import express from "express";

import {
  createProduct,
  getAllProducts,
  getAllAdminProducts,
  getProductById,
  getAdminProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "../controllers/product.controller.js";

import {
  protectedRoute,
  authorize,
} from "../middleware/adminAuth.middleware.js";

import validate from "../middleware/validate.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation.js";

import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// =====================================================
// PUBLIC PRODUCTS
// =====================================================

// GET /api/products
//
// Returns all active products
//
// Supported:
// ?search=samsung
// ?category=electronics
// ?minPrice=500
// ?maxPrice=50000
// ?page=1
// ?limit=20

router.get("/", getAllProducts);

// =====================================================
// ADMIN PRODUCTS
// =====================================================

// IMPORTANT:
// These routes MUST come BEFORE:
//
// router.get("/:id", getProductById);
//
// Otherwise Express can treat "admin" as the product ID.

// -----------------------------------------------------
// GET ALL PRODUCTS
// ADMIN
// -----------------------------------------------------

// GET /api/products/admin/all
//
// Returns all products for admin
//
// Includes:
// - Active products
// - Inactive products
// - Search
// - Category filter
// - Stock filter
// - Pagination

router.get(
  "/admin/all",
  protectedRoute,
  authorize("admin"),
  getAllAdminProducts,
);

// -----------------------------------------------------
// GET SINGLE PRODUCT
// ADMIN
// -----------------------------------------------------

// GET /api/products/admin/:id
//
// Returns a single product for admin
// including inactive products.

router.get(
  "/admin/:id",
  protectedRoute,
  authorize("admin"),
  getAdminProductById,
);

// =====================================================
// PUBLIC SINGLE PRODUCT
// =====================================================

// GET /api/products/:id
//
// IMPORTANT:
// This route MUST remain AFTER all /admin routes.
//
// Otherwise:
//
// /api/products/admin/all
//
// could be interpreted as:
//
// id = "admin"

router.get("/:id", getProductById);

// =====================================================
// CREATE PRODUCT
// ADMIN
// =====================================================

// POST /api/products
//
// multipart/form-data
//
// Fields:
// - name
// - description
// - price
// - stock
// - category
// - isActive
// - images

router.post(
  "/",
  protectedRoute,
  authorize("admin"),
  upload.array("images", 5),
  validate(createProductSchema),
  createProduct,
);

// =====================================================
// UPDATE PRODUCT
// ADMIN
// =====================================================

// PUT /api/products/:id
//
// multipart/form-data
//
// Fields:
// - name
// - description
// - price
// - stock
// - category
// - isActive
// - images

router.put(
  "/:id",
  protectedRoute,
  authorize("admin"),
  upload.array("images", 5),
  validate(updateProductSchema),
  updateProduct,
);

// =====================================================
// ENABLE / DISABLE PRODUCT
// ADMIN
// =====================================================

// PATCH /api/products/:id/status
//
// Toggles:
// true  -> false
// false -> true

router.patch(
  "/:id/status",
  protectedRoute,
  authorize("admin"),
  toggleProductStatus,
);

// =====================================================
// DELETE PRODUCT
// ADMIN
// =====================================================

// DELETE /api/products/:id

router.delete("/:id", protectedRoute, authorize("admin"), deleteProduct);

// =====================================================
// EXPORT ROUTER
// =====================================================

export default router;
