import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../models/notification.model.js";

import {
  countNotifications,
  getNotifications as getNotificationsService,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationService,
} from "../services/notification.services.js";

const parsePositiveInteger = (value, defaultValue, maximum, name) => {
  if (value === undefined) return defaultValue;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    const error = new Error(`${name} must be a positive integer.`);
    error.statusCode = 400;
    throw error;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    const error = new Error(`${name} cannot exceed ${maximum}.`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
};

export const resolveAdminNotificationQuery = (query = {}) => {
  const filter = { recipient: "admin" };
  const readState = query.filter ?? "all";
  if (!["all", "unread", "read"].includes(readState)) {
    const error = new Error("Filter must be all, unread, or read.");
    error.statusCode = 400;
    throw error;
  }
  if (readState === "unread") filter.isRead = false;
  if (readState === "read") filter.isRead = true;

  if (query.type !== undefined) {
    if (
      typeof query.type !== "string" ||
      !NOTIFICATION_TYPES.includes(query.type)
    ) {
      const error = new Error("Choose a valid notification type.");
      error.statusCode = 400;
      throw error;
    }
    filter.type = query.type;
  }

  const page = parsePositiveInteger(query.page, 1, 1_000_000, "Page");
  const limit = parsePositiveInteger(query.limit, 12, 50, "Limit");
  return { filter, page, limit, skip: (page - 1) * limit };
};

// Get Admin Notifications
export const getNotifications = async (req, res) => {
  try {
    const { filter, page, limit, skip } = resolveAdminNotificationQuery(
      req.query,
    );
    const [notifications, total, unreadCount] = await Promise.all([
      getNotificationsService(filter, { skip, limit }),
      countNotifications(filter),
      getUnreadNotificationCount({ recipient: "admin" }),
    ]);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      pagination: {
        page,
        limit,
        hasMore: skip + notifications.length < total,
      },
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Customer Notifications
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await getNotificationsService({
      recipient: "customer",
      user: userId,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get My Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Mark Notification As Read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    let filter;

    // Admin can only mark admin notifications
    if (req.user.role === "admin") {
      filter = {
        recipient: "admin",
      };
    } else {
      // Customer can only mark their own customer notifications
      filter = {
        recipient: "customer",
        user: req.user._id,
      };
    }

    const notification = await markNotificationAsRead(
      notificationId,
      filter,
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark Notification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Mark All Notifications As Read
export const markAllAsRead = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      await markAllNotificationsAsRead({
        recipient: "admin",
      });
    } else {
      await markAllNotificationsAsRead({
        recipient: "customer",
        user: req.user._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete Notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    let filter;

    // Admin can only delete admin notifications
    if (req.user.role === "admin") {
      filter = {
        recipient: "admin",
      };
    } else {
      // Customer can only delete their own customer notifications
      filter = {
        recipient: "customer",
        user: req.user._id,
      };
    }

    const notification = await deleteNotificationService(
      notificationId,
      filter,
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Unread Notification Count
export const getUnreadCount = async (req, res) => {
  try {
    let count = 0;

    if (req.user.role === "admin") {
      count = await getUnreadNotificationCount({
        recipient: "admin",
      });
    } else {
      count = await getUnreadNotificationCount({
        recipient: "customer",
        user: req.user._id,
      });
    }

    return res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Unread Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
