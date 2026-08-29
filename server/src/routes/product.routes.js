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
// PUBLIC
// =====================================================

router.get("/", getAllProducts);

// =====================================================
// ADMIN
// =====================================================

router.get(
  "/admin/all",
  protectedRoute,
  authorize("admin"),
  getAllAdminProducts,
);

router.get(
  "/admin/:id",
  protectedRoute,
  authorize("admin"),
  getAdminProductById,
);

router.post(
  "/",
  protectedRoute,
  authorize("admin"),
  upload.array("images", 5),
  validate(createProductSchema),
  createProduct,
);

router.patch(
  "/:id/status",
  protectedRoute,
  authorize("admin"),
  toggleProductStatus,
);

router.patch(
  "/:id",
  protectedRoute,
  authorize("admin"),
  upload.array("images", 5),
  validate(updateProductSchema),
  updateProduct,
);

router.delete("/:id", protectedRoute, authorize("admin"), deleteProduct);

// =====================================================
// PUBLIC SINGLE PRODUCT
// =====================================================

router.get("/:id", getProductById);

export default router;
