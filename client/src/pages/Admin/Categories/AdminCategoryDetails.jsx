import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  FolderTree,
  Loader2,
  Power,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  getAllCategories,
  toggleCategoryStatus,
} from "../../../services/categoryService";

function AdminCategoryDetails() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [category, setCategory] = useState(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD CATEGORY
  // =====================================================

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllCategories();

        const found = data.categories?.find((item) => item._id === id);

        if (!found) {
          setError("Category not found.");
          return;
        }

        setCategory(found);
      } catch (error) {
        console.error("Load category error:", error);

        setError(error.message || "Failed to load category.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCategory();
    }
  }, [id]);

  // =====================================================
  // TOGGLE STATUS
  // =====================================================

  const handleToggleStatus = async () => {
    if (!category) {
      return;
    }

    const action = category.isActive ? "disable" : "enable";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const data = await toggleCategoryStatus(category._id);

      setCategory(data.category);
    } catch (error) {
      console.error(error);

      window.alert(error.message || "Failed to update category status.");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background p-6">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-primary" />

          <p className="mt-3 text-sm text-text-secondary">
            Loading category...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (!category) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
          >
            <ArrowLeft size={17} />
            Back to Categories
          </button>

          <div className="mt-6 rounded-2xl border border-error/20 bg-error/5 p-10 text-center">
            <XCircle size={32} className="mx-auto text-error" />

            <p className="mt-3 text-sm font-semibold text-error">
              {error || "Category not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
          >
            <ArrowLeft size={17} />
            Back to Categories
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-text-secondary">Catalog</p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                {category.name}
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Category details
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate(`/admin/categories/${category._id}/edit`)
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant px-4 text-sm font-semibold text-text transition hover:bg-surface-container"
              >
                <Edit3 size={16} />
                Edit
              </button>

              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Power size={16} />
                )}

                {category.isActive ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            IMAGE + BASIC INFO
        ================================================= */}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* IMAGE */}

          <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
            {category.image?.url ? (
              <img
                src={category.image.url}
                alt={category.name}
                className="aspect-[16/10] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center bg-surface-container">
                <FolderTree size={60} className="text-text-secondary" />
              </div>
            )}
          </div>

          {/* INFORMATION */}

          <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-text-secondary">Category</p>

                <h2 className="mt-1 text-xl font-semibold text-text">
                  {category.name}
                </h2>
              </div>

              <Status active={category.isActive} />
            </div>

            <div className="mt-6 space-y-5">
              <Detail label="Category ID" value={category._id} />

              <Detail label="Slug" value={category.slug} />

              <Detail
                label="Description"
                value={category.description || "No description provided."}
              />

              <Detail label="Products" value={category.productCount ?? 0} />

              <Detail label="Created" value={formatDate(category.createdAt)} />

              <Detail
                label="Last Updated"
                value={formatDate(category.updatedAt)}
              />
            </div>
          </div>
        </section>

        {/* =================================================
            IMAGE INFORMATION
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-primary">
              <FolderTree size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-text">
                Cloudinary Image
              </h2>

              <p className="text-xs text-text-secondary">
                Image storage information
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-text-secondary">
                Image URL
              </p>

              <p className="mt-1 break-all rounded-xl bg-surface-container p-3 text-xs text-text">
                {category.image?.url || "No image uploaded"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-text-secondary">
                Cloudinary Public ID
              </p>

              <p className="mt-1 break-all rounded-xl bg-surface-container p-3 text-xs text-text">
                {category.image?.publicId || "No public ID"}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            STATUS
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">
                Customer Visibility
              </h2>

              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Active categories are available to customers. Disabled
                categories are hidden from the public category listing.
              </p>
            </div>

            <Status active={category.isActive} />
          </div>
        </section>
      </div>
    </main>
  );
}

// =====================================================
// STATUS
// =====================================================

function Status({ active }) {
  return active ? (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-[10px] font-semibold text-success">
      <CheckCircle2 size={13} />
      Active
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-error/10 px-3 py-1.5 text-[10px] font-semibold text-error">
      <XCircle size={13} />
      Inactive
    </span>
  );
}

// =====================================================
// DETAIL
// =====================================================

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-secondary">{label}</p>

      <p className="mt-1 break-words text-sm text-text">{value}</p>
    </div>
  );
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

  return date.toLocaleString();
}

export default AdminCategoryDetails;
