import { ArrowRight } from "lucide-react";

import Button from "../ui/Button";
import ProductCard from "../product/ProductCard";

import products from "../../data/products";

function FeaturedProducts() {
  // Select products for the Featured section
  const featuredProducts = products.slice(0, 6);

  return (
    <section className="border-y border-outline-variant bg-surface py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Handpicked</p>

            <h2 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">
              Featured Products
            </h2>
          </div>

          <Button variant="text" size="small">
            View all
            <ArrowRight size={16} />
          </Button>
        </div>

        {/* Featured products */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
