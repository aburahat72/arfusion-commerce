import mongoose from "mongoose";
import razorpay from "../config/razorpay.js";
import Order from "../models/order.model.js";
import PaymentIntent from "../models/paymentIntent.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import InventoryLog from "../models/inventoryLog.model.js";
import { createNotification } from "../services/notification.services.js";
import {
  sendRefundCompletedEmail,
  sendReplacementShippedEmail,
  sendReturnApprovedEmail,
  sendReturnRejectedEmail,
  sendReturnRequestedEmail,
} from "../services/email.services.js";
import { emitToAdmins, emitToCustomer } from "../realtime/socket.server.js";

const isValidOrderId = (id) => mongoose.Types.ObjectId.isValid(id);

const notifyReturnChange = async (order, recipient, title, message) => {
  await createNotification({
    title,
    message,
    type: order.refundRequested ? "Refund" : "Return",
    recipient,
    user: order.user,
    relatedOrder: order._id,
  });
  emitToCustomer(order.user, "order:status", {
    orderId: order._id.toString(),
    orderStatus: order.orderStatus,
    returnStatus: order.returnStatus,
    refundStatus: order.refundStatus,
    paymentStatus: order.paymentStatus,
  });
  emitToAdmins("return:status", {
    orderId: order._id.toString(),
    returnStatus: order.returnStatus,
    refundStatus: order.refundStatus,
  });
}

