import { ArrowRight } from "lucide-react";

import Button from "../ui/Button";

function HomeCTA() {
  return (
    <section className="border-t border-outline-variant bg-surface py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-primary">ARFusion Commerce</p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Everything you need in one place
        </h2>

        <p className="mx-auto mt-3 max-w-2xl leading-7 text-text-secondary">
          Discover products, great deals, secure checkout, and a modern shopping
          experience in one place.
        </p>

        <div className="mt-7 flex justify-center">
          <Button size="large">
            Start Shopping
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default HomeCTA;
