import { ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { topSellingProducts } from "../../data/adminDashboard";

function TopProducts() {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/admin/products");
  };

  const handleProductClick = (product) => {
    /*
     * We use the product name as the current temporary identifier.
     *
     * Later, when your backend/API is connected, replace this
     * with the real product ID.
     */
    const productKey = encodeURIComponent(
      product.name.toLowerCase().replace(/\s+/g, "-"),
    );

    navigate(`/admin/products/${productKey}`);
  };

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-text sm:text-lg">
          Top Selling Products
        </h3>

        <button
          type="button"
          onClick={handleViewAll}
          className="
            inline-flex
            shrink-0
            items-center
            gap-1
            text-xs
            font-semibold
            text-primary
            transition
            hover:underline
          "
        >
          View all
          <ArrowRight size={14} />
        </button>
      </div>

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <div className="mt-4 space-y-1">
        {topSellingProducts.map((product) => (
          <TopProductItem
            key={product.rank}
            product={product}
            onClick={() => handleProductClick(product)}
          />
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   PRODUCT ITEM
========================================================= */

function TopProductItem({ product, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        p-2
        text-left
        transition
        hover:bg-surface-container
      "
    >
      {/* Rank */}

      <span className="w-4 shrink-0 text-center text-xs font-semibold text-text-secondary">
        {product.rank}
      </span>

      {/* Image */}

      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-container">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Product details */}

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-text">{product.name}</p>

        <p className="mt-0.5 text-[11px] text-text-secondary">
          {product.sold} Sold
        </p>
      </div>

      {/* Revenue */}

      <div className="flex shrink-0 items-center gap-2">
        <p className="text-xs font-semibold text-text">
          {formatCurrency(product.revenue)}
        </p>

        <ExternalLink
          size={13}
          className="
            text-text-secondary
            opacity-0
            transition
            group-hover:opacity-100
            group-hover:text-primary
          "
        />
      </div>
    </button>
  );
}

/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(value) {
  if (typeof value !== "number") {
    return value;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default TopProducts;
