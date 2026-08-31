import express from "express";

import {
  createBanner,
  getAllBanners,
  getAllAdminBanners,
  getBannerById,
  getAdminBannerById,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from "../controllers/banner.controller.js";

import {
  protectedRoute,
  authorize,
} from "../middleware/adminAuth.middleware.js";

import validate from "../middleware/validate.middleware.js";

import {
  createBannerSchema,
  updateBannerSchema,
} from "../validations/banner.validation.js";

import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// =====================================================
// PUBLIC
// =====================================================

// Get all active banners
// GET /api/banners
router.get("/", getAllBanners);

// =====================================================
// ADMIN
// =====================================================

// Get all banners
// GET /api/banners/admin/all
router.get(
  "/admin/all",
  protectedRoute,
  authorize("admin"),
  getAllAdminBanners,
);

// Get single banner
// GET /api/banners/admin/:id
router.get(
  "/admin/:id",
  protectedRoute,
  authorize("admin"),
  getAdminBannerById,
);

// Create banner
// POST /api/banners
router.post(
  "/",
  protectedRoute,
  authorize("admin"),
  upload.fields([
    {
      name: "mainProduct",
      maxCount: 1,
    },
    {
      name: "topLeft",
      maxCount: 1,
    },
    {
      name: "topRight",
      maxCount: 1,
    },
    {
      name: "bottomLeft",
      maxCount: 1,
    },
    {
      name: "bottomRight",
      maxCount: 1,
    },
  ]),
  validate(createBannerSchema),
  createBanner,
);

// Toggle banner active/inactive
// PATCH /api/banners/:id/status
router.patch(
  "/:id/status",
  protectedRoute,
  authorize("admin"),
  toggleBannerStatus,
);

// Update banner
// PATCH /api/banners/:id
router.patch(
  "/:id",
  protectedRoute,
  authorize("admin"),
  upload.fields([
    {
      name: "mainProduct",
      maxCount: 1,
    },
    {
      name: "topLeft",
      maxCount: 1,
    },
    {
      name: "topRight",
      maxCount: 1,
    },
    {
      name: "bottomLeft",
      maxCount: 1,
    },
    {
      name: "bottomRight",
      maxCount: 1,
    },
  ]),
  validate(updateBannerSchema),
  updateBanner,
);

// Delete banner
// DELETE /api/banners/:id
router.delete(
  "/:id",
  protectedRoute,
  authorize("admin"),
  deleteBanner,
);

// =====================================================
// PUBLIC SINGLE BANNER
// =====================================================

// Get single active banner
// GET /api/banners/:id
//
// IMPORTANT:
// This must remain AFTER all /admin/* routes.
router.get("/:id", getBannerById);

export default router;
