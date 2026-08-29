import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
      default: 0,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
      index: true,
    },

    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },

          publicId: {
            type: String,
            required: true,
          },
        },
      ],

      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
