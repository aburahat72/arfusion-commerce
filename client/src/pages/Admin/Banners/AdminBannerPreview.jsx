import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getAdminBannerById } from "../../../services/bannerService";

// =====================================================
// ADMIN BANNER PREVIEW
// =====================================================

function AdminBannerPreview() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD BANNER
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadBanner = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("Banner ID is missing.");
        }

        const data = await getAdminBannerById(id);

        if (!mounted) {
          return;
        }

        if (!data) {
          throw new Error("Banner not found.");
        }

        setBanner(data);
      } catch (error) {
        console.error("Load banner preview error:", error);

        if (mounted) {
          setError(
            error.response?.data?.message ||
              error.message ||
              "Failed to load banner.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBanner();

    return () => {
      mounted = false;
    };
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

              <p className="text-sm text-text-secondary">Loading preview...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !banner) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px]">
          <button
            type="button"
            onClick={() => navigate("/admin/banners")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
          >
            <ArrowLeft size={17} />
            Back to Banners
          </button>

          <div className="rounded-2xl border border-error/20 bg-error/5 p-10 text-center">
            <XCircle size={32} className="mx-auto text-error" />

            <h2 className="mt-3 text-lg font-semibold text-text">
              Unable to load banner
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              {error || "Banner not found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/admin/banners")}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Back to Banners
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // COLORS
  // =====================================================

  const colors = {
    blue: "#dbeafe",
    lavender: "#ede9fe",
    pink: "#fce7f3",
    body: "#e0e7ff",
    inner: "#ede9fe",
    innerPink: "#fbcfe8",
    platform: "#ddd6fe",
    ...(banner.colors || {}),
  };

  // =====================================================
  // STATS
  // =====================================================

  const stats = Array.isArray(banner.stats) ? banner.stats : [];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/banners")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
            >
              <ArrowLeft size={17} />
              Back to Banners
            </button>

            <p className="text-sm text-text-secondary">
              Catalog / Banners / Preview
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Banner Preview
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-text-secondary">
              Preview exactly what this banner will look like on the storefront.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge active={banner.isActive} />

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/banners/${encodeURIComponent(
                    String(banner._id || id),
                  )}/edit`,
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-white transition hover:opacity-90"
            >
              <Edit3 size={15} />
              Edit Banner
            </button>
          </div>
        </div>

        {/* =================================================
            PREVIEW
        ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-sm">
          <div className="border-b border-outline-variant bg-surface-container/50 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Storefront Preview
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  /{banner.slug}
                </p>
              </div>

              <div className="text-xs text-text-secondary">
                Sort Order:{" "}
                <span className="font-semibold text-text">
                  {banner.sortOrder ?? 0}
                </span>
              </div>
            </div>
          </div>

          <HeroPreview banner={banner} colors={colors} />
        </section>

        {/* =================================================
            BANNER INFORMATION
        ================================================= */}

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <InfoCard
            title="Primary CTA"
            value={banner.primaryButton?.text || "—"}
            link={banner.primaryButton?.link}
          />

          <InfoCard
            title="Secondary CTA"
            value={banner.secondaryButton?.text || "—"}
            link={banner.secondaryButton?.link}
          />

          <InfoCard
            title="Status"
            value={
              banner.isActive
                ? "Visible on storefront"
                : "Hidden from storefront"
            }
          />
        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        {stats.length > 0 && (
          <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-text">
              Banner Statistics
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-surface-container p-4"
                >
                  <p className="text-xl font-semibold text-text">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

// =====================================================
// HERO PREVIEW
// =====================================================

function HeroPreview({ banner, colors }) {
  const primaryButton = banner.primaryButton || {};

  const secondaryButton = banner.secondaryButton || {};

  return (
    <section className="border-b border-outline-variant bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl bg-surface-container lg:grid-cols-[1.02fr_0.98fr]">
          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14 xl:p-16">
            <span className="mb-5 inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary-container px-3.5 py-1.5 text-sm font-medium text-on-primary-container shadow-sm">
              {banner.badge || "Banner"}
            </span>

            <h2 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-text sm:text-5xl lg:text-6xl">
              {banner.titleStart}{" "}
              <span className="text-primary">{banner.titleHighlight}</span>{" "}
              {banner.titleEnd}
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
              {banner.description}
            </p>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="mt-8 flex flex-wrap gap-3">
              <PreviewButton primary href={primaryButton.link}>
                {primaryButton.text || "Shop Now"}

                <ExternalLink size={16} />
              </PreviewButton>

              <PreviewButton href={secondaryButton.link}>
                {secondaryButton.text || "Explore Deals"}
              </PreviewButton>
            </div>

            {/* =================================================
                STATS
            ================================================= */}

            {statsExist(banner.stats) && (
              <div className="mt-10 grid max-w-xl grid-cols-3 border-t border-outline-variant pt-6">
                {banner.stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`
                        ${
                          index < banner.stats.length - 1
                            ? "border-r border-outline-variant"
                            : ""
                        }

                        ${
                          index === 0
                            ? "pr-4 sm:pr-8"
                            : index === 1
                              ? "px-4 sm:px-8"
                              : "pl-4 sm:pl-8"
                        }
                      `}
                  >
                    <p className="text-xl font-semibold text-text">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-text-secondary">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* =================================================
              VISUAL
          ================================================= */}

          <div className="relative min-h-97.5 overflow-hidden bg-[#fcfcff] sm:min-h-115 lg:min-h-135">
            {/* =================================================
                BACKGROUND
            ================================================= */}

            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute -right-20 -top-12 h-96 w-96 rounded-full blur-3xl"
                style={{
                  backgroundColor: colors.blue,
                }}
              />

              <div
                className="absolute -left-24 top-16 h-80 w-80 rounded-full blur-3xl"
                style={{
                  backgroundColor: colors.lavender,
                }}
              />

              <div
                className="absolute -bottom-25 left-[28%] h-80 w-80 rounded-full blur-3xl"
                style={{
                  backgroundColor: colors.pink,
                }}
              />

              <div
                className="absolute left-[3%] top-[25%] h-[54%] w-[86%] rotate-[-7deg] rounded-[50%]"
                style={{
                  backgroundColor: colors.body,
                }}
              />

              <div
                className="absolute left-[20%] top-[31%] h-[43%] w-[69%] -rotate-3 rounded-[50%]"
                style={{
                  backgroundColor: colors.inner,
                }}
              />

              <div
                className="absolute left-[39%] top-[37%] h-[32%] w-[47%] rotate-[8deg] rounded-[50%]"
                style={{
                  backgroundColor: colors.innerPink,
                }}
              />

              <div
                className="absolute bottom-[3%] left-[15%] h-24 w-[70%] rounded-[50%] blur-xl"
                style={{
                  backgroundColor: colors.platform,
                }}
              />

              <div className="absolute left-1/2 top-1/2 h-105 w-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" />
            </div>

            {/* =================================================
                TOP LEFT
            ================================================= */}

            <PreviewImage
              image={banner.topLeft}
              className="absolute left-[7%] top-[6%] z-20 h-28 w-28 rotate-[-7deg] sm:h-36 sm:w-36 lg:h-40 lg:w-40"
            />

            {/* =================================================
                TOP RIGHT
            ================================================= */}

            <PreviewImage
              image={banner.topRight}
              className="absolute right-[7%] top-[5%] z-20 h-28 w-28 rotate-[7deg] sm:h-36 sm:w-36 lg:h-40 lg:w-40"
            />

            {/* =================================================
                MAIN PRODUCT
            ================================================= */}

            <PreviewImage
              image={banner.mainProduct}
              className="absolute left-1/2 top-[29%] z-30 h-48 w-64 -translate-x-1/2 rotate-[-7deg] sm:h-56 sm:w-72 lg:h-60 lg:w-80"
            />

            {/* =================================================
                BOTTOM LEFT
            ================================================= */}

            <PreviewImage
              image={banner.bottomLeft}
              className="absolute bottom-[7%] left-[4%] z-20 h-24 w-24 -rotate-2 sm:h-28 sm:w-28 lg:h-32 lg:w-32"
            />

            {/* =================================================
                BOTTOM RIGHT
            ================================================= */}

            <PreviewImage
              image={banner.bottomRight}
              className="absolute bottom-[6%] right-[4%] z-20 h-24 w-24 rotate-[4deg] sm:h-28 sm:w-28 lg:h-32 lg:w-32"
            />

            {/* =================================================
                PLATFORM
            ================================================= */}

            <div
              className="absolute bottom-[-4%] left-1/2 z-10 h-20 w-64 -translate-x-1/2 rounded-[50%] shadow-[0_18px_35px_rgba(103,80,164,0.15)] sm:h-24 sm:w-80 lg:w-96"
              style={{
                backgroundColor: colors.platform,
              }}
            >
              <div className="absolute -top-2.5 left-1/2 h-12 w-[92%] -translate-x-1/2 rounded-[50%] border border-white/60 bg-[#eeebff] shadow-[inset_0_4px_14px_rgba(255,255,255,0.8)] sm:h-14" />
            </div>

            {/* =================================================
                ADMIN PREVIEW LABEL
            ================================================= */}

            <div className="absolute right-4 top-4 z-50 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">
              ADMIN PREVIEW
            </div>

            {/* =================================================
                EDGE
            ================================================= */}

            <div className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(255,255,255,0.22)_100%)]" />
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================================
// STATS EXIST
// =====================================================

function statsExist(stats) {
  return Array.isArray(stats) && stats.length > 0;
}

// =====================================================
// PREVIEW IMAGE
// =====================================================

function PreviewImage({ image, className }) {
  if (!image?.url) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-xl bg-black/5`}
      >
        <span className="text-[10px] text-text-secondary">
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      src={image.url}
      alt={image.alt || "Banner image"}
      loading="lazy"
      className={`${className} object-cover mix-blend-multiply drop-shadow-[0_18px_20px_rgba(60,50,120,0.15)]`}
    />
  );
}

