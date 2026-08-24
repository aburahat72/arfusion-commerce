import { AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { lowStockProducts } from "../../data/adminDashboard";

function LowStockProducts() {
  const navigate = useNavigate();

  /* =====================================================
     VIEW ALL INVENTORY
  ===================================================== */

  const handleViewAll = () => {
    navigate("/admin/inventory");
  };

  /* =====================================================
     OPEN PRODUCT INVENTORY
  ===================================================== */

  const handleProductClick = (product) => {
    /*
     * Temporary identifier based on the current demo data.
     *
     * Replace this with product.id / product._id when
     * your real product API is connected.
     */
    const productKey = encodeURIComponent(
      product.sku || product.name.toLowerCase().trim().replace(/\s+/g, "-"),
    );

    navigate(`/admin/inventory/${productKey}`);
  };

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error">
            <AlertTriangle size={16} />
          </div>

          <h3 className="truncate text-base font-semibold text-text sm:text-lg">
            Low Stock Products
          </h3>
        </div>

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
          PRODUCT LIST
      ================================================= */}

      <div className="mt-4 space-y-1">
        {lowStockProducts.map((product) => (
          <LowStockItem
            key={product.sku}
            product={product}
            onClick={() => handleProductClick(product)}
          />
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   LOW STOCK ITEM
========================================================= */

function LowStockItem({ product, onClick }) {
  const stockLevel =
    product.stock <= 3 ? "critical" : product.stock <= 5 ? "low" : "warning";

  const stockConfig = {
    critical: {
      label: "Critical",
      className: "bg-error/10 text-error",
    },

    low: {
      label: "Low",
      className: "bg-warning/10 text-warning",
    },

    warning: {
      label: "Low",
      className: "bg-orange-50 text-orange-600",
    },
  };

  const config = stockConfig[stockLevel];

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
      {/* Product image */}

      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-container">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Product information */}

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-text">{product.name}</p>

        <p className="mt-0.5 text-[11px] text-text-secondary">
          SKU: {product.sku}
        </p>
      </div>

      {/* Stock */}

      <div className="flex shrink-0 items-center gap-2">
        <div className="text-right">
          <p className="text-xs font-semibold text-error">
            Stock: {product.stock}
          </p>

          <span
            className={`
              mt-1
              inline-flex
              rounded-full
              px-2
              py-0.5
              text-[9px]
              font-semibold
              ${config.className}
            `}
          >
            {config.label}
          </span>
        </div>

        <ExternalLink
          size={13}
          className="
            text-text-secondary
            opacity-0
            transition
            group-hover:text-primary
            group-hover:opacity-100
          "
        />
      </div>
    </button>
  );
}

export default LowStockProducts;
