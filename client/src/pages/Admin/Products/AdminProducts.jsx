import {
  CheckCircle2,
  ChevronDown,
  Edit3,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import products from "../../../data/products";

function AdminProducts() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.categoryLabel || product.category)
          .filter(Boolean),
      ),
    ];

    return ["All", ...uniqueCategories];
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const productCategory = product.categoryLabel || product.category || "";

      const stock = Number(product.stock || 0);

      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" ||
        productCategory.toLowerCase() === category.toLowerCase();

      let matchesStock = true;

      if (stockFilter === "In Stock") {
        matchesStock = stock > 0;
      }

      if (stockFilter === "Low Stock") {
        matchesStock = stock > 0 && stock <= 10;
      }

      if (stockFilter === "Out of Stock") {
        matchesStock = stock <= 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [search, category, stockFilter]);

  const handleAddProduct = () => {
    navigate("/admin/products/new");
  };

  const handleViewProduct = (product) => {
    const productId = product.id || product._id;

    if (!productId) {
      return;
    }

    navigate(`/admin/products/${productId}`);
  };

  const handleEditProduct = (product) => {
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
                Products
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Manage your product catalog and inventory.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddProduct}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-4
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:opacity-95
                hover:shadow-md
                active:translate-y-0
              "
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <section className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            {/* Search */}

            <div className="relative">
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
                placeholder="Search products, brands or SKU..."
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

            {/* Category */}

            <SelectField
              value={category}
              onChange={setCategory}
              options={categories}
              label="Category"
            />

            {/* Stock */}

            <SelectField
              value={stockFilter}
              onChange={setStockFilter}
              options={["All", "In Stock", "Low Stock", "Out of Stock"]}
              label="Stock"
            />
          </div>
        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-semibold text-text">
              {filteredProducts.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-text">{products.length}</span>{" "}
            products
          </p>

          {(search || category !== "All" || stockFilter !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setStockFilter("All");
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <section className="mt-4 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
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
                    Price
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id || product._id}
                    product={product}
                    onView={handleViewProduct}
                    onEdit={handleEditProduct}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && <EmptyProducts />}
        </section>

        {/* =================================================
            MOBILE CARDS
        ================================================= */}

        <section className="mt-4 space-y-3 md:hidden">
          {filteredProducts.map((product) => (
            <ProductMobileCard
              key={product.id || product._id}
              product={product}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
            />
          ))}

          {filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-outline-variant bg-surface p-8">
              <EmptyProducts />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({ value, onChange, options, label }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
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
        "
      >
        {options.map((option) => (
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
  );
}

/* =========================================================
   DESKTOP PRODUCT ROW
========================================================= */

function ProductRow({ product, onView, onEdit }) {
  const stock = Number(product.stock || 0);

  return (
    <tr className="border-b border-outline-variant last:border-0">
      {/* Product */}

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

      {/* SKU */}

      <td className="px-5 py-4 text-sm text-text-secondary">
        {product.sku || "—"}
      </td>

      {/* Category */}

      <td className="px-5 py-4 text-sm text-text-secondary">
        {product.categoryLabel || product.category || "—"}
      </td>

      {/* Price */}

      <td className="px-5 py-4 text-sm font-semibold text-text">
        {formatCurrency(product.price)}
      </td>

      {/* Stock */}

      <td className="px-5 py-4">
        <span
          className={
            stock <= 0
              ? "text-sm font-semibold text-error"
              : stock <= 10
                ? "text-sm font-semibold text-warning"
                : "text-sm font-semibold text-text"
          }
        >
          {stock}
        </span>
      </td>

      {/* Status */}

      <td className="px-5 py-4">
        <StockStatus stock={stock} />
      </td>

      {/* Actions */}

      <td className="px-5 py-4">
        <ProductActions product={product} onView={onView} onEdit={onEdit} />
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function ProductMobileCard({ product, onView, onEdit }) {
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
                {product.brand || "No brand"}
              </p>
            </div>

            <StockStatus stock={stock} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoItem label="Price" value={formatCurrency(product.price)} />

            <InfoItem label="Stock" value={stock} />

            <InfoItem label="SKU" value={product.sku || "—"} />

            <InfoItem
              label="Category"
              value={product.categoryLabel || product.category || "—"}
            />
          </div>
        </div>
      </div>

      <ProductActions
        product={product}
        onView={onView}
        onEdit={onEdit}
        mobile
      />
    </article>
  );
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({ product }) {
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-text-secondary">
          <Package size={20} />
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PRODUCT ACTIONS
========================================================= */

function ProductActions({ product, onView, onEdit, mobile = false }) {
  if (mobile) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onView(product)}
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-outline-variant
            text-xs
            font-semibold
            text-text
            transition
            hover:bg-surface-container
          "
        >
          <Eye size={15} />
          View
        </button>

        <button
          type="button"
          onClick={() => onEdit(product)}
          className="
            inline-flex
            h-10
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
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() => onView(product)}
        aria-label={`View ${product.name}`}
        className="
          inline-flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          text-text-secondary
          transition
          hover:bg-surface-container
          hover:text-primary
        "
      >
        <Eye size={17} />
      </button>

      <button
        type="button"
        onClick={() => onEdit(product)}
        aria-label={`Edit ${product.name}`}
        className="
          inline-flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          text-text-secondary
          transition
          hover:bg-surface-container
          hover:text-primary
        "
      >
        <Edit3 size={17} />
      </button>

      <button
        type="button"
        aria-label={`Delete ${product.name}`}
        className="
          inline-flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          text-text-secondary
          transition
          hover:bg-error/5
          hover:text-error
        "
      >
        <Trash2 size={17} />
      </button>
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
        <Package size={12} />
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
   INFO ITEM
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

function EmptyProducts() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
        <Package size={21} className="text-text-secondary" />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-text">
        No products found
      </h2>

      <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
        Try changing your search or filters.
      </p>
    </div>
  );
}

/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default AdminProducts;
