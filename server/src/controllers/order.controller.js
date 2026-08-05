import mongoose from "mongoose";

import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import InventoryLog from "../models/inventoryLog.model.js";

import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from "../services/email.services.js";

import {
  notifyNewOrder,
  notifyOrderCancelled,
  notifyOrderShipped,
  notifyOrderDelivered,
} from "../services/notification.services.js";

// Place order
export const placeOrder = async (req, res) => {
  // Start MongoDB session
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    // Get logged-in user ID
    const userId = req.user._id;

    // Get request data
    const { shippingAddress, paymentMethod } = req.body;

    // Find user's cart
    const cart = await Cart.findOne({
      user: userId,
    })
      .populate("items.product")
      .session(session);

    // Check whether cart exists or is empty
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Validate stock availability
    for (const item of cart.items) {
      if (!item.product) {
        await session.abortTransaction();
        session.endSession();

        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (item.quantity > item.product.stock) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message: `${item.product.name} is out of stock`,
        });
      }
    }

    // Create new order
    const [order] = await Order.create(
      [
        {
          user: userId,
          items: cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price,
          })),
          totalPrice: cart.totalPrice,
          shippingAddress,
          paymentMethod,
        },
      ],
      { session },
    );

    // Prepare bulk product updates
    const bulkUpdates = [];

    // Prepare inventory logs
    const inventoryLogs = [];

    // Loop through ordered products
    for (const item of cart.items) {
      const previousStock = item.product.stock;
      const newStock = Math.max(previousStock - item.quantity, 0);

      bulkUpdates.push({
        updateOne: {
          filter: {
            _id: item.product._id,
          },
          update: {
            $set: {
              stock: newStock,
              isActive: newStock > 0,
            },
          },
        },
      });

      inventoryLogs.push({
        product: item.product._id,
        previousStock,
        newStock,
        quantityChanged: item.quantity,
        action: "Order Placed",
        updatedBy: userId,
      });
    }

    // Update all product stocks in a single database operation
    await Product.bulkWrite(bulkUpdates, {
      session,
    });

    // Create inventory logs in a single database operation
    await InventoryLog.insertMany(inventoryLogs, {
      session,
    });

    // Clear user's cart
    cart.items = [];
    cart.totalPrice = 0;

    // Save updated cart
    await cart.save({
      session,
    });

    // Commit transaction
    await session.commitTransaction();

    // End MongoDB session
    session.endSession();

    // Send confirmation email
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

    // Notify admin about new order
    try {
      await notifyNewOrder(order, req.user);
    } catch (error) {
      console.error("New order notification failed:", error);
    }

    // Return created order
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    // Rollback transaction if any operation fails
    await session.abortTransaction();

    // End MongoDB session
    session.endSession();

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

    // Get pagination query parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Calculate documents to skip
    const skip = (page - 1) * limit;

    // Fetch orders and total order count simultaneously
    const [orders, totalOrders] = await Promise.all([
      Order.find({
        user: userId,
      })
        .populate("items.product", "name images price category brand")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments({
        user: userId,
      }),
    ]);

    // Check whether user has any orders
    if (totalOrders === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found",
        totalOrders: 0,
        currentPage: page,
        totalPages: 0,
        orders: [],
      });
    }

    // Return user's orders
    return res.status(200).json({
      success: true,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      limit,
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

// getOrderById
// Get a single order by ID
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

    // Find user's order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    })
      .populate("items.product", "name images price category brand stock")
      .lean();

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
  // Start MongoDB session
  const session = await mongoose.startSession();
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

    // Start transaction
    session.startTransaction();

    // Find user's order
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    // Check whether order exists
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check whether order is already cancelled
    if (order.orderStatus === "Cancelled") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Prevent cancellation after shipping
    if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled",
      });
    }

    // Prepare bulk product updates
    const bulkUpdates = [];
    const inventoryLogs = [];

    // Collect all ordered product IDs
    const productIds = order.items.map((item) => item.product);

    // Fetch all ordered products
    const products = await Product.find({
      _id: { $in: productIds },
    }).session(session);

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    // Restore product stock
    for (const item of order.items) {
      // Find product using the product map instead of querying the database again
      const product = productMap.get(item.product.toString());

      // Check whether product exists
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Store previous stock
      const previousStock = product.stock;

      // Update product object
      product.stock += item.quantity;

      // Reactivate product
      if (product.stock > 0) {
        product.isActive = true;
      }

      // Don't save yet
      bulkUpdates.push({
        updateOne: {
          filter: {
            _id: product._id,
          },
          update: {
            $set: {
              stock: product.stock,
              isActive: product.isActive,
            },
          },
        },
      });

      // Save updated product
      // await product.save({ session });

      // Create inventory log
      inventoryLogs.push({
        product: product._id,
        previousStock,
        newStock: product.stock,
        quantityChanged: item.quantity,
        action: "Order Cancelled",
        updatedBy: userId,
      });
    }

    await Product.bulkWrite(bulkUpdates, {
      session,
    });

    // Create inventory logs in a single database operation
    await InventoryLog.insertMany(inventoryLogs, {
      session,
    });

    // Update order status
    order.orderStatus = "Cancelled";

    // Save order
    await order.save({ session });

    // Commit transaction
    await session.commitTransaction();

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

    // Notify admin about order cancellation
    try {
      await notifyOrderCancelled(order, req.user);
    } catch (error) {
      console.error("Order cancelled notification failed:", error);
    }

    // Return response
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();

    console.error("Cancel Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    // End MongoDB session
    session.endSession();
  }
};

// Admin - Get all orders
export const getAllOrders = async (req, res) => {
  try {
    // Logic started

    // Get pagination query parameters
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);

    // Calculate documents to skip
    const skip = (page - 1) * limit;

    // Fetch orders and total order count simultaneously
    const [orders, totalOrders] = await Promise.all([
      Order.find()
        .populate("user", "fullName email")
        .populate("items.product", "name images price category brand")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(),
    ]);

    // Check whether any orders exist
    if (totalOrders === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found",
        totalOrders: 0,
        currentPage: page,
        totalPages: 0,
        limit,
        orders: [],
      });
    }

    // Return all orders
    return res.status(200).json({
      success: true,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      limit,
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

    // Allowed statuses
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

    // Valid status transitions
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

    // Customer can return the order within 7 days
    if (orderStatus === "Delivered") {
      order.returnEligibleUntil = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      );
    }

    // Save updated order
    await order.save();

    // Send email notifications only for shipped and delivered orders
    if (orderStatus === "Shipped" || orderStatus === "Delivered") {
      // Fetch customer details
      const customer = await User.findById(order.user).select("email fullName");

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // Shipped notification
      if (orderStatus === "Shipped") {
        try {
          await sendOrderShippedEmail(
            customer.email,
            customer.fullName,
            order._id,
          );
        } catch (error) {
          console.error("Order shipped email failed:", error);
        }

        try {
          await notifyOrderShipped(order, customer);
        } catch (error) {
          console.error("Order shipped notification failed:", error);
        }
      }

      // Delivered notification
      if (orderStatus === "Delivered") {
        try {
          await sendOrderDeliveredEmail(
            customer.email,
            customer.fullName,
            order._id,
          );
        } catch (error) {
          console.error("Order delivered email failed:", error);
        }

        try {
          await notifyOrderDelivered(order, customer);
        } catch (error) {
          console.error("Order delivered notification failed:", error);
        }
      }
    }

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
