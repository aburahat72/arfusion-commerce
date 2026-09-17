import mongoose from "mongoose";

import Order from "../models/order.model.js";
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
    const userId = req.user._id;

    const { items, shippingAddress, paymentMethod } = req.body;

    // -------------------------------------------------
    // VALIDATE ORDER ITEMS
    // -------------------------------------------------

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    // -------------------------------------------------
    // VALIDATE SHIPPING ADDRESS
    // -------------------------------------------------

    if (
      typeof shippingAddress !== "string" ||
      shippingAddress.trim().length < 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid shipping address is required",
      });
    }

    // -------------------------------------------------
    // VALIDATE PAYMENT METHOD
    // -------------------------------------------------

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Payment method must be COD or ONLINE",
      });
    }

    // -------------------------------------------------
    // NORMALIZE AND VALIDATE ITEMS
    // -------------------------------------------------

    const normalizedItems = [];

    for (const item of items) {
      if (!item || typeof item !== "object") {
        return res.status(400).json({
          success: false,
          message: "Invalid order item",
        });
      }

      const productId = item.productId || item.product;

      if (
        typeof productId !== "string" ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Product quantity must be at least 1",
        });
      }

      normalizedItems.push({
        productId,
        quantity: item.quantity,
      });
    }

    // -------------------------------------------------
    // PREVENT DUPLICATE PRODUCTS
    // -------------------------------------------------

    const productIdSet = new Set();

    for (const item of normalizedItems) {
      if (productIdSet.has(item.productId)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate product found in order",
        });
      }

      productIdSet.add(item.productId);
    }

    // -------------------------------------------------
    // START TRANSACTION
    // -------------------------------------------------

    session.startTransaction();

    // -------------------------------------------------
    // FETCH PRODUCTS
    // -------------------------------------------------

    const products = [];

    for (const item of normalizedItems) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      products.push(product);
    }

    // -------------------------------------------------
    // PRODUCT MAP
    // -------------------------------------------------

    const productMap = new Map();

    for (const product of products) {
      productMap.set(product._id.toString(), product);
    }

    // -------------------------------------------------
    // VALIDATE PRODUCTS AND STOCK
    // -------------------------------------------------

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId);

      if (!product) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // -------------------------------------------------
      // CHECK PRODUCT ACTIVE STATUS
      // -------------------------------------------------

      if (!product.isActive) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`,
        });
      }

      // -------------------------------------------------
      // CHECK STOCK
      // -------------------------------------------------

      if (item.quantity > product.stock) {
        await session.abortTransaction();

        return res.status(409).json({
          success: false,
          message: `${product.name} does not have enough stock`,
        });
      }
    }

    // -------------------------------------------------
    // PREPARE ORDER ITEMS
    // -------------------------------------------------

    const orderItems = normalizedItems.map((item) => {
      const product = productMap.get(item.productId);

      return {
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // -------------------------------------------------
    // CALCULATE TOTAL PRICE
    // -------------------------------------------------

    const totalPrice = orderItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // -------------------------------------------------
    // CREATE ORDER
    // -------------------------------------------------

    const [order] = await Order.create(
      [
        {
          user: userId,

          items: orderItems,

          totalPrice,

          shippingAddress: shippingAddress.trim(),

          paymentMethod,

          paymentStatus: "Pending",

          orderStatus: "Pending",
        },
      ],
      {
        session,
      },
    );

    // -------------------------------------------------
    // PREPARE STOCK UPDATES
    // -------------------------------------------------

    const bulkUpdates = [];
    const inventoryLogs = [];

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId);

      const previousStock = product.stock;

      const newStock = previousStock - item.quantity;

      // -------------------------------------------------
      // PRODUCT STOCK UPDATE
      // -------------------------------------------------

      bulkUpdates.push({
        updateOne: {
          filter: {
            _id: product._id,

            stock: {
              $gte: item.quantity,
            },

            isActive: true,
          },

          update: {
            $set: {
              stock: newStock,

              isActive: newStock > 0,
            },
          },
        },
      });

      // -------------------------------------------------
      // INVENTORY LOG
      // -------------------------------------------------

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
    // VERIFY STOCK UPDATES
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
    // COMMIT TRANSACTION
    // -------------------------------------------------

    await session.commitTransaction();

    // -------------------------------------------------
    // CUSTOMER EMAIL
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
    // ADMIN NOTIFICATION
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
