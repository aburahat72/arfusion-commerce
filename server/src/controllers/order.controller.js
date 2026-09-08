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

// =====================================================
// PLACE ORDER
// =====================================================

export const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = req.user._id;
    const { shippingAddress, paymentMethod } = req.body;

    // -------------------------------------------------
    // FIND USER CART
    // -------------------------------------------------

    const cart = await Cart.findOne({
      user: userId,
    })
      .populate("items.product")
      .session(session);

    // -------------------------------------------------
    // CHECK CART
    // -------------------------------------------------

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // -------------------------------------------------
    // VALIDATE PRODUCTS AND STOCK
    // -------------------------------------------------

    for (const item of cart.items) {
      if (!item.product) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (item.quantity > item.product.stock) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: `${item.product.name} is out of stock`,
        });
      }
    }

    // -------------------------------------------------
    // CREATE ORDER
    // -------------------------------------------------

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
      {
        session,
      },
    );

    // -------------------------------------------------
    // PREPARE INVENTORY OPERATIONS
    // -------------------------------------------------

    const bulkUpdates = [];
    const inventoryLogs = [];

    for (const item of cart.items) {
      const product = item.product;

      const previousStock = product.stock;

      const newStock = previousStock - item.quantity;

      // Product stock update
      bulkUpdates.push({
        updateOne: {
          filter: {
            _id: product._id,
            stock: {
              $gte: item.quantity,
            },
          },

          update: {
            $set: {
              stock: newStock,
              isActive: newStock > 0,
            },
          },
        },
      });

      // Inventory log
      inventoryLogs.push({
        product: product._id,

        previousStock,

        newStock,

        quantityChanged: item.quantity,

        action: "Order Placed",

        updatedBy: userId,
      });
    }

    // -------------------------------------------------
    // UPDATE PRODUCT STOCK
    // -------------------------------------------------

    const bulkResult = await Product.bulkWrite(bulkUpdates, {
      session,
    });

    // -------------------------------------------------
    // VERIFY ALL STOCK UPDATES
    // -------------------------------------------------

    if (bulkResult.modifiedCount !== bulkUpdates.length) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "One or more products became unavailable while placing the order. Please try again.",
      });
    }

    // -------------------------------------------------
    // CREATE INVENTORY LOGS
    // -------------------------------------------------

    await InventoryLog.insertMany(inventoryLogs, {
      session,
    });

    // -------------------------------------------------
    // CLEAR CART
    // -------------------------------------------------

    cart.items = [];

    cart.totalPrice = 0;

    await cart.save({
      session,
    });

    // -------------------------------------------------
    // COMMIT TRANSACTION
    // -------------------------------------------------

    await session.commitTransaction();

    // -------------------------------------------------
    // EMAIL CUSTOMER
    // -------------------------------------------------

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

    // -------------------------------------------------
    // NOTIFY ADMIN
    // -------------------------------------------------

    try {
      await notifyNewOrder(order, req.user);
    } catch (error) {
      console.error("New order notification failed:", error);
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,

      message: "Order placed successfully",

      order,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Place Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await session.endSession();
  }
};

