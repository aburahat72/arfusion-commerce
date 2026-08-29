import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Loader2,
  Package,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { getProductById } from "../../../services/productService";

function AdminProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      if (!id) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getProductById(id);

        if (mounted) {
          setProduct(response?.product || response?.data?.product || null);
        }
      } catch (error) {
        console.error("Load product error:", error);

        if (mounted) {
          setError(
            error.response?.data?.message ||
              error.message ||
              "Failed to load product.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleEdit = () => {
    navigate(`/admin/products/${id}/edit`);
  };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background p-6">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-primary" />

          <p className="mt-3 text-sm text-text-secondary">Loading product...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary"
          >
            <ArrowLeft size={17} />
            Back to Products
          </button>

          <div className="rounded-2xl border border-error/20 bg-error/5 p-8 text-center">
            <XCircle size={36} className="mx-auto text-error" />

            <h1 className="mt-3 text-lg font-semibold text-text">
              Unable to load product
            </h1>

            <p className="mt-2 text-sm text-error">
              {error || "Product not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const images = product.images || [];

  const stock = Number(product.stock || 0);

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
          >
            <ArrowLeft size={17} />
            Back to Products
          </button>

          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Edit3 size={17} />
            Edit Product
          </button>
        </div>

        {/* PRODUCT */}

        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
          {/* IMAGE GALLERY */}

          <div className="border-b border-outline-variant p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {images.length > 0 ? (
                images.map((image, index) => (
                  <div
                    key={image.publicId || image.url || index}
                    className="overflow-hidden rounded-xl bg-surface-container"
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="aspect-square h-full w-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-xl bg-surface-container sm:col-span-2 lg:col-span-4">
                  <Package size={42} className="text-text-secondary" />
                </div>
              )}
            </div>
          </div>

          {/* INFORMATION */}

          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">Product</p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                  {product.name}
                </h1>

                <p className="mt-2 break-all text-xs text-text-secondary">
                  ID: {product._id || product.id}
                </p>
              </div>

              <StatusBadge active={product.isActive} />
            </div>

            {/* MAIN DETAILS */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailCard label="Price" value={formatCurrency(product.price)} />

              <DetailCard label="Stock" value={stock} />

              <DetailCard label="Category" value={getCategoryName(product)} />

              <DetailCard
                label="Status"
                value={product.isActive ? "Active" : "Inactive"}
              />
            </div>

            {/* DESCRIPTION */}

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-text">Description</h2>

              <div className="mt-2 rounded-xl bg-surface-container p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                  {product.description || "No description available."}
                </p>
              </div>
            </div>

            {/* DATES */}

            <div className="mt-6 grid gap-4 border-t border-outline-variant pt-6 sm:grid-cols-2">
              <DetailCard
                label="Created"
                value={formatDate(product.createdAt)}
              />

              <DetailCard
                label="Last Updated"
                value={formatDate(product.updatedAt)}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// =====================================================
// STATUS
// =====================================================

function StatusBadge({ active }) {
  if (active) {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
        <CheckCircle2 size={14} />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-error/10 px-3 py-1.5 text-xs font-semibold text-error">
      <XCircle size={14} />
      Inactive
    </span>
  );
}

// =====================================================
// DETAIL CARD
// =====================================================

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl bg-surface-container p-4">
      <p className="text-xs text-text-secondary">{label}</p>

      <p className="mt-1 break-words text-sm font-semibold text-text">
        {value}
      </p>
    </div>
  );
}

// =====================================================
// CATEGORY
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

// =====================================================
// DATE
// =====================================================

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default AdminProductDetails;
