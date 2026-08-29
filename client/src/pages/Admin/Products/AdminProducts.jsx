import {
  CheckCircle2,
  ChevronDown,
  Edit3,
  Eye,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  deleteProduct,
  getAllAdminProducts,
  toggleProductStatus,
} from "../../../services/productService";

import { getActiveCategories } from "../../../services/categoryService";

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [stockFilter, setStockFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState("");

  const [error, setError] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productResponse, categoryResponse] = await Promise.all([
        getAllAdminProducts({
          page: 1,
          limit: 100,
        }),

        getActiveCategories(),
      ]);

      setProducts(productResponse?.products || []);

      setCategories(categoryResponse?.categories || []);
    } catch (error) {
      console.error("Load products error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load products.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // CATEGORY OPTIONS
  // =====================================================

  const categoryOptions = useMemo(() => {
    return ["All", ...categories.map((item) => item.name)];
  }, [categories]);

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const productCategory = getCategoryName(product);

      const stock = Number(product.stock || 0);

      const matchesSearch =
        !query || product.name?.toLowerCase().includes(query);

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
  }, [products, search, category, stockFilter]);

  // =====================================================
  // ADD
  // =====================================================

  const handleAddProduct = () => {
    if (categories.length === 0) {
      setError("Create or enable a category before adding a product.");

      return;
    }

    navigate("/admin/products/new");
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleViewProduct = (product) => {
    const productId = product._id || product.id;

    if (!productId) {
      setError("Product ID is missing.");

      return;
    }

    navigate(`/admin/products/${productId}`);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEditProduct = (product) => {
    const productId = product._id || product.id;

    if (!productId) {
      setError("Product ID is missing.");

      return;
    }

    navigate(`/admin/products/${productId}/edit`);
  };

  // =====================================================
  // TOGGLE STATUS
  // =====================================================

  const handleToggleStatus = async (product) => {
    const productId = product._id || product.id;

    if (!productId) {
      setError("Product ID is missing.");

      return;
    }

    try {
      setActionLoading(`status-${productId}`);

      setError("");

      const response = await toggleProductStatus(productId);

      const updatedProduct = response?.product;

      if (updatedProduct) {
        setProducts((current) =>
          current.map((item) =>
            item._id === productId || item.id === productId
              ? updatedProduct
              : item,
          ),
        );
      } else {
        await loadData();
      }
    } catch (error) {
      console.error("Toggle product status error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to change product status.",
      );
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteProduct = async (product) => {
    const productId = product._id || product.id;

    if (!productId) {
      setError("Product ID is missing.");

      return;
    }

    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis will permanently delete the product and its Cloudinary images.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`delete-${productId}`);

      setError("");

      await deleteProduct(productId);

      setProducts((current) =>
        current.filter(
          (item) => item._id !== productId && item.id !== productId,
        ),
      );
    } catch (error) {
      console.error("Delete product error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete product.",
      );
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setStockFilter("All");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 text-sm font-semibold text-text transition hover:bg-surface-container disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleAddProduct}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* FILTERS */}

        <section className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="h-11 w-full rounded-xl border border-outline-variant bg-surface pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <SelectField
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              label="Category"
            />

            <SelectField
              value={stockFilter}
              onChange={setStockFilter}
              options={["All", "In Stock", "Low Stock", "Out of Stock"]}
              label="Stock"
            />
          </div>
        </section>

        {/* SUMMARY */}

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
              onClick={clearFilters}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="mt-4 flex min-h-64 items-center justify-center rounded-2xl border border-outline-variant bg-surface">
            <div className="text-center">
              <Loader2
                size={30}
                className="mx-auto animate-spin text-primary"
              />

              <p className="mt-3 text-sm text-text-secondary">
                Loading products...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* DESKTOP */}

            <section className="mt-4 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container/60">
                      <TableHeader>Product</TableHeader>

                      <TableHeader>Category</TableHeader>

                      <TableHeader>Price</TableHeader>

                      <TableHeader>Stock</TableHeader>

                      <TableHeader>Status</TableHeader>

                      <th className="px-5 py-4 text-right text-xs font-semibold text-text-secondary">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <ProductRow
                        key={product._id || product.id}
                        product={product}
                        onView={handleViewProduct}
                        onEdit={handleEditProduct}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDeleteProduct}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <EmptyProducts
                  hasFilters={Boolean(
                    search || category !== "All" || stockFilter !== "All",
                  )}
                />
              )}
            </section>

            {/* MOBILE */}

            <section className="mt-4 space-y-3 md:hidden">
              {filteredProducts.map((product) => (
                <ProductMobileCard
                  key={product._id || product.id}
                  product={product}
                  onView={handleViewProduct}
                  onEdit={handleEditProduct}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDeleteProduct}
                  actionLoading={actionLoading}
                />
              ))}

              {filteredProducts.length === 0 && (
                <div className="rounded-2xl border border-outline-variant bg-surface p-8">
                  <EmptyProducts
                    hasFilters={Boolean(
                      search || category !== "All" || stockFilter !== "All",
                    )}
                  />
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

// =====================================================
// TABLE HEADER
// =====================================================

function TableHeader({ children }) {
  return (
    <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
      {children}
    </th>
  );
}

// =====================================================
// SELECT
// =====================================================

function SelectField({ value, onChange, options, label }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-11 w-full appearance-none rounded-xl border border-outline-variant bg-surface py-2 pl-3 pr-9 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
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

// =====================================================
// PRODUCT ROW
// =====================================================

function ProductRow({
  product,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  actionLoading,
}) {
  const stock = Number(product.stock || 0);

  const productId = product._id || product.id;

  const statusLoading = actionLoading === `status-${productId}`;

  const deleteLoading = actionLoading === `delete-${productId}`;

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
              ID: {product._id || product.id}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-text-secondary">
        {getCategoryName(product)}
      </td>

      <td className="px-5 py-4 text-sm font-semibold text-text">
        {formatCurrency(product.price)}
      </td>

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

      <td className="px-5 py-4">
        <ProductStatus product={product} />
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-1">
          <ActionButton
            icon={<Eye size={17} />}
            label={`View ${product.name}`}
            onClick={() => onView(product)}
            disabled={statusLoading || deleteLoading}
          />

          <ActionButton
            icon={<Edit3 size={17} />}
            label={`Edit ${product.name}`}
            onClick={() => onEdit(product)}
            disabled={statusLoading || deleteLoading}
          />

          <ActionButton
            icon={
              statusLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : product.isActive ? (
                <XCircle size={17} />
              ) : (
                <CheckCircle2 size={17} />
              )
            }
            label={
              product.isActive
                ? `Disable ${product.name}`
                : `Enable ${product.name}`
            }
            onClick={() => onToggleStatus(product)}
            disabled={statusLoading || deleteLoading}
          />

          <ActionButton
            icon={
              deleteLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Trash2 size={17} />
              )
            }
            label={`Delete ${product.name}`}
            onClick={() => onDelete(product)}
            danger
            disabled={statusLoading || deleteLoading}
          />
        </div>
      </td>
    </tr>
  );
}

// =====================================================
// MOBILE CARD
// =====================================================

function ProductMobileCard({
  product,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  actionLoading,
}) {
  const stock = Number(product.stock || 0);

  const productId = product._id || product.id;

  const statusLoading = actionLoading === `status-${productId}`;

  const deleteLoading = actionLoading === `delete-${productId}`;

  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <ProductImage product={product} large />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">
                {product.name}
              </p>

              <p className="mt-1 text-xs text-text-secondary">
                {getCategoryName(product)}
              </p>
            </div>

            <ProductStatus product={product} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoItem label="Price" value={formatCurrency(product.price)} />

            <InfoItem label="Stock" value={stock} />

            <InfoItem label="Category" value={getCategoryName(product)} />

            <InfoItem
              label="Status"
              value={product.isActive ? "Active" : "Inactive"}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onView(product)}
          disabled={statusLoading || deleteLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant text-xs font-semibold text-text transition hover:bg-surface-container disabled:opacity-50"
        >
          <Eye size={15} />
          View
        </button>

        <button
          type="button"
          onClick={() => onEdit(product)}
          disabled={statusLoading || deleteLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Edit3 size={15} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onToggleStatus(product)}
          disabled={statusLoading || deleteLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant text-xs font-semibold text-text transition hover:bg-surface-container disabled:opacity-50"
        >
          {statusLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : product.isActive ? (
            <XCircle size={15} />
          ) : (
            <CheckCircle2 size={15} />
          )}

          {product.isActive ? "Disable" : "Enable"}
        </button>

        <button
          type="button"
          onClick={() => onDelete(product)}
          disabled={statusLoading || deleteLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-error/20 text-xs font-semibold text-error transition hover:bg-error/5 disabled:opacity-50"
        >
          {deleteLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
          Delete
        </button>
      </div>
    </article>
  );
}

// =====================================================
// PRODUCT IMAGE
// =====================================================

function ProductImage({ product, large = false }) {
  const imageUrl = product.images?.[0]?.url || product.image || "";

  return (
    <div
      className={
        large
          ? "h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-container"
          : "h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container"
      }
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product.name || "Product"}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-text-secondary">
          <Package size={large ? 24 : 20} />
        </div>
      )}
    </div>
  );
}

