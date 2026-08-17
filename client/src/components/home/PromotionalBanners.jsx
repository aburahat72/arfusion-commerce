import { ArrowRight } from "lucide-react";

import Button from "../ui/Button";

function PromotionalBanners() {
  return (
    <section className="bg-background py-10 sm:py-14" id="deals">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        {/* New Arrivals */}
        <article className="group overflow-hidden rounded-3xl bg-[#ecebff] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7">
          <p className="text-sm font-medium text-primary">New Arrivals</p>

          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text">
            Fresh picks for you
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
            Explore the latest products added to our store.
          </p>

          <div className="mt-6">
            <Button size="medium">
              Shop now
              <ArrowRight size={17} />
            </Button>
          </div>
        </article>

        {/* Big Sale */}
        <article className="group overflow-hidden rounded-3xl bg-[#eaf3ff] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7">
          <p className="text-sm font-medium text-info">Big Sale</p>

          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text">
            Up to 50% OFF
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
            Limited-time offers across selected products.
          </p>

          <div className="mt-6">
            <Button variant="outlined" size="medium">
              Explore deals
            </Button>
          </div>
        </article>

        {/* Exclusive Offers */}
        <article className="group overflow-hidden rounded-3xl bg-[#f4edff] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7">
          <p className="text-sm font-medium text-primary">Exclusive Offers</p>

          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text">
            Save more with ARFusion
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
            Discover member-only deals and special discounts.
          </p>

          <div className="mt-6">
            <Button variant="tonal" size="medium">
              View offers
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}

export default PromotionalBanners;
