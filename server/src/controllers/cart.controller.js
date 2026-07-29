import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

// addTocart
// Add product to cart
export const addToCart = async (req, res) => {
  try {
    // logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get request data
    const { productId, quantity } = req.body;

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

    // Check whether product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity is not available",
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({
      user: userId,
    });

    // Create new cart if it doesn't exist
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalPrice: 0,
      });
    }

    // Check whether product already exists in the cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    // If product already exists, increase quantity
    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock",
        });
      }

      existingItem.quantity += quantity;
    } else {
      // Otherwise add new product
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
      });
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Save cart
    await cart.save();

    // Return updated cart
    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getCart
// Get logged-in user's cart
export const getCart = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Find user's cart and populate product details
    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    // Check whether cart exists
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: {
          items: [],
          totalPrice: 0,
        },
      });
    }

    // Return user's cart
    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// updateCartItem
// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get product ID from URL
    const { productId } = req.params;

    // Get updated quantity
    const { quantity } = req.body;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({
      user: userId,
    });

    // Check whether cart exists
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find product inside cart
    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    // Check whether product exists in cart
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Find product
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

    // Check stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    // Update quantity
    cartItem.quantity = quantity;

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Save cart
    await cart.save();

    // Return updated cart
    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// removeCartItem
// Remove product from cart
export const removeCartItem = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get product ID from URL
    const { productId } = req.params;

    // Check whether product ID is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({
      user: userId,
    });

    // Check whether cart exists
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Check whether product exists in cart
    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId,
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Remove product from cart
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Save cart
    await cart.save();

    // Return updated cart
    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Remove Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Find user's cart
    const cart = await Cart.findOne({
      user: userId,
    });

    // Check whether cart exists
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Clear all cart items
    cart.items = [];

    // Reset total price
    cart.totalPrice = 0;

    // Save cart
    await cart.save();

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
