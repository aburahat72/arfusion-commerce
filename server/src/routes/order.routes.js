import express from "express";

import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import { protectedRoute as customerProtectedRoute } from "../middleware/customerAuth.middleware.js";

import {
  protectedRoute as adminProtectedRoute,
  authorize as adminAuthorize,
} from "../middleware/adminAuth.middleware.js";

import validate from "../middleware/validate.middleware.js";

import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validations/order.validation.js";

const router = express.Router();

// =====================================================
// CUSTOMER - PLACE ORDER
// =====================================================

router.post(
  "/",
  customerProtectedRoute,
  validate(createOrderSchema),
  placeOrder,
);

// =====================================================
// CUSTOMER - GET MY ORDERS
// =====================================================

router.get("/my-orders", customerProtectedRoute, getMyOrders);

// =====================================================
// ADMIN - GET ALL ORDERS
// =====================================================

router.get("/", adminProtectedRoute, adminAuthorize("admin"), getAllOrders);

// =====================================================
// ADMIN - GET SINGLE ORDER
// =====================================================

router.get(
  "/admin/:orderId",
  adminProtectedRoute,
  adminAuthorize("admin"),
  getAdminOrderById,
);

// =====================================================
// CUSTOMER - GET SINGLE ORDER
// =====================================================

router.get("/:orderId", customerProtectedRoute, getOrderById);

// =====================================================
// CUSTOMER - CANCEL ORDER
// =====================================================

router.patch("/:orderId/cancel", customerProtectedRoute, cancelOrder);

// =====================================================
// ADMIN - UPDATE ORDER STATUS
// =====================================================

router.patch(
  "/:orderId/status",
  adminProtectedRoute,
  adminAuthorize("admin"),
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);

export default router;
