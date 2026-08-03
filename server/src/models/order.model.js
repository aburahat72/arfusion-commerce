import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
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
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
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
      enum: ["Not Applicable", "Pending", "Completed"],
      default: "Not Applicable",
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