export const requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { returnReason, requestType } = req.body;
    if (!isValidOrderId(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    const now = new Date();
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      orderStatus: "Delivered",
      returnStatus: "Not Requested",
      returnEligibleUntil: { $gte: now },
    });
    if (!order) {
      const existingOrder = await Order.findOne({ _id: orderId, user: req.user._id });
      if (!existingOrder) {
        return res.status(404).json({ success: false, message: "Order not found." });
      }
      return res.status(409).json({
        success: false,
        message:
          existingOrder.returnStatus !== "Not Requested"
            ? "A return request has already been submitted."
            : "This order is not eligible for a return.",
      });
    }
    const linkedPaymentId =
      order.razorpayPaymentId || (await getPaymentIdForOrder(order));
    if (
      requestType === "Refund" &&
      (order.paymentMethod !== "ONLINE" ||
        order.paymentStatus !== "Paid" ||
        !linkedPaymentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay refunds are available only for verified online payments.",
      });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: req.user._id,
        orderStatus: "Delivered",
        returnStatus: "Not Requested",
        returnEligibleUntil: { $gte: now },
      },
      {
        $set: {
          returnStatus: "Pending",
          returnType: requestType,
          returnReason: returnReason.trim(),
          returnRequestedAt: now,
          refundRequested: requestType === "Refund",
          replacementRequested: requestType === "Replacement",
          refundStatus: requestType === "Refund" ? "Pending" : "Not Applicable",
          ...(linkedPaymentId ? { razorpayPaymentId: linkedPaymentId } : {}),
        },
      },
      { new: true },
    );
    if (!updatedOrder) {
      return res.status(409).json({
        success: false,
        message: "The order changed while the return request was being submitted.",
      });
    }

    await notifyReturnChange(
      updatedOrder,
      "admin",
      "New return request",
      `A customer requested a ${requestType.toLowerCase()} for order #${orderId}.`,
    );
    await notifyReturnChange(
      updatedOrder,
      "customer",
      "Return request received",
      `Your ${requestType.toLowerCase()} request is pending review.`,
    );
    try {
      await sendReturnRequestedEmail(
        req.user.email,
        req.user.fullName,
        updatedOrder._id,
        requestType,
      );
    } catch (error) {
      console.error("Return request email failed:", error);
    }

    return res.status(201).json({
      success: true,
      message: `${requestType} request submitted successfully.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Request return failed:", error);
    return res.status(500).json({ success: false, message: "Unable to submit return request." });
  }
};

export const getMyReturnRequests = async (req, res) => {
  try {
    const returnRequests = await Order.find({
      user: req.user._id,
      returnStatus: { $ne: "Not Requested" },
    })
      .populate("items.product", "name images")
      .sort({ returnRequestedAt: -1 })
      .lean();
    return res.status(200).json({ success: true, count: returnRequests.length, returnRequests });
  } catch (error) {
    console.error("Get customer return requests failed:", error);
    return res.status(500).json({ success: false, message: "Unable to load return requests." });
  }
};

export const getAllReturnRequests = async (_req, res) => {
  try {
    const returnRequests = await Order.find({
      returnStatus: { $ne: "Not Requested" },
    })
      .populate("user", "fullName email")
      .populate("items.product", "name images")
      .sort({ returnRequestedAt: -1 })
      .lean();
    return res.status(200).json({ success: true, count: returnRequests.length, returnRequests });
  } catch (error) {
    console.error("Get admin return requests failed:", error);
    return res.status(500).json({ success: false, message: "Unable to load return requests." });
  }
};

export const approveReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!isValidOrderId(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }
    const order = await Order.findOneAndUpdate(
      { _id: orderId, returnStatus: "Pending" },
      { $set: { returnStatus: "Approved" } },
      { new: true },
    );
    if (!order) {
      return res.status(409).json({
        success: false,
        message: "No pending return request was found.",
      });
    }
    const customer = await User.findById(order.user).select("email fullName");
    if (!customer) {
      return res.status(409).json({ success: false, message: "Order customer no longer exists." });
    }

    await notifyReturnChange(
      order,
      "customer",
      "Return request approved",
      "Your return request has been approved.",
    );
    try {
      await sendReturnApprovedEmail(customer.email, customer.fullName, order._id);
    } catch (error) {
      console.error("Return approval email failed:", error);
    }
    return res.status(200).json({ success: true, message: "Return request approved.", order });
  } catch (error) {
    console.error("Approve return failed:", error);
    return res.status(500).json({ success: false, message: "Unable to approve return request." });
  }
};

export const rejectReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!isValidOrderId(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }
    const order = await Order.findOneAndUpdate(
      { _id: orderId, returnStatus: "Pending" },
      {
        $set: {
          returnStatus: "Rejected",
          refundStatus: "Not Applicable",
          refundRequested: false,
          replacementRequested: false,
        },
      },
      { new: true },
    );
    if (!order) {
      return res.status(409).json({
        success: false,
        message: "No pending return request was found.",
      });
    }
    const customer = await User.findById(order.user).select("email fullName");
    await notifyReturnChange(
      order,
      "customer",
      "Return request rejected",
      "Your return request was not approved.",
    );
    if (customer) {
      try {
        await sendReturnRejectedEmail(customer.email, customer.fullName, order._id);
      } catch (error) {
        console.error("Return rejection email failed:", error);
      }
    }
    return res.status(200).json({ success: true, message: "Return request rejected.", order });
  } catch (error) {
    console.error("Reject return failed:", error);
    return res.status(500).json({ success: false, message: "Unable to reject return request." });
  }
};

const getPaymentIdForOrder = async (order) => {
  if (order.razorpayPaymentId) return order.razorpayPaymentId;
  const intent = await PaymentIntent.findOne({
    order: order._id,
    user: order.user,
    status: "Paid",
  }).select("paymentId");
  return intent?.paymentId || "";
};

const reconcileRefund = async (orderId, refund, adminId) => {
  if (!refund || refund.status !== "processed") {
    return null;
  }
  const order = await Order.findById(orderId);
  if (!order) return null;

  const expectedAmount = Math.round(order.totalPrice * 100);
  if (
    Number(refund.amount) !== expectedAmount ||
    refund.payment_id !== order.razorpayPaymentId
  ) {
    const paymentId = await getPaymentIdForOrder(order);
    if (refund.payment_id !== paymentId || Number(refund.amount) !== expectedAmount) {
      throw new Error("The confirmed Razorpay refund does not match the order amount/payment.");
    }
  }

  const session = await mongoose.startSession();
  let updatedOrder;
  const inventoryChanges = [];
  try {
    session.startTransaction();
    const currentOrder = await Order.findOne({
      _id: orderId,
      returnStatus: "Approved",
      refundRequested: true,
      paymentStatus: "Paid",
      refundStatus: "Processing",
      razorpayRefundId: refund.id,
    }).session(session);
    if (!currentOrder) {
      await session.abortTransaction();
      const alreadyDone = await Order.findOne({
        _id: orderId,
        refundStatus: "Completed",
        razorpayRefundId: refund.id,
      });
      return alreadyDone;
    }

    const quantities = new Map();
    for (const item of currentOrder.items) {
      const productId = item.product.toString();
      quantities.set(productId, (quantities.get(productId) || 0) + item.quantity);
    }
    const products = await Product.find({
      _id: { $in: [...quantities.keys()] },
    }).session(session);
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));
    const increments = [];
    const logs = [];
    for (const [productId, quantity] of quantities) {
      const product = productMap.get(productId);
      if (!product) continue;
      increments.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { stock: quantity } },
        },
      });
      logs.push({
        product: product._id,
        previousStock: product.stock,
        newStock: product.stock + quantity,
        quantityChanged: quantity,
        action: "Refund",
        updatedBy: adminId,
      });
      inventoryChanges.push({
        productId: product._id.toString(),
        stock: product.stock + item.quantity,
      });
    }
    if (increments.length) {
      await Product.bulkWrite(increments, { session });
      await InventoryLog.insertMany(logs, { session });
    }

    currentOrder.refundStatus = "Completed";
    currentOrder.returnStatus = "Refunded";
    currentOrder.paymentStatus = "Refunded";
    currentOrder.refundCompletedAt = new Date();
    updatedOrder = await currentOrder.save({ session });
    await PaymentIntent.updateOne(
      { order: currentOrder._id, status: "Paid" },
      { $set: { status: "Refunded" } },
      { session },
    );
    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  for (const change of inventoryChanges) {
    emitToAdmins("inventory:updated", {
      ...change,
      source: "refund",
      orderId: updatedOrder._id.toString(),
    });
  }
  emitToCustomer(updatedOrder.user, "payment:status", {
    orderId: updatedOrder._id.toString(),
    status: "Refunded",
    refundId: updatedOrder.razorpayRefundId,
  });
  await notifyReturnChange(
    updatedOrder,
    "customer",
    "Refund completed",
    "Your Razorpay refund has been confirmed.",
  );
  await notifyReturnChange(
    updatedOrder,
    "admin",
    "Refund completed",
    `The refund for order #${updatedOrder._id} was confirmed by Razorpay.`,
  );
  return updatedOrder;
};

