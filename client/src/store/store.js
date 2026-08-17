import { configureStore } from "@reduxjs/toolkit";

import cartReducer from "./slices/cartSlice";
import checkoutReducer from "./slices/checkoutSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    checkout: checkoutReducer,
  },
});
