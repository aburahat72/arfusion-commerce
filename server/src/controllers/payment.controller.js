import mongoose from "mongoose";
import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import PaymentIntent from "../models/paymentIntent.model.js";
import InventoryLog from "../models/inventoryLog.model.js";
import {
  CheckoutInputError,
  normalizeCheckoutItems,
} from "../utils/checkoutItems.js";
import {
  calculateCouponPricing,
  CouponEligibilityError,
  redeemCoupon,
} from "../utils/couponPricing.js";
import { emitToAdmins, emitToCustomer } from "../realtime/socket.server.js";

import { sendPaymentSuccessEmail } from "../services/email.services.js";

/*
 * =====================================================
 * CREATE RAZORPAY PAYMENT ORDER
 * =====================================================
 *
 * PAYMENT-FIRST FLOW
 *
 * Customer Checkout
 *        ↓
 * PaymentIntent
 *        ↓
 * Razorpay Order
 *        ↓
 * Razorpay Checkout
 *        ↓
 * Verify Payment
 *        ↓
 * Final MongoDB Order
 *
 * IMPORTANT:
 * This function does NOT create the final
 * MongoDB customer Order.
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      shippingAddress,
      items = [],
      checkoutMode = "cart",
      couponCode,
    } = req.body;

    /*
     * =====================================================
     * VALIDATION
     * =====================================================
     */

    if (
      !shippingAddress ||
      typeof shippingAddress !== "string" ||
      shippingAddress.trim().length < 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid shipping address is required.",
      });
    }

    if (!["cart", "buyNow"].includes(checkoutMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkout mode.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product is required.",
      });
    }

    /*
     * =====================================================
     * NORMALIZE AND VALIDATE PRODUCTS
     * =====================================================
     */

    const normalizedItems = normalizeCheckoutItems(items);

    /*
     * =====================================================
     * GET PRODUCTS
     * =====================================================
     *
     * IMPORTANT:
     *
     * We intentionally use findOne() for each product.
     *
     * This avoids the $in ObjectId casting problem that
     * was occurring in the current payment flow.
     *
     * DO NOT change this back to:
     *
     * Product.find({
     *   _id: {
     *     $in: productIds,
     *   },
     * })
     */

    const products = [];

    for (const item of normalizedItems) {
      const product = await Product.findOne({
        _id: new mongoose.Types.ObjectId(item.productId),
      }).lean();

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} was not found.`,
        });
      }

      products.push(product);
    }

    /*
     * =====================================================
     * CREATE SERVER-SIDE PAYMENT ITEMS
     * =====================================================
     *
     * Never trust frontend prices.
     */

    const paymentItems = [];

    for (const item of normalizedItems) {
      const product = products.find(
        (productItem) => productItem._id.toString() === item.productId,
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Selected product was not found.",
        });
      }

      /*
       * -------------------------------------------------
       * PRODUCT ACTIVE CHECK
       * -------------------------------------------------
       */

      if (product.isActive === false) {
        return res.status(400).json({
          success: false,
          message: `${
            product.name || "A selected product"
          } is no longer available.`,
        });
      }

      /*
       * -------------------------------------------------
       * STOCK CHECK
       * -------------------------------------------------
       */

      const stock = Number(product.stock) || 0;

      if (stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${
            product.name || "a selected product"
          }.`,
        });
      }

      /*
       * -------------------------------------------------
       * SERVER-SIDE PRICE
       * -------------------------------------------------
       */

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name || "a selected product"}.`,
        });
      }

      paymentItems.push({
        product: product._id,
        quantity: item.quantity,
        price,
      });
    }

    /*
     * =====================================================
     * VALIDATE TOTAL
     * =====================================================
     */

    const pricing = await calculateCouponPricing(
      paymentItems,
      userId,
      couponCode,
    );
    const totalPrice = pricing.totalPrice;

    if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total.",
      });
    }

    /*
     * =====================================================
     * CREATE PAYMENT INTENT
     * =====================================================
     *
     * NO FINAL ORDER IS CREATED HERE.
     */

    const paymentIntent = await PaymentIntent.create({
      user: userId,

      items: paymentItems,

      totalPrice,

      subtotal: pricing.subtotal,

      shippingAmount: pricing.shipping,

      discount: pricing.discount,

      couponDiscount: pricing.couponDiscount,

      coupon: pricing.couponId,

      couponCode: pricing.couponCode,

      shippingAddress: shippingAddress.trim(),

      checkoutMode,

      /*
       * Temporary unique value.
       * Replaced immediately after Razorpay
       * order creation.
       */
      razorpayOrderId: `pending_${new mongoose.Types.ObjectId()}`,

      paymentId: "",

      order: null,

      status: "Created",
    });

    /*
     * =====================================================
     * CREATE RAZORPAY ORDER
     * =====================================================
     */

    let razorpayOrder;

    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalPrice * 100),

        currency: "INR",

        receipt: `pi_${paymentIntent._id.toString()}`,

        notes: {
          paymentIntentId: paymentIntent._id.toString(),

          userId: userId.toString(),

          checkoutMode,
        },
      });
    } catch (razorpayError) {
      /*
       * Razorpay order creation failed.
       *
       * Remove the temporary PaymentIntent because
       * there is no usable Razorpay payment order.
       */

      await PaymentIntent.deleteOne({
        _id: paymentIntent._id,
      });

      throw razorpayError;
    }

    /*
     * =====================================================
     * SAVE REAL RAZORPAY ORDER ID
     * =====================================================
     */

    paymentIntent.razorpayOrderId = razorpayOrder.id;

    await paymentIntent.save();

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return res.status(200).json({
      success: true,

      message: "Payment order created successfully.",

      paymentIntentId: paymentIntent._id.toString(),

      /*
       * Razorpay order ID.
       *
       * Frontend uses this as:
       *
       * order_id
       */
      orderId: razorpayOrder.id,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      summary: {
        items: pricing.items,
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        discount: pricing.discount,
        couponDiscount: pricing.couponDiscount,
        couponCode: pricing.couponCode,
        total: pricing.totalPrice,
      },
    });
  } catch (error) {
    console.error("Create Payment Error:", error);

    if (error instanceof CheckoutInputError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    if (error instanceof CouponEligibilityError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || "Unable to create payment order.",
    });
  }
};

/*
 * =====================================================
 * VERIFY RAZORPAY PAYMENT
 * =====================================================
 *
 * Razorpay
 *    ↓
 * Signature verification
 *    ↓
 * PaymentIntent
 *    ↓
 * Amount verification
 *    ↓
 * Razorpay order verification
 *    ↓
 * Stock verification
 *    ↓
 * Final MongoDB Order
 *
 * IMPORTANT:
 * The final Order is created ONLY after
 * successful Razorpay verification.
 */
export const verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  let recoveryPaymentIntentId;
  let recoveryPaymentId;

  try {
    const userId = req.user._id;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    /*
     * =====================================================
     * VALIDATION
     * =====================================================
     */

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment details are required.",
      });
    }

    /*
     * =====================================================
     * VERIFY RAZORPAY SIGNATURE
     * =====================================================
     */

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const suppliedSignature = Buffer.from(razorpay_signature, "hex");
    const expectedSignature = Buffer.from(generatedSignature, "hex");
    if (
      suppliedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(suppliedSignature, expectedSignature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay payment signature.",
      });
    }

    /*
     * =====================================================
     * FETCH RAZORPAY ORDER
     * =====================================================
     */

    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

    if (!razorpayOrder) {
      return res.status(404).json({
        success: false,
        message: "Razorpay order was not found.",
      });
    }

    /*
     * =====================================================
     * GET PAYMENT INTENT ID
     * =====================================================
     *
     * Receipt format:
     *
     * pi_<paymentIntentId>
     */

    const receipt = razorpayOrder.receipt || "";

    if (!receipt.startsWith("pi_")) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment receipt.",
      });
    }

    const paymentIntentId = receipt.substring(3);
    recoveryPaymentIntentId = paymentIntentId;
    recoveryPaymentId = razorpay_payment_id;

    if (!mongoose.Types.ObjectId.isValid(paymentIntentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment intent.",
      });
    }

    /*
     * =====================================================
     * GET PAYMENT INTENT
     * =====================================================
     */

    const paymentIntent = await PaymentIntent.findOne({
      _id: paymentIntentId,

      user: userId,

      razorpayOrderId: razorpay_order_id,
    });

    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        message: "Payment intent was not found.",
      });
    }

    /*
     * =====================================================
     * DUPLICATE PAYMENT
     * =====================================================
     */

    if (paymentIntent.status === "Paid") {
      if (paymentIntent.paymentId !== razorpay_payment_id) {
        return res.status(409).json({
          success: false,
          message: "This payment intent was completed with a different payment.",
        });
      }
      const existingOrder = paymentIntent.order
        ? await Order.findOne({
            _id: paymentIntent.order,
            user: userId,
          })
        : null;

      if (existingOrder) {
        return res.status(200).json({
          success: true,
          message: "Payment was already verified.",
          order: existingOrder,
        });
      }

      return res.status(409).json({
        success: false,
        message: "Payment has already been processed.",
      });
    }

    /*
     * =====================================================
     * FAILED / CANCELLED PAYMENT
     * =====================================================
     */

    if (
      paymentIntent.status === "Failed" ||
      paymentIntent.status === "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "This payment attempt is no longer active.",
      });
    }

    /*
     * =====================================================
     * VERIFY AMOUNT
     * =====================================================
     */

    const expectedAmount = Math.round(paymentIntent.totalPrice * 100);

    if (Number(razorpayOrder.amount) !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match the order total.",
      });
    }

    /*
     * =====================================================
     * VERIFY RAZORPAY ORDER STATUS
     * =====================================================
     */

    if (razorpayOrder.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment has not been completed.",
      });
    }

    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.status !== "captured" ||
      Number(razorpayPayment.amount) !== expectedAmount ||
      razorpayPayment.currency !== razorpayOrder.currency
    ) {
      return res.status(400).json({
        success: false,
        message: "The Razorpay payment is not a captured payment for this order.",
      });
    }

    /*
     * =====================================================
     * START TRANSACTION
     * =====================================================
     */

    session.startTransaction();

    /*
     * =====================================================
     * GET PRODUCTS
     * =====================================================
     *
     * IMPORTANT:
     *
     * We intentionally use findOne() for each
     * product instead of the previous $in query.
     *
     * This also ensures every product lookup is
     * performed inside the transaction.
     */

    const products = [];

    for (const item of paymentIntent.items) {
      const product = await Product.findOne({
        _id: item.product,
      }).session(session);

      if (!product) {
        throw new Error(
          `Product ${item.product.toString()} is no longer available.`,
        );
      }

      products.push(product);
    }

    /*
     * =====================================================
     * CHECK PRODUCTS AND STOCK AGAIN
     * =====================================================
     *
     * Stock may have changed between:
     *
     * createPaymentOrder()
     *
     * and
     *
     * verifyPayment()
     */

    for (const item of paymentIntent.items) {
      const product = products.find(
        (productItem) => productItem._id.toString() === item.product.toString(),
      );

      if (!product) {
        throw new Error("A product from the payment could not be found.");
      }

      /*
       * -------------------------------------------------
       * ACTIVE CHECK
       * -------------------------------------------------
       */

      if (product.isActive === false) {
        const conflict = new Error(
          `${product.name || "A product"} is no longer available.`,
        );
        conflict.statusCode = 409;
        throw conflict;
      }

      /*
       * -------------------------------------------------
       * STOCK CHECK
       * -------------------------------------------------
       */

      if (Number(product.stock) < Number(item.quantity)) {
        const conflict = new Error(
          `Insufficient stock for ${product.name || "a product"}.`,
        );
        conflict.statusCode = 409;
        throw conflict;
      }
    }

    /*
     * =====================================================
     * CREATE FINAL MONGODB ORDER
     * =====================================================
     *
     * THIS IS THE FIRST TIME THE FINAL CUSTOMER
     * ORDER IS CREATED FOR ONLINE PAYMENT.
     *
     * Payment has already been:
     *
     * 1. Signature verified
     * 2. Razorpay order verified
     * 3. Amount verified
     * 4. Stock verified
     */

    const claimResult = await PaymentIntent.updateOne(
      {
        _id: paymentIntent._id,
        user: userId,
        status: "Created",
        order: null,
      },
      {
        $set: {
          status: "Paid",
          paymentId: razorpay_payment_id,
        },
      },
      { session },
    );
    if (claimResult.modifiedCount !== 1) {
      const conflict = new Error("This payment is already being processed.");
      conflict.statusCode = 409;
      throw conflict;
    }

    const [createdOrder] = await Order.create(
      [
        {
          user: userId,

          paymentIntent: paymentIntent._id,

          items: paymentIntent.items.map((item) => ({
            product: item.product,

            quantity: item.quantity,

            /*
             * Price was captured from
             * MongoDB before payment.
             */
            price: item.price,
          })),

          totalPrice: paymentIntent.totalPrice,

          subtotal: paymentIntent.subtotal,

          shippingAmount: paymentIntent.shippingAmount,

          discount: paymentIntent.discount,

          couponDiscount: paymentIntent.couponDiscount,

          coupon: paymentIntent.coupon,

          couponCode: paymentIntent.couponCode,

          shippingAddress: paymentIntent.shippingAddress,

          paymentMethod: "ONLINE",

          paymentStatus: "Paid",

          orderStatus: "Processing",

          razorpayPaymentId: razorpay_payment_id,
        },
      ],
      {
        session,
      },
    );

    await redeemCoupon(
      {
        couponId: paymentIntent.coupon,
        subtotal: paymentIntent.subtotal,
      },
      userId,
      session,
      { paymentSnapshot: true },
    );

    /*
     * =====================================================
     * UPDATE PRODUCT STOCK
     * =====================================================
     */

    const inventoryLogs = [];
    const stockUpdates = [];
    for (const item of paymentIntent.items) {
      const product = products.find(
        (productItem) => productItem._id.toString() === item.product.toString(),
      );

      if (!product) {
        throw new Error("Unable to update product stock.");
      }

      const previousStock = Number(product.stock);
      stockUpdates.push({
        updateOne: {
          filter: {
            _id: product._id,
            isActive: true,
            stock: { $gte: item.quantity },
          },
          update: { $inc: { stock: -item.quantity } },
        },
      });
      inventoryLogs.push({
        product: product._id,
        previousStock,
        newStock: previousStock - item.quantity,
        quantityChanged: item.quantity,
        action: "Order Placed",
        updatedBy: userId,
      });
    }

    const stockResult = await Product.bulkWrite(stockUpdates, { session });
    if (stockResult.modifiedCount !== stockUpdates.length) {
      const conflict = new Error(
        "Stock changed during payment verification. Contact support with your payment reference.",
      );
      conflict.statusCode = 409;
      throw conflict;
    }

    await InventoryLog.insertMany(inventoryLogs, { session });

    /*
     * =====================================================
     * UPDATE PAYMENT INTENT
     * =====================================================
     */

    const linkedIntent = await PaymentIntent.updateOne(
      {
        _id: paymentIntent._id,
        status: "Paid",
        paymentId: razorpay_payment_id,
        order: null,
      },
      { $set: { order: createdOrder._id } },
      { session },
    );
    if (linkedIntent.modifiedCount !== 1) {
      throw new Error("Unable to link the verified payment to its order.");
    }

    /*
     * =====================================================
     * COMMIT TRANSACTION
     * =====================================================
     */

    await session.commitTransaction();

    emitToCustomer(userId, "payment:status", {
      paymentIntentId: paymentIntent._id.toString(),
      status: "Paid",
      orderId: createdOrder._id.toString(),
    });
    emitToCustomer(userId, "order:status", {
      orderId: createdOrder._id.toString(),
      orderStatus: createdOrder.orderStatus,
      paymentStatus: createdOrder.paymentStatus,
    });
    emitToAdmins("payment:status", {
      paymentIntentId: paymentIntent._id.toString(),
      status: "Paid",
      orderId: createdOrder._id.toString(),
    });
    for (const item of paymentIntent.items) {
      const product = products.find(
        (productItem) => productItem._id.toString() === item.product.toString(),
      );
      emitToAdmins("inventory:updated", {
        productId: product._id.toString(),
        stock: Number(product.stock) - item.quantity,
        source: "order",
        orderId: createdOrder._id.toString(),
      });
    }

    /*
     * =====================================================
     * PAYMENT SUCCESS EMAIL
     * =====================================================
     *
     * Email failure must NOT undo a successful
     * payment/order transaction.
     */

    try {
      await sendPaymentSuccessEmail(userId, createdOrder);
    } catch (emailError) {
      console.error("Payment success email failed:", emailError);
    }

    /*
     * =====================================================
     * SUCCESS RESPONSE
     * =====================================================
     */

    return res.status(200).json({
      success: true,

      message: "Payment verified and order created successfully.",

      order: createdOrder,
    });
  } catch (error) {
    /*
     * =====================================================
     * ROLLBACK TRANSACTION
     * =====================================================
     */

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Verify Payment Error:", error);

    if (recoveryPaymentIntentId && recoveryPaymentId) {
      try {
        const recoveredIntent = await PaymentIntent.findOne({
          _id: recoveryPaymentIntentId,
          user: req.user._id,
          status: "Paid",
          paymentId: recoveryPaymentId,
        });
        if (recoveredIntent?.order) {
          const recoveredOrder = await Order.findOne({
            _id: recoveredIntent.order,
            user: req.user._id,
            paymentIntent: recoveredIntent._id,
          });
          if (recoveredOrder) {
            return res.status(200).json({
              success: true,
              message: "Payment was already verified.",
              order: recoveredOrder,
            });
          }
        }
      } catch (recoveryError) {
        console.error("Payment idempotency recovery failed:", recoveryError);
      }
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Payment verification failed.",
    });
  } finally {
    await session.endSession();
  }
};

/*
 * =====================================================
 * UPDATE PAYMENT STATUS
 * =====================================================
 *
 * Used when Razorpay payment:
 *
 * - fails
 * - is cancelled
 *
 * This does NOT create an Order.
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const { paymentIntentId, status } = req.body;

    /*
     * =====================================================
     * VALIDATE PAYMENT INTENT ID
     * =====================================================
     */

    if (!paymentIntentId || !mongoose.Types.ObjectId.isValid(paymentIntentId)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment intent ID is required.",
      });
    }

    /*
     * =====================================================
     * VALIDATE STATUS
     * =====================================================
     */

    if (!["Failed", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Payment status must be Failed or Cancelled.",
      });
    }

    /*
     * =====================================================
     * FIND PAYMENT INTENT
     * =====================================================
     */

    const paymentIntent = await PaymentIntent.findOne({
      _id: paymentIntentId,

      user: userId,
    });

    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        message: "Payment intent was not found.",
      });
    }

    /*
     * =====================================================
     * NEVER OVERWRITE SUCCESSFUL PAYMENT
     * =====================================================
     */

    if (paymentIntent.status === "Paid") {
      return res.status(409).json({
        success: false,
        message: "This payment has already been completed.",
      });
    }

    let remoteOrder;
    let remotePayments;
    try {
      [remoteOrder, remotePayments] = await Promise.all([
        razorpay.orders.fetch(paymentIntent.razorpayOrderId),
        razorpay.orders.fetchPayments(paymentIntent.razorpayOrderId),
      ]);
    } catch (error) {
      console.error("Razorpay status reconciliation failed:", error);
      return res.status(502).json({
        success: false,
        message: "Unable to verify payment status with Razorpay. Try again.",
      });
    }

    const paymentAttempts = Array.isArray(remotePayments?.items)
      ? remotePayments.items
      : [];
    const capturedPayment = paymentAttempts.find(
      (payment) => payment.status === "captured",
    );
    const pendingPayment = paymentAttempts.find((payment) =>
      ["created", "authorized"].includes(payment.status),
    );

    if (remoteOrder.status === "paid" || capturedPayment) {
      return res.status(409).json({
        success: false,
        message:
          "Razorpay reports a successful payment. Complete payment verification before changing its status.",
      });
    }
    if (pendingPayment) {
      return res.status(409).json({
        success: false,
        message:
          "Razorpay still has a pending payment attempt. Its status cannot be changed yet.",
      });
    }

    /*
     * =====================================================
     * ALREADY FAILED / CANCELLED
     * =====================================================
     */

    if (
      paymentIntent.status === "Failed" ||
      paymentIntent.status === "Cancelled"
    ) {
      return res.status(200).json({
        success: true,
        message: "Payment status was already updated.",
        paymentIntent,
      });
    }

    /*
     * =====================================================
     * UPDATE STATUS
     * =====================================================
     */

    const updatedIntent = await PaymentIntent.findOneAndUpdate(
      {
        _id: paymentIntentId,
        user: userId,
        status: "Created",
        order: null,
      },
      { $set: { status } },
      { new: true },
    );
    if (!updatedIntent) {
      const currentIntent = await PaymentIntent.findOne({
        _id: paymentIntentId,
        user: userId,
      });
      if (currentIntent?.status === "Paid") {
        return res.status(409).json({
          success: false,
          message: "The payment was verified concurrently and cannot be changed.",
        });
      }
      if (currentIntent?.status === status) {
        return res.status(200).json({
          success: true,
          message: "Payment status was already updated.",
          paymentIntent: currentIntent,
        });
      }
      return res.status(409).json({
        success: false,
        message: "Payment status changed while this request was processed.",
      });
    }
    emitToCustomer(userId, "payment:status", {
      paymentIntentId: updatedIntent._id.toString(),
      status: updatedIntent.status,
    });
    emitToAdmins("payment:status", {
      paymentIntentId: updatedIntent._id.toString(),
      status: updatedIntent.status,
    });

    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    return res.status(200).json({
      success: true,

      message: `Payment marked as ${status}.`,

      paymentIntent: updatedIntent,
    });
  } catch (error) {
    console.error("Update Payment Status Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Unable to update payment status.",
    });
  }
};
