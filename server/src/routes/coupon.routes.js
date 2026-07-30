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

import { protectedRoute, authorize } from "../middleware/auth.middleware.js";

import validate from "../middleware/validate.middleware.js";

import {
  createCouponSchema,
  updateCouponSchema,
} from "../validations/coupon.validation.js";

const router = express.Router();

// Create Coupon (Admin)
router.post(
  "/",
  protectedRoute,
  authorize("admin"),
  validate(createCouponSchema),
  createCoupon,
);

// Get All Coupons (Admin)
router.get("/", protectedRoute, authorize("admin"), getCoupons);

// Get Single Coupon (Admin)
router.get("/:couponId", protectedRoute, authorize("admin"), getCoupon);

// Update Coupon (Admin)
router.put(
  "/:couponId",
  protectedRoute,
  authorize("admin"),
  validate(updateCouponSchema),
  updateCoupon,
);

// Delete Coupon (Admin)
router.delete("/:couponId", protectedRoute, authorize("admin"), deleteCoupon);

// Apply Coupon
router.post("/apply", protectedRoute, applyCoupon);

// Remove Coupon
router.post("/remove", protectedRoute, removeCoupon);

export default router;
