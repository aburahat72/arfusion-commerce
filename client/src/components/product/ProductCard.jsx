import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { addProductToCart } from "../../store/slices/cartSlice";

import {
  addProductToWishlist,
  removeProductFromWishlist,
} from "../../store/slices/wishlistSlice";

import { formatCurrency } from "../../utils/currency";

import IconButton from "../ui/IconButton";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [wishlistLoading, setWishlistLoading] = useState(false);

  /* =====================================================
     REAL PRODUCT ID
  ===================================================== */

  const productId = product?._id || product?.id;

  /* =====================================================
     REAL PRODUCT IMAGE

     MongoDB product:

     images: [
       {
         url,
         publicId
       }
     ]
  ===================================================== */

  const productImage =
    product?.images?.[0]?.url ||
    (typeof product?.images?.[0] === "string" ? product.images[0] : null) ||
    product?.image ||
    "";

  /* =====================================================
     REAL CATEGORY

     Backend may return:

     category: {
       _id,
       name,
       slug,
       image,
       isActive
     }

     OR:

     categoryLabel / category
  ===================================================== */

  const categoryName =
    typeof product?.category === "object"
      ? product.category?.name
      : product?.categoryLabel || product?.category || "";

  /* =====================================================
     CART ACTION STATE
  ===================================================== */

  const cartActionLoading = useSelector(
    (state) => state.cart?.actionLoading ?? false,
  );

  /* =====================================================
     WISHLIST STATE
  ===================================================== */

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const isWishlisted = wishlistItems.some(
    (item) => String(item?.id || item?._id) === String(productId),
  );

  /* =====================================================
     STOCK
  ===================================================== */

  const stock = Number(product?.stock ?? 0);

  const isOutOfStock = stock <= 0;

  /* =====================================================
     OPEN PRODUCT
  ===================================================== */

  const openProduct = () => {
    if (!productId) {
      return;
    }

    navigate(`/products/${productId}`);
  };

  /* =====================================================
     WISHLIST PRODUCT OBJECT

     Keep the complete product information locally in
     Redux after the backend operation succeeds.

     Backend remains the source of truth.
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
     ADD TO CART
  ===================================================== */

  const handleAddToCart = async (event) => {
    event.stopPropagation();

    if (!productId) {
      console.error("Cannot add product to cart: product ID is missing.");

      return;
    }

    if (isOutOfStock) {
      return;
    }

    if (cartActionLoading) {
      return;
    }

    try {
      /*
       * Backend cart API:
       *
       * POST /api/cart
       *
       * {
       *   productId,
       *   quantity
       * }
       */

      await dispatch(
        addProductToCart({
          productId,
          quantity: 1,
        }),
      ).unwrap();

      console.log(`Added "${product?.name}" to cart successfully.`);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  /* =====================================================
     WISHLIST
  ===================================================== */

  const handleWishlist = async (event) => {
    event.stopPropagation();

    if (!productId) {
      console.error("Cannot update wishlist: product ID is missing.");

      return;
    }

    if (wishlistLoading) {
      return;
    }

    setWishlistLoading(true);

    try {
      /* =================================================
         REMOVE
      ================================================= */

      if (isWishlisted) {
        await dispatch(removeProductFromWishlist(productId)).unwrap();

        console.log(`Removed "${product?.name}" from wishlist successfully.`);

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

      console.log(`Added "${product?.name}" to wishlist successfully.`);
    } catch (error) {
      console.error("Wishlist operation failed:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <article className="group overflow-hidden rounded-2xl border border-outline-variant bg-surface transition duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg">
      {/* =================================================
          PRODUCT IMAGE
      ================================================= */}

      <div
        role="link"
        tabIndex={0}
        onClick={openProduct}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            openProduct();
          }
        }}
        className="relative aspect-square cursor-pointer overflow-hidden bg-surface-container"
      >
        {/* =================================================
            DISCOUNT
        ================================================= */}

        {product?.discount && (
          <span className="absolute left-3 top-3 z-10 rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white shadow-sm">
            {product.discount}
          </span>
        )}

        {/* =================================================
            WISHLIST
        ================================================= */}

        <div className="absolute right-3 top-3 z-20">
          <IconButton
            label={
              wishlistLoading
                ? "Updating wishlist"
                : isWishlisted
                  ? `Remove ${product?.name} from wishlist`
                  : `Add ${product?.name} to wishlist`
            }
            size="small"
            variant={isWishlisted ? "filled" : "standard"}
            onClick={handleWishlist}
            disabled={wishlistLoading || !productId}
            aria-pressed={isWishlisted}
          >
            <Heart size={17} fill={isWishlisted ? "currentColor" : "none"} />
          </IconButton>
        </div>

        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}

        {productImage ? (
          <img
            src={productImage}
            alt={product?.name || "Product"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-text-secondary">
            No image available
          </div>
        )}
      </div>

      {/* =================================================
          PRODUCT INFORMATION
      ================================================= */}

      <div className="p-4">
        {/* =================================================
            PRODUCT NAME / CATEGORY
        ================================================= */}

        <button type="button" onClick={openProduct} className="text-left">
          {/* Category */}

          {categoryName && (
            <p className="text-xs font-medium capitalize text-text-secondary">
              {categoryName}
            </p>
          )}

          {/* Name */}

          <h3 className="mt-1 min-h-10 text-sm font-semibold text-text">
            {product?.name}
          </h3>
        </button>

        {/* =================================================
            RATING
        ================================================= */}

        <div className="mt-2 flex items-center gap-1 text-xs">
          <Star size={14} className="fill-amber-400 text-amber-400" />

          <span className="font-medium text-text">{product?.rating ?? 0}</span>

          {product?.reviewCount !== undefined &&
            product?.reviewCount !== null && (
              <span className="text-text-secondary">
                ({product.reviewCount})
              </span>
            )}
        </div>

        {/* =================================================
            PRICE + CART
        ================================================= */}

        <div className="mt-3 flex items-end justify-between gap-2">
          {/* Price */}

          <div>
            <p className="text-base font-semibold text-text">
              {formatCurrency(product?.price)}
            </p>

            {product?.oldPrice && (
              <p className="text-xs text-text-secondary line-through">
                {formatCurrency(product.oldPrice)}
              </p>
            )}
          </div>

          {/* Add To Cart */}

          <IconButton
            label={
              isOutOfStock
                ? `${product?.name} is out of stock`
                : `Add ${product?.name} to cart`
            }
            variant="filled"
            size="small"
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartActionLoading || !productId}
          >
            <ShoppingCart size={17} />
          </IconButton>
        </div>

        {/* =================================================
            STOCK STATUS
        ================================================= */}

        {isOutOfStock ? (
          <p className="mt-2 text-xs font-medium text-error">Out of stock</p>
        ) : stock <= 10 ? (
          <p className="mt-2 text-xs font-medium text-warning">
            Only {stock} left in stock
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default ProductCard;
