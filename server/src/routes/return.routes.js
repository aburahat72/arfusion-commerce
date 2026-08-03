import express from "express";

import {
  requestReturn,
  getMyReturnRequests,
  getAllReturnRequests,
  approveReturn,
  rejectReturn,
  completeRefund,
  completeReplacement,
} from "../controllers/return.controller.js";

import { protectedRoute, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Customer Routes

// Request Return
router.post("/:orderId", protectedRoute, requestReturn);

// Get My Return Requests
router.get("/my", protectedRoute, getMyReturnRequests);

// Admin Routes

// Get All Return Requests
router.get("/", protectedRoute, authorize("admin"), getAllReturnRequests);

// Approve Return Request
router.put(
  "/:orderId/approve",
  protectedRoute,
  authorize("admin"),
  approveReturn,
);

// Reject Return Request
router.put(
  "/:orderId/reject",
  protectedRoute,
  authorize("admin"),
  rejectReturn,
);

// Complete Refund
router.put(
  "/:orderId/complete-refund",
  protectedRoute,
  authorize("admin"),
  completeRefund,
);

// Complete Replacement
router.put(
  "/:orderId/complete-replacement",
  protectedRoute,
  authorize("admin"),
  completeReplacement,
);

export default router;
