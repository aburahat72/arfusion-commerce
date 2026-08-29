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
router.get("/", getActiveCategories);

// GET /api/categories/:slug
router.get("/:slug", getCategoryBySlug);

// =====================================================
// ADMIN
// =====================================================

// GET /api/categories/admin/all
router.get("/admin/all", protectedRoute, authorize("admin"), getAllCategories);

// CREATE
// POST /api/categories
router.post(
  "/",
  protectedRoute,
  authorize("admin"),
  upload.single("image"),
  createCategory,
);

// UPDATE
// PUT /api/categories/:id
router.put(
  "/:id",
  protectedRoute,
  authorize("admin"),
  upload.single("image"),
  updateCategory,
);

// ENABLE / DISABLE
// PATCH /api/categories/:id/status
router.patch(
  "/:id/status",
  protectedRoute,
  authorize("admin"),
  toggleCategoryStatus,
);

// DELETE
// DELETE /api/categories/:id
router.delete("/:id", protectedRoute, authorize("admin"), deleteCategory);

export default router;