// =====================================================
// PREVIEW BUTTON
// =====================================================

function PreviewButton({ children, href, primary = false }) {
  const handleClick = () => {
    if (!href) {
      return;
    }

    if (href.startsWith("http://") || href.startsWith("https://")) {
      window.open(href, "_blank", "noopener,noreferrer");

      return;
    }

    window.location.href = href;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        primary
          ? "inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
          : "inline-flex h-11 items-center gap-2 rounded-xl border border-outline-variant bg-surface px-5 text-sm font-semibold text-text transition hover:bg-surface-container"
      }
    >
      {children}
    </button>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ active }) {
  if (!active) {
    return (
      <span className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-error/10 px-3 text-xs font-semibold text-error">
        <XCircle size={14} />
        Inactive
      </span>
    );
  }

  return (
    <span className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-success/10 px-3 text-xs font-semibold text-success">
      <CheckCircle2 size={14} />
      Active
    </span>
  );
}

// =====================================================
// INFO CARD
// =====================================================

function InfoCard({ title, value, link }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
      <p className="text-xs text-text-secondary">{title}</p>

      <p className="mt-2 text-sm font-semibold text-text">{value}</p>

      {link && (
        <p className="mt-1 truncate text-xs text-text-secondary">{link}</p>
      )}
    </article>
  );
}

export default AdminBannerPreview;
