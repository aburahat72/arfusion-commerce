import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { protectedRoute, authorize } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createProductSchema, updateProductSchema } from "../validations/product.validation.js";

const router = express.Router();

// Get all active products - Public (product routes)
router.get("/", getAllProducts);

// Get single product by ID - Public
router.get("/:id", getProductById);

// Create product - Admin only (product routes)
router.post(
  "/",
  protectedRoute,
  authorize("admin"),
  validate(createProductSchema),
  createProduct,
);

// Update product - Admin only
router.patch(
  "/:id",
  protectedRoute,
  authorize("admin"),
  validate(updateProductSchema),
  updateProduct,
);

// Delete product - Admin only
router.delete(
  "/:id",
  protectedRoute,
  authorize("admin"),
  deleteProduct,
);

export default router;

