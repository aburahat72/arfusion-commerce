import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import { protectedRoute, authorize } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validations/order.validation.js";

const router = express.Router();

// Place order
router.post("/", protectedRoute, validate(createOrderSchema), placeOrder);

// Get logged-in user's orders
router.get("/my-orders", protectedRoute, getMyOrders);

// Get single order
router.get("/:orderId", protectedRoute, getOrderById);

// Cancel order
router.patch("/:orderId/cancel", protectedRoute, cancelOrder);

// Admin - Get all orders
router.get("/", protectedRoute, authorize("admin"), getAllOrders);

// Admin - Update order status
router.patch(
  "/:orderId/status",
  protectedRoute,
  authorize("admin"),
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);

export default router;
