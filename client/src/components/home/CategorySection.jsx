import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import { getActiveCategories } from "../../services/categoryService";

function CategorySection() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getActiveCategories();

        console.log("Active categories:", response);

        if (response?.success && Array.isArray(response.categories)) {
          setCategories(response.categories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const openCategory = (category) => {
    if (!category?.slug) {
      console.error("Category slug is missing:", category);
      return;
    }

    // Use the real category slug in the URL.
    // Example:
    // /products?category=electronics
    navigate(`/products?category=${category.slug}`);
  };

  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Explore</p>

            <h2 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">
              Shop by Categories
            </h2>
          </div>

          <Button
            variant="text"
            size="small"
            onClick={() => navigate("/products")}
          >
            View all
            <ArrowRight size={16} />
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-outline-variant bg-surface"
              >
                <div className="aspect-square bg-surface-container" />

                <div className="space-y-2 p-3.5">
                  <div className="h-4 w-3/4 rounded bg-surface-container" />
                  <div className="h-3 w-1/2 rounded bg-surface-container" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real Categories */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => openCategory(category)}
                className="
                  group
                  overflow-hidden
                  rounded-2xl
                  border
                  border-outline-variant
                  bg-surface
                  text-left
                  transition
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-primary/20
                  hover:shadow-md
                  focus-visible:outline-2
                  focus-visible:outline-primary
                "
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-surface-container">
                  {category.image?.url ? (
                    <img
                      src={category.image.url}
                      alt={category.name}
                      className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-300
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-text-secondary">
                      No image
                    </div>
                  )}
                </div>

                {/* Information */}
                <div className="p-3.5">
                  <p className="text-sm font-semibold text-text">
                    {category.name}
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    {category.productCount ?? 0}{" "}
                    {category.productCount === 1 ? "product" : "products"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Categories */}
        {!loading && categories.length === 0 && (
          <div className="rounded-2xl border border-outline-variant bg-surface p-8 text-center">
            <p className="text-sm text-text-secondary">
              No categories are available right now.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CategorySection;
