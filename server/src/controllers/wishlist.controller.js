import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

// addToWishlist
// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get product ID
    const { productId } = req.body;

    // Check whether product ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find active product
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    // Check whether product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find user's wishlist
    let wishlist = await Wishlist.findOne({
      user: userId,
    });

    // Create wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: [],
      });
    }

    // Check whether product already exists in wishlist
    const productExists = wishlist.products.some(
      (item) => item.toString() === productId,
    );

    if (productExists) {
      return res.status(400).json({
        success: false,
        message: "Product already exists in wishlist",
      });
    }

    // Add product to wishlist
    wishlist.products.push(product._id);

    // Save wishlist
    await wishlist.save();

    // Return updated wishlist
    return res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Add Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get wishlist
export const getWishlist = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Find user's wishlist and populate product details
    const wishlist = await Wishlist.findOne({
      user: userId,
    }).populate("products");

    // Check whether wishlist exists or is empty
    if (!wishlist || wishlist.products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is empty",
        wishlist: {
          products: [],
        },
      });
    }

    // Return wishlist
    return res.status(200).json({
      success: true,
      count: wishlist.products.length,
      wishlist,
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// removeWishlistItem
// Remove product from wishlist
export const removeWishlistItem = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get product ID from URL
    const { productId } = req.params;

    // Check whether product ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
      user: userId,
    });

    // Check whether wishlist exists
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Check whether product exists in wishlist
    const productExists = wishlist.products.some(
      (item) => item.toString() === productId,
    );

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(
      (item) => item.toString() !== productId,
    );

    // Save wishlist
    await wishlist.save();

    // Return updated wishlist
    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Remove Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Clearwishlist
export const clearWishlist = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Find user's wishlist
    const wishlist = await Wishlist.findOne({
      user: userId,
    });

    // Check whether wishlist exists
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Clear wishlist
    wishlist.products = [];

    // Save wishlist
    await wishlist.save();

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Clear Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
