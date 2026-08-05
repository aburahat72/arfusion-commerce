import mongoose from "mongoose";

import Product from "../models/product.model.js";
import InventoryLog from "../models/inventoryLog.model.js";

// Get all inventory
export const getInventory = async (req, res) => {
  try {
    // Find all products
    const products = await Product.find().sort({
      createdAt: -1,
    });

    // Return inventory
    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Inventory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    // Find products with stock less than or equal to 5
    const products = await Product.find({
      stock: {
        $lte: 5,
      },
    }).sort({
      stock: 1,
    });

    // Return low stock products
    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Low Stock Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Restock product
export const restockProduct = async (req, res) => {
  try {
    // Get product ID
    const { productId } = req.params;

    // Get quantity
    const { quantity } = req.body;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    // Find product
    const product = await Product.findById(productId);

    // Check whether product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Store previous stock
    const previousStock = product.stock;

    // Update stock
    product.stock += quantity;

    // Activate product if restocked
    if (product.stock > 0) {
      product.isActive = true;
    }

    // Save product
    await product.save();

    // Create inventory log
    await InventoryLog.create({
      product: product._id,
      previousStock,
      newStock: product.stock,
      quantityChanged: quantity,
      action: "Restock",
      updatedBy: req.user._id,
    });

    // Return response
    return res.status(200).json({
      success: true,
      message: "Product restocked successfully",
      product,
    });
  } catch (error) {
    console.error("Restock Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get inventory history
export const getInventoryHistory = async (req, res) => {
  try {
    // Find inventory logs
    const logs = await InventoryLog.find()
      .populate("product", "name category")
      .populate("updatedBy", "fullName email")
      .sort({
        createdAt: -1,
      });

    // Return inventory logs
    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Inventory History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
