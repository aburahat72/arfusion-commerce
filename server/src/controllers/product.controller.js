import mongoose from "mongoose";

import cloudinary from "../config/cloudinary.js";

import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const deleteCloudinaryImages = async (images = []) => {
  if (!images.length) {
    return;
  }

  await Promise.allSettled(
    images
      .filter((image) => image?.publicId)
      .map((image) => cloudinary.uploader.destroy(image.publicId)),
  );
};

const uploadProductImages = async (files = []) => {
  if (!files.length) {
    return [];
  }

  const uploadedImages = [];

  try {
    for (const file of files) {
      const result = await uploadToCloudinary(file.buffer, "arfusion/products");

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    return uploadedImages;
  } catch (error) {
    await deleteCloudinaryImages(uploadedImages);

    throw error;
  }
};

const getActiveCategory = async (categoryId) => {
  if (!isValidObjectId(categoryId)) {
    return null;
  }

  return Category.findOne({
    _id: categoryId,
    isActive: true,
  });
};

// =====================================================
// GET ALL ACTIVE PRODUCTS
// PUBLIC
// =====================================================

export const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (search?.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (category) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const currentPage = Math.max(Number(page) || 1, 1);

    const itemsPerPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * itemsPerPage;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug image isActive")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(itemsPerPage),

      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: currentPage,
      pages: Math.ceil(total / itemsPerPage),
      products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET ALL PRODUCTS
// ADMIN
// =====================================================

export const getAllAdminProducts = async (req, res) => {
  try {
    const { search, category, stock, page = 1, limit = 100 } = req.query;

    const filter = {};

    if (search?.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (category) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      filter.category = category;
    }

    if (stock === "in-stock") {
      filter.stock = {
        $gt: 0,
      };
    }

    if (stock === "low-stock") {
      filter.stock = {
        $gt: 0,
        $lte: 10,
      };
    }

    if (stock === "out-of-stock") {
      filter.stock = {
        $lte: 0,
      };
    }

    const currentPage = Math.max(Number(page) || 1, 1);

    const itemsPerPage = Math.min(Math.max(Number(limit) || 100, 1), 100);

    const skip = (currentPage - 1) * itemsPerPage;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug image isActive")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(itemsPerPage),

      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: currentPage,
      pages: Math.ceil(total / itemsPerPage),
      products,
    });
  } catch (error) {
    console.error("Get Admin Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET SINGLE PRODUCT
// PUBLIC
// =====================================================

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    }).populate("category", "name slug image isActive");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET SINGLE PRODUCT
// ADMIN
// Includes inactive products
// =====================================================

export const getAdminProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).populate(
      "category",
      "name slug image isActive",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Admin Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// CREATE PRODUCT
// ADMIN
// =====================================================

export const createProduct = async (req, res) => {
  let uploadedImages = [];

  try {
    const { name, description, price, stock, category, isActive } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Product category is required",
      });
    }

    const categoryDocument = await getActiveCategory(category);

    if (!categoryDocument) {
      return res.status(400).json({
        success: false,
        message: "Category not found or inactive",
      });
    }

    if (req.files?.length) {
      uploadedImages = await uploadProductImages(req.files);
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category: categoryDocument._id,
      images: uploadedImages,

      ...(isActive !== undefined && {
        isActive,
      }),
    });

    await product.populate("category", "name slug image isActive");

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    await deleteCloudinaryImages(uploadedImages);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product already exists",
      });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// UPDATE PRODUCT
// ADMIN
// =====================================================

export const updateProduct = async (req, res) => {
  let uploadedImages = [];

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { name, description, price, stock, category, isActive } = req.body;

    if (category !== undefined) {
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Product category is required",
        });
      }

      const categoryDocument = await getActiveCategory(category);

      if (!categoryDocument) {
        return res.status(400).json({
          success: false,
          message: "Category not found or inactive",
        });
      }

      product.category = categoryDocument._id;
    }

    if (name !== undefined) {
      product.name = name;
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (price !== undefined) {
      product.price = price;
    }

    if (stock !== undefined) {
      product.stock = stock;
    }

    if (isActive !== undefined) {
      product.isActive = isActive;
    }

    if (req.files?.length) {
      uploadedImages = await uploadProductImages(req.files);

      product.images = [...(product.images || []), ...uploadedImages];
    }

    await product.save();

    await product.populate("category", "name slug image isActive");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    await deleteCloudinaryImages(uploadedImages);

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// DELETE PRODUCT
// ADMIN
// =====================================================

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await deleteCloudinaryImages(product.images);

    await Product.deleteOne({
      _id: id,
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// ENABLE / DISABLE PRODUCT
// ADMIN
// =====================================================

export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = !product.isActive;

    await product.save();

    await product.populate("category", "name slug image isActive");

    return res.status(200).json({
      success: true,
      message: product.isActive
        ? "Product enabled successfully"
        : "Product disabled successfully",
      product,
    });
  } catch (error) {
    console.error("Toggle Product Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default {
  createProduct,
  getAllProducts,
  getAllAdminProducts,
  getProductById,
  getAdminProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
};