// =====================================================
// PRODUCT STATUS
// =====================================================

function ProductStatus({ product }) {
  if (!product.isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-1.5 text-[10px] font-semibold text-error">
        <XCircle size={12} />
        Inactive
      </span>
    );
  }

  const stock = Number(product.stock || 0);

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

// =====================================================
// ACTION BUTTON
// =====================================================

function ActionButton({
  icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "text-text-secondary hover:bg-error/5 hover:text-error"
          : "text-text-secondary hover:bg-surface-container hover:text-primary"
      }`}
    >
      {icon}
    </button>
  );
}

// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-surface-container p-3">
      <p className="text-[10px] text-text-secondary">{label}</p>

      <p className="mt-1 truncate text-xs font-semibold text-text">{value}</p>
    </div>
  );
}

// =====================================================
// EMPTY
// =====================================================

function EmptyProducts({ hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
        <Package size={21} className="text-text-secondary" />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-text">
        No products found
      </h2>

      <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
        {hasFilters
          ? "Try changing your search or filters."
          : "No products have been added yet."}
      </p>
    </div>
  );
}

// =====================================================
// CATEGORY NAME
// =====================================================

function getCategoryName(product) {
  if (product.category && typeof product.category === "object") {
    return product.category.name || "Unknown category";
  }

  return product.categoryLabel || product.category || "Unknown category";
}

// =====================================================
// CURRENCY
// =====================================================

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default AdminProducts;
