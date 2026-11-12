import mongoose from "mongoose";
import dotenv from "dotenv";
import Review from "../src/models/review.model.js";
import ReviewClaim from "../src/models/reviewClaim.model.js";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await Review.init();
  await ReviewClaim.init();

  const existingReviews = await Review.find({
    order: { $exists: true },
    verifiedPurchase: true,
  })
    .select("user order product")
    .lean();
  if (existingReviews.length > 0) {
    await ReviewClaim.bulkWrite(
      existingReviews.map((review) => ({
        updateOne: {
          filter: {
            user: review.user,
            order: review.order,
            product: review.product,
          },
          update: {
            $setOnInsert: {
              user: review.user,
              order: review.order,
              product: review.product,
              state: "submitted",
            },
          },
          upsert: true,
        },
      })),
    );
    console.log(`Preserved one-time review claims for ${existingReviews.length} reviews.`);
  }

  const legacyReviews = await Review.collection.updateMany(
    { order: { $exists: false } },
    { $set: { status: "removed", verifiedPurchase: false } },
  );
  if (legacyReviews.modifiedCount > 0) {
    console.log(`Removed ${legacyReviews.modifiedCount} unverified legacy reviews.`);
  }

  const indexes = await Review.collection.indexes();
  const legacyIndex = indexes.find(
    (index) =>
      index.key.user === 1 &&
      index.key.product === 1 &&
      !Object.hasOwn(index.key, "order"),
  );

  if (legacyIndex) {
    await Review.collection.dropIndex(legacyIndex.name);
    console.log(`Dropped legacy review index: ${legacyIndex.name}`);
  } else {
    console.log("No legacy user/product review index found.");
  }
} catch (error) {
  console.error("Review index migration failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
