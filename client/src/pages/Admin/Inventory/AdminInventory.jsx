import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Package,
  Search,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import products from "../../../data/products";

function AdminInventory() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All");

  const stockOptions = ["All", "In Stock", "Low Stock", "Out of Stock"];

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const stock = Number(product.stock || 0);

      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query);

      let matchesStock = true;

      if (stockFilter === "In Stock") {
        matchesStock = stock > 10;
      }

      if (stockFilter === "Low Stock") {
        matchesStock = stock > 0 && stock <= 10;
      }

      if (stockFilter === "Out of Stock") {
        matchesStock = stock <= 0;
      }

      return matchesSearch && matchesStock;
    });
  }, [search, stockFilter]);

  /* =====================================================
     INVENTORY SUMMARY
  ===================================================== */

  const inventoryStats = useMemo(() => {
    const total = products.length;

    const inStock = products.filter(
      (product) => Number(product.stock || 0) > 10,
    ).length;

    const lowStock = products.filter((product) => {
      const stock = Number(product.stock || 0);

      return stock > 0 && stock <= 10;
    }).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock || 0) <= 0,
    ).length;

    const units = products.reduce(
      (totalUnits, product) => totalUnits + Number(product.stock || 0),
      0,
    );

    return {
      total,
      inStock,
      lowStock,
      outOfStock,
      units,
    };
  }, []);

  /* =====================================================
     UPDATE STOCK
  ===================================================== */

  const handleEditStock = (product) => {
    const productId = product.id || product._id;

    if (!productId) {
      return;
    }

    navigate(`/admin/products/${productId}/edit`);
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <p className="text-sm text-text-secondary">Catalog</p>

          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                Inventory
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Monitor stock levels and identify products that need attention.
              </p>
            </div>

            <div className="text-sm text-text-secondary">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </div>
          </div>
        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section
          aria-label="Inventory summary"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <InventoryStat
            title="Total Products"
            value={inventoryStats.total}
            icon={<Package size={20} />}
            iconClass="bg-primary-container text-primary"
          />

          <InventoryStat
            title="Healthy Stock"
            value={inventoryStats.inStock}
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-success/10 text-success"
          />

          <InventoryStat
            title="Low Stock"
            value={inventoryStats.lowStock}
            icon={<AlertTriangle size={20} />}
            iconClass="bg-warning/10 text-warning"
          />

          <InventoryStat
            title="Out of Stock"
            value={inventoryStats.outOfStock}
            icon={<XCircle size={20} />}
            iconClass="bg-error/10 text-error"
          />
        </section>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}

            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-text-secondary
                "
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product, brand or SKU..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-outline-variant
                  bg-surface
                  pl-10
                  pr-4
                  text-sm
                  text-text
                  outline-none
                  transition
                  placeholder:text-text-secondary
                  hover:border-outline
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/15
                "
              />
            </div>

            {/* Stock filter */}

            <div className="relative">
              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                aria-label="Filter stock"
                className="
                  h-11
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-outline-variant
                  bg-surface
                  py-2
                  pl-3
                  pr-9
                  text-sm
                  text-text
                  outline-none
                  transition
                  hover:border-outline
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/15
                  sm:w-48
                "
              >
                {stockOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
            </div>
          </div>
        </section>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <section className="mt-6 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/60">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    SKU
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold text-text-secondary">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <InventoryRow
                    key={product.id || product._id}
                    product={product}
                    onEdit={handleEditStock}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && <EmptyInventory />}
        </section>

        {/* =================================================
            MOBILE
        ================================================= */}

        <section className="mt-6 space-y-3 md:hidden">
          {filteredProducts.map((product) => (
            <InventoryMobileCard
              key={product.id || product._id}
              product={product}
              onEdit={handleEditStock}
            />
          ))}

          {filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-outline-variant bg-surface p-8">
              <EmptyInventory />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   INVENTORY STAT
========================================================= */

function InventoryStat({ title, value, icon, iconClass }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs text-text-secondary">{title}</p>

          <p className="mt-1 text-2xl font-semibold text-text">
            {value.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   DESKTOP ROW
========================================================= */

function InventoryRow({ product, onEdit }) {
  const stock = Number(product.stock || 0);

  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <ProductImage product={product} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {product.name}
            </p>

            <p className="mt-0.5 text-xs text-text-secondary">
              {product.brand || "No brand"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-text-secondary">
        {product.sku || "—"}
      </td>

      <td className="px-5 py-4 text-sm text-text-secondary">
        {product.categoryLabel || product.category || "—"}
      </td>

      <td className="px-5 py-4">
        <span
          className={`
            text-sm
            font-semibold
            ${
              stock <= 0
                ? "text-error"
                : stock <= 10
                  ? "text-warning"
                  : "text-text"
            }
          `}
        >
          {stock}
        </span>
      </td>

      <td className="px-5 py-4">
        <StockStatus stock={stock} />
      </td>

      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="
            inline-flex
            h-9
            items-center
            gap-2
            rounded-lg
            border
            border-outline-variant
            px-3
            text-xs
            font-semibold
            text-text
            transition
            hover:bg-surface-container
            hover:text-primary
          "
        >
          <Edit3 size={15} />
          Update Stock
        </button>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function InventoryMobileCard({ product, onEdit }) {
  const stock = Number(product.stock || 0);

  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <ProductImage product={product} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">
                {product.name}
              </p>

              <p className="mt-1 text-xs text-text-secondary">
                SKU: {product.sku || "—"}
              </p>
            </div>

            <StockStatus stock={stock} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoItem label="Stock" value={stock} />

            <InfoItem
              label="Category"
              value={product.categoryLabel || product.category || "—"}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEdit(product)}
        className="
          mt-4
          flex
          h-10
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-primary
          text-xs
          font-semibold
          text-white
          transition
          hover:opacity-90
        "
      >
        <Edit3 size={15} />
        Update Stock
      </button>
    </article>
  );
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({ product }) {
  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-container">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-text-secondary">
          <Package size={19} />
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STOCK STATUS
========================================================= */

function StockStatus({ stock }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-1.5 text-[10px] font-semibold text-error">
        <XCircle size={12} />
        Out of Stock
      </span>
    );
  }

  if (stock <= 10) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1.5 text-[10px] font-semibold text-warning">
        <AlertTriangle size={12} />
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1.5 text-[10px] font-semibold text-success">
      <CheckCircle2 size={12} />
      In Stock
    </span>
  );
}

/* =========================================================
   INFO
========================================================= */

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-surface-container p-3">
      <p className="text-[10px] text-text-secondary">{label}</p>

      <p className="mt-1 truncate text-xs font-semibold text-text">{value}</p>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyInventory() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
        <Package size={21} className="text-text-secondary" />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-text">
        No inventory items found
      </h2>

      <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
        Try changing your search or stock filter.
      </p>
    </div>
  );
}

export default AdminInventory;
