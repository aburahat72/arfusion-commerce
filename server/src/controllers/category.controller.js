import mongoose from "mongoose";

import cloudinary from "../config/cloudinary.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";

import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";

// =====================================================
// HELPERS
// =====================================================

// Escape special regex characters
const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Convert request value to boolean safely
const parseBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return defaultValue;
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================================
// GET ALL ACTIVE CATEGORIES
// Public
//
// GET /api/categories
//
// Returns:
// - Active categories only
// - Active product count for each category
// =====================================================

export const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      // -------------------------------------------------
      // ONLY ACTIVE CATEGORIES
      // -------------------------------------------------

      {
        $match: {
          isActive: true,
        },
      },

      // -------------------------------------------------
      // FIND ACTIVE PRODUCTS FOR EACH CATEGORY
      // -------------------------------------------------

      {
        $lookup: {
          from: "products",

          let: {
            categoryId: "$_id",
          },

          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$category", "$$categoryId"],
                    },
                    {
                      $eq: ["$isActive", true],
                    },
                  ],
                },
              },
            },

            {
              $count: "count",
            },
          ],

          as: "productCountData",
        },
      },

      // -------------------------------------------------
      // CONVERT COUNT ARRAY TO NUMBER
      // -------------------------------------------------

      {
        $addFields: {
          productCount: {
            $ifNull: [
              {
                $arrayElemAt: ["$productCountData.count", 0],
              },
              0,
            ],
          },
        },
      },

      // -------------------------------------------------
      // REMOVE TEMPORARY FIELD
      // -------------------------------------------------

      {
        $project: {
          productCountData: 0,
        },
      },

      // -------------------------------------------------
      // SORT BY CATEGORY NAME
      // -------------------------------------------------

      {
        $sort: {
          name: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get Active Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET ALL CATEGORIES
// Admin only
//
// GET /api/categories/admin/all
//
// Returns:
// - All categories
// - Active product count for each category
// =====================================================

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      // -------------------------------------------------
      // FIND ACTIVE PRODUCTS FOR EACH CATEGORY
      // -------------------------------------------------

      {
        $lookup: {
          from: "products",

          let: {
            categoryId: "$_id",
          },

          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$category", "$$categoryId"],
                    },
                    {
                      $eq: ["$isActive", true],
                    },
                  ],
                },
              },
            },

            {
              $count: "count",
            },
          ],

          as: "productCountData",
        },
      },

      // -------------------------------------------------
      // CONVERT COUNT ARRAY TO NUMBER
      // -------------------------------------------------

      {
        $addFields: {
          productCount: {
            $ifNull: [
              {
                $arrayElemAt: ["$productCountData.count", 0],
              },
              0,
            ],
          },
        },
      },

      // -------------------------------------------------
      // REMOVE TEMPORARY FIELD
      // -------------------------------------------------

      {
        $project: {
          productCountData: 0,
        },
      },

      // -------------------------------------------------
      // SORT NEWEST CATEGORY FIRST
      // -------------------------------------------------

      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get All Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET CATEGORY BY SLUG
// Public
//
// GET /api/categories/:slug
// =====================================================

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug || !slug.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category slug is required",
      });
    }

    const category = await Category.findOne({
      slug: slug.trim().toLowerCase(),
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get Category By Slug Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// CREATE CATEGORY
// Admin only
//
// POST /api/categories
//
// multipart/form-data
// name
// slug
// description
// isActive
// image
// =====================================================

export const createCategory = async (req, res) => {
  let uploadedImage = null;

  try {
    const { name, slug, description, isActive } = req.body;

    // -------------------------------------------------
    // VALIDATE REQUIRED FIELDS
    // -------------------------------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (!slug || !slug.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category slug is required",
      });
    }

    // -------------------------------------------------
    // CLEAN VALUES
    // -------------------------------------------------

    const cleanName = name.trim();

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const cleanDescription = description ? description.trim() : "";

    // -------------------------------------------------
    // CHECK DUPLICATE NAME
    // -------------------------------------------------

    const existingName = await Category.findOne({
      name: new RegExp(`^${escapeRegex(cleanName)}$`, "i"),
    });

    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    // -------------------------------------------------
    // CHECK DUPLICATE SLUG
    // -------------------------------------------------

    const existingSlug = await Category.findOne({
      slug: cleanSlug,
    });

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: "Category with this slug already exists",
      });
    }

    // -------------------------------------------------
    // UPLOAD IMAGE
    // -------------------------------------------------

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "arfusion/categories",
      );

      uploadedImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    // -------------------------------------------------
    // CREATE CATEGORY
    // -------------------------------------------------

    const category = await Category.create({
      name: cleanName,

      slug: cleanSlug,

      description: cleanDescription,

      image: uploadedImage || {
        url: "",
        publicId: "",
      },

      isActive: parseBoolean(isActive, true),
    });

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);

    // -------------------------------------------------
    // CLOUDINARY ROLLBACK
    // -------------------------------------------------

    if (uploadedImage?.publicId) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.publicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary rollback error:", cloudinaryError);
      }
    }

    // -------------------------------------------------
    // MONGODB DUPLICATE
    // -------------------------------------------------

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category name or slug already exists",
      });
    }

    // -------------------------------------------------
    // MONGOOSE VALIDATION
    // -------------------------------------------------

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// UPDATE CATEGORY
// Admin only
//
// PUT /api/categories/:id
//
// multipart/form-data
// name
// slug
// description
// isActive
// image
// =====================================================

