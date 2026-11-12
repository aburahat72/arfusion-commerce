import mongoose from "mongoose";

const reviewClaimSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    state: {
      type: String,
      enum: ["submitted", "deleted"],
      default: "submitted",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

reviewClaimSchema.index(
  { user: 1, order: 1, product: 1 },
  { unique: true },
);

const ReviewClaim = mongoose.model("ReviewClaim", reviewClaimSchema);

export default ReviewClaim;
