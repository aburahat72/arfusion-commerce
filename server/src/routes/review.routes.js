import express from "express";
import {
  addReview,
  getAdminReviews,
  getMyOrderReviews,
  getProductReviews,
  updateReviewStatus,
} from "../controllers/review.controller.js";
import {
  protectedRoute as customerProtectedRoute,
} from "../middleware/customerAuth.middleware.js";
import {
  protectedRoute as adminProtectedRoute,
  authorize as adminAuthorize,
} from "../middleware/adminAuth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  addReviewSchema,
  reviewStatusSchema,
} from "../validations/review.validation.js";

const router = express.Router();

router.get(
  "/admin",
  adminProtectedRoute,
  adminAuthorize("admin"),
  getAdminReviews,
);
router.patch(
  "/admin/:reviewId/status",
  adminProtectedRoute,
  adminAuthorize("admin"),
  validate(reviewStatusSchema),
  updateReviewStatus,
);
router.get("/mine/order/:orderId", customerProtectedRoute, getMyOrderReviews);
router.post("/", customerProtectedRoute, validate(addReviewSchema), addReview);
router.get("/:productId", getProductReviews);

export default router;
