import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const compareSlice = createSlice({
  name: "compare",

  initialState,

  reducers: {
    // Add product to compare
    addToCompare: (state, action) => {
      const product = action.payload;

      const productId = product.id || product._id;

      const exists = state.items.some(
        (item) => String(item.id || item._id) === String(productId),
      );

      // Do not add duplicate products
      if (exists) {
        return;
      }

      // Keep comparison limited to 4 products
      if (state.items.length >= 4) {
        return;
      }

      state.items.push(product);
    },

    // Remove product from compare
    removeFromCompare: (state, action) => {
      const productId = action.payload;

      state.items = state.items.filter(
        (item) => String(item.id || item._id) !== String(productId),
      );
    },

    // Toggle compare
    toggleCompare: (state, action) => {
      const product = action.payload;

      const productId = product.id || product._id;

      const existingIndex = state.items.findIndex(
        (item) => String(item.id || item._id) === String(productId),
      );

      // Already compared → remove
      if (existingIndex !== -1) {
        state.items.splice(existingIndex, 1);
        return;
      }

      // Maximum 4 products
      if (state.items.length >= 4) {
        return;
      }

      // Add product
      state.items.push(product);
    },

    // Clear all compared products
    clearCompare: (state) => {
      state.items = [];
    },
  },
});

export const { addToCompare, removeFromCompare, toggleCompare, clearCompare } =
  compareSlice.actions;

export default compareSlice.reducer;
