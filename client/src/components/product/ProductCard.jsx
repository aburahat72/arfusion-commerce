import { Heart, ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { addToCart } from "../../store/slices/cartSlice";
import { formatCurrency } from "../../utils/currency";

import IconButton from "../ui/IconButton";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* =====================================================
     REAL PRODUCT ID
  ===================================================== */

  const productId = product._id || product.id;

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
    product.images?.[0]?.url ||
    (typeof product.images?.[0] === "string" ? product.images[0] : null) ||
    product.image ||
    "";

  /* =====================================================
     REAL CATEGORY

     Backend returns populated category object:

     category: {
       _id,
       name,
       slug,
       image,
       isActive
     }
  ===================================================== */

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.categoryLabel || product.category || "";

  /* =====================================================
     OPEN PRODUCT
  ===================================================== */

  const openProduct = () => {
    navigate(`/products/${productId}`);
  };

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = (event) => {
    event.stopPropagation();

    dispatch(
      addToCart({
        id: productId,
        name: product.name,
        price: product.price,
        image: productImage,
        quantity: 1,
      }),
    );
  };

  /* =====================================================
     WISHLIST
  ===================================================== */

  const handleWishlist = (event) => {
    event.stopPropagation();

    // Wishlist functionality will be added later.
    console.log("Wishlist:", product.name);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <article className="group overflow-hidden rounded-2xl border border-outline-variant bg-surface transition duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg">
      {/* Product Image */}
      <div
        role="link"
        tabIndex={0}
        onClick={openProduct}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            openProduct();
          }
        }}
        className="relative aspect-square cursor-pointer overflow-hidden bg-surface-container"
      >
        {product.discount && (
          <span className="absolute left-3 top-3 z-10 rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white shadow-sm">
            {product.discount}
          </span>
        )}

        <div className="absolute right-3 top-3 z-20">
          <IconButton
            label={`Add ${product.name} to wishlist`}
            size="small"
            onClick={handleWishlist}
          >
            <Heart size={17} />
          </IconButton>
        </div>

        <img
          src={productImage}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Information */}
      <div className="p-4">
        <button type="button" onClick={openProduct} className="text-left">
          <p className="text-xs font-medium capitalize text-text-secondary">
            {categoryName}
          </p>

          <h3 className="mt-1 min-h-10 text-sm font-semibold text-text">
            {product.name}
          </h3>
        </button>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1 text-xs">
          <Star size={14} className="fill-amber-400 text-amber-400" />

          <span className="font-medium text-text">{product.rating ?? 0}</span>

          {product.reviewCount !== undefined && (
            <span className="text-text-secondary">({product.reviewCount})</span>
          )}
        </div>

        {/* Price + Cart */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-text">
              {formatCurrency(product.price)}
            </p>

            {product.oldPrice && (
              <p className="text-xs text-text-secondary line-through">
                {formatCurrency(product.oldPrice)}
              </p>
            )}
          </div>

          <IconButton
            label={`Add ${product.name} to cart`}
            variant="filled"
            size="small"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={17} />
          </IconButton>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
