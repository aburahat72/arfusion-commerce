import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";

// =====================================================
// HELPERS
// =====================================================

// Escape special regex characters
const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Delete Cloudinary product images
const deleteCloudinaryImages = async (images = []) => {
  if (!Array.isArray(images) || !images.length) {
    return;
  }

  await Promise.allSettled(
    images
      .filter((image) => image?.publicId)
      .map((image) => cloudinary.uploader.destroy(image.publicId)),
  );
};

// Upload product images
const uploadProductImages = async (files = []) => {
  if (!Array.isArray(files) || !files.length) {
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

// =====================================================
// CATEGORY HELPERS
// =====================================================

// Get active category by MongoDB ID
const getActiveCategory = async (categoryId) => {
  if (!isValidObjectId(categoryId)) {
    return null;
  }

  return Category.findOne({
    _id: categoryId,
    isActive: true,
  }).select("_id name slug image isActive");
};

// Get active category by ID OR slug
//
// Used by public filtering.
//
// Example:
// category=68abc123...
// category=electronics
//
const getActiveCategoryByIdOrSlug = async (value) => {
  if (!value) {
    return null;
  }

  const categoryValue = String(value).trim();

  if (!categoryValue) {
    return null;
  }

  if (isValidObjectId(categoryValue)) {
    return Category.findOne({
      _id: categoryValue,
      isActive: true,
    }).select("_id name slug image isActive");
  }

  return Category.findOne({
    slug: categoryValue.toLowerCase(),
    isActive: true,
  }).select("_id name slug image isActive");
};

// Populate category
const populateCategory = (query) => {
  return query.populate("category", "name slug image isActive");
};

// =====================================================
// GET ALL ACTIVE PRODUCTS
// PUBLIC
//
// GET /api/products
//
// Supported:
// ?search=samsung
// ?category=electronics
// ?category=68xxxxxxxxxxxxxxxxxxxxxxxx
// ?minPrice=500
// ?maxPrice=50000
// ?page=1
// ?limit=20
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

    // -------------------------------------------------
    // BASE FILTER
    // -------------------------------------------------

    const filter = {
      isActive: true,
    };

    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    if (search?.trim()) {
      filter.name = {
        $regex: escapeRegex(search.trim()),
        $options: "i",
      };
    }

    // -------------------------------------------------
    // CATEGORY
    //
    // Supports:
    //
    // 1. MongoDB ObjectId
    // 2. Category slug
    // -------------------------------------------------

    if (category?.trim()) {
      const categoryDocument = await getActiveCategoryByIdOrSlug(category);

      if (!categoryDocument) {
        return res.status(404).json({
          success: false,
          message: "Category not found or inactive",
        });
      }

      filter.category = categoryDocument._id;
    }

    // -------------------------------------------------
    // PRICE
    // -------------------------------------------------

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined && minPrice !== "") {
        const parsedMinPrice = Number(minPrice);

        if (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid minimum price",
          });
        }

        filter.price.$gte = parsedMinPrice;
      }

      if (maxPrice !== undefined && maxPrice !== "") {
        const parsedMaxPrice = Number(maxPrice);

        if (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid maximum price",
          });
        }

        filter.price.$lte = parsedMaxPrice;
      }

      if (
        filter.price.$gte !== undefined &&
        filter.price.$lte !== undefined &&
        filter.price.$gte > filter.price.$lte
      ) {
        return res.status(400).json({
          success: false,
          message: "Minimum price cannot be greater than maximum price",
        });
      }

      // If no actual price condition was created
      if (!Object.keys(filter.price).length) {
        delete filter.price;
      }
    }

    // -------------------------------------------------
    // PAGINATION
    // -------------------------------------------------

    const currentPage = Math.max(Number(page) || 1, 1);

    const itemsPerPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * itemsPerPage;

    // -------------------------------------------------
    // GET PRODUCTS
    // -------------------------------------------------

    const [products, total] = await Promise.all([
      populateCategory(
        Product.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(itemsPerPage),
      ),

      Product.countDocuments(filter),
    ]);

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

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
//
// GET /api/products/admin/all
// =====================================================

