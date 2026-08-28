import express from "express";

import {
  addToWishlist,
  getWishlist,
  removeWishlistItem,
  clearWishlist,
} from "../controllers/wishlist.controller.js";

import { protectedRoute } from "../middleware/customerAuth.middleware.js";

import validate from "../middleware/validate.middleware.js";

import {
  addToWishlistSchema,
  removeWishlistItemSchema,
} from "../validations/wishlist.validation.js";

const router = express.Router();

// Add product to wishlist

router.post("/", protectedRoute, validate(addToWishlistSchema), addToWishlist);

// Get logged-in user's wishlist

router.get("/", protectedRoute, getWishlist);

// Remove product from wishlist

router.delete("/:productId", protectedRoute, removeWishlistItem);

// Clear wishlist

router.delete("/", protectedRoute, clearWishlist);

export default router;
