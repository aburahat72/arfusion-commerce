import { Star, CheckCircle2 } from "lucide-react";

import { formatCurrency } from "../../utils/currency";

function ProductInfo({ product }) {
  return (
    <div className="space-y-6">
      {/* Category */}
      <p className="text-sm font-medium text-primary">{product.category}</p>

      {/* Product name */}
      <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Star size={18} className="fill-amber-400 text-amber-400" />

          <span className="text-sm font-semibold text-text">
            {product.rating}
          </span>
        </div>

        {product.reviewCount !== undefined && (
          <span className="text-sm text-text-secondary">
            {product.reviewCount} reviews
          </span>
        )}

        <span className="h-1 w-1 rounded-full bg-outline-variant" />

        <span className="text-sm text-text-secondary">
          {product.soldCount ?? 0} sold
        </span>
      </div>

      {/* Price */}
      <div className="flex flex-wrap items-end gap-3 border-y border-outline-variant py-5">
        <span className="text-3xl font-bold text-text">
          {formatCurrency(product.price)}
        </span>

        {product.oldPrice && (
          <span className="pb-1 text-base text-text-secondary line-through">
            {formatCurrency(product.oldPrice)}
          </span>
        )}

        {product.discount && (
          <span className="rounded-lg bg-primary-container px-2.5 py-1 text-xs font-semibold text-primary">
            {product.discount} OFF
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
        <CheckCircle2 size={18} className="text-success" />

        <span className="text-sm font-medium text-success">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
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
