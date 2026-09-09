import customerApi from "./customerApi";

/* =====================================================
   GET WISHLIST
===================================================== */

/**
 * Get the logged-in customer's wishlist.
 *
 * Backend:
 * GET /api/wishlist
 *
 * The customerApi instance is responsible for:
 * - Base URL
 * - Customer authentication
 * - Authorization header
 * - Customer auth error handling
 */
export const getWishlist = async () => {
  const response = await customerApi.get("/wishlist");

  return response.data;
};

/* =====================================================
   ADD TO WISHLIST
===================================================== */

/**
 * Add a product to the logged-in customer's wishlist.
 *
 * Backend:
 * POST /api/wishlist
 *
 * Payload:
 * {
 *   productId
 * }
 */
export const addToWishlistApi = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const response = await customerApi.post("/wishlist", {
    productId,
  });

  return response.data;
};

/* =====================================================
   REMOVE FROM WISHLIST
===================================================== */

/**
 * Remove a product from the logged-in customer's wishlist.
 *
 * Backend:
 * DELETE /api/wishlist/:productId
 */
export const removeWishlistItemApi = async (productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const response = await customerApi.delete(`/wishlist/${productId}`);

  return response.data;
};

/* =====================================================
   CLEAR WISHLIST
===================================================== */

/**
 * Remove all products from the logged-in customer's wishlist.
 *
 * Backend:
 * DELETE /api/wishlist
 */
export const clearWishlistApi = async () => {
  const response = await customerApi.delete("/wishlist");

  return response.data;
};
