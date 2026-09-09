import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";

import {
  fetchWishlist,
  removeProductFromWishlist,
  clearWishlistFromBackend,
} from "../../store/slices/wishlistSlice";

import { addProductToCart } from "../../store/slices/cartSlice";

import { formatCurrency } from "../../utils/currency";

function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* =====================================================
     WISHLIST STATE
  ===================================================== */

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const wishlistLoading = useSelector(
    (state) => state.wishlist?.loading ?? false,
  );

  const wishlistActionLoading = useSelector(
    (state) => state.wishlist?.actionLoading ?? false,
  );

  const wishlistError = useSelector((state) => state.wishlist?.error ?? null);

  /* =====================================================
     CART STATE
  ===================================================== */

  const cartActionLoading = useSelector(
    (state) => state.cart?.actionLoading ?? false,
  );

  /* =====================================================
     FETCH WISHLIST

     Redux state is reset when the browser refreshes.
     Therefore the wishlist must be loaded again
     from the backend.
  ===================================================== */

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = async (item) => {
    const productId = item?.id || item?._id;

    if (!productId) {
      console.error("Cannot add wishlist item to cart: product ID is missing.");

      return;
    }

    if (Number(item?.stock ?? 0) <= 0) {
      return;
    }

    if (cartActionLoading) {
      return;
    }

    try {
      await dispatch(
        addProductToCart({
          productId,
          quantity: 1,
        }),
      ).unwrap();

      console.log(`Added "${item?.name}" to cart successfully.`);
    } catch (error) {
      console.error("Failed to add wishlist item to cart:", error);
    }
  };

  /* =====================================================
     REMOVE FROM WISHLIST

     Backend:
     DELETE /api/wishlist/:productId
  ===================================================== */

  const handleRemoveFromWishlist = async (productId) => {
    if (!productId || wishlistActionLoading) {
      return;
    }

    try {
      await dispatch(removeProductFromWishlist(productId)).unwrap();

      console.log("Product removed from wishlist successfully.");
    } catch (error) {
      console.error("Failed to remove product from wishlist:", error);
    }
  };

  /* =====================================================
     CLEAR WISHLIST

     Backend:
     DELETE /api/wishlist
  ===================================================== */

  const handleClearWishlist = async () => {
    if (wishlistItems.length === 0 || wishlistActionLoading) {
      return;
    }

    try {
      await dispatch(clearWishlistFromBackend()).unwrap();

      console.log("Wishlist cleared successfully.");
    } catch (error) {
      console.error("Failed to clear wishlist:", error);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (wishlistLoading) {
    return (
      <main className="min-h-screen bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-outline-variant bg-surface p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <Heart size={28} className="animate-pulse" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-text">
              Loading wishlist...
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Please wait while we load your saved products.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (wishlistError && wishlistItems.length === 0) {
    return (
      <main className="min-h-screen bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-outline-variant bg-surface p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <Heart size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-text">
              Unable to load wishlist
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              {wishlistError}
            </p>

            <div className="mt-6 flex justify-center">
              <Button size="large" onClick={() => dispatch(fetchWishlist())}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     EMPTY WISHLIST
  ===================================================== */

  if (wishlistItems.length === 0) {
    return (
      <main className="min-h-screen bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-outline-variant bg-surface p-10 text-center shadow-sm sm:p-14">
            {/* Icon */}

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <Heart size={28} />
            </div>

            {/* Heading */}

            <h1 className="mt-5 text-2xl font-semibold text-text">
              Your wishlist is empty
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Save products you love and find them easily whenever you are ready
              to buy.
            </p>

            {/* Button */}

            <div className="mt-6 flex justify-center">
              <Button size="large" onClick={() => navigate("/products")}>
                <ShoppingCart size={18} />
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     WISHLIST
  ===================================================== */

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="mb-6 text-sm text-text-secondary">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="transition hover:text-primary"
          >
            Home
          </button>

          <span className="mx-2">/</span>

          <span className="font-medium text-text">Wishlist</span>
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-primary">
              <Heart size={21} />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-text">
                My Wishlist
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "product" : "products"} saved
              </p>
            </div>
          </div>

          {/* Clear wishlist */}

          <Button
            variant="text"
            size="small"
            onClick={handleClearWishlist}
            disabled={wishlistActionLoading}
          >
            <Trash2 size={16} />

            {wishlistActionLoading ? "Clearing..." : "Clear wishlist"}
          </Button>
        </div>

        {/* =================================================
            WISHLIST ERROR
        ================================================= */}

        {wishlistError && (
          <div className="mb-6 rounded-xl border border-error/20 bg-error/5 px-4 py-3">
            <p className="text-sm font-medium text-error">{wishlistError}</p>
          </div>
        )}

        {/* =================================================
            WISHLIST GRID
        ================================================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => {
            const productId = item?.id || item?._id;

            const isOutOfStock = Number(item?.stock ?? 0) <= 0;

            /*
             * Support:
             *
             * image: "..."
             *
             * images: [
             *   {
             *     url: "..."
             *   }
             * ]
             */

            const productImage =
              item?.images?.[0]?.url ||
              (typeof item?.images?.[0] === "string" ? item.images[0] : null) ||
              item?.image ||
              "";

            return (
              <article
                key={productId}
                className="group overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* =================================================
                    PRODUCT IMAGE
                ================================================= */}

                <div className="relative aspect-square overflow-hidden bg-surface-container">
                  <button
                    type="button"
                    onClick={() => navigate(`/products/${productId}`)}
                    className="h-full w-full"
                  >
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={item?.name || "Product"}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-text-secondary">
                        No image available
                      </div>
                    )}
                  </button>

                  {/* Remove wishlist */}

                  <IconButton
                    label={`Remove ${item?.name || "product"} from wishlist`}
                    size="medium"
                    variant="standard"
                    onClick={() => handleRemoveFromWishlist(productId)}
                    disabled={wishlistActionLoading}
                    className="absolute right-3 top-3 bg-surface/90 backdrop-blur"
                  >
                    <Heart
                      size={18}
                      fill="currentColor"
                      className="text-primary"
                    />
                  </IconButton>

                  {/* Out of stock */}

                  {isOutOfStock && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-error px-3 py-1 text-xs font-semibold text-white">
                      Out of stock
                    </span>
                  )}
                </div>

                {/* =================================================
                    PRODUCT CONTENT
                ================================================= */}

                <div className="p-5">
                  {/* Category */}

                  {item?.categoryLabel && (
                    <p className="text-xs font-medium text-primary">
                      {item.categoryLabel}
                    </p>
                  )}

                  {/* Product name */}

                  <button
                    type="button"
                    onClick={() => navigate(`/products/${productId}`)}
                    className="mt-1 block text-left"
                  >
                    <h2 className="line-clamp-2 text-base font-semibold text-text transition hover:text-primary">
                      {item?.name}
                    </h2>
                  </button>

                  {/* Rating */}

                  {item?.rating !== undefined && item?.rating !== null && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-text">
                        ★ {item.rating}
                      </span>

                      {item?.reviewCount !== undefined &&
                        item?.reviewCount !== null && (
                          <span className="text-xs text-text-secondary">
                            ({item.reviewCount})
                          </span>
                        )}
                    </div>
                  )}

                  {/* Price */}

                  <div className="mt-3">
                    <span className="text-lg font-bold text-text">
                      {formatCurrency(item?.price)}
                    </span>

                    {item?.oldPrice && (
                      <span className="ml-2 text-xs text-text-secondary line-through">
                        {formatCurrency(item.oldPrice)}
                      </span>
                    )}
                  </div>

                  {/* =================================================
                      ADD TO CART
                  ================================================= */}

                  <Button
                    size="medium"
                    className="mt-4 w-full"
                    disabled={isOutOfStock || cartActionLoading}
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart size={17} />

                    {isOutOfStock
                      ? "Out of Stock"
                      : cartActionLoading
                        ? "Adding..."
                        : "Add to Cart"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {/* =================================================
            BACK TO PRODUCTS
        ================================================= */}

        <div className="mt-8">
          <Button variant="outlined" onClick={() => navigate("/products")}>
            <ArrowLeft size={17} />
            Continue Shopping
          </Button>
        </div>
      </div>
    </main>
  );
}

export default Wishlist;