export const updateCategory = async (req, res) => {
  let newUploadedImage = null;

  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // -------------------------------------------------
    // FIND CATEGORY
    // -------------------------------------------------

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // -------------------------------------------------
    // REQUEST DATA
    // -------------------------------------------------

    const { name, slug, description, isActive } = req.body;

    // -------------------------------------------------
    // PREPARE VALUES
    // -------------------------------------------------

    const cleanName = name !== undefined ? name.trim() : category.name;

    const cleanSlug =
      slug !== undefined
        ? slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/-+/g, "-")
        : category.slug;

    // -------------------------------------------------
    // VALIDATE NAME
    // -------------------------------------------------

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // -------------------------------------------------
    // VALIDATE SLUG
    // -------------------------------------------------

    if (!cleanSlug) {
      return res.status(400).json({
        success: false,
        message: "Category slug is required",
      });
    }

    // =================================================
    // DUPLICATE NAME CHECK
    // =================================================

    const existingName = await Category.findOne({
      name: new RegExp(`^${escapeRegex(cleanName)}$`, "i"),
    });

    if (existingName && existingName._id.toString() !== id) {
      return res.status(409).json({
        success: false,
        message: "Another category with this name already exists",
      });
    }

    // =================================================
    // DUPLICATE SLUG CHECK
    // =================================================

    const existingSlug = await Category.findOne({
      slug: cleanSlug,
    });

    if (existingSlug && existingSlug._id.toString() !== id) {
      return res.status(409).json({
        success: false,
        message: "Another category with this slug already exists",
      });
    }

    // =================================================
    // SAVE OLD IMAGE ID
    // =================================================

    const oldPublicId = category.image?.publicId || "";

    // =================================================
    // UPLOAD NEW IMAGE
    // =================================================

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "arfusion/categories",
      );

      newUploadedImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    // =================================================
    // UPDATE MONGODB FIELDS
    // =================================================

    category.name = cleanName;

    category.slug = cleanSlug;

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (isActive !== undefined) {
      category.isActive = parseBoolean(isActive, category.isActive);
    }

    // -------------------------------------------------
    // UPDATE IMAGE ONLY IF NEW IMAGE EXISTS
    // -------------------------------------------------

    if (newUploadedImage) {
      category.image = newUploadedImage;
    }

    // =================================================
    // SAVE MONGODB FIRST
    // =================================================

    await category.save();

    // =================================================
    // DELETE OLD CLOUDINARY IMAGE
    //
    // ONLY AFTER MONGODB SUCCESS
    // =================================================

    if (
      newUploadedImage &&
      oldPublicId &&
      oldPublicId !== newUploadedImage.publicId
    ) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (cloudinaryError) {
        console.error("Old Cloudinary image deletion error:", cloudinaryError);
      }
    }

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);

    // =================================================
    // DELETE NEW IMAGE IF UPDATE FAILED
    // =================================================

    if (newUploadedImage?.publicId) {
      try {
        await cloudinary.uploader.destroy(newUploadedImage.publicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary rollback error:", cloudinaryError);
      }
    }

    // =================================================
    // DUPLICATE KEY
    // =================================================

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category name or slug already exists",
      });
    }

    // =================================================
    // VALIDATION ERROR
    // =================================================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // =================================================
    // INVALID OBJECT ID
    // =================================================

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// ENABLE / DISABLE CATEGORY
// Admin only
//
// PATCH /api/categories/:id/status
// =====================================================

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // -------------------------------------------------
    // FIND CATEGORY
    // -------------------------------------------------

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // -------------------------------------------------
    // TOGGLE STATUS
    // -------------------------------------------------

    category.isActive = !category.isActive;

    await category.save();

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message: category.isActive
        ? "Category enabled successfully"
        : "Category disabled successfully",
      category,
    });
  } catch (error) {
    console.error("Toggle Category Status Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// DELETE CATEGORY
// Admin only
//
// DELETE /api/categories/:id
// =====================================================

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // -------------------------------------------------
    // FIND CATEGORY
    // -------------------------------------------------

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // =================================================
    // DELETE MONGODB CATEGORY FIRST
    // =================================================

    await Category.findByIdAndDelete(id);

    // =================================================
    // DELETE CLOUDINARY IMAGE
    // =================================================

    if (category.image?.publicId) {
      try {
        await cloudinary.uploader.destroy(category.image.publicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary image deletion error:", cloudinaryError);
      }
    }

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
