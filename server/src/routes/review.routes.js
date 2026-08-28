import express from "express";

import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import { protectedRoute } from "../middleware/customerAuth.middleware.js";

import validate from "../middleware/validate.middleware.js";

import {
  addReviewSchema,
  updateReviewSchema,
} from "../validations/review.validation.js";

const router = express.Router();

// Add Review

router.post("/", protectedRoute, validate(addReviewSchema), addReview);

// Get Product Reviews

router.get("/:productId", getProductReviews);

// Update Review

router.put(
  "/:reviewId",
  protectedRoute,
  validate(updateReviewSchema),
  updateReview,
);

// Delete Review

router.delete("/:reviewId", protectedRoute, deleteReview);

export default router;
