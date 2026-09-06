import express from "express";

import {
  getActiveCategories,
  getAllCategories,
  createCategory,
  getCategoryBySlug,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} from "../controllers/category.controller.js";

import {
  protectedRoute,
  authorize,
} from "../middleware/adminAuth.middleware.js";

import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// =====================================================
// PUBLIC
// =====================================================

// GET /api/categories
//
// Returns all active categories
router.get("/", getActiveCategories);

// =====================================================
// ADMIN
// =====================================================

// GET /api/categories/admin/all
//
// IMPORTANT:
// This route must come BEFORE /:slug
// so "admin" is not treated as a category slug.
router.get("/admin/all", protectedRoute, authorize("admin"), getAllCategories);

// =====================================================
// PUBLIC SINGLE CATEGORY
// =====================================================

// GET /api/categories/:slug
//
// Example:
// GET /api/categories/electronics
router.get("/:slug", getCategoryBySlug);

// =====================================================
// ADMIN CREATE
// =====================================================

// POST /api/categories
//
// multipart/form-data
// image: category image
router.post(
  "/",
  protectedRoute,
  authorize("admin"),
  upload.single("image"),
  createCategory,
);

// =====================================================
// ADMIN UPDATE
// =====================================================

// PUT /api/categories/:id
//
// multipart/form-data
// image: optional new category image
router.put(
  "/:id",
  protectedRoute,
  authorize("admin"),
  upload.single("image"),
  updateCategory,
);

// =====================================================
// ADMIN ENABLE / DISABLE
// =====================================================

// PATCH /api/categories/:id/status
router.patch(
  "/:id/status",
  protectedRoute,
  authorize("admin"),
  toggleCategoryStatus,
);

// =====================================================
// ADMIN DELETE
// =====================================================

// DELETE /api/categories/:id
router.delete("/:id", protectedRoute, authorize("admin"), deleteCategory);

export default router;