// =====================================================
// GET MY ORDERS
// =====================================================

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
      100,
    );

    const skip = (page - 1) * limit;

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

    return res.status(200).json({
      success: true,

      message: totalOrders === 0 ? "No orders found" : undefined,

      totalOrders,

      currentPage: page,

      totalPages: totalOrders === 0 ? 0 : Math.ceil(totalOrders / limit),

      limit,

      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET CUSTOMER ORDER BY ID
// =====================================================

export const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;

    const { orderId } = req.params;

    // -------------------------------------------------
    // VALIDATE ORDER ID
    // -------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // -------------------------------------------------
    // FIND CUSTOMER ORDER
    // -------------------------------------------------

    const order = await Order.findOne({
      _id: orderId,

      user: userId,
    })
      .populate("items.product", "name images price category brand stock")
      .lean();

    // -------------------------------------------------
    // ORDER NOT FOUND
    // -------------------------------------------------

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      order,
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// CANCEL CUSTOMER ORDER
// =====================================================

export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user._id;

    const { orderId } = req.params;

    // -------------------------------------------------
    // VALIDATE ORDER ID
    // -------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    session.startTransaction();

    // -------------------------------------------------
    // FIND CUSTOMER ORDER
    // -------------------------------------------------

    const order = await Order.findOne({
      _id: orderId,

      user: userId,
    }).session(session);

    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // -------------------------------------------------
    // CHECK CURRENT STATUS
    // -------------------------------------------------

    if (order.orderStatus === "Cancelled") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // -------------------------------------------------
    // PREVENT LATE CANCELLATION
    // -------------------------------------------------

    if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled",
      });
    }

    // -------------------------------------------------
    // GET ORDER PRODUCTS
    // -------------------------------------------------

    const productIds = order.items.map((item) => item.product);

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    }).session(session);

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    // -------------------------------------------------
    // PREPARE STOCK RESTORATION
    // -------------------------------------------------

    const bulkUpdates = [];

    const inventoryLogs = [];

    for (const item of order.items) {
      const product = productMap.get(item.product.toString());

      if (!product) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const previousStock = product.stock;

      const newStock = previousStock + item.quantity;

      bulkUpdates.push({
        updateOne: {
          filter: {
            _id: product._id,
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
        product: product._id,

        previousStock,

        newStock,

        quantityChanged: item.quantity,

        action: "Order Cancelled",

        updatedBy: userId,
      });
    }

    // -------------------------------------------------
    // RESTORE PRODUCT STOCK
    // -------------------------------------------------

    await Product.bulkWrite(bulkUpdates, {
      session,
    });

    // -------------------------------------------------
    // CREATE INVENTORY LOGS
    // -------------------------------------------------

    await InventoryLog.insertMany(inventoryLogs, {
      session,
    });

    // -------------------------------------------------
    // UPDATE ORDER
    // -------------------------------------------------

    order.orderStatus = "Cancelled";

    await order.save({
      session,
    });

    // -------------------------------------------------
    // COMMIT
    // -------------------------------------------------

    await session.commitTransaction();

    // -------------------------------------------------
    // CUSTOMER EMAIL
    // -------------------------------------------------

    try {
      await sendOrderCancelledEmail(
        req.user.email,
        req.user.fullName,
        order._id,
      );
    } catch (error) {
      console.error("Order cancelled email failed:", error);
    }

    // -------------------------------------------------
    // ADMIN NOTIFICATION
    // -------------------------------------------------

    try {
      await notifyOrderCancelled(order, req.user);
    } catch (error) {
      console.error("Order cancelled notification failed:", error);
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message: "Order cancelled successfully",

      order,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Cancel Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await session.endSession();
  }
};

// =====================================================
// ADMIN - GET ALL ORDERS
// =====================================================

export const getAllOrders = async (req, res) => {
  try {
    // -------------------------------------------------
    // PAGINATION
    // -------------------------------------------------

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
      100,
    );

    const skip = (page - 1) * limit;

    // -------------------------------------------------
    // FETCH ORDERS
    // -------------------------------------------------

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

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message: totalOrders === 0 ? "No orders found" : undefined,

      totalOrders,

      currentPage: page,

      totalPages: totalOrders === 0 ? 0 : Math.ceil(totalOrders / limit),

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

// =====================================================
// ADMIN - GET SINGLE ORDER
// =====================================================

export const getAdminOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // -------------------------------------------------
    // VALIDATE ORDER ID
    // -------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // -------------------------------------------------
    // FIND ORDER
    // -------------------------------------------------

    const order = await Order.findById(orderId)
      .populate("user", "fullName email")
      .populate("items.product", "name images price category brand stock")
      .lean();

    // -------------------------------------------------
    // NOT FOUND
    // -------------------------------------------------

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      order,
    });
  } catch (error) {
    console.error("Get Admin Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// ADMIN - UPDATE ORDER STATUS
// =====================================================

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { orderStatus } = req.body;

    // -------------------------------------------------
    // VALIDATE ORDER ID
    // -------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // -------------------------------------------------
    // FIND ORDER
    // -------------------------------------------------

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // -------------------------------------------------
    // VALIDATE STATUS
    // -------------------------------------------------

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

    // -------------------------------------------------
    // PREVENT UPDATE AFTER CANCELLATION
    // -------------------------------------------------

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled orders cannot be updated",
      });
    }

    // -------------------------------------------------
    // VALID STATUS TRANSITIONS
    // -------------------------------------------------

    const validTransitions = {
      Pending: ["Processing", "Cancelled"],

      Processing: ["Shipped", "Cancelled"],

      Shipped: ["Delivered"],

      Delivered: [],

      Cancelled: [],
    };

    const allowedNextStatuses = validTransitions[order.orderStatus];

    if (!allowedNextStatuses || !allowedNextStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,

        message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
      });
    }

    // -------------------------------------------------
    // UPDATE ORDER STATUS
    // -------------------------------------------------

    order.orderStatus = orderStatus;

    // -------------------------------------------------
    // RETURN ELIGIBILITY
    // -------------------------------------------------

    if (orderStatus === "Delivered") {
      order.returnEligibleUntil = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      );
    }

    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------

    await order.save();

    // -------------------------------------------------
    // CUSTOMER NOTIFICATIONS
    // -------------------------------------------------

    if (orderStatus === "Shipped" || orderStatus === "Delivered") {
      const customer = await User.findById(order.user).select("email fullName");

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // -------------------------------------------------
      // SHIPPED
      // -------------------------------------------------

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

      // -------------------------------------------------
      // DELIVERED
      // -------------------------------------------------

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

    // -------------------------------------------------
    // RETURN UPDATED ORDER
    // -------------------------------------------------

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "fullName email")
      .populate("items.product", "name images price category brand stock")
      .lean();

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message: "Order status updated successfully",

      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