export const completeRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!isValidOrderId(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }
    let order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    if (order.refundStatus === "Completed") {
      return res.status(200).json({ success: true, message: "Refund already completed.", order });
    }
    if (
      order.returnStatus !== "Approved" ||
      !order.refundRequested ||
      order.paymentMethod !== "ONLINE" ||
      order.paymentStatus !== "Paid"
    ) {
      return res.status(409).json({
        success: false,
        message: "Only an approved, paid online refund request can be refunded.",
      });
    }

    const staleBefore = new Date(Date.now() - 5 * 60 * 1000);
    const query = {
      _id: order._id,
      returnStatus: "Approved",
      refundRequested: true,
      paymentMethod: "ONLINE",
      paymentStatus: "Paid",
      ...(order.refundStatus === "Processing"
        ? {
            razorpayRefundId: { $in: ["", null] },
            $or: [
              { refundAttemptedAt: { $lte: staleBefore } },
              { refundAttemptedAt: null },
              { refundAttemptedAt: { $exists: false } },
            ],
          }
        : { refundStatus: { $in: ["Pending", "Failed"] } }),
    };

    if (order.refundStatus === "Processing" && order.razorpayRefundId) {
      const paymentId = await getPaymentIdForOrder(order);
      const refund = await razorpay.payments.fetchRefund(
        paymentId,
        order.razorpayRefundId,
      );
      if (refund.status === "processed") {
        const completedOrder = await reconcileRefund(order._id, refund, req.user._id);
        if (completedOrder?.refundStatus === "Completed") {
          const customer = await User.findById(order.user).select("email fullName");
          if (customer) {
            try {
              await sendRefundCompletedEmail(
                customer.email,
                customer.fullName,
                order._id,
                order.totalPrice,
              );
            } catch (error) {
              console.error("Refund confirmation email failed:", error);
            }
          }
          return res.status(200).json({
            success: true,
            message: "Razorpay confirmed the refund.",
            order: completedOrder,
          });
        }
      }
      if (refund.status === "failed") {
        order = await Order.findOneAndUpdate(
          { _id: order._id, refundStatus: "Processing", razorpayRefundId: refund.id },
          { $set: { refundStatus: "Failed" } },
          { new: true },
        );
        return res.status(502).json({
          success: false,
          message: "Razorpay reported that the refund failed.",
          order,
        });
      }
      return res.status(202).json({
        success: true,
        message: "Razorpay is still processing the refund.",
        order,
      });
    }

    if (
      order.refundStatus === "Processing" &&
      order.refundAttemptedAt &&
      order.refundAttemptedAt > staleBefore
    ) {
      return res.status(202).json({
        success: true,
        message: "The refund request is being reconciled with Razorpay.",
        order,
      });
    }

    const claimedOrder = await Order.findOneAndUpdate(
      query,
      { $set: { refundStatus: "Processing", refundAttemptedAt: new Date() } },
      { new: true },
    );
    if (!claimedOrder) {
      return res.status(409).json({
        success: false,
        message: "The refund is already being processed or the request changed.",
      });
    }
    order = claimedOrder;

    const paymentId = await getPaymentIdForOrder(order);
    if (!paymentId) {
      await Order.updateOne(
        { _id: order._id, refundStatus: "Processing", razorpayRefundId: "" },
        { $set: { refundStatus: "Failed" } },
      );
      return res.status(409).json({
        success: false,
        message: "No verified Razorpay payment is linked to this order.",
      });
    }

    const receipt = `ret_${order._id.toString()}`;
    let refunds = await razorpay.payments.fetchMultipleRefund(paymentId, { count: 100 });
    let refund = refunds.items?.find(
      (candidate) =>
        candidate.status !== "failed" &&
        (candidate.receipt === receipt ||
          candidate.notes?.orderId === order._id.toString()),
    );
    if (!refund) {
      const payment = await razorpay.payments.fetch(paymentId);
      if (
        payment.id !== paymentId ||
        payment.order_id !== (await PaymentIntent.findOne({ order: order._id }).select("razorpayOrderId"))?.razorpayOrderId ||
        !["captured", "refunded"].includes(payment.status)
      ) {
        await Order.updateOne(
          { _id: order._id, refundStatus: "Processing", razorpayRefundId: "" },
          { $set: { refundStatus: "Failed" } },
        );
        return res.status(409).json({
          success: false,
          message: "Razorpay payment verification failed; no refund was created.",
        });
      }
      refund = await razorpay.payments.refund(paymentId, {
        amount: Math.round(order.totalPrice * 100),
        receipt,
        notes: { orderId: order._id.toString() },
      });
    }

    if (
      refund.payment_id !== paymentId ||
      Number(refund.amount) !== Math.round(order.totalPrice * 100)
    ) {
      console.error("Razorpay returned a refund that does not match order", order._id);
      return res.status(502).json({
        success: false,
        message: "Razorpay refund details do not match this order; manual review is required.",
      });
    }

    order = await Order.findOneAndUpdate(
      { _id: order._id, refundStatus: "Processing", paymentStatus: "Paid" },
      { $set: { razorpayPaymentId: paymentId, razorpayRefundId: refund.id } },
      { new: true },
    );
    if (!order) {
      return res.status(409).json({
        success: false,
        message: "Order changed while the refund was being submitted.",
      });
    }

    emitToCustomer(order.user, "payment:status", {
      orderId: order._id.toString(),
      status: "Refund processing",
      refundId: order.razorpayRefundId,
    });
    emitToAdmins("payment:status", {
      orderId: order._id.toString(),
      status: "Refund processing",
      refundId: order.razorpayRefundId,
    });

    if (refund.status === "processed") {
      const completedOrder = await reconcileRefund(order._id, refund, req.user._id);
      const customer = await User.findById(order.user).select("email fullName");
      if (completedOrder?.refundStatus === "Completed" && customer) {
        try {
          await sendRefundCompletedEmail(
            customer.email,
            customer.fullName,
            order._id,
            order.totalPrice,
          );
        } catch (error) {
          console.error("Refund confirmation email failed:", error);
        }
      }
      return res.status(200).json({
        success: true,
        message: "Razorpay confirmed the refund.",
        order: completedOrder || order,
      });
    }
    if (refund.status === "failed") {
      order = await Order.findOneAndUpdate(
        { _id: order._id, refundStatus: "Processing", razorpayRefundId: refund.id },
        { $set: { refundStatus: "Failed" } },
        { new: true },
      );
      return res.status(502).json({
        success: false,
        message: "Razorpay reported that the refund failed.",
        order,
      });
    }
    return res.status(202).json({
      success: true,
      message: "Razorpay accepted the refund and is processing it.",
      order,
    });
  } catch (error) {
    console.error("Complete Razorpay refund failed:", error);
    return res.status(502).json({
      success: false,
      message: "Razorpay refund status could not be confirmed. Retry reconciliation before creating another refund.",
    });
  }
};

