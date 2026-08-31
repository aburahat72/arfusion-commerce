import {
  CheckCircle2,
  Edit3,
  Eye,
  Image,
  Loader2,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import adminApi from "../../../services/adminApi";

function AdminBanners() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  // =====================================================
  // FETCH ALL ADMIN BANNERS
  // =====================================================

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get("/banners/admin/all");

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to fetch banners.");
      }

      setBanners(
        Array.isArray(response.data?.banners) ? response.data.banners : [],
      );
    } catch (error) {
      console.error("Fetch admin banners error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load banners.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchBanners();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredBanners = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return banners;
    }

    return banners.filter((banner) => {
      const title = [banner.titleStart, banner.titleHighlight, banner.titleEnd]
        .filter(Boolean)
        .join(" ");

      const description = banner.description || "";
      const badge = banner.badge || "";
      const slug = banner.slug || "";

      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        badge.toLowerCase().includes(query) ||
        slug.toLowerCase().includes(query)
      );
    });
  }, [search, banners]);

  // =====================================================
  // COUNTS
  // =====================================================

  const activeCount = banners.filter(
    (banner) => banner.isActive === true,
  ).length;

  const inactiveCount = banners.length - activeCount;

  // =====================================================
  // ADD
  // =====================================================

  const handleAddBanner = () => {
    navigate("/admin/banners/new");
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleViewBanner = (banner) => {
    if (!banner?._id) return;

    navigate(`/admin/banners/${encodeURIComponent(String(banner._id))}`);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEditBanner = (banner) => {
    if (!banner?._id) return;

    navigate(`/admin/banners/${encodeURIComponent(String(banner._id))}/edit`);
  };

  // =====================================================
  // TOGGLE STATUS
  // =====================================================

  const handleToggleStatus = async (banner) => {
    if (!banner?._id) return;

    const id = String(banner._id);

    try {
      setActionLoading(`status-${id}`);

      const response = await adminApi.patch(`/banners/${id}/status`);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to update banner status.",
        );
      }

      const updatedBanner = response.data?.banner;

      setBanners((previous) =>
        previous.map((item) =>
          String(item._id) === id
            ? updatedBanner || {
                ...item,
                isActive: !item.isActive,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Toggle banner status error:", error);

      window.alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to update banner status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeleteBanner = async (banner) => {
    if (!banner?._id) return;

    const id = String(banner._id);

    const title = [banner.titleStart, banner.titleHighlight, banner.titleEnd]
      .filter(Boolean)
      .join(" ");

    const confirmed = window.confirm(
      `Delete "${title || banner.slug || "this banner"}"?\n\nThis will permanently delete the banner and its Cloudinary images.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`delete-${id}`);

      const response = await adminApi.delete(`/banners/${id}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to delete banner.");
      }

      setBanners((previous) =>
        previous.filter((item) => String(item._id) !== id),
      );
    } catch (error) {
      console.error("Delete banner error:", error);

      window.alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete banner.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px]">
          <BannerPageHeader onAdd={handleAddBanner} />

          <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={30} className="animate-spin text-primary" />

              <p className="text-sm text-text-secondary">Loading banners...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px]">
          <BannerPageHeader onAdd={handleAddBanner} />

          <div className="mt-6 rounded-2xl border border-error/20 bg-error/5 p-8 text-center">
            <XCircle size={34} className="mx-auto text-error" />

            <h2 className="mt-3 text-sm font-semibold text-text">
              Failed to load banners
            </h2>

            <p className="mt-1 text-sm text-text-secondary">{error}</p>

            <button
              type="button"
              onClick={fetchBanners}
              className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}

        <BannerPageHeader onAdd={handleAddBanner} />

        {/* SUMMARY */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <BannerStat
            title="Total Banners"
            value={banners.length}
            icon={<Image size={20} />}
            iconClass="bg-primary-container text-primary"
          />

          <BannerStat
            title="Active"
            value={activeCount}
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-success/10 text-success"
          />

          <BannerStat
            title="Inactive"
            value={inactiveCount}
            icon={<XCircle size={20} />}
            iconClass="bg-error/10 text-error"
          />
        </section>

        {/* SEARCH */}

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search banners..."
              className="h-11 w-full rounded-xl border border-outline-variant bg-surface pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-text-secondary hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </section>

        {/* COUNT */}

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-semibold text-text">
              {filteredBanners.length}
            </span>{" "}
            banners
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

        {/* DESKTOP */}

        <section className="mt-4 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/60">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Banner
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Badge
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    CTA
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Order
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
                {filteredBanners.map((banner) => (
                  <BannerRow
                    key={getBannerKey(banner)}
                    banner={banner}
                    onView={handleViewBanner}
                    onEdit={handleEditBanner}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteBanner}
                    actionLoading={actionLoading}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredBanners.length === 0 && <EmptyBanners />}
        </section>

        {/* MOBILE */}

        <section className="mt-4 space-y-3 md:hidden">
          {filteredBanners.map((banner) => (
            <BannerCard
              key={getBannerKey(banner)}
              banner={banner}
              onView={handleViewBanner}
              onEdit={handleEditBanner}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteBanner}
              actionLoading={actionLoading}
            />
          ))}

          {filteredBanners.length === 0 && (
            <div className="rounded-2xl border border-outline-variant bg-surface p-8">
              <EmptyBanners />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   PAGE HEADER
========================================================= */

function BannerPageHeader({ onAdd }) {
  return (
    <div>
      <p className="text-sm text-text-secondary">Catalog</p>

      <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Banners
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Manage homepage banners and promotional slides.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md"
        >
          <Plus size={18} />
          Add Banner
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function BannerStat({ title, value, icon, iconClass }) {
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

function BannerRow({
  banner,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  actionLoading,
}) {
  const title = getBannerTitle(banner);

  const badge = banner.badge || "—";

  const buttonText = banner.primaryButton?.text || "—";

  const image = banner.mainProduct?.url;

  const id = String(banner._id);

  const statusLoading = actionLoading === `status-${id}`;

  const deleteLoading = actionLoading === `delete-${id}`;

  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <BannerImage src={image} alt={banner.mainProduct?.alt || title} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {title || "Untitled Banner"}
            </p>

            <p className="mt-0.5 max-w-md truncate text-xs text-text-secondary">
              {banner.description || ""}
            </p>

            <p className="mt-1 truncate text-[10px] text-text-secondary">
              /{banner.slug}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-text-secondary">{badge}</td>

      <td className="px-5 py-4 text-sm text-text">{buttonText}</td>

      <td className="px-5 py-4 text-sm font-medium text-text">
        {banner.sortOrder ?? 0}
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onToggleStatus(banner)}
          disabled={statusLoading || deleteLoading}
          title={banner.isActive ? "Deactivate banner" : "Activate banner"}
          className="disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BannerStatus active={banner.isActive} />
        </button>
      </td>

      <td className="px-5 py-4">
        <BannerActions
          banner={banner}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          actionLoading={actionLoading}
        />
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function BannerCard({
  banner,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  actionLoading,
}) {
  const title = getBannerTitle(banner);

  const badge = banner.badge || "—";

  const buttonText = banner.primaryButton?.text || "—";

  const id = String(banner._id);

  const statusLoading = actionLoading === `status-${id}`;

  const deleteLoading = actionLoading === `delete-${id}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
      <div className="aspect-[16/7] overflow-hidden bg-surface-container">
        <BannerImage
          src={banner.mainProduct?.url}
          alt={banner.mainProduct?.alt || title}
          large
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {title || "Untitled Banner"}
            </p>

            <p className="mt-1 text-xs leading-5 text-text-secondary">
              {banner.description || ""}
            </p>

            <p className="mt-1 text-[10px] text-text-secondary">
              /{banner.slug}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleStatus(banner)}
            disabled={statusLoading || deleteLoading}
            className="shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <BannerStatus active={banner.isActive} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <InfoItem label="Badge" value={badge} />

          <InfoItem label="CTA" value={buttonText} />

          <InfoItem label="Order" value={String(banner.sortOrder ?? 0)} />
        </div>

        <BannerActions
          banner={banner}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          actionLoading={actionLoading}
          mobile
        />
      </div>
    </article>
  );
}

/* =========================================================
   IMAGE
========================================================= */

function BannerImage({ src, alt, large = false }) {
  if (!src) {
    return (
      <div className="flex h-full min-h-12 w-full items-center justify-center bg-surface-container text-text-secondary">
        <Image size={large ? 28 : 20} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Banner"}
      loading="lazy"
      className={
        large
          ? "h-full w-full object-cover"
          : "h-12 w-20 rounded-xl object-cover"
      }
    />
  );
}

/* =========================================================
   ACTIONS
========================================================= */

function BannerActions({
  banner,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  actionLoading,
  mobile = false,
}) {
  const id = String(banner._id);

  const statusLoading = actionLoading === `status-${id}`;

  const deleteLoading = actionLoading === `delete-${id}`;

  if (mobile) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onView(banner)}
          disabled={statusLoading || deleteLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant text-xs font-semibold text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Eye size={15} />
          Preview
        </button>

        <button
          type="button"
          onClick={() => onEdit(banner)}
          disabled={statusLoading || deleteLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Edit3 size={15} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onToggleStatus(banner)}
          disabled={deleteLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant text-xs font-semibold text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {statusLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : banner.isActive ? (
            <XCircle size={15} />
          ) : (
            <CheckCircle2 size={15} />
          )}

          {banner.isActive ? "Deactivate" : "Activate"}
        </button>

        <button
          type="button"
          onClick={() => onDelete(banner)}
          disabled={statusLoading || deleteLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-error/20 text-xs font-semibold text-error transition hover:bg-error/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleteLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() => onView(banner)}
        disabled={statusLoading || deleteLoading}
        aria-label="Preview banner"
        title="Preview"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-container hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Eye size={17} />
      </button>

      <button
        type="button"
        onClick={() => onEdit(banner)}
        disabled={statusLoading || deleteLoading}
        aria-label="Edit banner"
        title="Edit"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-container hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Edit3 size={17} />
      </button>

      <button
        type="button"
        onClick={() => onToggleStatus(banner)}
        disabled={deleteLoading}
        aria-label={banner.isActive ? "Deactivate banner" : "Activate banner"}
        title={banner.isActive ? "Deactivate" : "Activate"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-container hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {statusLoading ? (
          <Loader2 size={17} className="animate-spin" />
        ) : banner.isActive ? (
          <XCircle size={17} />
        ) : (
          <CheckCircle2 size={17} />
        )}
      </button>

      <button
        type="button"
        onClick={() => onDelete(banner)}
        disabled={statusLoading || deleteLoading}
        aria-label="Delete banner"
        title="Delete"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-error/5 hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleteLoading ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <Trash2 size={17} />
        )}
      </button>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function BannerStatus({ active }) {
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
   INFO
========================================================= */

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-surface-container p-3">
      <p className="text-[10px] text-text-secondary">{label}</p>

      <p className="mt-1 truncate text-xs font-semibold text-text">
        {value || "—"}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyBanners() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
        <Image size={21} className="text-text-secondary" />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-text">No banners found</h2>

      <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
        Add a banner or change your search.
      </p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getBannerTitle(banner) {
  return [banner?.titleStart, banner?.titleHighlight, banner?.titleEnd]
    .filter(Boolean)
    .join(" ");
}

function getBannerKey(banner) {
  return String(banner?._id || banner?.slug || Math.random());
}

export default AdminBanners;
