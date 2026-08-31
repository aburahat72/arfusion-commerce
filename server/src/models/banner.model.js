import mongoose from "mongoose";

// =====================================================
// IMAGE SCHEMA
// =====================================================

const bannerImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Banner image URL is required"],
      trim: true,
    },

    publicId: {
      type: String,
      required: [true, "Banner image public ID is required"],
      trim: true,
    },

    alt: {
      type: String,
      required: [true, "Banner image alt text is required"],
      trim: true,
      maxlength: [200, "Alt text cannot exceed 200 characters"],
    },
  },
  {
    _id: false,
  },
);

// =====================================================
// BUTTON SCHEMA
// =====================================================

const bannerButtonSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Button text is required"],
      trim: true,
      maxlength: [50, "Button text cannot exceed 50 characters"],
    },

    link: {
      type: String,
      required: [true, "Button link is required"],
      trim: true,
      maxlength: [500, "Button link cannot exceed 500 characters"],
    },
  },
  {
    _id: false,
  },
);

// =====================================================
// STAT SCHEMA
// =====================================================

const bannerStatSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: [true, "Statistic value is required"],
      trim: true,
      maxlength: [50, "Statistic value cannot exceed 50 characters"],
    },

    label: {
      type: String,
      required: [true, "Statistic label is required"],
      trim: true,
      maxlength: [100, "Statistic label cannot exceed 100 characters"],
    },
  },
  {
    _id: false,
  },
);

// =====================================================
// COLORS SCHEMA
// =====================================================

const bannerColorsSchema = new mongoose.Schema(
  {
    blue: {
      type: String,
      required: [true, "Blue color is required"],
      trim: true,
    },

    lavender: {
      type: String,
      required: [true, "Lavender color is required"],
      trim: true,
    },

    pink: {
      type: String,
      required: [true, "Pink color is required"],
      trim: true,
    },

    body: {
      type: String,
      required: [true, "Body color is required"],
      trim: true,
    },

    inner: {
      type: String,
      required: [true, "Inner color is required"],
      trim: true,
    },

    innerPink: {
      type: String,
      required: [true, "Inner pink color is required"],
      trim: true,
    },

    platform: {
      type: String,
      required: [true, "Platform color is required"],
      trim: true,
    },
  },
  {
    _id: false,
  },
);

// =====================================================
// BANNER SCHEMA
// =====================================================

const bannerSchema = new mongoose.Schema(
  {
    // =================================================
    // IDENTIFICATION
    // =================================================

    slug: {
      type: String,
      required: [true, "Banner slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    // =================================================
    // HERO CONTENT
    // =================================================

    badge: {
      type: String,
      required: [true, "Banner badge is required"],
      trim: true,
      maxlength: [100, "Badge cannot exceed 100 characters"],
    },

    titleStart: {
      type: String,
      required: [true, "Banner title start is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    titleHighlight: {
      type: String,
      required: [true, "Banner highlighted title is required"],
      trim: true,
      maxlength: [100, "Highlighted title cannot exceed 100 characters"],
    },

    titleEnd: {
      type: String,
      required: [true, "Banner title end is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Banner description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    // =================================================
    // CLOUDINARY IMAGES
    // =================================================

    mainProduct: {
      type: bannerImageSchema,
      required: [true, "Main product image is required"],
    },

    topLeft: {
      type: bannerImageSchema,
      required: [true, "Top-left image is required"],
    },

    topRight: {
      type: bannerImageSchema,
      required: [true, "Top-right image is required"],
    },

    bottomLeft: {
      type: bannerImageSchema,
      required: [true, "Bottom-left image is required"],
    },

    bottomRight: {
      type: bannerImageSchema,
      required: [true, "Bottom-right image is required"],
    },

    // =================================================
    // BUTTONS
    // =================================================

    primaryButton: {
      type: bannerButtonSchema,
      required: [true, "Primary button is required"],
    },

    secondaryButton: {
      type: bannerButtonSchema,
      required: [true, "Secondary button is required"],
    },

    // =================================================
    // STATS
    // =================================================

    stats: {
      type: [bannerStatSchema],
      default: [],

      validate: {
        validator: (value) => value.length <= 3,
        message: "Banner cannot contain more than 3 statistics",
      },
    },

    // =================================================
    // COLORS
    // =================================================

    colors: {
      type: bannerColorsSchema,
      required: [true, "Banner colors are required"],
    },

    // =================================================
    // ADMIN CONTROLS
    // =================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: [0, "Sort order cannot be negative"],
      index: true,
    },
  },

  {
    timestamps: true,
  },
);

// =====================================================
// INDEXES
// =====================================================

bannerSchema.index({
  isActive: 1,
  sortOrder: 1,
});

// =====================================================
// MODEL
// =====================================================

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