export const completeReplacement = async (req, res) => {
  const session = await mongoose.startSession();
  let order;
  try {
    const { orderId } = req.params;
    if (!isValidOrderId(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }
    session.startTransaction();
    const currentOrder = await Order.findOne({
      _id: orderId,
      returnStatus: "Approved",
      replacementRequested: true,
    }).session(session);
    if (!currentOrder) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "No approved replacement request was found.",
      });
    }

    const quantities = new Map();
    for (const item of currentOrder.items) {
      const key = item.product.toString();
      quantities.set(key, (quantities.get(key) || 0) + item.quantity);
    }
    const productIds = [...quantities.keys()].map((id) => new mongoose.Types.ObjectId(id));
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));
    const updates = [];
    const logs = [];
    for (const [productId, quantity] of quantities) {
      const product = productMap.get(productId);
      if (!product || !product.isActive || product.stock < quantity) {
        await session.abortTransaction();
        return res.status(409).json({
          success: false,
          message: `${product?.name || "A replacement product"} does not have enough active stock.`,
        });
      }
      updates.push({
        updateOne: {
          filter: { _id: product._id, isActive: true, stock: { $gte: quantity } },
          update: { $inc: { stock: -quantity } },
        },
      });
      logs.push({
        product: product._id,
        previousStock: product.stock,
        newStock: product.stock - quantity,
        quantityChanged: quantity,
        action: "Replacement",
        updatedBy: req.user._id,
      });
    }
    const result = await Product.bulkWrite(updates, { session });
    if (result.modifiedCount !== updates.length) {
      throw new Error("Replacement stock changed while processing.");
    }
    await InventoryLog.insertMany(logs, { session });
    currentOrder.returnStatus = "Replaced";
    currentOrder.replacementRequested = false;
    order = await currentOrder.save({ session });
    await session.commitTransaction();

    const customer = await User.findById(order.user).select("email fullName");
    await notifyReturnChange(
      order,
      "customer",
      "Replacement processed",
      "Your replacement request has been fulfilled.",
    );
    for (const log of logs) {
      emitToAdmins("inventory:updated", {
        productId: log.product.toString(),
        stock: log.newStock,
        source: "replacement",
        orderId: order._id.toString(),
      });
    }
    if (customer) {
      try {
        await sendReplacementShippedEmail(customer.email, customer.fullName, order._id);
      } catch (error) {
        console.error("Replacement email failed:", error);
      }
    }
    return res.status(200).json({ success: true, message: "Replacement fulfilled.", order });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error("Complete replacement failed:", error);
    return res.status(500).json({ success: false, message: "Unable to fulfill replacement." });
  } finally {
    await session.endSession();
  }
};
