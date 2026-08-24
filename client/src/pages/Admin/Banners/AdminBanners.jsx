import {
  CheckCircle2,
  Edit3,
  Eye,
  Image,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import heroSlides from "../../../data/heroSlides";

function AdminBanners() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const banners = Array.isArray(heroSlides)
    ? heroSlides
    : [];

  const filteredBanners = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return banners;
    }

    return banners.filter((banner) => {
      const title =
        banner.title ||
        banner.heading ||
        banner.name ||
        "";

      const subtitle =
        banner.subtitle ||
        banner.description ||
        banner.badge ||
        "";

      return (
        title.toLowerCase().includes(query) ||
        subtitle.toLowerCase().includes(query)
      );
    });
  }, [search, banners]);

  const activeCount = banners.filter(
    (banner) => banner.active !== false,
  ).length;

  const inactiveCount =
    banners.length - activeCount;

  const handleAddBanner = () => {
    navigate("/admin/banners/new");
  };

  const handleViewBanner = (banner) => {
    const id =
      banner.id ||
      banner._id ||
      banner.slug ||
      banner.title ||
      banner.heading;

    navigate(
      `/admin/banners/${encodeURIComponent(
        String(id),
      )}`,
    );
  };

  const handleEditBanner = (banner) => {
    const id =
      banner.id ||
      banner._id ||
      banner.slug ||
      banner.title ||
      banner.heading;

    navigate(
      `/admin/banners/${encodeURIComponent(
        String(id),
      )}/edit`,
    );
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <p className="text-sm text-text-secondary">
            Catalog
          </p>

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
              onClick={handleAddBanner}
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
              "
            >
              <Plus size={18} />
              Add Banner
            </button>
          </div>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-3">
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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search banners..."
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
            COUNT
        ================================================= */}

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

        {/* =================================================
            DESKTOP
        ================================================= */}

        <section className="mt-4 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse">
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
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredBanners.length === 0 && (
            <EmptyBanners />
          )}
        </section>

        {/* =================================================
            MOBILE
        ================================================= */}

        <section className="mt-4 space-y-3 md:hidden">
          {filteredBanners.map((banner) => (
            <BannerCard
              key={getBannerKey(banner)}
              banner={banner}
              onView={handleViewBanner}
              onEdit={handleEditBanner}
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
   STAT
========================================================= */

function BannerStat({
  title,
  value,
  icon,
  iconClass,
}) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs text-text-secondary">
            {title}
          </p>

          <p className="mt-1 text-2xl font-semibold text-text">
            {value}
          </p>
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
}) {
  const title =
    banner.title ||
    banner.heading ||
    banner.name ||
    "Untitled Banner";

  const description =
    banner.description ||
    banner.subtitle ||
    "";

  const badge =
    banner.badge ||
    banner.tag ||
    "—";

  const buttonText =
    banner.buttonText ||
    banner.ctaText ||
    banner.buttonLabel ||
    "Shop Now";

  const image =
    banner.image ||
    banner.imageUrl ||
    banner.backgroundImage;

  const isActive =
    banner.active !== false;

  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <BannerImage
            src={image}
            alt={title}
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {title}
            </p>

            <p className="mt-0.5 max-w-md truncate text-xs text-text-secondary">
              {description}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-text-secondary">
        {badge}
      </td>

      <td className="px-5 py-4 text-sm text-text">
        {buttonText}
      </td>

      <td className="px-5 py-4">
        <BannerStatus active={isActive} />
      </td>

      <td className="px-5 py-4">
        <BannerActions
          banner={banner}
          onView={onView}
          onEdit={onEdit}
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
}) {
  const title =
    banner.title ||
    banner.heading ||
    banner.name ||
    "Untitled Banner";

  const description =
    banner.description ||
    banner.subtitle ||
    "";

  const badge =
    banner.badge ||
    banner.tag ||
    "—";

  const buttonText =
    banner.buttonText ||
    banner.ctaText ||
    banner.buttonLabel ||
    "Shop Now";

  const image =
    banner.image ||
    banner.imageUrl ||
    banner.backgroundImage;

  const isActive =
    banner.active !== false;

  return (
    <article className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
      <div className="aspect-[16/7] overflow-hidden bg-surface-container">
        <BannerImage
          src={image}
          alt={title}
          large
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {title}
            </p>

            <p className="mt-1 text-xs leading-5 text-text-secondary">
              {description}
            </p>
          </div>

          <BannerStatus active={isActive} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoItem
            label="Badge"
            value={badge}
          />

          <InfoItem
            label="CTA"
            value={buttonText}
          />
        </div>

        <BannerActions
          banner={banner}
          onView={onView}
          onEdit={onEdit}
          mobile
        />
      </div>
    </article>
  );
}

/* =========================================================
   IMAGE
========================================================= */

function BannerImage({
  src,
  alt,
  large = false,
}) {
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
      alt={alt}
      loading="lazy"
      className={`h-full w-full object-cover ${
        large ? "" : "h-12 w-20 rounded-xl"
      }`}
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
  mobile = false,
}) {
  if (mobile) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onView(banner)}
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
          Preview
        </button>

        <button
          type="button"
          onClick={() => onEdit(banner)}
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
        onClick={() => onView(banner)}
        aria-label="Preview banner"
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
        onClick={() => onEdit(banner)}
        aria-label="Edit banner"
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
        aria-label="Delete banner"
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

function BannerStatus({
  active,
}) {
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

function InfoItem({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-surface-container p-3">
      <p className="text-[10px] text-text-secondary">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-text">
        {value}
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
        <Image
          size={21}
          className="text-text-secondary"
        />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-text">
        No banners found
      </h2>

      <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
        Add a banner or change your search.
      </p>
    </div>
  );
}

/* =========================================================
   KEY
========================================================= */

function getBannerKey(banner) {
  return String(
    banner.id ||
      banner._id ||
      banner.slug ||
      banner.title ||
      banner.heading,
  );
}

export default AdminBanners;
