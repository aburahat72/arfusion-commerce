import { ArrowRight, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";

import products from "../../data/products";

function DealOfTheDay() {
  const navigate = useNavigate();

  // Select the deal product from the main product dataset
  const dealProduct = products.find((product) => product.id === "6");

  if (!dealProduct) {
    return null;
  }

  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#f1efff]">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#dcd4ff]/70 blur-3xl" />

          <div className="relative grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-1.5 text-xs font-semibold text-primary">
                <Clock3 size={14} />
                Deal of the Day
              </div>

              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                {dealProduct.name}
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-text-secondary sm:text-base">
                {dealProduct.description}
              </p>

              {/* Countdown */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="min-w-20 rounded-2xl bg-surface p-3 text-center shadow-sm">
                  <p className="text-2xl font-semibold text-text">02</p>

                  <p className="mt-1 text-xs text-text-secondary">Hours</p>
                </div>

                <div className="min-w-20 rounded-2xl bg-surface p-3 text-center shadow-sm">
                  <p className="text-2xl font-semibold text-text">45</p>

                  <p className="mt-1 text-xs text-text-secondary">Minutes</p>
                </div>

                <div className="min-w-20 rounded-2xl bg-surface p-3 text-center shadow-sm">
                  <p className="text-2xl font-semibold text-text">30</p>

                  <p className="mt-1 text-xs text-text-secondary">Seconds</p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-5 flex items-center gap-3">
                <span className="text-2xl font-bold text-text">
                  ₹{Number(dealProduct.price).toLocaleString("en-IN")}
                </span>

                {dealProduct.oldPrice && (
                  <span className="text-sm text-text-secondary line-through">
                    ₹{Number(dealProduct.oldPrice).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Shop Deal */}
              <div className="mt-6">
                <Button
                  size="large"
                  onClick={() => navigate(`/products/${dealProduct.id}`)}
                >
                  Shop Deal
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>

            {/* Product */}
            <div className="relative flex min-h-70 items-center justify-center sm:min-h-85">
              {/* Glow */}
              <div className="absolute h-64 w-64 rounded-full bg-white/80 blur-3xl" />

              {/* Product Image */}
              <img
                src={dealProduct.image}
                alt={dealProduct.name}
                className="
                  relative
                  z-10
                  h-56
                  w-72
                  rotate-[-5deg]
                  object-cover
                  mix-blend-multiply
                  drop-shadow-[0_25px_25px_rgba(60,50,120,0.18)]
                  sm:h-64
                  sm:w-80
                "
              />

              {/* Discount */}
              {dealProduct.discount && (
                <span className="absolute right-[8%] top-[8%] z-20 rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-white shadow-md">
                  {dealProduct.discount}
                </span>
              )}

              {/* Product Info */}
              <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-white/70 bg-white/80 px-5 py-3 text-center shadow-md backdrop-blur">
                <p className="text-sm font-semibold text-text">
                  {dealProduct.name}
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  {dealProduct.categoryLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DealOfTheDay;
