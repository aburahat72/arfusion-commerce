import mongoose from "mongoose";

import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from "../services/email.services.js";

// Place order
export const placeOrder = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get request data
    const { shippingAddress, paymentMethod } = req.body;

    // Find user's cart
    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    // Check whether cart exists or is empty
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Check product stock before placing order
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          success: false,
          message: `${item.product.name} is out of stock`,
        });
      }
    }

    // Create new order
    const order = await Order.create({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: cart.totalPrice,
      shippingAddress,
      paymentMethod,
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }

    // Clear user's cart
    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();

    // Send confirmation email after successful order placement
    try {
      await sendOrderConfirmationEmail(
        req.user.email,
        req.user.fullName,
        order._id,
        order.totalPrice,
      );
    } catch (error) {
      console.error("Order confirmation email failed:", error);
    }

    // Return created order
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//getMyorders
// Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Find all orders of the logged-in user
    const orders = await Order.find({
      user: userId,
    })
      .populate("items.product")
      .sort({
        createdAt: -1,
      });

    // Check whether user has any orders
    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found",
        orders: [],
      });
    }

    // Return user's orders
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getOrderById;
// Get single order
export const getOrderById = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get order ID from URL
    const { orderId } = req.params;

    // Check whether order ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate("items.product");

    // Check whether order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Return order
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get order ID from URL
    const { orderId } = req.params;

    // Check whether order ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find user's order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    // Check whether order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check whether order is already cancelled
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Prevent cancellation after shipping
    if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled",
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.quantity,
        },
      });
    }

    // Update order status
    order.orderStatus = "Cancelled";

    // Save order
    await order.save();

    // Send order cancelled email to the customer
    try {
      await sendOrderCancelledEmail(
        req.user.email,
        req.user.fullName,
        order._id,
      );
    } catch (error) {
      console.error("Order cancelled email failed:", error);
    }

    // Return response
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admin - Get all orders
export const getAllOrders = async (req, res) => {
  try {
    // Logic started
    // Find all orders
    const orders = await Order.find()
      .populate("user", "fullName email")
      .populate("items.product")
      .sort({
        createdAt: -1,
      });

    // Check whether any orders exist
    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found",
        orders: [],
      });
    }

    // Return all orders
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// updateOrderStatus
// Admin - Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    // Logic started

    // Get order ID from URL
    const { orderId } = req.params;

    // Get new order status
    const { orderStatus } = req.body;

    // Check whether order ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    // Check whether order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check whether order is already cancelled
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled orders cannot be updated",
      });
    }

    // Check whether the order status is valid
    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // Check whether the order status transition is valid
    const validTransitions = {
      Pending: ["Processing", "Cancelled"],
      Processing: ["Shipped", "Cancelled"],
      Shipped: ["Delivered"],
      Delivered: [],
      Cancelled: [],
    };

    if (!validTransitions[order.orderStatus].includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
      });
    }

    // Update order status
    order.orderStatus = orderStatus;

    // Send email notification based on the updated order status
    if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
      // Find customer for email notification
      const customer = await User.findById(order.user);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // Send shipped email
      if (order.orderStatus === "Shipped") {
        try {
          await sendOrderShippedEmail(
            customer.email,
            customer.fullName,
            order._id,
          );
        } catch (error) {
          console.error("Order shipped email failed:", error);
        }
      }

      // Send delivered email
      if (order.orderStatus === "Delivered") {
        // Customer can return the order within 7 days
        order.returnEligibleUntil = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        );

        try {
          await sendOrderDeliveredEmail(
            customer.email,
            customer.fullName,
            order._id,
          );
        } catch (error) {
          console.error("Order delivered email failed:", error);
        }
      }
    }

    // Save order AFTER all updates
    await order.save();

    // Return updated order
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
