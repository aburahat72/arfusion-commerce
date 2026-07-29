import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

import { protectedRoute } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  addToCartSchema,
  updateCartSchema,
} from "../validations/cart.validation.js";

const router = express.Router();

// Get logged-in user's cart
router.get("/", protectedRoute, getCart);

// Add product to cart
router.post("/", protectedRoute, validate(addToCartSchema), addToCart);

// Update cart item quantity
router.patch(
  "/:productId",
  protectedRoute,
  validate(updateCartSchema),
  updateCartItem,
);

// Remove product from cart
router.delete("/:productId", protectedRoute, removeCartItem);

// Clear cart
router.delete("/", protectedRoute, clearCart);

export default router;
