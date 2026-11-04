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

          if (!productId) {
            return null;
          }

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
| Fetch Fresh Cart
|--------------------------------------------------------------------------
|
| Always gets the populated cart from the backend.
|
| This is important because cart mutation endpoints may
| return an unpopulated cart.
|
*/

const fetchNormalizedCart = async () => {
  const response = await getCart();

  return normalizeCart(response?.cart);
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
      return await fetchNormalizedCart();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load cart",
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
      if (!productId) {
        return rejectWithValue("Product ID is required");
      }

      /*
       * First update the backend cart.
       */
      await addToCartApi(productId, quantity);

      /*
       * Then fetch the authoritative populated cart.
       *
       * This immediately synchronizes Redux with the backend.
       */
      return await fetchNormalizedCart();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add product to cart",
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
      if (!productId) {
        return rejectWithValue("Product ID is required");
      }

      if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
        return rejectWithValue("Quantity must be at least 1");
      }

      /*
       * Update backend first.
       */
      await updateCartItemApi(productId, quantity);

      /*
       * Fetch fresh populated cart.
       */
      return await fetchNormalizedCart();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update cart",
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
      if (!productId) {
        return rejectWithValue("Product ID is required");
      }

      /*
       * Remove from backend first.
       */
      await removeCartItemApi(productId);

      /*
       * Fetch fresh populated cart.
       */
      return await fetchNormalizedCart();
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to remove product",
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
      await clearCartApi();

      /*
       * The backend has cleared the cart.
       * Returning an empty normalized cart keeps Redux
       * immediately synchronized.
       */
      return {
        items: [],
        totalPrice: 0,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to clear cart",
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
     *
     * Backend succeeds
     *       ↓
     * Fresh cart is fetched
     *       ↓
     * Redux items are updated
     *       ↓
     * Header/cart UI updates immediately
     *
     */

    builder
      .addCase(addProductToCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(addProductToCart.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.items = action.payload.items;
        state.totalPrice = action.payload.totalPrice;

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

      .addCase(updateProductQuantity.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.items = action.payload.items;
        state.totalPrice = action.payload.totalPrice;

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

      .addCase(removeProductFromCart.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.items = action.payload.items;
        state.totalPrice = action.payload.totalPrice;

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

      .addCase(clearCustomerCart.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.items = action.payload.items;
        state.totalPrice = action.payload.totalPrice;

        state.error = null;
      })

      .addCase(clearCustomerCart.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to clear cart";
      });
  },
});

/*
|--------------------------------------------------------------------------
| Export Local Actions
|--------------------------------------------------------------------------
*/

export const { resetCart, removePurchasedItems } = cartSlice.actions;

/*
|--------------------------------------------------------------------------
| Export Reducer
|--------------------------------------------------------------------------
*/

export default cartSlice.reducer;
