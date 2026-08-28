import Notification from "../models/notification.model.js";

// Create Notification
export const createNotification = async ({
  title,
  message,
  type,
  recipient,
  user = null,
  relatedOrder = null,
  relatedProduct = null,
}) => {
  try {
    const notification = await Notification.create({
      title,
      message,
      type,
      recipient,
      user,
      relatedOrder,
      relatedProduct,
    });

    return notification;
  } catch (error) {
    console.error("Create Notification Error:", error);
    throw error;
  }
};

// Get Notifications
export const getNotifications = async (filter = {}) => {
  try {
    const notifications = await Notification.find(filter)
      .populate("user", "fullName email")
      .populate("relatedOrder")
      .populate("relatedProduct", "name")
      .sort({
        createdAt: -1,
      });

    return notifications;
  } catch (error) {
    console.error("Get Notifications Error:", error);
    throw error;
  }
};

// Get Unread Notification Count
export const getUnreadNotificationCount = async (filter = {}) => {
  try {
    const count = await Notification.countDocuments({
      ...filter,
      isRead: false,
    });

    return count;
  } catch (error) {
    console.error("Get Unread Count Error:", error);
    throw error;
  }
};

// Mark Notification As Read
export const markNotificationAsRead = async (
  notificationId,
  filter = {},
) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        ...filter,
      },
      {
        isRead: true,
      },
      {
        new: true,
      },
    );

    return notification;
  } catch (error) {
    console.error("Mark Notification Error:", error);
    throw error;
  }
};

// Mark All Notifications As Read
export const markAllNotificationsAsRead = async (filter = {}) => {
  try {
    const result = await Notification.updateMany(
      {
        ...filter,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    return result;
  } catch (error) {
    console.error("Mark All Notifications Error:", error);
    throw error;
  }
};

// Delete Notification
export const deleteNotification = async (
  notificationId,
  filter = {},
) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      ...filter,
    });

    return notification;
  } catch (error) {
    console.error("Delete Notification Error:", error);
    throw error;
  }
};

// =========================
// Order Notifications
// =========================

// New Order
export const notifyNewOrder = async (order, user) => {
  return await createNotification({
    title: "New Order",
    message: `${user.fullName} placed a new order.`,
    type: "Order",
    recipient: "admin",
    user: user._id,
    relatedOrder: order._id,
  });
};

// Order Cancelled
export const notifyOrderCancelled = async (order, user) => {
  // Admin Notification
  await createNotification({
    title: "Order Cancelled",
    message: `${user.fullName} cancelled Order #${order._id}.`,
    type: "Order",
    recipient: "admin",
    user: user._id,
    relatedOrder: order._id,
  });

  // Customer Notification
  await createNotification({
    title: "Order Cancelled",
    message: "Your order has been cancelled successfully.",
    type: "Order",
    recipient: "customer",
    user: order.user,
    relatedOrder: order._id,
  });
};

// Order Shipped
export const notifyOrderShipped = async (order, customer) => {
  return await createNotification({
    title: "Order Shipped",
    message: "Your order has been shipped successfully.",
    type: "Order",
    recipient: "customer",
    user: customer._id,
    relatedOrder: order._id,
  });
};

// Order Delivered
export const notifyOrderDelivered = async (order, customer) => {
  return await createNotification({
    title: "Order Delivered",
    message: "Your order has been delivered successfully.",
    type: "Order",
    recipient: "customer",
    user: customer._id,
    relatedOrder: order._id,
  });
};
