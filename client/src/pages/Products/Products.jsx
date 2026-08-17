import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import ProductFilters from "../../components/product/ProductFilters";
import ProductGrid from "../../components/product/ProductGrid";

import products from "../../data/products";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Mobile filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Read category directly from URL
  const category = searchParams.get("category") || "";

  // Update category in URL
  const setCategory = (value) => {
    if (value) {
      setSearchParams({
        category: value,
      });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /* Search */
    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.categoryLabel?.toLowerCase().includes(query),
      );
    }

    /* Category */
    if (category) {
      result = result.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase(),
      );
    }

    /* Minimum price */
    if (minPrice !== "") {
      result = result.filter((product) => product.price >= Number(minPrice));
    }

    /* Maximum price */
    if (maxPrice !== "") {
      result = result.filter((product) => product.price <= Number(maxPrice));
    }

    /* Sorting */
    switch (sort) {
      case "featured":
        result.sort((a, b) => {
          const ratingDifference = b.rating - a.rating;

          if (ratingDifference !== 0) {
            return ratingDifference;
          }

          return (b.reviewCount || 0) - (a.reviewCount || 0);
        });
        break;

      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;

      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;

      case "newest":
        result.reverse();
        break;

      default:
        break;
    }

    return result;
  }, [search, category, sort, minPrice, maxPrice]);

  const clearFilters = () => {
    setSearch("");
    setSort("");
    setMinPrice("");
    setMaxPrice("");
    setCategory("");
  };

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-text-secondary">
          <span>Home</span>

          <span className="mx-2">/</span>

          <span className="font-medium text-text">Products</span>

          {category && (
            <>
              <span className="mx-2">/</span>

              <span className="font-medium capitalize text-primary">
                {category}
              </span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {category
              ? `${category.charAt(0).toUpperCase()}${category.slice(1)}`
              : "Products"}
          </h1>

          <p className="mt-2 text-sm text-text-secondary sm:text-base">
            {category
              ? `Discover our ${category} products.`
              : "Discover products you'll love."}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-2xl">
          <div className="relative">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
            />

            <Input
              name="productSearch"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
            />
          </div>
        </div>

        {/* Mobile filter button */}
        <div className="mb-5 lg:hidden">
          <Button variant="outlined" onClick={() => setIsFilterOpen(true)}>
            <Search size={17} />
            Filters
          </Button>
        </div>

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Desktop filters */}
          <aside className="hidden lg:block">
            <ProductFilters
              category={category}
              setCategory={setCategory}
              sort={sort}
              setSort={setSort}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              onClear={clearFilters}
            />
          </aside>

          {/* Products */}
          <section>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm text-text-secondary">
                Showing{" "}
                <span className="font-semibold text-text">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>

              <div className="hidden sm:block">
                <Button variant="text" size="small" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            </div>

            <ProductGrid products={filteredProducts} />
          </section>
        </div>
      </div>

      {/* ================================================= */}
      {/* MOBILE FILTER DRAWER */}
      {/* ================================================= */}

      {isFilterOpen && (
        <div className="fixed inset-0 z-100 lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setIsFilterOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <aside
            className="
              absolute
              right-0
              top-0
              flex
              h-full
              w-[min(90%,380px)]
              flex-col
              bg-background
              shadow-2xl
            "
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-text">Filters</h2>

                <p className="mt-0.5 text-xs text-text-secondary">
                  Refine your products
                </p>
              </div>

              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setIsFilterOpen(false)}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  text-text-secondary
                  transition
                  hover:bg-surface-container
                  hover:text-text
                "
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-5">
              <ProductFilters
                category={category}
                setCategory={setCategory}
                sort={sort}
                setSort={setSort}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                onClear={clearFilters}
              />
            </div>

            {/* Drawer footer */}
            <div className="border-t border-outline-variant bg-surface p-4">
              <Button
                size="large"
                className="w-full"
                onClick={() => setIsFilterOpen(false)}
              >
                Show {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "Product" : "Products"}
              </Button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Products;
