import { z } from "zod";

// Add product to wishlist
export const addToWishlistSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required"),
});

// Remove product from wishlist
export const removeWishlistItemSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required"),
});
