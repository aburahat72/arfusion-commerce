import {
  CheckCircle2,
  Edit3,
  Eye,
  FolderTree,
  Plus,
  Power,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  deleteCategory,
  getAllCategories,
  toggleCategoryStatus,
} from "../../../services/categoryService";

function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState("");

  // ===================================================
  // LOAD CATEGORIES
  // ===================================================

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllCategories();

      setCategories(data.categories || []);
    } catch (error) {
      console.error("Load categories error:", error);

      setError(error.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ===================================================
  // SEARCH
  // ===================================================

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(query) ||
        category.slug?.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query),
    );
  }, [categories, search]);

  // ===================================================
  // COUNTS
  // ===================================================

  const activeCount = categories.filter((category) => category.isActive).length;

  const inactiveCount = categories.length - activeCount;

  // ===================================================
  // ADD
  // ===================================================

  const handleAddCategory = () => {
    navigate("/admin/categories/new");
  };

  // ===================================================
  // VIEW
  // ===================================================

  const handleViewCategory = (category) => {
    navigate(`/admin/categories/${category._id}`);
  };

  // ===================================================
  // EDIT
  // ===================================================

  const handleEditCategory = (category) => {
    navigate(`/admin/categories/${category._id}/edit`);
  };

  // ===================================================
  // ENABLE / DISABLE
  // ===================================================

  const handleToggleStatus = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${
        category.isActive ? "disable" : "enable"
      } "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`status-${category._id}`);

      const data = await toggleCategoryStatus(category._id);

      setCategories((current) =>
        current.map((item) =>
          item._id === category._id ? data.category : item,
        ),
      );
    } catch (error) {
      console.error(error);

      window.alert(error.message || "Failed to change category status");
    } finally {
      setActionLoading("");
    }
  };

  // ===================================================
  // DELETE
  // ===================================================

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}" permanently?\n\nThe category image will also be removed from Cloudinary.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`delete-${category._id}`);

      await deleteCategory(category._id);

      setCategories((current) =>
        current.filter((item) => item._id !== category._id),
      );
    } catch (error) {
      console.error(error);

      window.alert(error.message || "Failed to delete category");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}

        <div className="mb-6">
          <p className="text-sm text-text-secondary">Catalog</p>

          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                Categories
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Organize products and manage your store categories.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddCategory}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>
        </div>

        {/* STATISTICS */}

        <section className="grid gap-4 sm:grid-cols-3">
          <Stat
            title="Total Categories"
            value={categories.length}
            icon={<FolderTree size={20} />}
            className="bg-primary-container text-primary"
          />

          <Stat
            title="Active Categories"
            value={activeCount}
            icon={<CheckCircle2 size={20} />}
            className="bg-success/10 text-success"
          />

          <Stat
            title="Inactive Categories"
            value={inactiveCount}
            icon={<XCircle size={20} />}
            className="bg-error/10 text-error"
          />
        </section>

        {/* SEARCH */}

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              className="h-11 w-full rounded-xl border border-outline-variant bg-surface pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-4 rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error">
            {error}

            <button
              type="button"
              onClick={loadCategories}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-outline-variant bg-surface p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />

            <p className="mt-3 text-sm text-text-secondary">
              Loading categories...
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}

            <section className="mt-6 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container/60">
                      <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                        Category
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                        Slug
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                        Products
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
                    {filteredCategories.map((category) => (
                      <tr
                        key={category._id}
                        className="border-b border-outline-variant last:border-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <CategoryImage category={category} />

                            <div>
                              <p className="text-sm font-semibold text-text">
                                {category.name}
                              </p>

                              {category.description && (
                                <p className="mt-1 max-w-md truncate text-xs text-text-secondary">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-text-secondary">
                          {category.slug}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-text">
                          {category.productCount ?? 0}
                        </td>

                        <td className="px-5 py-4">
                          <Status active={category.isActive} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <IconButton
                              title="View"
                              onClick={() => handleViewCategory(category)}
                            >
                              <Eye size={17} />
                            </IconButton>

                            <IconButton
                              title="Edit"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit3 size={17} />
                            </IconButton>

                            <IconButton
                              title={category.isActive ? "Disable" : "Enable"}
                              disabled={
                                actionLoading === `status-${category._id}`
                              }
                              onClick={() => handleToggleStatus(category)}
                            >
                              <Power size={17} />
                            </IconButton>

                            <IconButton
                              title="Delete"
                              danger
                              disabled={
                                actionLoading === `delete-${category._id}`
                              }
                              onClick={() => handleDeleteCategory(category)}
                            >
                              <Trash2 size={17} />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCategories.length === 0 && <Empty />}
            </section>

            {/* MOBILE */}

            <section className="mt-6 space-y-3 md:hidden">
              {filteredCategories.map((category) => (
                <article
                  key={category._id}
                  className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <CategoryImage category={category} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="truncate text-sm font-semibold text-text">
                            {category.name}
                          </p>

                          <p className="mt-1 text-xs text-text-secondary">
                            {category.slug}
                          </p>
                        </div>

                        <Status active={category.isActive} />
                      </div>

                      <div className="mt-3 text-xs text-text-secondary">
                        Products:{" "}
                        <span className="font-semibold text-text">
                          {category.productCount ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    <MobileButton onClick={() => handleViewCategory(category)}>
                      <Eye size={15} />
                      View
                    </MobileButton>

                    <MobileButton onClick={() => handleEditCategory(category)}>
                      <Edit3 size={15} />
                      Edit
                    </MobileButton>

                    <MobileButton
                      disabled={actionLoading === `status-${category._id}`}
                      onClick={() => handleToggleStatus(category)}
                    >
                      <Power size={15} />
                      {category.isActive ? "Off" : "On"}
                    </MobileButton>

                    <MobileButton
                      danger
                      disabled={actionLoading === `delete-${category._id}`}
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 size={15} />
                      Delete
                    </MobileButton>
                  </div>
                </article>
              ))}

              {filteredCategories.length === 0 && <Empty />}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

// =====================================================
// COMPONENTS
// =====================================================

function Stat({ title, value, icon, className }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs text-text-secondary">{title}</p>

          <p className="mt-1 text-2xl font-semibold text-text">{value}</p>
        </div>
      </div>
    </article>
  );
}

function CategoryImage({ category }) {
  if (category.image?.url) {
    return (
      <img
        src={category.image.url}
        alt={category.name}
        className="h-11 w-11 shrink-0 rounded-xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
      <FolderTree size={20} />
    </div>
  );
}

function Status({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1.5 text-[10px] font-semibold text-success">
      <CheckCircle2 size={12} />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2.5 py-1.5 text-[10px] font-semibold text-error">
      <XCircle size={12} />
      Inactive
    </span>
  );
}

function IconButton({ children, title, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-40 ${
        danger
          ? "text-text-secondary hover:bg-error/10 hover:text-error"
          : "text-text-secondary hover:bg-surface-container hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function MobileButton({ children, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-10 items-center justify-center gap-1 rounded-xl border text-[11px] font-semibold disabled:opacity-40 ${
        danger
          ? "border-error/20 text-error"
          : "border-outline-variant text-text"
      }`}
    >
      {children}
    </button>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FolderTree size={24} className="text-text-secondary" />

      <p className="mt-3 text-sm font-semibold text-text">
        No categories found
      </p>

      <p className="mt-1 text-xs text-text-secondary">
        Try a different search.
      </p>
    </div>
  );
}

export default AdminCategories;
