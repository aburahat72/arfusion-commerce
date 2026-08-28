import express from "express";

import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import {
  protectedRoute as customerProtectedRoute,
} from "../middleware/customerAuth.middleware.js";

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

// Place order

router.post(
  "/",
  customerProtectedRoute,
  validate(createOrderSchema),
  placeOrder,
);

// Get logged-in user's orders

router.get("/my-orders", customerProtectedRoute, getMyOrders);

// Get single order

router.get("/:orderId", customerProtectedRoute, getOrderById);

// Cancel order

router.patch(
  "/:orderId/cancel",
  customerProtectedRoute,
  cancelOrder,
);

// Admin - Get all orders

router.get(
  "/",
  adminProtectedRoute,
  adminAuthorize("admin"),
  getAllOrders,
);

// Admin - Update order status

router.patch(
  "/:orderId/status",
  adminProtectedRoute,
  adminAuthorize("admin"),
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);

export default router;
