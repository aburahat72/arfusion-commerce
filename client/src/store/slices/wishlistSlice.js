import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getWishlist,
  addToWishlistApi,
  removeWishlistItemApi,
  clearWishlistApi,
} from "../../services/wishlistService";

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
  items: [],
  loading: false,
  error: null,
  actionLoading: false,
};

/* =====================================================
   GET WISHLIST ITEMS FROM RESPONSE
===================================================== */

const extractWishlistItems = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.wishlist?.products)) {
    return response.wishlist.products;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  if (Array.isArray(response?.wishlist?.items)) {
    return response.wishlist.items;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

/* =====================================================
   FETCH WISHLIST
===================================================== */

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getWishlist();

      return extractWishlistItems(response);
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load wishlist",
      );
    }
  },
);

/* =====================================================
   ADD PRODUCT TO WISHLIST
===================================================== */

export const addProductToWishlist = createAsyncThunk(
  "wishlist/addProductToWishlist",
  async (payload, { rejectWithValue }) => {
    try {
      /*
       * Support both:
       *
       * addProductToWishlist(productId)
       *
       * and:
       *
       * addProductToWishlist({
       *   productId,
       *   product,
       * })
       */

      const productId =
        typeof payload === "object"
          ? payload?.productId || payload?._id || payload?.id
          : payload;

      const product = typeof payload === "object" ? payload?.product : null;

      if (!productId) {
        return rejectWithValue("Product ID is required");
      }

      const response = await addToWishlistApi(productId);

      return {
        productId,
        product,
        response,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add product to wishlist",
      );
    }
  },
);

/* =====================================================
   REMOVE PRODUCT FROM WISHLIST
===================================================== */

export const removeProductFromWishlist = createAsyncThunk(
  "wishlist/removeProductFromWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const id =
        typeof productId === "object"
          ? productId?.productId || productId?._id || productId?.id
          : productId;

      if (!id) {
        return rejectWithValue("Product ID is required");
      }

      const response = await removeWishlistItemApi(id);

      return {
        productId: id,
        response,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to remove product from wishlist",
      );
    }
  },
);

/* =====================================================
   CLEAR WISHLIST
===================================================== */

export const clearWishlistFromBackend = createAsyncThunk(
  "wishlist/clearWishlistFromBackend",
  async (_, { rejectWithValue }) => {
    try {
      const response = await clearWishlistApi();

      return response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to clear wishlist",
      );
    }
  },
);

/* =====================================================
   WISHLIST SLICE
===================================================== */

const wishlistSlice = createSlice({
  name: "wishlist",

  initialState,

  reducers: {
    /* =================================================
       LOCAL ADD

       Kept for compatibility with existing components.
    ================================================= */

    addToWishlist: (state, action) => {
      const product = action.payload;

      const productId = product?.id || product?._id;

      if (!productId) {
        return;
      }

      const exists = state.items.some(
        (item) => String(item.id || item._id) === String(productId),
      );

      if (!exists) {
        state.items.push(product);
      }
    },

    /* =================================================
       LOCAL REMOVE

       Kept for compatibility.
    ================================================= */

    removeFromWishlist: (state, action) => {
      const productId = action.payload;

      state.items = state.items.filter(
        (item) => String(item.id || item._id) !== String(productId),
      );
    },

    /* =================================================
       LOCAL TOGGLE

       Kept for compatibility with older components.
       New backend-connected components should use
       addProductToWishlist/removeProductFromWishlist.
    ================================================= */

    toggleWishlist: (state, action) => {
      const product = action.payload;

      const productId = product?.id || product?._id;

      if (!productId) {
        return;
      }

      const existingIndex = state.items.findIndex(
        (item) => String(item.id || item._id) === String(productId),
      );

      if (existingIndex !== -1) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push(product);
      }
    },

    /* =================================================
       LOCAL CLEAR

       Kept for compatibility.
    ================================================= */

    clearWishlist: (state) => {
      state.items = [];
    },

    /* =================================================
       CLEAR ERROR
    ================================================= */

    clearWishlistError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    /* =================================================
       FETCH WISHLIST
    ================================================= */

    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.items = action.payload;
      })

      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to load wishlist";
      });

    /* =================================================
       ADD PRODUCT
    ================================================= */

    builder
      .addCase(addProductToWishlist.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(addProductToWishlist.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.error = null;

        const productId = action.payload.productId;

        /*
         * If the calling component supplied the
         * complete product object, immediately add it
         * to Redux after the backend succeeds.
         */

        const product = action.payload.product;

        const exists = state.items.some(
          (item) => String(item.id || item._id) === String(productId),
        );

        if (!exists && product) {
          state.items.push(product);
        }
      })

      .addCase(addProductToWishlist.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to add product to wishlist";
      });

    /* =================================================
       REMOVE PRODUCT
    ================================================= */

    builder
      .addCase(removeProductFromWishlist.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(removeProductFromWishlist.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.error = null;

        const productId = action.payload.productId;

        state.items = state.items.filter(
          (item) => String(item.id || item._id) !== String(productId),
        );
      })

      .addCase(removeProductFromWishlist.rejected, (state, action) => {
        state.actionLoading = false;

        state.error =
          action.payload || "Failed to remove product from wishlist";
      });

    /* =================================================
       CLEAR WISHLIST
    ================================================= */

    builder
      .addCase(clearWishlistFromBackend.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(clearWishlistFromBackend.fulfilled, (state) => {
        state.actionLoading = false;
        state.error = null;

        state.items = [];
      })

      .addCase(clearWishlistFromBackend.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to clear wishlist";
      });
  },
});

/* =====================================================
   EXPORT LOCAL ACTIONS
===================================================== */

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  clearWishlistError,
} = wishlistSlice.actions;

/* =====================================================
   EXPORT REDUCER
===================================================== */

export default wishlistSlice.reducer;
