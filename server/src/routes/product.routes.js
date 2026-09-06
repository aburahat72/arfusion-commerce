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
router.get("/", getAllProducts);

// GET /api/products/:id
// IMPORTANT:
// This must stay AFTER /admin routes so /admin/all and
// /admin/:id are handled correctly.
router.get("/:id", getProductById);

// =====================================================
// ADMIN PRODUCTS
// =====================================================

// GET /api/products/admin/all
router.get(
  "/admin/all",
  protectedRoute,
  authorize("admin"),
  getAllAdminProducts,
);

// GET /api/products/admin/:id
router.get(
  "/admin/:id",
  protectedRoute,
  authorize("admin"),
  getAdminProductById,
);

// =====================================================
// CREATE PRODUCT
// =====================================================

// POST /api/products
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
// =====================================================

// PUT /api/products/:id
router.put(
  "/:id",
  protectedRoute,
  authorize("admin"),
  upload.array("images", 5),
  validate(updateProductSchema),
  updateProduct,
);

// =====================================================
// TOGGLE PRODUCT STATUS
// =====================================================

// PATCH /api/products/:id/status
router.patch(
  "/:id/status",
  protectedRoute,
  authorize("admin"),
  toggleProductStatus,
);

// =====================================================
// DELETE PRODUCT
// =====================================================

// DELETE /api/products/:id
router.delete("/:id", protectedRoute, authorize("admin"), deleteProduct);

export default router;
