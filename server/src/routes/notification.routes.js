import express from "express";

import {
  getNotifications,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.controller.js";

import {
  protectedRoute as customerProtectedRoute,
} from "../middleware/customerAuth.middleware.js";

import {
  protectedRoute as adminProtectedRoute,
  authorize as adminAuthorize,
} from "../middleware/adminAuth.middleware.js";

const router = express.Router();

// Admin Routes

// Get all admin notifications

router.get(
  "/",
  adminProtectedRoute,
  adminAuthorize("admin"),
  getNotifications,
);

// Customer Routes

// Get logged-in customer's notifications

router.get(
  "/my",
  customerProtectedRoute,
  getMyNotifications,
);

// Common Routes

// Get unread notification count

router.get(
  "/unread-count",
  customerProtectedRoute,
  getUnreadCount,
);

// Mark notification as read

router.put(
  "/:notificationId/read",
  customerProtectedRoute,
  markAsRead,
);

// Mark all notifications as read

router.put(
  "/read-all",
  customerProtectedRoute,
  markAllAsRead,
);

// Delete notification

router.delete(
  "/:notificationId",
  customerProtectedRoute,
  deleteNotification,
);

export default router;
