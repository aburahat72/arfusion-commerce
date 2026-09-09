import {
  GitCompareArrows,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { addProductToCart } from "../../store/slices/cartSlice";
import { startBuyNow } from "../../store/slices/checkoutSlice";

import {
  addProductToWishlist,
  removeProductFromWishlist,
} from "../../store/slices/wishlistSlice";

import { toggleCompare } from "../../store/slices/compareSlice";

import Button from "../ui/Button";
import IconButton from "../ui/IconButton";

function ProductActions({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  /* =====================================================
     REAL PRODUCT ID
  ===================================================== */

  const productId = product?._id || product?.id;

  /* =====================================================
     REAL PRODUCT IMAGE
  ===================================================== */

  /*
   * MongoDB product:
   *
   * images: [
   *   {
   *     url,
   *     publicId
   *   }
   * ]
   *
   * Also support older/static product formats.
   */

  const productImage =
    product?.images?.[0]?.url ||
    (typeof product?.images?.[0] === "string" ? product.images[0] : null) ||
    product?.image ||
    "";

  /* =====================================================
     STOCK
  ===================================================== */

  const stock = Number(product?.stock ?? 0);

  const isOutOfStock = stock <= 0;

  /* =====================================================
     CATEGORY
  ===================================================== */

  const categoryName =
    typeof product?.category === "object"
      ? product.category?.name
      : product?.categoryLabel || product?.category || "";

  /* =====================================================
     WISHLIST STATE
  ===================================================== */

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const wishlistActionLoading = useSelector(
    (state) => state.wishlist?.actionLoading ?? false,
  );

  const wishlistError = useSelector((state) => state.wishlist?.error ?? null);

  const isWishlisted = wishlistItems.some(
    (item) => String(item?.id || item?._id) === String(productId),
  );

  /* =====================================================
     COMPARE STATE
  ===================================================== */

  const compareItems = useSelector((state) => state.compare?.items || []);

  const isCompared = compareItems.some(
    (item) => String(item?.id || item?._id) === String(productId),
  );

  const compareLimitReached = compareItems.length >= 4 && !isCompared;

  /* =====================================================
     CART STATE
  ===================================================== */

  const cartActionLoading = useSelector(
    (state) => state.cart?.actionLoading ?? false,
  );

  /* =====================================================
     QUANTITY
  ===================================================== */

  const increaseQuantity = () => {
    if (quantity < stock) {
      setQuantity((current) => current + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((current) => (current > 1 ? current - 1 : 1));
  };

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = async () => {
    if (!productId || isOutOfStock) {
      return;
    }

    if (cartActionLoading) {
      return;
    }

    try {
      await dispatch(
        addProductToCart({
          productId,
          quantity,
        }),
      ).unwrap();

      console.log(`Added "${product?.name}" to cart successfully.`);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  /* =====================================================
     BUY NOW
  ===================================================== */

  const handleBuyNow = () => {
    if (!productId || isOutOfStock) {
      return;
    }

    dispatch(
      startBuyNow({
        id: productId,
        _id: productId,
        name: product?.name,
        price: product?.price,
        image: productImage,
        images: product?.images || [],
        quantity,
        stock,
        category: categoryName,
      }),
    );

    navigate("/checkout");
  };

  /* =====================================================
     WISHLIST PRODUCT OBJECT

     This is only used to keep the complete product
     available in Redux after the backend succeeds.

     The backend remains the source of truth.
  ===================================================== */

  const wishlistProduct = {
    id: productId,
    _id: productId,
    name: product?.name,
    price: product?.price,
    image: productImage,
    images: product?.images || [],
    category: categoryName,
    categoryLabel: categoryName,
    rating: product?.rating,
    reviewCount: product?.reviewCount,
    stock,
    brand: product?.brand,
    oldPrice: product?.oldPrice,
    discount: product?.discount,
    sku: product?.sku,
    description: product?.description,
  };

  /* =====================================================
     WISHLIST

     ADD:
     POST /api/wishlist

     REMOVE:
     DELETE /api/wishlist/:productId
  ===================================================== */

  const handleWishlist = async () => {
    if (!productId || wishlistLoading) {
      return;
    }

    if (wishlistActionLoading) {
      return;
    }

    setWishlistLoading(true);

    try {
      /* =================================================
         REMOVE
      ================================================= */

      if (isWishlisted) {
        await dispatch(removeProductFromWishlist(productId)).unwrap();

        console.log("Product removed from wishlist successfully.");

        return;
      }

      /* =================================================
         ADD
      ================================================= */

      await dispatch(
        addProductToWishlist({
          productId,
          product: wishlistProduct,
        }),
      ).unwrap();

      console.log("Product added to wishlist successfully.");
    } catch (error) {
      console.error("Wishlist operation failed:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  /* =====================================================
     COMPARE
  ===================================================== */

  const handleCompare = () => {
    if (!productId || compareLimitReached) {
      return;
    }

    dispatch(
      toggleCompare({
        id: productId,
        _id: productId,
        name: product?.name,
        price: product?.price,
        image: productImage,
        images: product?.images || [],
        category: categoryName,
        categoryLabel: categoryName,
        rating: product?.rating,
        reviewCount: product?.reviewCount,
        stock,
        brand: product?.brand,
        oldPrice: product?.oldPrice,
        discount: product?.discount,
        description: product?.description,
        sku: product?.sku,
      }),
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-4 border-t border-outline-variant pt-6">
      {/* =================================================
          QUANTITY
      ================================================= */}

      <div>
        <p className="mb-2 text-sm font-semibold text-text">Quantity</p>

        <div className="flex w-fit items-center overflow-hidden rounded-xl border border-outline-variant bg-surface">
          {/* Decrease */}

          <IconButton
            label="Decrease quantity"
            variant="standard"
            size="small"
            onClick={decreaseQuantity}
            disabled={isOutOfStock || quantity <= 1}
          >
            <Minus size={17} />
          </IconButton>

          {/* Quantity */}

          <span className="flex h-10 min-w-12 items-center justify-center px-3 text-sm font-semibold text-text">
            {quantity}
          </span>

          {/* Increase */}

          <IconButton
            label="Increase quantity"
            variant="standard"
            size="small"
            onClick={increaseQuantity}
            disabled={isOutOfStock || quantity >= stock}
          >
            <Plus size={17} />
          </IconButton>
        </div>

        {!isOutOfStock && stock <= 10 && (
          <p className="mt-2 text-xs font-medium text-warning">
            Only {stock} left in stock
          </p>
        )}
      </div>

      {/* =================================================
          PRIMARY ACTIONS
      ================================================= */}

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Add to Cart */}

        <Button
          size="large"
          disabled={isOutOfStock || cartActionLoading}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={18} />

          {cartActionLoading ? "Adding..." : "Add to Cart"}
        </Button>

        {/* Buy Now */}

        <Button
          size="large"
          variant="tonal"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
        >
          <Zap size={18} />
          Buy Now
        </Button>
      </div>

      {/* =================================================
          SECONDARY ACTIONS
      ===================================================== */}

      <div className="grid grid-cols-2 gap-3">
        {/* Wishlist */}

        <Button
          size="medium"
          variant={isWishlisted ? "tonal" : "outlined"}
          onClick={handleWishlist}
          disabled={!productId || wishlistLoading || wishlistActionLoading}
          aria-pressed={isWishlisted}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />

          {wishlistLoading || wishlistActionLoading
            ? "Updating..."
            : isWishlisted
              ? "Wishlisted"
              : "Wishlist"}
        </Button>

        {/* Compare */}

        <Button
          size="medium"
          variant={isCompared ? "tonal" : "outlined"}
          onClick={handleCompare}
          disabled={compareLimitReached}
          aria-pressed={isCompared}
          title={
            compareLimitReached ? "You can compare up to 4 products" : undefined
          }
        >
          <GitCompareArrows size={18} />

          {isCompared
            ? "Compared"
            : compareLimitReached
              ? "Limit Reached"
              : "Compare"}
        </Button>
      </div>

      {/* =================================================
          WISHLIST ERROR
      ===================================================== */}

      {wishlistError && (
        <p className="text-xs font-medium text-error">{wishlistError}</p>
      )}

      {/* =================================================
          DELIVERY INFORMATION
      ===================================================== */}

      <div className="rounded-2xl bg-surface-container p-4">
        <div className="space-y-2 text-sm">
          <p className="font-medium text-text">Free delivery</p>

          <p className="text-text-secondary">
            Estimated delivery within 3–7 business days.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductActions;
