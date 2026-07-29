import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create Razorpay Order
router.post("/create-order", protectedRoute, createPaymentOrder);

// Verify Razorpay Payment
router.post("/verify", protectedRoute, verifyPayment);

export default router;