export const getAllAdminProducts = async (req, res) => {
  try {
    const { search, category, stock, page = 1, limit = 100 } = req.query;

    const filter = {};

    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    if (search?.trim()) {
      filter.name = {
        $regex: escapeRegex(search.trim()),
        $options: "i",
      };
    }

    // -------------------------------------------------
    // CATEGORY
    //
    // Admin category filter uses MongoDB ObjectId.
    // -------------------------------------------------

    if (category) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      filter.category = category;
    }

    // -------------------------------------------------
    // STOCK
    // -------------------------------------------------

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

    // -------------------------------------------------
    // PAGINATION
    // -------------------------------------------------

    const currentPage = Math.max(Number(page) || 1, 1);

    const itemsPerPage = Math.min(Math.max(Number(limit) || 100, 1), 100);

    const skip = (currentPage - 1) * itemsPerPage;

    // -------------------------------------------------
    // GET PRODUCTS
    // -------------------------------------------------

    const [products, total] = await Promise.all([
      populateCategory(
        Product.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(itemsPerPage),
      ),

      Product.countDocuments(filter),
    ]);

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

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
//
// GET /api/products/:id
// =====================================================

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // -------------------------------------------------
    // FIND ACTIVE PRODUCT
    // -------------------------------------------------

    const product = await populateCategory(
      Product.findOne({
        _id: id,
        isActive: true,
      }),
    );

    // -------------------------------------------------
    // NOT FOUND
    // -------------------------------------------------

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

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
//
// GET /api/products/admin/:id
// =====================================================

export const getAdminProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // -------------------------------------------------
    // FIND PRODUCT
    // -------------------------------------------------

    const product = await populateCategory(Product.findById(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

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
//
// POST /api/products
// =====================================================

export const createProduct = async (req, res) => {
  let uploadedImages = [];

  try {
    const { name, description, price, stock, category, isActive } = req.body;

    // -------------------------------------------------
    // CATEGORY REQUIRED
    // -------------------------------------------------

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Product category is required",
      });
    }

    // -------------------------------------------------
    // FIND ACTIVE CATEGORY
    // -------------------------------------------------

    const categoryDocument = await getActiveCategory(category);

    if (!categoryDocument) {
      return res.status(400).json({
        success: false,
        message: "Category not found or inactive",
      });
    }

    // -------------------------------------------------
    // UPLOAD IMAGES
    // -------------------------------------------------

    if (req.files?.length) {
      uploadedImages = await uploadProductImages(req.files);
    }

    // -------------------------------------------------
    // CREATE PRODUCT
    // -------------------------------------------------

    const product = await Product.create({
      name,
      description,
      price,
      stock,

      // IMPORTANT:
      // Always save the real Category ObjectId.
      category: categoryDocument._id,

      images: uploadedImages,

      ...(isActive !== undefined && {
        isActive,
      }),
    });

    // -------------------------------------------------
    // POPULATE CATEGORY
    // -------------------------------------------------

    await product.populate("category", "name slug image isActive");

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    // -------------------------------------------------
    // CLOUDINARY ROLLBACK
    // -------------------------------------------------

    await deleteCloudinaryImages(uploadedImages);

    // -------------------------------------------------
    // DUPLICATE
    // -------------------------------------------------

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product already exists",
      });
    }

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
      });
    }

    // -------------------------------------------------
    // SERVER ERROR
    // -------------------------------------------------

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// UPDATE PRODUCT
// ADMIN
//
// PATCH /api/products/:id
// =====================================================

export const updateProduct = async (req, res) => {
  let uploadedImages = [];

  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE PRODUCT ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // -------------------------------------------------
    // FIND PRODUCT
    // -------------------------------------------------

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // -------------------------------------------------
    // REQUEST DATA
    // -------------------------------------------------

    const { name, description, price, stock, category, isActive } = req.body;

    // -------------------------------------------------
    // UPDATE CATEGORY
    // -------------------------------------------------

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

    // -------------------------------------------------
    // UPDATE BASIC FIELDS
    // -------------------------------------------------

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

    // -------------------------------------------------
    // UPLOAD NEW IMAGES
    // -------------------------------------------------

    if (req.files?.length) {
      uploadedImages = await uploadProductImages(req.files);

      product.images = [...(product.images || []), ...uploadedImages];
    }

    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------

    await product.save();

    // -------------------------------------------------
    // POPULATE
    // -------------------------------------------------

    await product.populate("category", "name slug image isActive");

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    // -------------------------------------------------
    // CLOUDINARY ROLLBACK
    // -------------------------------------------------

    await deleteCloudinaryImages(uploadedImages);

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
      });
    }

    // -------------------------------------------------
    // CAST ERROR
    // -------------------------------------------------

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product data",
      });
    }

    // -------------------------------------------------
    // SERVER ERROR
    // -------------------------------------------------

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// DELETE PRODUCT
// ADMIN
//
// DELETE /api/products/:id
// =====================================================

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // -------------------------------------------------
    // FIND PRODUCT
    // -------------------------------------------------

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // -------------------------------------------------
    // DELETE CLOUDINARY IMAGES
    // -------------------------------------------------

    await deleteCloudinaryImages(product.images);

    // -------------------------------------------------
    // DELETE PRODUCT
    // -------------------------------------------------

    await Product.deleteOne({
      _id: id,
    });

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

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
//
// PATCH /api/products/:id/status
//
// IMPORTANT:
// Uses findOneAndUpdate instead of:
//
// const product = await Product.findById(id);
// product.isActive = !product.isActive;
// await product.save();
//
// This prevents an old legacy category value such as:
//
// category: "electronics"
//
// from causing a full-document validation error while
// simply changing the product status.
// =====================================================

export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // -------------------------------------------------
    // FIND CURRENT PRODUCT STATUS
    //
    // lean() prevents unnecessary Mongoose document
    // validation/hydration for legacy records.
    // -------------------------------------------------

    const existingProduct = await Product.findById(id)
      .select("_id isActive")
      .lean();

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const newStatus = !Boolean(existingProduct.isActive);

    // -------------------------------------------------
    // ATOMIC STATUS UPDATE
    //
    // IMPORTANT:
    // Do NOT use document.save() here.
    // -------------------------------------------------

    const product = await Product.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          isActive: newStatus,
        },
      },
      {
        new: true,
        runValidators: false,
      },
    ).populate("category", "name slug image isActive");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message: product.isActive
        ? "Product enabled successfully"
        : "Product disabled successfully",
      product,
    });
  } catch (error) {
    console.error("Toggle Product Status Error:", error);

    // -------------------------------------------------
    // INVALID OBJECT ID
    // -------------------------------------------------

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // -------------------------------------------------
    // SERVER ERROR
    // -------------------------------------------------

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

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
