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

import { protectedRoute as customerProtectedRoute } from "../middleware/customerAuth.middleware.js";

import {
  protectedRoute as adminProtectedRoute,
  authorize as adminAuthorize,
} from "../middleware/adminAuth.middleware.js";

const router = express.Router();

// Customer Routes

// Request Return

router.post("/:orderId", customerProtectedRoute, requestReturn);

// Get My Return Requests

router.get("/my", customerProtectedRoute, getMyReturnRequests);

// Admin Routes

// Get All Return Requests

router.get(
  "/",
  adminProtectedRoute,
  adminAuthorize("admin"),
  getAllReturnRequests,
);

// Approve Return Request

router.put(
  "/:orderId/approve",
  adminProtectedRoute,
  adminAuthorize("admin"),
  approveReturn,
);

// Reject Return Request

router.put(
  "/:orderId/reject",
  adminProtectedRoute,
  adminAuthorize("admin"),
  rejectReturn,
);

// Complete Refund

router.put(
  "/:orderId/complete-refund",
  adminProtectedRoute,
  adminAuthorize("admin"),
  completeRefund,
);

// Complete Replacement

router.put(
  "/:orderId/complete-replacement",
  adminProtectedRoute,
  adminAuthorize("admin"),
  completeReplacement,
);

export default router;
