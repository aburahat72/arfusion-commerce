import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import ProductCard from "../product/ProductCard";

import { getAllProducts } from "../../services/productService";

function FeaturedProducts() {
  const navigate = useNavigate();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);

        const data = await getAllProducts({
          page: 1,
          limit: 6,
        });

        if (data?.success && Array.isArray(data.products)) {
          setFeaturedProducts(data.products);
        } else {
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleViewAll = () => {
    navigate("/products");
  };

  return (
    <section className="border-y border-outline-variant bg-surface py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Handpicked</p>

            <h2 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">
              Featured Products
            </h2>
          </div>

          <Button variant="text" size="small" onClick={handleViewAll}>
            View all
            <ArrowRight size={16} />
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-lg bg-surface-container"
              />
            ))}
          </div>
        )}

        {/* Products */}
        {!loading && featuredProducts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && featuredProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-text-secondary">
              No featured products available.
            </p>

            <div className="mt-4">
              <Button variant="text" size="small" onClick={handleViewAll}>
                Browse all products
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
