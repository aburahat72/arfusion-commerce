import { configureStore } from "@reduxjs/toolkit";

import cartReducer from "./slices/cartSlice";
import checkoutReducer from "./slices/checkoutSlice";
import wishlistReducer from "./slices/wishlistSlice";
import compareReducer from "./slices/compareSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    checkout: checkoutReducer,
    wishlist: wishlistReducer,
    compare: compareReducer,
  },
});
