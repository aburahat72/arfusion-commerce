import {
  CheckCircle2,
  Edit3,
  Eye,
  FolderTree,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import categories from "../../../data/categories";

function AdminCategories() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {
      const name = category.name || category.label || "";

      const slug = category.slug || category.id || "";

      return (
        name.toLowerCase().includes(query) ||
        String(slug).toLowerCase().includes(query)
      );
    });
  }, [search]);

  const activeCount = categories.filter(
    (category) => category.active !== false,
  ).length;

  const inactiveCount = categories.length - activeCount;

  const handleAddCategory = () => {
    navigate("/admin/categories/new");
  };

  const handleViewCategory = (category) => {
    const categoryId =
      category.id || category._id || category.slug || category.name;

    navigate(`/admin/categories/${encodeURIComponent(String(categoryId))}`);
  };

  const handleEditCategory = (category) => {
    const categoryId =
      category.id || category._id || category.slug || category.name;

    navigate(
      `/admin/categories/${encodeURIComponent(String(categoryId))}/edit`,
    );
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* =================================================
            HEADER
        ================================================= */}

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
              Add Category
            </button>
          </div>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-3">
          <CategoryStat
            title="Total Categories"
            value={categories.length}
            icon={<FolderTree size={20} />}
            iconClass="bg-primary-container text-primary"
          />

          <CategoryStat
            title="Active Categories"
            value={activeCount}
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-success/10 text-success"
          />

          <CategoryStat
            title="Inactive Categories"
            value={inactiveCount}
            icon={<XCircle size={20} />}
            iconClass="bg-error/10 text-error"
          />
        </section>

        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
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
              placeholder="Search categories..."
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
        </section>

        {/* =================================================
            RESULT COUNT
        ================================================= */}

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-semibold text-text">
              {filteredCategories.length}
            </span>{" "}
            categories
          </p>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <section className="mt-4 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/60">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Slug / ID
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
                  <CategoryRow
                    key={getCategoryKey(category)}
                    category={category}
                    onView={handleViewCategory}
                    onEdit={handleEditCategory}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredCategories.length === 0 && <EmptyCategories />}
        </section>

        {/* =================================================
            MOBILE CARDS
        ================================================= */}

        <section className="mt-4 space-y-3 md:hidden">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={getCategoryKey(category)}
              category={category}
              onView={handleViewCategory}
              onEdit={handleEditCategory}
            />
          ))}

          {filteredCategories.length === 0 && (
            <div className="rounded-2xl border border-outline-variant bg-surface p-8">
              <EmptyCategories />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function CategoryStat({ title, value, icon, iconClass }) {
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

          <p className="mt-1 text-2xl font-semibold text-text">{value}</p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   DESKTOP ROW
========================================================= */

function CategoryRow({ category, onView, onEdit }) {
  const name = category.name || category.label || "Unnamed Category";

  const identifier = category.slug || category.id || category._id || "—";

  const productCount = Number(
    category.productCount ?? category.productsCount ?? category.count ?? 0,
  );

  const isActive = category.active !== false;

  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <CategoryIcon />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">{name}</p>

            {category.description && (
              <p className="mt-0.5 max-w-md truncate text-xs text-text-secondary">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-text-secondary">{identifier}</td>

      <td className="px-5 py-4 text-sm font-semibold text-text">
        {productCount}
      </td>

      <td className="px-5 py-4">
        <CategoryStatus active={isActive} />
      </td>

      <td className="px-5 py-4">
        <CategoryActions category={category} onView={onView} onEdit={onEdit} />
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function CategoryCard({ category, onView, onEdit }) {
  const name = category.name || category.label || "Unnamed Category";

  const identifier = category.slug || category.id || category._id || "—";

  const productCount = Number(
    category.productCount ?? category.productsCount ?? category.count ?? 0,
  );

  const isActive = category.active !== false;

  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <CategoryIcon />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">{name}</p>

              <p className="mt-1 truncate text-xs text-text-secondary">
                {identifier}
              </p>
            </div>

            <CategoryStatus active={isActive} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoItem label="Products" value={productCount} />

            <InfoItem label="Status" value={isActive ? "Active" : "Inactive"} />
          </div>
        </div>
      </div>

      <CategoryActions
        category={category}
        onView={onView}
        onEdit={onEdit}
        mobile
      />
    </article>
  );
}

/* =========================================================
   CATEGORY ICON
========================================================= */

function CategoryIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
      <FolderTree size={20} />
    </div>
  );
}

/* =========================================================
   ACTIONS
========================================================= */

function CategoryActions({ category, onView, onEdit, mobile = false }) {
  if (mobile) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onView(category)}
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
          onClick={() => onEdit(category)}
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
        onClick={() => onView(category)}
        aria-label="View category"
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
        onClick={() => onEdit(category)}
        aria-label="Edit category"
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
        aria-label="Delete category"
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
   STATUS
========================================================= */

function CategoryStatus({ active }) {
  if (!active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-1.5 text-[10px] font-semibold text-error">
        <XCircle size={12} />
        Inactive
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1.5 text-[10px] font-semibold text-success">
      <CheckCircle2 size={12} />
      Active
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
   EMPTY STATE
========================================================= */

function EmptyCategories() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
        <FolderTree size={21} className="text-text-secondary" />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-text">
        No categories found
      </h2>

      <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
        Try changing your search or add a new category.
      </p>
    </div>
  );
}

/* =========================================================
   KEY
========================================================= */

function getCategoryKey(category) {
  return String(category.id || category._id || category.slug || category.name);
}

export default AdminCategories;
