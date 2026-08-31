import { ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getPublicBanners } from "../../services/bannerPublicService";

// =====================================================
// DEFAULT COLORS
// Used only when a banner does not provide a color.
// These are visual defaults, NOT fallback banner content.
// =====================================================

const DEFAULT_COLORS = {
  blue: "#dbeafe",
  lavender: "#ede9fe",
  pink: "#fce7f3",
  body: "#e0e7ff",
  inner: "#ede9fe",
  innerPink: "#fbcfe8",
  platform: "#ddd6fe",
};

// =====================================================
// HERO
// =====================================================

function Hero() {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeIndex, setActiveIndex] = useState(0);

  // ===================================================
  // LOAD PUBLIC BANNERS
  // ===================================================

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPublicBanners();

      const validBanners = Array.isArray(data)
        ? data.filter((banner) => banner?._id)
        : [];

      setBanners(validBanners);
      setActiveIndex(0);
    } catch (error) {
      console.error("Load public banners error:", error);

      setBanners([]);
      setActiveIndex(0);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load banners.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadBanners();
  }, []);

  // ===================================================
  // AUTO SLIDE
  // ===================================================

  useEffect(() => {
    if (banners.length <= 1 || error || loading) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((previous) => {
        return (previous + 1) % banners.length;
      });
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [banners.length, error, loading]);

  // ===================================================
  // ACTIVE BANNER
  // ===================================================

  const activeBanner = useMemo(() => {
    if (!banners.length) {
      return null;
    }

    return banners[activeIndex] || banners[0];
  }, [banners, activeIndex]);

  // ===================================================
  // LOADING STATE
  // ===================================================

  if (loading) {
    return (
      <section className="border-b border-outline-variant bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-outline-variant bg-surface-container sm:min-h-[500px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={30} className="animate-spin text-primary" />

              <p className="text-sm text-text-secondary">Loading banners...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ===================================================
  // ERROR STATE
  //
  // IMPORTANT:
  // Never show a hardcoded promotional banner here.
  // ===================================================

  if (error) {
    return (
      <section className="border-b border-outline-variant bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-outline-variant bg-surface-container px-6 text-center sm:min-h-[500px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
              <RefreshCw size={24} className="text-error" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-text">
              Unable to load banners
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
              {error}
            </p>

            <p className="mt-1 max-w-md text-xs leading-5 text-text-secondary">
              Please check your network connection and try again.
            </p>

            <button
              type="button"
              onClick={loadBanners}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ===================================================
  // NO ACTIVE BANNERS
  // ===================================================

  if (!activeBanner) {
    return (
      <section className="border-b border-outline-variant bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-3xl border border-outline-variant bg-surface-container px-6 text-center">
            <div>
              <h2 className="text-lg font-semibold text-text">
                No promotional banners available
              </h2>

              <p className="mt-2 text-sm text-text-secondary">
                Please check back later.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ===================================================
  // DATA
  // ===================================================

  const colors = {
    ...DEFAULT_COLORS,
    ...(activeBanner.colors || {}),
  };

  const primaryButton = activeBanner.primaryButton || {};
  const secondaryButton = activeBanner.secondaryButton || {};

  const stats = Array.isArray(activeBanner.stats) ? activeBanner.stats : [];

  // ===================================================
  // CTA HANDLER
  // ===================================================

  const handleLink = (link) => {
    if (!link) {
      return;
    }

    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank", "noopener,noreferrer");

      return;
    }

    navigate(link);
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <section className="border-b border-outline-variant bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl bg-surface-container lg:grid-cols-[1.02fr_0.98fr]">
          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14 xl:p-16">
            {activeBanner.badge && (
              <span className="mb-5 inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary-container px-3.5 py-1.5 text-sm font-medium text-on-primary-container shadow-sm">
                {activeBanner.badge}
              </span>
            )}

            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-text sm:text-5xl lg:text-6xl">
              {activeBanner.titleStart}{" "}
              {activeBanner.titleHighlight && (
                <span className="text-primary">
                  {activeBanner.titleHighlight}
                </span>
              )}{" "}
              {activeBanner.titleEnd}
            </h1>

            {activeBanner.description && (
              <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
                {activeBanner.description}
              </p>
            )}

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="mt-8 flex flex-wrap gap-3">
              {primaryButton.text && (
                <button
                  type="button"
                  onClick={() => handleLink(primaryButton.link)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95"
                >
                  {primaryButton.text}

                  <ArrowRight size={16} />
                </button>
              )}

              {secondaryButton.text && (
                <button
                  type="button"
                  onClick={() => handleLink(secondaryButton.link)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-outline-variant bg-surface px-5 text-sm font-semibold text-text transition hover:bg-surface-container"
                >
                  {secondaryButton.text}
                </button>
              )}
            </div>

            {/* =================================================
                STATS
            ================================================= */}

            {stats.length > 0 && (
              <div className="mt-10 grid max-w-xl grid-cols-3 border-t border-outline-variant pt-6">
                {stats.map((stat, index) => (
                  <div
                    key={`${stat.label}-${index}`}
                    className={`
                      ${
                        index < stats.length - 1
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

          <div className="relative min-h-[390px] overflow-hidden bg-[#fcfcff] sm:min-h-[460px] lg:min-h-[540px]">
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

              <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" />
            </div>

            {/* =================================================
                TOP LEFT
            ================================================= */}

            <PublicBannerImage
              image={activeBanner.topLeft}
              className="absolute left-[7%] top-[6%] z-20 h-28 w-28 rotate-[-7deg] sm:h-36 sm:w-36 lg:h-40 lg:w-40"
            />

            {/* =================================================
                TOP RIGHT
            ================================================= */}

            <PublicBannerImage
              image={activeBanner.topRight}
              className="absolute right-[7%] top-[5%] z-20 h-28 w-28 rotate-[7deg] sm:h-36 sm:w-36 lg:h-40 lg:w-40"
            />

            {/* =================================================
                MAIN PRODUCT
            ================================================= */}

            <PublicBannerImage
              image={activeBanner.mainProduct}
              className="absolute left-1/2 top-[29%] z-30 h-48 w-64 -translate-x-1/2 rotate-[-7deg] sm:h-56 sm:w-72 lg:h-60 lg:w-80"
            />

            {/* =================================================
                BOTTOM LEFT
            ================================================= */}

            <PublicBannerImage
              image={activeBanner.bottomLeft}
              className="absolute bottom-[7%] left-[4%] z-20 h-24 w-24 -rotate-2 sm:h-28 sm:w-28 lg:h-32 lg:w-32"
            />

            {/* =================================================
                BOTTOM RIGHT
            ================================================= */}

            <PublicBannerImage
              image={activeBanner.bottomRight}
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
                SLIDE INDICATORS
            ================================================= */}

            {banners.length > 1 && (
              <div className="absolute bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-3 py-2 backdrop-blur">
                {banners.map((banner, index) => (
                  <button
                    key={banner._id}
                    type="button"
                    aria-label={`Go to banner ${index + 1}`}
                    onClick={() => setActiveIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeIndex
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}

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
// PUBLIC BANNER IMAGE
// =====================================================

function PublicBannerImage({ image, className }) {
  if (!image?.url) {
    return null;
  }

  return (
    <img
      src={image.url}
      alt={image.alt || "Banner image"}
      loading="lazy"
      className={`${className} object-contain mix-blend-multiply drop-shadow-[0_18px_20px_rgba(60,50,120,0.15)]`}
    />
  );
}

export default Hero;
