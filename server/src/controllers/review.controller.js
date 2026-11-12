import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import ReviewClaim from "../models/reviewClaim.model.js";
import User from "../models/user.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50);

  return { page, limit, skip: (page - 1) * limit };
};

export const buildPublicReviewFilter = (productId) => ({
  product: productId,
  status: "approved",
  order: mongoose.trusted({ $exists: true }),
  verifiedPurchase: true,
});

export const isReviewableOrderItem = (order, productId) =>
  order?.orderStatus === "Delivered" &&
  (order.items || []).some(
    (item) =>
      String(item.product?._id || item.product).toLowerCase() ===
      String(productId).toLowerCase(),
  );

export const addReview = async (req, res) => {
  try {
    const { orderId, productId, rating, comment } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    }).select("items.product orderStatus");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!isReviewableOrderItem(order, productId)) {
      return res.status(403).json({
        success: false,
        message: "Reviews are available only for products in delivered orders",
      });
    }

    const existingClaim = await ReviewClaim.findOne({
      user: req.user._id,
      order: orderId,
      product: productId,
    }).select("_id");

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product in this order",
      });
    }

    const session = await mongoose.startSession();
    let review;
    try {
      await session.withTransaction(async () => {
        await ReviewClaim.create(
          [{
            user: req.user._id,
            order: orderId,
            product: productId,
          }],
          { session },
        );
        [review] = await Review.create(
          [{
            user: req.user._id,
            order: orderId,
            product: productId,
            rating,
            comment,
          }],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted and awaiting moderation",
      review,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product in this order",
      });
    }

    console.error("Add Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit review",
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findOne({ _id: productId, isActive: true }).select("_id");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { page, limit, skip } = getPagination(req.query);
    const filter = buildPublicReviewFilter(productId);

    const [reviews, count, summary, ratingCounts] = await Promise.all([
      Review.find(filter)
        .populate("user", "fullName avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        {
          $match: {
            product: product._id,
            status: "approved",
            order: { $exists: true },
            verifiedPurchase: true,
          },
        },
        { $group: { _id: null, averageRating: { $avg: "$rating" } } },
      ]),
      Review.aggregate([
        {
          $match: {
            product: product._id,
            status: "approved",
            order: { $exists: true },
            verifiedPurchase: true,
          },
        },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
    ]);

    const distribution = Object.fromEntries(
      [1, 2, 3, 4, 5].map((rating) => [
        rating,
        ratingCounts.find((entry) => entry._id === rating)?.count || 0,
      ]),
    );

    return res.status(200).json({
      success: true,
      count,
      averageRating: Number((summary[0]?.averageRating || 0).toFixed(1)),
      distribution,
      currentPage: page,
      totalPages: count === 0 ? 0 : Math.ceil(count / limit),
      reviews,
    });
  } catch (error) {
    console.error("Get Product Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load reviews",
    });
  }
};

export const getMyOrderReviews = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id }).select("_id");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const [reviews, claims] = await Promise.all([
      Review.find({
        order: order._id,
        user: req.user._id,
      })
        .select("product rating comment status createdAt")
        .lean(),
      ReviewClaim.find({
        order: order._id,
        user: req.user._id,
      })
        .select("product state deletedAt")
        .lean(),
    ]);

    const reviewProducts = new Set(reviews.map((review) => String(review.product)));
    const deletedReviews = claims
      .filter(
        (claim) =>
          claim.state === "deleted" || !reviewProducts.has(String(claim.product)),
      )
      .map((claim) => ({
        product: claim.product,
        status: "deleted",
        deletedAt: claim.deletedAt,
      }));

    return res.status(200).json({
      success: true,
      reviews: [...reviews, ...deletedReviews],
    });
  } catch (error) {
    console.error("Get Customer Order Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load your review status",
    });
  }
};

export const deleteReviewPermanently = async (req, res) => {
  const { reviewId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ success: false, message: "Invalid review ID" });
  }

  let session;
  try {
    session = await mongoose.startSession();
    let deleted = false;
    await session.withTransaction(async () => {
      const review = await Review.findById(reviewId).session(session);
      if (!review) return;

      await Review.deleteOne({ _id: review._id }).session(session);
      if (review.order) {
        await ReviewClaim.updateOne(
          {
            user: review.user,
            order: review.order,
            product: review.product,
          },
          {
            $set: { state: "deleted", deletedAt: new Date() },
            $setOnInsert: {
              user: review.user,
              order: review.order,
              product: review.product,
            },
          },
          { upsert: true, session },
        );
      }
      deleted = true;
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Review permanently deleted",
    });
  } catch (error) {
    console.error("Permanently Delete Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to permanently delete review",
    });
  } finally {
    if (session) await session.endSession();
  }
};

export const getAdminReviews = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    const allowedStatuses = ["pending", "approved", "rejected", "removed"];
    const status = String(req.query.status || "");

    if (status && status !== "all" && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status filter",
      });
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    const rating = String(req.query.rating || "");
    if (rating && rating !== "all" && !/^[1-5]$/.test(rating)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rating filter",
      });
    }
    if (rating && rating !== "all") {
      filter.rating = Number(rating);
    }

    const search = String(req.query.search || "").trim().slice(0, 100);
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const [users, products] = await Promise.all([
        User.find({ fullName: regex }).select("_id").lean(),
        Product.find({ name: regex }).select("_id").lean(),
      ]);
      filter.$or = [
        { comment: regex },
        { user: mongoose.trusted({ $in: users.map((user) => user._id) }) },
        { product: mongoose.trusted({ $in: products.map((product) => product._id) }) },
      ];
    }

    const [reviews, total, statusCounts, ratingSummary] = await Promise.all([
      Review.find(filter)
        .populate("user", "fullName email")
        .populate("product", "name")
        .populate("order", "createdAt orderStatus")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Review.aggregate([
        {
          $match: {
            status: "approved",
            order: { $exists: true },
            verifiedPurchase: true,
          },
        },
        { $group: { _id: null, averageRating: { $avg: "$rating" } } },
      ]),
    ]);

    const counts = Object.fromEntries(statusCounts.map(({ _id, count }) => [_id, count]));

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
      summary: {
        total: Object.values(counts).reduce((sum, count) => sum + count, 0),
        pending: counts.pending || 0,
        approved: counts.approved || 0,
        rejected: counts.rejected || 0,
        removed: counts.removed || 0,
        averageRating: Number((ratingSummary[0]?.averageRating || 0).toFixed(1)),
      },
    });
  } catch (error) {
    console.error("Get Admin Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load reviews",
    });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const { status } = req.body;
    if (status === "approved") {
      const reviewToApprove = await Review.findById(reviewId)
        .select("order user product verifiedPurchase")
        .lean();
      const eligibleOrder =
        reviewToApprove?.order &&
        reviewToApprove.verifiedPurchase &&
        (await Order.findOne({
          _id: reviewToApprove.order,
          user: reviewToApprove.user,
          orderStatus: "Delivered",
          "items.product": reviewToApprove.product,
        }).select("_id"));

      if (!eligibleOrder) {
        return res.status(409).json({
          success: false,
          message: "Only reviews from delivered orders can be approved",
        });
      }
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        $set: {
          status,
          moderatedBy: req.user._id,
          moderatedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    )
      .populate("user", "fullName email")
      .populate("product", "name")
      .lean();

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Review moderation updated",
      review,
    });
  } catch (error) {
    console.error("Update Review Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update review moderation",
    });
  }
};
