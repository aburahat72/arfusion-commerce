import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
  updatePaymentStatus,
} from "../controllers/payment.controller.js";

import { protectedRoute } from "../middleware/customerAuth.middleware.js";

const router = express.Router();

/*
 * Create temporary PaymentIntent
 * + Razorpay Order.
 */
router.post("/create-order", protectedRoute, createPaymentOrder);

/*
 * Verify Razorpay payment
 * + create final MongoDB Order.
 */
router.post("/verify", protectedRoute, verifyPayment);

/*
 * Failed / Cancelled payment.
 */
router.post("/status", protectedRoute, updatePaymentStatus);

export default router;
