import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";

import {
  removeFromWishlist,
  clearWishlist,
} from "../../store/slices/wishlistSlice";

import { addToCart } from "../../store/slices/cartSlice";

import { formatCurrency } from "../../utils/currency";

function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const wishlistItems = useSelector((state) => state.wishlist.items);

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = (item) => {
    if (Number(item.stock) <= 0) {
      return;
    }

    dispatch(
      addToCart({
        id: item.id || item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
      }),
    );
  };

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
            onClick={() => dispatch(clearWishlist())}
          >
            <Trash2 size={16} />
            Clear wishlist
          </Button>
        </div>

        {/* =================================================
            WISHLIST GRID
        ================================================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => {
            const productId = item.id || item._id;
            const isOutOfStock = Number(item.stock) <= 0;

            return (
              <article
                key={productId}
                className="group overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Product image */}
                <div className="relative aspect-square overflow-hidden bg-surface-container">
                  <button
                    type="button"
                    onClick={() => navigate(`/products/${productId}`)}
                    className="h-full w-full"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </button>

                  {/* Remove wishlist */}
                  <IconButton
                    label={`Remove ${item.name} from wishlist`}
                    size="medium"
                    variant="standard"
                    onClick={() => dispatch(removeFromWishlist(productId))}
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

                {/* Product content */}
                <div className="p-5">
                  {/* Category */}
                  {item.categoryLabel && (
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
                      {item.name}
                    </h2>
                  </button>

                  {/* Rating */}
                  {item.rating && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-text">
                        ★ {item.rating}
                      </span>

                      {item.reviewCount && (
                        <span className="text-xs text-text-secondary">
                          ({item.reviewCount})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="mt-3">
                    <span className="text-lg font-bold text-text">
                      {formatCurrency(item.price)}
                    </span>
                  </div>

                  {/* Add to cart */}
                  <Button
                    size="medium"
                    className="mt-4 w-full"
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart size={17} />

                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
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
