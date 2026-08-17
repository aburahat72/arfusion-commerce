import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import categories from "../../data/categories";

function CategorySection() {
  const navigate = useNavigate();

  const openCategory = (categoryName) => {
    const category = categoryName.toLowerCase();

    navigate(`/products?category=${category}`);
  };

  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
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

        {/* Categories */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <button
              key={category.id || category.name}
              type="button"
              onClick={() => openCategory(category.name)}
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
                <img
                  src={category.image}
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
              </div>

              {/* Information */}
              <div className="p-3.5">
                <p className="text-sm font-semibold text-text">
                  {category.name}
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  {category.items}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategorySection;
