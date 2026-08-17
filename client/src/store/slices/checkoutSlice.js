import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: null,
  items: [],
};

const checkoutSlice = createSlice({
  name: "checkout",

  initialState,

  reducers: {
    // Start Buy Now checkout
    startBuyNow: (state, action) => {
      state.mode = "buyNow";

      state.items = [
        {
          ...action.payload,
          quantity: action.payload.quantity || 1,
        },
      ];
    },

    // Start normal cart checkout
    startCartCheckout: (state, action) => {
      state.mode = "cart";
      state.items = action.payload;
    },

    // Clear checkout after successful order
    clearCheckout: (state) => {
      state.mode = null;
      state.items = [];
    },
  },
});

export const { startBuyNow, startCartCheckout, clearCheckout } =
  checkoutSlice.actions;

export default checkoutSlice.reducer;
