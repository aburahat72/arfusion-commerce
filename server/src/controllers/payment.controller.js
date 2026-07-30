import mongoose from "mongoose";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Order from "../models/order.model.js";
import { sendPaymentSuccessEmail } from "../services/email.services.js";

// createPaymentOrder
// Create Razorpay Order
export const createPaymentOrder = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get order ID from request body
    const { orderId } = req.body;

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

    // Check whether payment is already completed
    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalPrice * 100, // Convert ₹ to paise
      currency: "INR",
      receipt: order._id.toString(),
    });

    // Return Razorpay order details
    return res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Create Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// verifyPayment
// Verify Razorpay Payment
export const verifyPayment = async (req, res) => {
  try {
    // Logic started
    // Get payment details
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Check whether all required fields are provided
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // Generate expected signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Verify signature
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Find order using receipt
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

    const order = await Order.findById(razorpayOrder.receipt);

    // Check whether order exists
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update payment status
    order.paymentStatus = "Paid";

    // Update order status
    order.orderStatus = "Processing";

    // Save order
    await order.save();

    // Send payment success email to the customer
    try {
      await sendPaymentSuccessEmail(
        req.user.email,
        req.user.fullName,
        order._id,
        order.totalPrice,
      );
    } catch (error) {
      console.error("Payment success email failed:", error);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
