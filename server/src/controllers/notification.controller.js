import mongoose from "mongoose";

import {
  getNotifications as getNotificationsService,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationService,
} from "../services/notification.services.js";

// Get Admin Notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsService({
      recipient: "admin",
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

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

    const notification = await markNotificationAsRead(notificationId);

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

    const notification = await deleteNotificationService(notificationId);

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
