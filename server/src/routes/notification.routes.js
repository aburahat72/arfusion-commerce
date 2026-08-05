import express from "express";

import {
  getNotifications,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.controller.js";

import { protectedRoute, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin Routes
// Get all admin notifications
router.get("/", protectedRoute, authorize("admin"), getNotifications);

// Customer Routes

// Get logged-in customer's notifications
router.get("/my", protectedRoute, getMyNotifications);

// Common Routes

// Get unread notification count
router.get("/unread-count", protectedRoute, getUnreadCount);

// Mark notification as read
router.put("/:notificationId/read", protectedRoute, markAsRead);

// Mark all notifications as read
router.put("/read-all", protectedRoute, markAllAsRead);

// Delete notification
router.delete("/:notificationId", protectedRoute, deleteNotification);

export default router;
