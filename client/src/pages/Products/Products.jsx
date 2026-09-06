import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import ProductFilters from "../../components/product/ProductFilters";
import ProductGrid from "../../components/product/ProductGrid";

import { getAllProducts } from "../../services/productService";
import { getActiveCategories } from "../../services/categoryService";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  /* =====================================================
     URL STATE
  ===================================================== */

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

  /* =====================================================
     PRODUCTS
  ===================================================== */

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     CATEGORIES
  ===================================================== */

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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
     FETCH ACTIVE CATEGORIES
  ===================================================== */

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);

        const response = await getActiveCategories();

        if (!isMounted) return;

        if (response?.success) {
          setCategories(response.categories || []);
        } else {
          setCategories([]);
        }
      } catch (error) {
        if (!isMounted) return;

        console.error("Categories fetch error:", error);
        setCategories([]);
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =====================================================
     FETCH REAL PRODUCTS
  ===================================================== */

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllProducts({
          search: search.trim() || undefined,
          category: category || undefined,
          minPrice: minPrice !== "" ? minPrice : undefined,
          maxPrice: maxPrice !== "" ? maxPrice : undefined,
          page: 1,
          limit: 100,
        });

        if (!isMounted) return;

        if (response?.success) {
          setProducts(response.products || []);
        } else {
          setProducts([]);
          setError(response?.message || "Unable to load products");
        }
      } catch (err) {
        if (!isMounted) return;

        console.error("Products fetch error:", err);

        setProducts([]);

        setError(
          err?.response?.data?.message ||
            "Unable to load products. Please try again.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [search, category, minPrice, maxPrice]);

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
     SORT REAL PRODUCTS
  ===================================================== */

  const sortedProducts = [...products];

  switch (sort) {
    case "featured":
      sortedProducts.sort((a, b) => {
        const ratingDifference = Number(b.rating || 0) - Number(a.rating || 0);

        if (ratingDifference !== 0) {
          return ratingDifference;
        }

        return Number(b.reviewCount || 0) - Number(a.reviewCount || 0);
      });

      break;

    case "price-low":
      sortedProducts.sort(
        (a, b) => Number(a.price || 0) - Number(b.price || 0),
      );

      break;

    case "price-high":
      sortedProducts.sort(
        (a, b) => Number(b.price || 0) - Number(a.price || 0),
      );

      break;

    case "rating":
      sortedProducts.sort(
        (a, b) => Number(b.rating || 0) - Number(a.rating || 0),
      );

      break;

    case "deals":
      sortedProducts.sort((a, b) => {
        const discountA = Number(a.discount || 0);
        const discountB = Number(b.discount || 0);

        return discountB - discountA;
      });

      break;

    case "newest":
      sortedProducts.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );

      break;

    default:
      break;
  }

  /* =====================================================
     CLEAR ALL FILTERS
  ===================================================== */

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({});
  };

  /* =====================================================
     DISPLAY CATEGORY
  ===================================================== */

  const categoryFromList = categories.find(
    (item) =>
      item.slug === category || item._id === category || item.id === category,
  );

  const categoryName =
    categoryFromList?.name ||
    (products.length > 0 && products[0]?.category?.name
      ? products[0].category.name
      : category);

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
                {categoryName || category}
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
                ? categoryName ||
                  `${category.charAt(0).toUpperCase()}${category.slice(1)}`
                : "Products"}
          </h1>

          <p className="mt-2 text-sm text-text-secondary sm:text-base">
            {search
              ? `Showing products matching "${search}".`
              : category
                ? `Discover our ${categoryName || category} products.`
                : "Discover products you'll love."}
          </p>
        </div>

        {/* =================================================
            PRODUCT SEARCH
        ================================================= */}

        <div className="mb-6 max-w-2xl">
          <div className="relative">
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

            <Input
              name="productSearch"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="pl-11 pr-11"
            />

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
              categories={categories}
              categoriesLoading={categoriesLoading}
            />
          </aside>

          {/* =================================================
              PRODUCT RESULTS
          ================================================= */}

          <section>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm text-text-secondary">
                Showing{" "}
                <span className="font-semibold text-text">
                  {loading ? "..." : sortedProducts.length}
                </span>{" "}
                {sortedProducts.length === 1 ? "product" : "products"}
              </p>

              <div className="hidden sm:block">
                <Button variant="text" size="small" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            </div>

            {loading && (
              <div className="rounded-2xl border border-outline-variant bg-surface p-10 text-center">
                <p className="text-sm text-text-secondary">
                  Loading products...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-outline-variant bg-surface p-10 text-center">
                <h3 className="text-lg font-semibold text-text">
                  Unable to load products
                </h3>

                <p className="mt-2 text-sm text-text-secondary">{error}</p>

                <div className="mt-5">
                  <Button
                    variant="outlined"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {!loading && !error && <ProductGrid products={sortedProducts} />}
          </section>
        </div>
      </div>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {isFilterOpen && (
        <div className="fixed inset-0 z-100 lg:hidden">
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
                categories={categories}
                categoriesLoading={categoriesLoading}
              />
            </div>

            <div className="border-t border-outline-variant bg-surface p-4">
              <Button
                size="large"
                className="w-full"
                onClick={() => setIsFilterOpen(false)}
              >
                Show {sortedProducts.length}{" "}
                {sortedProducts.length === 1 ? "Product" : "Products"}
              </Button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Products;
