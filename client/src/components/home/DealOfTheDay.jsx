// =====================================================
// DEAL OF THE DAY — HOME COMPONENT
// =====================================================
// Fetches the active deal from the backend.
// Shows a live countdown to the expiry time.
// Falls back gracefully when no deal is active.

import { useEffect, useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Button from "../ui/Button";
import { getActiveDeal } from "../../services/dealService";

// =====================================================
// COUNTDOWN HOOK
// =====================================================

function useCountdown(targetDate) {
  const getTimeLeft = () => {
    // If no target date provided, default to midnight tonight
    if (!targetDate) {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const diff = endOfDay.getTime() - Date.now();
      const totalSeconds = Math.max(0, Math.floor(diff / 1000));

      return {
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        expired: false,
      };
    }

    const diff = new Date(targetDate).getTime() - Date.now();

    if (isNaN(diff) || diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, expired: false };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

// =====================================================
// COUNTDOWN DISPLAY BLOCK
// =====================================================

function CountdownBlock({ value, label }) {
  return (
    <div className="min-w-20 rounded-2xl bg-surface p-3 text-center shadow-sm">
      <p className="text-2xl font-semibold text-text tabular-nums">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

// =====================================================
// DEAL OF THE DAY
// =====================================================

function DealOfTheDay() {
  const navigate = useNavigate();

  const {
    data: deal,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["deal-of-the-day"],
    queryFn: getActiveDeal,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const expiryTarget = deal?.expiresAt || deal?.endsAt || null;
  const timeLeft = useCountdown(expiryTarget);

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="bg-background py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-3xl bg-[#f1efff] p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div className="h-6 w-36 rounded-full bg-primary/20" />
                <div className="h-10 w-3/4 rounded-lg bg-primary/10" />
                <div className="h-4 w-full rounded bg-primary/10" />
                <div className="h-4 w-5/6 rounded bg-primary/10" />
              </div>
              <div className="flex min-h-70 items-center justify-center">
                <div className="h-56 w-72 rounded-2xl bg-primary/10" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No deal or error — render nothing
  if (isError || !deal || !deal.product) {
    return null;
  }

  // If deal had an explicit expiry and it expired
  if (expiryTarget && timeLeft.expired) {
    return null;
  }

  const product = deal.product;

  // Resolve product image (deal override -> product images)
  const productImage =
    deal.image?.url ||
    (typeof deal.image === "string" ? deal.image : "") ||
    product.images?.[0]?.url ||
    (typeof product.images?.[0] === "string" ? product.images[0] : "") ||
    product.image ||
    "";

  // Resolve discount badge
  const discount =
    deal.discountLabel || deal.discount || product.discount || "";

  // Resolve product ID for navigation
  const productId = product._id || product.id;

  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#f1efff]">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#dcd4ff]/70 blur-3xl" />

          <div className="relative grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            {/* Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-1.5 text-xs font-semibold text-primary">
                <Clock3 size={14} />
                {deal.badge || "Deal of the Day"}
              </div>

              {/* Title */}
              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                {deal.title}
              </h2>

              {/* Description */}
              <p className="mt-3 max-w-lg text-sm leading-6 text-text-secondary sm:text-base">
                {deal.description}
              </p>

              {/* Countdown */}
              <div className="mt-6 flex flex-wrap gap-3">
                <CountdownBlock value={timeLeft.hours} label="Hours" />
                <CountdownBlock value={timeLeft.minutes} label="Minutes" />
                <CountdownBlock value={timeLeft.seconds} label="Seconds" />
              </div>

              {/* Price */}
              <div className="mt-5 flex items-center gap-3">
                <span className="text-2xl font-bold text-text">
                  ₹{Number(product.price || 0).toLocaleString("en-IN")}
                </span>

                {product.oldPrice && (
                  <span className="text-sm text-text-secondary line-through">
                    ₹{Number(product.oldPrice).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* CTA */}
              <div className="mt-6">
                <Button
                  size="large"
                  onClick={() => navigate(`/products/${productId}`)}
                >
                  Shop Deal
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>

            {/* Product Image */}
            <div className="relative flex min-h-70 items-center justify-center sm:min-h-85">
              {/* Glow */}
              <div className="absolute h-64 w-64 rounded-full bg-white/80 blur-3xl" />

              {productImage ? (
                <img
                  src={productImage}
                  alt={product.name}
                  className="relative z-10 h-56 w-72 rotate-[-5deg] object-cover mix-blend-multiply drop-shadow-[0_25px_25px_rgba(60,50,120,0.18)] sm:h-64 sm:w-80"
                />
              ) : (
                <div className="relative z-10 flex h-56 w-72 items-center justify-center rounded-2xl bg-primary/10 sm:h-64 sm:w-80">
                  <span className="text-sm text-text-secondary">No image</span>
                </div>
              )}

              {/* Discount badge */}
              {discount && (
                <span className="absolute right-[8%] top-[8%] z-20 rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-white shadow-md">
                  {discount}
                </span>
              )}

              {/* Product Info Card */}
              <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-white/70 bg-white/80 px-5 py-3 text-center shadow-md backdrop-blur">
                <p className="text-sm font-semibold text-text">
                  {product.name}
                </p>
                {product.categoryLabel && (
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {product.categoryLabel}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DealOfTheDay;
