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

  /* =====================================================
     URL STATE
  ===================================================== */

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

  /* =====================================================
     PRICE FILTER STATE
  ===================================================== */

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  /* =====================================================
     MOBILE FILTER DRAWER
  ===================================================== */

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* =====================================================
     CATEGORY
  ===================================================== */

  const setCategory = (value) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    setSearchParams(params);
  };

  /* =====================================================
     SORT
  ===================================================== */

  const setSort = (value) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    setSearchParams(params);
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const setSearch = (value) => {
    const params = new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    setSearchParams(params);
  };

  /* =====================================================
     CLEAR SEARCH
  ===================================================== */

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams);

    params.delete("search");

    setSearchParams(params);
  };

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /* -------------------------------------------------
       SEARCH
    ------------------------------------------------- */

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || "";

        const productCategory = product.category?.toLowerCase() || "";

        const categoryLabel = product.categoryLabel?.toLowerCase() || "";

        const brand = product.brand?.toLowerCase() || "";

        const sku = product.sku?.toLowerCase() || "";

        const description = product.description?.toLowerCase() || "";

        return (
          name.includes(query) ||
          productCategory.includes(query) ||
          categoryLabel.includes(query) ||
          brand.includes(query) ||
          sku.includes(query) ||
          description.includes(query)
        );
      });
    }

    /* -------------------------------------------------
       CATEGORY
    ------------------------------------------------- */

    if (category) {
      result = result.filter(
        (product) => product.category?.toLowerCase() === category.toLowerCase(),
      );
    }

    /* -------------------------------------------------
       MINIMUM PRICE
    ------------------------------------------------- */

    if (minPrice !== "") {
      result = result.filter(
        (product) => Number(product.price) >= Number(minPrice),
      );
    }

    /* -------------------------------------------------
       MAXIMUM PRICE
    ------------------------------------------------- */

    if (maxPrice !== "") {
      result = result.filter(
        (product) => Number(product.price) <= Number(maxPrice),
      );
    }

    /* =================================================
       SORTING
    ================================================= */

    switch (sort) {
      /* ------------------------------------------------
         FEATURED
      ------------------------------------------------ */

      case "featured":
        result.sort((a, b) => {
          const ratingDifference =
            Number(b.rating || 0) - Number(a.rating || 0);

          if (ratingDifference !== 0) {
            return ratingDifference;
          }

          return Number(b.reviewCount || 0) - Number(a.reviewCount || 0);
        });

        break;

      /* ------------------------------------------------
         PRICE LOW → HIGH
      ------------------------------------------------ */

      case "price-low":
        result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));

        break;

      /* ------------------------------------------------
         PRICE HIGH → LOW
      ------------------------------------------------ */

      case "price-high":
        result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));

        break;

      /* ------------------------------------------------
         RATING
      ------------------------------------------------ */

      case "rating":
        result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

        break;

      /* ------------------------------------------------
         DEALS
      ------------------------------------------------ */

      case "deals":
        result = result.filter((product) => product.discount);

        result.sort((a, b) => {
          const discountA =
            Number(
              String(a.discount || "")
                .replace("%", "")
                .replace("-", ""),
            ) || 0;

          const discountB =
            Number(
              String(b.discount || "")
                .replace("%", "")
                .replace("-", ""),
            ) || 0;

          return discountB - discountA;
        });

        break;

      /* ------------------------------------------------
         NEWEST
      ------------------------------------------------ */

      case "newest":
        /*
         * Current static products.js does not contain
         * createdAt, so the original product order
         * is preserved.
         *
         * Later, when products come from MongoDB,
         * sort using createdAt.
         */
        break;

      default:
        break;
    }

    return result;
  }, [search, category, sort, minPrice, maxPrice]);

  /* =====================================================
     CLEAR ALL FILTERS
  ===================================================== */

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({});
  };

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =================================================
            BREADCRUMB
        ================================================= */}

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

          {search && (
            <>
              <span className="mx-2">/</span>

              <span className="font-medium text-primary">
                Search: "{search}"
              </span>
            </>
          )}
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {search
              ? `Search results for "${search}"`
              : category
                ? `${category.charAt(0).toUpperCase()}${category.slice(1)}`
                : "Products"}
          </h1>

          <p className="mt-2 text-sm text-text-secondary sm:text-base">
            {search
              ? `Showing products matching "${search}".`
              : category
                ? `Discover our ${category} products.`
                : "Discover products you'll love."}
          </p>
        </div>

        {/* =================================================
            PRODUCT SEARCH
        ================================================= */}

        <div className="mb-6 max-w-2xl">
          <div className="relative">
            {/* Search icon */}

            <Search
              size={19}
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-text-secondary
              "
            />

            {/* Search input */}

            <Input
              name="productSearch"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="pl-11 pr-11"
            />

            {/* Clear search */}

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear product search"
                className="
                  absolute
                  right-3
                  top-1/2
                  z-10
                  flex
                  h-8
                  w-8
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-lg
                  text-text-secondary
                  transition
                  hover:bg-surface-container
                  hover:text-text
                  focus-visible:outline-2
                  focus-visible:outline-primary
                "
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* =================================================
            MOBILE FILTER BUTTON
        ================================================= */}

        <div className="mb-5 lg:hidden">
          <Button variant="outlined" onClick={() => setIsFilterOpen(true)}>
            <Search size={17} />
            Filters
          </Button>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* =================================================
              DESKTOP FILTERS
          ================================================= */}

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

          {/* =================================================
              PRODUCT RESULTS
          ================================================= */}

          <section>
            {/* Results header */}

            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm text-text-secondary">
                Showing{" "}
                <span className="font-semibold text-text">
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </p>

              <div className="hidden sm:block">
                <Button variant="text" size="small" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            </div>

            {/* Product grid */}

            <ProductGrid products={filteredProducts} />
          </section>
        </div>
      </div>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {isFilterOpen && (
        <div className="fixed inset-0 z-100 lg:hidden">
          {/* Backdrop */}

          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setIsFilterOpen(false)}
            className="
              absolute
              inset-0
              bg-black/40
              backdrop-blur-sm
            "
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
