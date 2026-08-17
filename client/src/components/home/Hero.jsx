import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import Button from "../ui/Button";
import heroSlides from "../../data/heroSlides";

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = heroSlides[currentSlide];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1,
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="border-b border-outline-variant bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl bg-surface-container lg:grid-cols-[1.02fr_0.98fr]">
          {/* ================================================= */}
          {/* HERO CONTENT */}
          {/* ================================================= */}

          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14 xl:p-16">
            <span
              key={`${currentSlide}-badge`}
              className="mb-5 inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary-container px-3.5 py-1.5 text-sm font-medium text-on-primary-container shadow-sm"
            >
              {slide.badge}
            </span>

            <h1
              key={`${currentSlide}-title`}
              className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-text sm:text-5xl lg:text-6xl"
            >
              {slide.titleStart}{" "}
              <span className="text-primary">{slide.titleHighlight}</span>{" "}
              {slide.titleEnd}
            </h1>

            <p
              key={`${currentSlide}-description`}
              className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg"
            >
              {slide.description}
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="large">
                Shop Now
                <ArrowRight size={18} />
              </Button>

              <Button size="large" variant="outlined">
                Explore Deals
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-10 grid max-w-xl grid-cols-3 border-t border-outline-variant pt-6">
              <div className="border-r border-outline-variant pr-4 sm:pr-8">
                <p className="text-xl font-semibold text-text">20K+</p>

                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Happy Customers
                </p>
              </div>

              <div className="border-r border-outline-variant px-4 sm:px-8">
                <p className="text-xl font-semibold text-text">10K+</p>

                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Products
                </p>
              </div>

              <div className="pl-4 sm:pl-8">
                <p className="text-xl font-semibold text-text">99%</p>

                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Satisfaction
                </p>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* HERO VISUAL */}
          {/* ================================================= */}

          <div className="relative min-h-97.5 overflow-hidden bg-[#fcfcff] sm:min-h-115 lg:min-h-135">
            {/* ================================================= */}
            {/* BACKGROUND */}
            {/* ================================================= */}

            <div className="pointer-events-none absolute inset-0">
              {/* Blue glow */}
              <div
                className="absolute -right-20 -top-12 h-96 w-96 rounded-full blur-3xl transition-colors duration-1000"
                style={{
                  backgroundColor: slide.colors.blue,
                }}
              />

              {/* Lavender glow */}
              <div
                className="absolute -left-24 top-16 h-80 w-80 rounded-full blur-3xl transition-colors duration-1000"
                style={{
                  backgroundColor: slide.colors.lavender,
                }}
              />

              {/* Pink glow */}
              <div
                className="absolute -bottom-25 left-[28%] h-80 w-80 rounded-full blur-3xl transition-colors duration-1000"
                style={{
                  backgroundColor: slide.colors.pink,
                }}
              />

              {/* Main body */}
              <div
                className="absolute left-[3%] top-[25%] h-[54%] w-[86%] rotate-[-7deg] rounded-[50%] transition-colors duration-1000"
                style={{
                  backgroundColor: slide.colors.body,
                }}
              />

              {/* Inner lavender body */}
              <div
                className="absolute left-[20%] top-[31%] h-[43%] w-[69%] -rotate-3 rounded-[50%] transition-colors duration-1000"
                style={{
                  backgroundColor: slide.colors.inner,
                }}
              />

              {/* Inner pink body */}
              <div
                className="absolute left-[39%] top-[37%] h-[32%] w-[47%] rotate-[8deg] rounded-[50%] transition-colors duration-1000"
                style={{
                  backgroundColor: slide.colors.innerPink,
                }}
              />

              {/* Lower glow */}
              <div
                className="absolute bottom-[3%] left-[15%] h-24 w-[70%] rounded-[50%] blur-xl transition-colors duration-1000"
                style={{
                  backgroundColor: slide.colors.platform,
                }}
              />

              {/* Center light */}
              <div className="absolute left-1/2 top-1/2 h-105 w-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" />
            </div>

            {/* ================================================= */}
            {/* TOP LEFT PRODUCT */}
            {/* ================================================= */}

            <div
              key={`${currentSlide}-top-left`}
              className="absolute left-[7%] top-[6%] z-20"
            >
              <img
                src={slide.topLeft.src}
                alt={slide.topLeft.alt}
                className="
                  h-28
                  w-28
                  rotate-[-7deg]
                  object-cover
                  mix-blend-multiply
                  drop-shadow-[0_14px_16px_rgba(60,50,120,0.12)]
                  sm:h-36
                  sm:w-36
                  lg:h-40
                  lg:w-40
                "
              />
            </div>

            {/* ================================================= */}
            {/* TOP RIGHT PRODUCT */}
            {/* ================================================= */}

            <div
              key={`${currentSlide}-top-right`}
              className="absolute right-[7%] top-[5%] z-20"
            >
              <img
                src={slide.topRight.src}
                alt={slide.topRight.alt}
                className="
                  h-28
                  w-28
                  rotate-[7deg]
                  object-cover
                  mix-blend-multiply
                  drop-shadow-[0_14px_16px_rgba(60,50,120,0.12)]
                  sm:h-36
                  sm:w-36
                  lg:h-40
                  lg:w-40
                "
              />
            </div>

            {/* ================================================= */}
            {/* MAIN PRODUCT */}
            {/* ================================================= */}

            <div
              key={`${currentSlide}-main`}
              className="absolute left-1/2 top-[29%] z-30 -translate-x-1/2"
            >
              <img
                src={slide.mainProduct.src}
                alt={slide.mainProduct.alt}
                className="
                  h-48
                  w-64
                  rotate-[-7deg]
                  object-cover
                  mix-blend-multiply
                  drop-shadow-[0_26px_25px_rgba(60,50,120,0.18)]
                  sm:h-56
                  sm:w-72
                  lg:h-60
                  lg:w-80
                "
              />
            </div>

            {/* ================================================= */}
            {/* BOTTOM LEFT PRODUCT */}
            {/* ================================================= */}

            <div
              key={`${currentSlide}-bottom-left`}
              className="absolute bottom-[7%] left-[4%] z-20"
            >
              <img
                src={slide.bottomLeft.src}
                alt={slide.bottomLeft.alt}
                className="
                  h-24
                  w-24
                  -rotate-2
                  object-cover
                  mix-blend-multiply
                  drop-shadow-[0_14px_14px_rgba(60,50,120,0.12)]
                  sm:h-28
                  sm:w-28
                  lg:h-32
                  lg:w-32
                "
              />
            </div>

            {/* ================================================= */}
            {/* BOTTOM RIGHT PRODUCT */}
            {/* ================================================= */}

            <div
              key={`${currentSlide}-bottom-right`}
              className="absolute bottom-[6%] right-[4%] z-20"
            >
              <img
                src={slide.bottomRight.src}
                alt={slide.bottomRight.alt}
                className="
                  h-24
                  w-24
                  rotate-[4deg]
                  object-cover
                  mix-blend-multiply
                  drop-shadow-[0_14px_14px_rgba(60,50,120,0.12)]
                  sm:h-28
                  sm:w-28
                  lg:h-32
                  lg:w-32
                "
              />
            </div>

            {/* ================================================= */}
            {/* PRODUCT PLATFORM */}
            {/* ================================================= */}

            <div
              className="absolute bottom-[-4%] left-1/2 z-10 h-20 w-64 -translate-x-1/2 rounded-[50%] shadow-[0_18px_35px_rgba(103,80,164,0.15)] transition-colors duration-1000 sm:h-24 sm:w-80 lg:w-96"
              style={{
                backgroundColor: slide.colors.platform,
              }}
            >
              <div className="absolute left-1/2 -top-2.5 h-12 w-[92%] -translate-x-1/2 rounded-[50%] border border-white/60 bg-[#eeebff] shadow-[inset_0_4px_14px_rgba(255,255,255,0.8)] sm:h-14" />
            </div>

            {/* ================================================= */}
            {/* SLIDE INDICATORS */}
            {/* ================================================= */}

            <div className="absolute bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm backdrop-blur-md">
              {heroSlides.map((heroSlide, index) => (
                <button
                  key={heroSlide.id || index}
                  type="button"
                  aria-label={`Show hero slide ${index + 1}`}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "w-6 bg-primary"
                      : "w-2 bg-text-secondary/30"
                  }`}
                />
              ))}
            </div>

            {/* Edge highlight */}
            <div className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(255,255,255,0.22)_100%)]" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
