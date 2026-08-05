import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    previousStock: {
      type: Number,
      required: true,
    },

    newStock: {
      type: Number,
      required: true,
    },

    quantityChanged: {
      type: Number,
      required: true,
    },

    action: {
      type: String,
      enum: [
        "Order Placed",
        "Order Cancelled",
        "Refund",
        "Replacement",
        "Restock",
      ],
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("InventoryLog", inventoryLogSchema);
