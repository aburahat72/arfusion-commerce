import mongoose from "mongoose";
import Banner from "../models/banner.model.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// =====================================================
// CONSTANTS
// =====================================================

const IMAGE_FIELDS = [
  "mainProduct",
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];

const CLOUDINARY_ROOT = "arfusion/banners";

// =====================================================
// HELPERS
// =====================================================

// -----------------------------------------------------
// Validate MongoDB ObjectId
// -----------------------------------------------------

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// -----------------------------------------------------
// Parse JSON safely
// -----------------------------------------------------

const parseJsonField = (data, field) => {
  if (data[field] === undefined) {
    return;
  }

  if (typeof data[field] !== "string") {
    return;
  }

  try {
    data[field] = JSON.parse(data[field]);
  } catch (error) {
    const jsonError = new Error(`${field} must contain valid JSON`);

    jsonError.statusCode = 400;

    throw jsonError;
  }
};

// -----------------------------------------------------
// Parse multipart JSON fields
// -----------------------------------------------------

const parseMultipartFields = (data) => {
  parseJsonField(data, "primaryButton");
  parseJsonField(data, "secondaryButton");
  parseJsonField(data, "stats");
  parseJsonField(data, "colors");
};

// -----------------------------------------------------
// Normalize boolean
// -----------------------------------------------------

