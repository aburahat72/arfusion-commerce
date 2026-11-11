import mongoose from "mongoose";

import Product from "../models/product.model.js";
import InventoryLog from "../models/inventoryLog.model.js";
import { emitToAdmins } from "../realtime/socket.server.js";

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
  const session = await mongoose.startSession();
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
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || quantity > 1000000) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number between 1 and 1,000,000.",
      });
    }

    session.startTransaction();
    const product = await Product.findById(productId).session(session);

    // Check whether product exists
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Store previous stock
    const previousStock = product.stock;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: product._id, stock: previousStock },
      { $inc: { stock: quantity } },
      { new: true, session },
    );
    if (!updatedProduct) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Stock changed while restocking. Refresh and try again.",
      });
    }

    // Create inventory log
    await InventoryLog.create([{
      product: product._id,
      previousStock,
      newStock: updatedProduct.stock,
      quantityChanged: quantity,
      action: "Restock",
      updatedBy: req.user._id,
    }], { session });
    await session.commitTransaction();
    emitToAdmins("inventory:updated", {
      productId: updatedProduct._id.toString(),
      stock: updatedProduct.stock,
      source: "restock",
    });

    // Return response
    return res.status(200).json({
      success: true,
      message: "Product restocked successfully",
      product: updatedProduct,
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error("Restock Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await session.endSession();
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
