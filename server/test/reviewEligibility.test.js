import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import {
  buildPublicReviewFilter,
  isReviewableOrderItem,
} from "../src/controllers/review.controller.js";
import Review from "../src/models/review.model.js";
import {
  addReviewSchema,
  reviewStatusSchema,
} from "../src/validations/review.validation.js";

const orderId = "507f1f77bcf86cd799439011";
const productId = "507f1f77bcf86cd799439012";

test("review submission requires a valid delivered order item", () => {
  const deliveredOrder = {
    orderStatus: "Delivered",
    items: [{ product: productId }],
  };

  assert.equal(isReviewableOrderItem(deliveredOrder, productId), true);
  assert.equal(isReviewableOrderItem(deliveredOrder, productId.toUpperCase()), true);
  assert.equal(isReviewableOrderItem(deliveredOrder, orderId), false);
  assert.equal(
    isReviewableOrderItem({ ...deliveredOrder, orderStatus: "Shipped" }, productId),
    false,
  );
});

test("review input validates IDs, integer ratings, and comment length", () => {
  const validReview = { orderId, productId, rating: 5, comment: "Works very well" };

  assert.equal(addReviewSchema.safeParse(validReview).success, true);
  assert.equal(
    addReviewSchema.safeParse({ ...validReview, rating: 4.5 }).success,
    false,
  );
  assert.equal(
    addReviewSchema.safeParse({ ...validReview, orderId: "invalid" }).success,
    false,
  );
  assert.equal(
    addReviewSchema.safeParse({ ...validReview, comment: "ok" }).success,
    false,
  );
  assert.equal(reviewStatusSchema.safeParse({ status: "approved" }).success, true);
  assert.equal(reviewStatusSchema.safeParse({ status: "published" }).success, false);
});

test("review uniqueness is scoped to the customer, order, and product", () => {
  const uniqueIndex = Review.schema.indexes().find(
    ([keys, options]) =>
      keys.user === 1 &&
      keys.order === 1 &&
      keys.product === 1 &&
      options.unique === true,
  );

  assert.ok(uniqueIndex);
  assert.equal(Review.schema.path("order").isRequired, true);
});

test("public review filters preserve trusted Mongo operators under sanitization", () => {
  mongoose.set("sanitizeFilter", true);
  const query = Review.find(buildPublicReviewFilter(productId));

  assert.doesNotThrow(() => query._castConditions());
  assert.equal(query.getFilter().order.$exists, true);
  assert.equal(query.getFilter().status, "approved");
});