const normalizeBoolean = (value, defaultValue = true) => {
  if (value === undefined) {
    return defaultValue;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return value;
};

// -----------------------------------------------------
// Normalize sort order
// -----------------------------------------------------

const normalizeSortOrder = (value, defaultValue = 0) => {
  if (value === undefined) {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isNaN(number) ? value : number;
};

// =====================================================
// CLOUDINARY UPLOAD
// =====================================================

const uploadToCloudinary = (file, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

// =====================================================
// CLOUDINARY DELETE
// =====================================================

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error(
      `Failed to delete Cloudinary image ${publicId}:`,
      error.message,
    );
  }
};

// =====================================================
// DELETE MULTIPLE CLOUDINARY IMAGES
// =====================================================

const deleteCloudinaryImages = async (publicIds) => {
  for (const publicId of publicIds) {
    await deleteFromCloudinary(publicId);
  }
};

// =====================================================
// CREATE BANNER
// ADMIN
// =====================================================

export const createBanner = async (req, res) => {
  const uploadedPublicIds = [];

  try {
    const data = {
      ...req.body,
    };

    // -------------------------------------------------
    // Parse multipart JSON fields
    // -------------------------------------------------

    parseMultipartFields(data);

    // -------------------------------------------------
    // Check duplicate slug
    // -------------------------------------------------

    const existingBanner = await Banner.findOne({
      slug: data.slug,
    });

    if (existingBanner) {
      return res.status(409).json({
        success: false,
        message: "A banner with this slug already exists",
      });
    }

    // -------------------------------------------------
    // Require all five images
    // -------------------------------------------------

    for (const field of IMAGE_FIELDS) {
      if (!req.files?.[field]?.[0]) {
        return res.status(400).json({
          success: false,
          message: `${field} image is required`,
        });
      }
    }

    // -------------------------------------------------
    // Upload images
    // -------------------------------------------------

    const images = {};

    for (const field of IMAGE_FIELDS) {
      const file = req.files[field][0];

      const result = await uploadToCloudinary(
        file,
        `${CLOUDINARY_ROOT}/${data.slug}`,
        field,
      );

      uploadedPublicIds.push(result.public_id);

      images[field] = {
        url: result.secure_url,
        publicId: result.public_id,
        alt: data[`${field}Alt`] || file.originalname || field,
      };
    }

    // -------------------------------------------------
    // Create MongoDB banner
    // -------------------------------------------------

    const banner = await Banner.create({
      slug: data.slug,
      badge: data.badge,
      titleStart: data.titleStart,
      titleHighlight: data.titleHighlight,
      titleEnd: data.titleEnd,
      description: data.description,

      mainProduct: images.mainProduct,

      topLeft: images.topLeft,

      topRight: images.topRight,

      bottomLeft: images.bottomLeft,

      bottomRight: images.bottomRight,

      primaryButton: data.primaryButton,

      secondaryButton: data.secondaryButton,

      stats: data.stats ?? [],

      colors: data.colors,

      isActive: normalizeBoolean(data.isActive, true),

      sortOrder: normalizeSortOrder(data.sortOrder, 0),
    });

    // -------------------------------------------------
    // Success
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    // -------------------------------------------------
    // Rollback Cloudinary uploads
    // -------------------------------------------------

    await deleteCloudinaryImages(uploadedPublicIds);

    console.error("Create banner error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    // Duplicate key protection
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A banner with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create banner",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL ACTIVE BANNERS
// PUBLIC
// =====================================================

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({
      isActive: true,
    })
      .sort({
        sortOrder: 1,
        createdAt: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error("Get banners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL BANNERS
// ADMIN
// =====================================================

export const getAllAdminBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({
        sortOrder: 1,
        createdAt: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error("Get admin banners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin banners",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ACTIVE BANNER
// PUBLIC
// =====================================================

export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // Validate ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    // -------------------------------------------------
    // Find active banner
    // -------------------------------------------------

    const banner = await Banner.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error("Get banner error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banner",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE BANNER
// ADMIN
// =====================================================

export const getAdminBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // Validate ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    // -------------------------------------------------
    // Find banner
    // -------------------------------------------------

    const banner = await Banner.findById(id).lean();

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error("Get admin banner error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banner",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE BANNER
// ADMIN
// =====================================================

export const updateBanner = async (req, res) => {
  const uploadedPublicIds = [];
  const oldPublicIds = [];

  try {
    const { id } = req.params;

    // -------------------------------------------------
    // Validate ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    // -------------------------------------------------
    // Find banner
    // -------------------------------------------------

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // -------------------------------------------------
    // Copy request body
    // -------------------------------------------------

    const data = {
      ...req.body,
    };

    // -------------------------------------------------
    // Parse JSON fields
    // -------------------------------------------------

    parseMultipartFields(data);

    // -------------------------------------------------
    // Check slug change
    // -------------------------------------------------

    const oldSlug = banner.slug;

    if (data.slug && data.slug !== oldSlug) {
      const existingBanner = await Banner.findOne({
        slug: data.slug,
        _id: {
          $ne: banner._id,
        },
      });

      if (existingBanner) {
        return res.status(409).json({
          success: false,
          message: "A banner with this slug already exists",
        });
      }
    }

    // -------------------------------------------------
    // Determine final slug
    // -------------------------------------------------

    const finalSlug = data.slug || banner.slug;

    // -------------------------------------------------
    // Update normal fields
    // -------------------------------------------------

    const normalFields = [
      "slug",
      "badge",
      "titleStart",
      "titleHighlight",
      "titleEnd",
      "description",
      "primaryButton",
      "secondaryButton",
      "stats",
      "colors",
      "isActive",
      "sortOrder",
    ];

    for (const field of normalFields) {
      if (data[field] !== undefined) {
        banner[field] = data[field];
      }
    }

    // -------------------------------------------------
    // Normalize admin values
    // -------------------------------------------------

    if (data.isActive !== undefined) {
      banner.isActive = normalizeBoolean(data.isActive, banner.isActive);
    }

    if (data.sortOrder !== undefined) {
      banner.sortOrder = normalizeSortOrder(data.sortOrder, banner.sortOrder);
    }

    // -------------------------------------------------
    // Replace uploaded images
    // -------------------------------------------------

    for (const field of IMAGE_FIELDS) {
      const file = req.files?.[field]?.[0];

      if (!file) {
        continue;
      }

      // Save old Cloudinary ID
      const oldPublicId = banner[field]?.publicId;

      if (oldPublicId) {
        oldPublicIds.push(oldPublicId);
      }

      // Upload new image
      const result = await uploadToCloudinary(
        file,
        `${CLOUDINARY_ROOT}/${finalSlug}`,
        field,
      );

      uploadedPublicIds.push(result.public_id);

      // Replace MongoDB image object
      banner[field] = {
        url: result.secure_url,
        publicId: result.public_id,
        alt: data[`${field}Alt`] || file.originalname || field,
      };
    }

    // -------------------------------------------------
    // Save MongoDB
    // -------------------------------------------------

    await banner.save();

    // -------------------------------------------------
    // Delete old Cloudinary images
    // -------------------------------------------------

    for (const publicId of oldPublicIds) {
      if (!uploadedPublicIds.includes(publicId)) {
        await deleteFromCloudinary(publicId);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    // -------------------------------------------------
    // Rollback newly uploaded images
    // -------------------------------------------------

    await deleteCloudinaryImages(uploadedPublicIds);

    console.error("Update banner error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A banner with this slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update banner",
      error: error.message,
    });
  }
};

// =====================================================
// TOGGLE BANNER STATUS
// ADMIN
// =====================================================

export const toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // Validate ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    // -------------------------------------------------
    // Find banner
    // -------------------------------------------------

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // -------------------------------------------------
    // Toggle
    // -------------------------------------------------

    banner.isActive = !banner.isActive;

    await banner.save();

    return res.status(200).json({
      success: true,
      message: banner.isActive
        ? "Banner activated successfully"
        : "Banner deactivated successfully",
      banner,
    });
  } catch (error) {
    console.error("Toggle banner status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to toggle banner status",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE BANNER
// ADMIN
// =====================================================

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // Validate ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    // -------------------------------------------------
    // Find banner
    // -------------------------------------------------

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // -------------------------------------------------
    // Save Cloudinary IDs
    // BEFORE deleting MongoDB
    // -------------------------------------------------

    const publicIds = [];

    for (const field of IMAGE_FIELDS) {
      const publicId = banner[field]?.publicId;

      if (publicId) {
        publicIds.push(publicId);
      }
    }

    // -------------------------------------------------
    // Delete MongoDB document FIRST
    // -------------------------------------------------

    await Banner.deleteOne({
      _id: banner._id,
    });

    // -------------------------------------------------
    // Delete Cloudinary images
    // -------------------------------------------------

    await deleteCloudinaryImages(publicIds);

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete banner error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete banner",
      error: error.message,
    });
  }
};
