import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,

  reducers: {
    // Add product to wishlist
    addToWishlist: (state, action) => {
      const product = action.payload;

      const productId = product.id || product._id;

      const exists = state.items.some(
        (item) => (item.id || item._id) === productId,
      );

      if (!exists) {
        state.items.push(product);
      }
    },

    // Remove product from wishlist
    removeFromWishlist: (state, action) => {
      const productId = action.payload;

      state.items = state.items.filter(
        (item) => (item.id || item._id) !== productId,
      );
    },

    // Toggle wishlist
    toggleWishlist: (state, action) => {
      const product = action.payload;

      const productId = product.id || product._id;

      const existingIndex = state.items.findIndex(
        (item) => (item.id || item._id) === productId,
      );

      if (existingIndex !== -1) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push(product);
      }
    },

    // Clear wishlist
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
