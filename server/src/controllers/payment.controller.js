import mongoose from "mongoose";
import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import PaymentIntent from "../models/paymentIntent.model.js";

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

    const { shippingAddress, items = [], checkoutMode = "cart" } = req.body;

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

    const normalizedItems = [];

    for (const item of items) {
      const productId = item?.product;
      const quantity = Number(item?.quantity);

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID.",
        });
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Product quantity must be at least 1.",
        });
      }

      normalizedItems.push({
        product: new mongoose.Types.ObjectId(productId),
        quantity,
      });
    }

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
        _id: item.product,
      }).lean();

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product.toString()} was not found.`,
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

    let totalPrice = 0;

    const paymentItems = [];

    for (const item of normalizedItems) {
      const product = products.find(
        (productItem) => productItem._id.toString() === item.product.toString(),
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

      totalPrice += price * item.quantity;

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

    totalPrice = Number(totalPrice.toFixed(2));

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
    });
  } catch (error) {
    console.error("Create Payment Error:", error);

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

  try {
    const userId = req.user._id;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    /*
     * =====================================================
     * VALIDATION
     * =====================================================
     */

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

    if (generatedSignature !== razorpay_signature) {
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
        throw new Error(
          `${product.name || "A product"} is no longer available.`,
        );
      }

      /*
       * -------------------------------------------------
       * STOCK CHECK
       * -------------------------------------------------
       */

      if (Number(product.stock) < Number(item.quantity)) {
        throw new Error(
          `Insufficient stock for ${product.name || "a product"}.`,
        );
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

    const [createdOrder] = await Order.create(
      [
        {
          user: userId,

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

          shippingAddress: paymentIntent.shippingAddress,

          paymentMethod: "ONLINE",

          paymentStatus: "Paid",

          orderStatus: "Processing",
        },
      ],
      {
        session,
      },
    );

    /*
     * =====================================================
     * UPDATE PRODUCT STOCK
     * =====================================================
     */

    for (const item of paymentIntent.items) {
      const product = products.find(
        (productItem) => productItem._id.toString() === item.product.toString(),
      );

      if (!product) {
        throw new Error("Unable to update product stock.");
      }

      product.stock = Number(product.stock) - Number(item.quantity);

      /*
       * If stock reaches zero,
       * deactivate product.
       */

      if (product.stock <= 0) {
        product.stock = 0;
        product.isActive = false;
      }

      await product.save({
        session,
      });
    }

    /*
     * =====================================================
     * UPDATE PAYMENT INTENT
     * =====================================================
     */

    paymentIntent.status = "Paid";

    paymentIntent.paymentId = razorpay_payment_id;

    paymentIntent.order = createdOrder._id;

    await paymentIntent.save({
      session,
    });

    /*
     * =====================================================
     * COMMIT TRANSACTION
     * =====================================================
     */

    await session.commitTransaction();

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

    return res.status(500).json({
      success: false,
      message: error?.message || "Payment verification failed.",
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

    paymentIntent.status = status;

    await paymentIntent.save();

    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    return res.status(200).json({
      success: true,

      message: `Payment marked as ${status}.`,

      paymentIntent,
    });
  } catch (error) {
    console.error("Update Payment Status Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Unable to update payment status.",
    });
  }
};
