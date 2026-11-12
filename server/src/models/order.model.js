import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    paymentIntent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentIntent",
      unique: true,
      sparse: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      min: 0,
      default: 0,
    },

    shippingAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    discount: {
      type: Number,
      min: 0,
      default: 0,
    },

    couponDiscount: {
      type: Number,
      min: 0,
      default: 0,
    },

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },

    couponCode: {
      type: String,
      trim: true,
      default: "",
    },

    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
      default: "",
    },

    razorpayRefundId: {
      type: String,
      trim: true,
      default: "",
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    // Return Status
    returnStatus: {
      type: String,
      enum: [
        "Not Requested",
        "Pending",
        "Approved",
        "Rejected",
        "Returned",
        "Refunded",
        "Replaced",
      ],
      default: "Not Requested",
    },

    // Customer return reason
    returnReason: {
      type: String,
      trim: true,
      default: "",
    },

    returnType: {
      type: String,
      enum: ["Refund", "Replacement", null],
      default: null,
    },

    // Date when customer requested return
    returnRequestedAt: {
      type: Date,
      default: null,
    },

    // Last date customer can request return
    returnEligibleUntil: {
      type: Date,
      default: null,
    },

    // Refund Status
    refundStatus: {
      type: String,
      enum: ["Not Applicable", "Pending", "Processing", "Completed", "Failed"],
      default: "Not Applicable",
    },

    refundCompletedAt: {
      type: Date,
      default: null,
    },

    refundAttemptedAt: {
      type: Date,
      default: null,
    },

    // Replacement request
    replacementRequested: {
      type: Boolean,
      default: false,
    },

    // Refund request
    refundRequested: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
