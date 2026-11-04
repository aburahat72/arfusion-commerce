import mongoose from "mongoose";

// =====================================================
// DEAL OF THE DAY MODEL
// =====================================================

const dealOfTheDaySchema = new mongoose.Schema(
  {
    // The product being featured
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },

    // Admin-set headline for the deal section
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    // Admin-set description shown below the title
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
    },

    // Badge label shown above the title (e.g. "Deal of the Day", "Flash Sale")
    badge: {
      type: String,
      trim: true,
      default: "Deal of the Day",
      maxlength: [50, "Badge cannot exceed 50 characters"],
    },

    // Discount label (e.g. "-35%", "30% OFF")
    discountLabel: {
      type: String,
      trim: true,
      default: "",
      maxlength: [20, "Discount label cannot exceed 20 characters"],
    },

    // For backwards compatibility with existing documents
    discount: {
      type: String,
      trim: true,
      default: "",
    },

    // Deal expiry timestamp — countdown counts down to this
    expiresAt: {
      type: Date,
      default: null,
    },

    // Backwards compatibility with endsAt
    endsAt: {
      type: Date,
      default: null,
    },

    // Optional custom image override for the deal
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    // Optional delivery details
    deliveryText: {
      type: String,
      trim: true,
      default: "Free delivery",
    },

    deliveryDescription: {
      type: String,
      trim: true,
      default: "",
    },

    // Whether this deal is currently active/visible
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

dealOfTheDaySchema.index({ isActive: 1, createdAt: -1 });

const DealOfTheDay = mongoose.model("DealOfTheDay", dealOfTheDaySchema);

export default DealOfTheDay;
