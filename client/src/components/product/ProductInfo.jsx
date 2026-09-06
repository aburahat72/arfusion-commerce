import { Star, CheckCircle2 } from "lucide-react";

import { formatCurrency } from "../../utils/currency";

function ProductInfo({ product }) {
  /*
   * =====================================================
   * REAL API PRODUCT DATA
   * =====================================================
   *
   * MongoDB product:
   *
   * category: {
   *   _id,
   *   name,
   *   slug,
   *   image,
   *   isActive
   * }
   *
   * Keep compatibility with old/static product data too.
   */

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.categoryLabel || product.category;

  /*
   * =====================================================
   * RATING
   * =====================================================
   *
   * Current Product model may not contain rating/reviews.
   * Keep the existing design and safely fall back to 0.
   */

  const rating = Number(product.rating ?? 0);

  const reviewCount = product.reviewCount;

  const soldCount = product.soldCount ?? 0;

  /*
   * =====================================================
   * STOCK
   * =====================================================
   */

  const stock = Number(product.stock ?? 0);

  const isInStock = stock > 0;

  /*
   * =====================================================
   * PRICE
   * =====================================================
   */

  const price = Number(product.price ?? 0);

  /*
   * =====================================================
   * OLD PRICE / DISCOUNT
   * =====================================================
   *
   * Your current backend product controller uses:
   *
   * price
   *
   * It may not currently have oldPrice/discount.
   *
   * Keep support for them if they are added to the model.
   */

  const oldPrice =
    product.oldPrice !== undefined && product.oldPrice !== null
      ? Number(product.oldPrice)
      : null;

  const discount =
    product.discount !== undefined && product.discount !== null
      ? product.discount
      : null;

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div className="space-y-6">
      {/* Category */}
      <p className="text-sm font-medium text-primary">
        {categoryName || "Uncategorized"}
      </p>

      {/* Product name */}
      <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Star size={18} className="fill-amber-400 text-amber-400" />

          <span className="text-sm font-semibold text-text">
            {rating.toFixed(1)}
          </span>
        </div>

        {reviewCount !== undefined && reviewCount !== null && (
          <span className="text-sm text-text-secondary">
            {reviewCount} reviews
          </span>
        )}

        <span className="h-1 w-1 rounded-full bg-outline-variant" />

        <span className="text-sm text-text-secondary">{soldCount} sold</span>
      </div>

      {/* Price */}
      <div className="flex flex-wrap items-end gap-3 border-y border-outline-variant py-5">
        <span className="text-3xl font-bold text-text">
          {formatCurrency(price)}
        </span>

        {oldPrice !== null && oldPrice > price && (
          <span className="pb-1 text-base text-text-secondary line-through">
            {formatCurrency(oldPrice)}
          </span>
        )}

        {discount && (
          <span className="rounded-lg bg-primary-container px-2.5 py-1 text-xs font-semibold text-primary">
            {discount} OFF
          </span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div>
          <h2 className="text-sm font-semibold text-text">Description</h2>

          <p className="mt-2 text-sm leading-7 text-text-secondary">
            {product.description}
          </p>
        </div>
      )}

      {/* Stock */}
      <div className="flex items-center gap-2">
        <CheckCircle2
          size={18}
          className={isInStock ? "text-success" : "text-error"}
        />

        <span
          className={
            isInStock
              ? "text-sm font-medium text-success"
              : "text-sm font-medium text-error"
          }
        >
          {isInStock ? `${stock} in stock` : "Out of stock"}
        </span>
      </div>

      {/* Basic product information */}
      {(product.brand || product.sku) && (
        <div className="grid gap-3 rounded-2xl bg-surface-container p-4 sm:grid-cols-2">
          {product.brand && (
            <div>
              <p className="text-xs text-text-secondary">Brand</p>

              <p className="mt-1 text-sm font-medium text-text">
                {product.brand}
              </p>
            </div>
          )}

          {product.sku && (
            <div>
              <p className="text-xs text-text-secondary">SKU</p>

              <p className="mt-1 text-sm font-medium text-text">
                {product.sku}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductInfo;
