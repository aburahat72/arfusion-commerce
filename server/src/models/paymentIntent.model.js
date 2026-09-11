import mongoose from "mongoose";

const paymentIntentSchema = new mongoose.Schema(
  {
    /*
     * Customer
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * Products being purchased.
     *
     * Prices are captured from MongoDB by the
     * payment controller and are not trusted
     * from the frontend.
     */
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

    /*
     * Server-calculated total.
     */
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * Delivery address snapshot.
     */
    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },

    /*
     * cart / buyNow
     */
    checkoutMode: {
      type: String,
      enum: ["cart", "buyNow"],
      default: "cart",
    },

    /*
     * Razorpay order ID.
     */
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /*
     * Razorpay payment ID.
     */
    paymentId: {
      type: String,
      default: "",
      trim: true,
    },

    /*
     * Final MongoDB Order.
     *
     * Null until payment succeeds.
     */
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    /*
     * Temporary payment state.
     */
    status: {
      type: String,
      enum: ["Created", "Paid", "Failed", "Cancelled"],
      default: "Created",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const PaymentIntent = mongoose.model("PaymentIntent", paymentIntentSchema);

export default PaymentIntent;
