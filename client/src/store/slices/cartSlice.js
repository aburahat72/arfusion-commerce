import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
} from "../../services/cartService";

/*
|--------------------------------------------------------------------------
| Normalize backend cart
|--------------------------------------------------------------------------
|
| Backend response:
|
| cart.items[] = {
|   product: {
|     _id,
|     name,
|     price,
|     images,
|     stock,
|     ...
|   },
|   quantity,
|   price
| }
|
| Frontend cart item:
|
| {
|   id,
|   _id,
|   name,
|   price,
|   image,
|   images,
|   quantity,
|   stock,
|   ...
| }
|
*/

const normalizeCart = (cart) => {
  const items = Array.isArray(cart?.items)
    ? cart.items
        .map((item) => {
          const product = item?.product;

          if (!product) {
            return null;
          }

          const productId = product._id || product.id;

          const image =
            product.images?.[0]?.url ||
            (typeof product.images?.[0] === "string"
              ? product.images[0]
              : "") ||
            product.image ||
            "";

          return {
            id: String(productId),
            _id: String(productId),

            name: product.name || "",

            /*
             * Use cart item's saved price.
             * This matches the backend cart model.
             */
            price: Number(item.price ?? product.price ?? 0),

            image,

            images: product.images || [],

            quantity: Number(item.quantity || 1),

            stock: Number(product.stock ?? 0),

            category:
              typeof product.category === "object"
                ? product.category?.name || product.category?.slug || ""
                : product.categoryLabel || product.category || "",

            categoryLabel: product.categoryLabel || "",

            rating: product.rating,

            reviewCount: product.reviewCount,

            brand: product.brand,

            sku: product.sku,

            oldPrice: product.oldPrice,

            discount: product.discount,

            description: product.description,
          };
        })
        .filter(Boolean)
    : [];

  return {
    items,
    totalPrice: Number(cart?.totalPrice || 0),
  };
};

/*
|--------------------------------------------------------------------------
| Get Cart
|--------------------------------------------------------------------------
*/

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCart();

      return normalizeCart(response?.cart);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load cart",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Add To Cart
|--------------------------------------------------------------------------
*/

export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await addToCartApi(productId, quantity);

      /*
       * addToCart backend returns an unpopulated cart.
       *
       * Fetch again so the frontend receives complete
       * populated product information.
       */
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add product to cart",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Update Cart Quantity
|--------------------------------------------------------------------------
*/

export const updateProductQuantity = createAsyncThunk(
  "cart/updateProductQuantity",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await updateCartItemApi(productId, quantity);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cart",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Remove Cart Item
|--------------------------------------------------------------------------
*/

export const removeProductFromCart = createAsyncThunk(
  "cart/removeProductFromCart",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await removeCartItemApi(productId);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove product",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Clear Cart
|--------------------------------------------------------------------------
*/

export const clearCustomerCart = createAsyncThunk(
  "cart/clearCustomerCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await clearCartApi();

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear cart",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Initial State
|--------------------------------------------------------------------------
*/

const initialState = {
  items: [],
  totalPrice: 0,

  loading: false,
  actionLoading: false,

  error: null,
};

/*
|--------------------------------------------------------------------------
| Cart Slice
|--------------------------------------------------------------------------
*/

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    /*
     * Local reset only.
     * Useful after logout.
     */
    resetCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.loading = false;
      state.actionLoading = false;
      state.error = null;
    },

    /*
     * Kept for compatibility with existing code.
     */
    removePurchasedItems: (state, action) => {
      const purchasedItemIds = action.payload.map(String);

      state.items = state.items.filter(
        (item) => !purchasedItemIds.includes(String(item.id)),
      );

      state.totalPrice = state.items.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0,
      );
    },
  },

  extraReducers: (builder) => {
    /*
     * ========================================================
     * FETCH CART
     * ========================================================
     */

    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;

        state.items = action.payload.items;

        state.totalPrice = action.payload.totalPrice;

        state.error = null;
      })

      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to load cart";
      });

    /*
     * ========================================================
     * ADD PRODUCT
     * ========================================================
     */

    builder
      .addCase(addProductToCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(addProductToCart.fulfilled, (state) => {
        state.actionLoading = false;
        state.error = null;
      })

      .addCase(addProductToCart.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to add product";
      });

    /*
     * ========================================================
     * UPDATE QUANTITY
     * ========================================================
     */

    builder
      .addCase(updateProductQuantity.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(updateProductQuantity.fulfilled, (state) => {
        state.actionLoading = false;
        state.error = null;
      })

      .addCase(updateProductQuantity.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to update cart";
      });

    /*
     * ========================================================
     * REMOVE PRODUCT
     * ========================================================
     */

    builder
      .addCase(removeProductFromCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(removeProductFromCart.fulfilled, (state) => {
        state.actionLoading = false;
        state.error = null;
      })

      .addCase(removeProductFromCart.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to remove product";
      });

    /*
     * ========================================================
     * CLEAR CART
     * ========================================================
     */

    builder
      .addCase(clearCustomerCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(clearCustomerCart.fulfilled, (state) => {
        state.actionLoading = false;
        state.items = [];
        state.totalPrice = 0;
        state.error = null;
      })

      .addCase(clearCustomerCart.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to clear cart";
      });
  },
});

export const { resetCart, removePurchasedItems } = cartSlice.actions;

export default cartSlice.reducer;
