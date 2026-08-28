import express from "express";

import {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  removeCoupon,
} from "../controllers/coupon.controller.js";

import {
  protectedRoute as adminProtectedRoute,
  authorize as adminAuthorize,
} from "../middleware/adminAuth.middleware.js";

import {
  protectedRoute as customerProtectedRoute,
} from "../middleware/customerAuth.middleware.js";

import validate from "../middleware/validate.middleware.js";

import {
  createCouponSchema,
  updateCouponSchema,
} from "../validations/coupon.validation.js";

const router = express.Router();

// Create Coupon (Admin)

router.post(
  "/",
  adminProtectedRoute,
  adminAuthorize("admin"),
  validate(createCouponSchema),
  createCoupon,
);

// Get All Coupons (Admin)

router.get(
  "/",
  adminProtectedRoute,
  adminAuthorize("admin"),
  getCoupons,
);

// Get Single Coupon (Admin)

router.get(
  "/:couponId",
  adminProtectedRoute,
  adminAuthorize("admin"),
  getCoupon,
);

// Update Coupon (Admin)

router.put(
  "/:couponId",
  adminProtectedRoute,
  adminAuthorize("admin"),
  validate(updateCouponSchema),
  updateCoupon,
);

// Delete Coupon (Admin)

router.delete(
  "/:couponId",
  adminProtectedRoute,
  adminAuthorize("admin"),
  deleteCoupon,
);

// Apply Coupon

router.post(
  "/apply",
  customerProtectedRoute,
  applyCoupon,
);

// Remove Coupon

router.post(
  "/remove",
  customerProtectedRoute,
  removeCoupon,
);

export default router;
