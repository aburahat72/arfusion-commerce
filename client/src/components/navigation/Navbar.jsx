import {
  Heart,
  Search,
  ShoppingCart,
  GitCompareArrows,
  X,
  ChevronDown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import IconButton from "../ui/IconButton";

import products from "../../data/products";

function Navbar() {
  const navigate = useNavigate();

  const searchRef = useRef(null);

  const cartItems = useSelector((state) => state.cart.items);

  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  /*
   * Search suggestions
   */
  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return products
      .filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";
        const categoryLabel = product.categoryLabel?.toLowerCase() || "";
        const brand = product.brand?.toLowerCase() || "";
        const sku = product.sku?.toLowerCase() || "";

        return (
          name.includes(query) ||
          category.includes(query) ||
          categoryLabel.includes(query) ||
          brand.includes(query) ||
          sku.includes(query)
        );
      })
      .slice(0, 5);
  }, [search]);

  /*
   * Show suggestions only when:
   * - input has text
   * - input is focused
   */
  const showSuggestions = isSearchFocused && search.trim().length > 0;

  /*
   * Search submit
   */
  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      navigate("/products");
      return;
    }

    /*
     * If a suggestion is selected,
     * open that product directly.
     */
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      const selectedProduct = suggestions[selectedIndex];

      const productId = selectedProduct.id || selectedProduct._id;

      setSearch("");
      setSelectedIndex(-1);
      setIsSearchFocused(false);

      navigate(`/products/${productId}`);

      return;
    }

    /*
     * Normal keyword search.
     */
    navigate(`/products?search=${encodeURIComponent(query)}`);

    /*
     * Clear Navbar search after submitting.
     */
    setSearch("");
    setSelectedIndex(-1);
    setIsSearchFocused(false);
  };

  /*
   * Click product suggestion
   */
  const handleSuggestionClick = (product) => {
    const productId = product.id || product._id;

    setSearch("");
    setSelectedIndex(-1);
    setIsSearchFocused(false);

    navigate(`/products/${productId}`);
  };

  /*
   * Clear search text only.
   *
   * It does NOT navigate anywhere.
   */
  const handleClearSearch = () => {
    setSearch("");
    setSelectedIndex(-1);
  };

  /*
   * Keyboard navigation
   */
  const handleSearchKeyDown = (event) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === "Escape") {
        setIsSearchFocused(false);
      }

      return;
    }

    /*
     * Arrow Down
     */
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setSelectedIndex((current) => {
        if (current >= suggestions.length - 1) {
          return 0;
        }

        return current + 1;
      });

      return;
    }

    /*
     * Arrow Up
     */
    if (event.key === "ArrowUp") {
      event.preventDefault();

      setSelectedIndex((current) => {
        if (current <= 0) {
          return suggestions.length - 1;
        }

        return current - 1;
      });

      return;
    }

    /*
     * Escape
     */
    if (event.key === "Escape") {
      event.preventDefault();

      setIsSearchFocused(false);
      setSelectedIndex(-1);

      return;
    }
  };

  /*
   * Close suggestions when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex h-18 items-center gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex shrink-0 items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <ShoppingCart size={20} />
            </div>

            <span className="hidden text-lg font-semibold text-text sm:block">
              ARFusion
            </span>
          </button>

          {/* Search */}
          <form
            ref={searchRef}
            onSubmit={handleSearch}
            className="relative mx-auto hidden max-w-xl flex-1 md:block"
          >
            <div className="relative">
              {/* Search icon */}
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-text-secondary"
              />

              {/* Search input */}
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedIndex(-1);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for products, brands and more..."
                aria-label="Search products"
                aria-autocomplete="list"
                aria-expanded={showSuggestions}
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-outline-variant
                  bg-surface-container
                  pl-11
                  pr-20
                  text-sm
                  text-text
                  outline-none
                  transition
                  placeholder:text-text-secondary
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                "
              />

              {/* Clear button */}
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="
                    absolute
                    right-11
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
                    hover:bg-surface
                    hover:text-text
                    focus-visible:outline-2
                    focus-visible:outline-primary
                  "
                >
                  <X size={16} />
                </button>
              )}

              {/* Search button */}
              <button
                type="submit"
                aria-label="Search"
                className="
                  absolute
                  right-2
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
                  hover:bg-surface
                  hover:text-primary
                  focus-visible:outline-2
                  focus-visible:outline-primary
                "
              >
                <Search size={17} />
              </button>
            </div>

            {/* Suggestions */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-xl">
                {suggestions.length > 0 ? (
                  <>
                    {/* Suggestion header */}
                    <div className="border-b border-outline-variant px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        Products
                      </p>
                    </div>

                    {/* Products */}
                    <div className="p-2">
                      {suggestions.map((product, index) => {
                        const productId = product.id || product._id;

                        const isSelected = index === selectedIndex;

                        return (
                          <button
                            key={productId}
                            type="button"
                            onMouseDown={(event) => {
                              /*
                               * Prevent input blur
                               * before click executes.
                               */
                              event.preventDefault();
                            }}
                            onClick={() => handleSuggestionClick(product)}
                            className={`
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-xl
                              p-2
                              text-left
                              transition
                              ${
                                isSelected
                                  ? "bg-surface-container"
                                  : "hover:bg-surface-container"
                              }
                            `}
                          >
                            {/* Product image */}
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                              <img
                                src={product.image}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* Product information */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-text">
                                {product.name}
                              </p>

                              <div className="mt-0.5 flex items-center gap-2">
                                <span className="text-xs capitalize text-text-secondary">
                                  {product.categoryLabel || product.category}
                                </span>

                                {product.brand && (
                                  <>
                                    <span className="text-xs text-outline">
                                      •
                                    </span>

                                    <span className="truncate text-xs text-text-secondary">
                                      {product.brand}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <span className="shrink-0 text-sm font-semibold text-text">
                              ₹{Number(product.price).toLocaleString("en-IN")}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* View all results */}
                    <button
                      type="submit"
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        border-t
                        border-outline-variant
                        px-4
                        py-3
                        text-sm
                        font-medium
                        text-primary
                        transition
                        hover:bg-surface-container
                      "
                    >
                      Search for "{search.trim()}"
                      <Search size={15} className="ml-2" />
                    </button>
                  </>
                ) : (
                  /* No results */
                  <div className="px-5 py-8 text-center">
                    <Search size={24} className="mx-auto text-text-secondary" />

                    <p className="mt-3 text-sm font-medium text-text">
                      No products found
                    </p>

                    <p className="mt-1 text-xs text-text-secondary">
                      Try another product, brand, or keyword.
                    </p>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1">
            {/* Desktop wishlist */}
            <div className="hidden lg:block">
              <Button
                variant="text"
                size="small"
                onClick={() => navigate("/wishlist")}
              >
                <Heart size={18} />
                Wishlist
              </Button>
            </div>

            {/* Desktop compare */}
            <div className="hidden lg:block">
              <Button
                variant="text"
                size="small"
                onClick={() => navigate("/compare")}
              >
                <GitCompareArrows size={18} />
                Compare
              </Button>
            </div>

            {/* Mobile wishlist */}
            <IconButton
              label="Wishlist"
              size="medium"
              variant="standard"
              onClick={() => navigate("/wishlist")}
            >
              <Heart size={20} />
            </IconButton>

            {/* Cart */}
            <div className="relative">
              <IconButton
                label="Shopping cart"
                size="medium"
                variant="standard"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart size={20} />
              </IconButton>

              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </div>

            {/* Account */}
            <button
              type="button"
              className="ml-2 hidden items-center gap-2 rounded-xl p-1.5 transition hover:bg-surface-container sm:flex"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-primary">
                J
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium text-text">John Doe</p>

                <p className="text-xs text-text-secondary">Premium Member</p>
              </div>

              <ChevronDown size={17} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Navigation row */}
        <nav className="hidden h-12 items-center gap-8 md:flex">
          {/* Categories */}
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-text transition hover:text-primary"
          >
            Categories
            <ChevronDown size={15} />
          </button>

          {/* Products */}
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="text-sm font-medium text-text-secondary transition hover:text-primary"
          >
            Products
          </button>

          {/* Deals */}
          <button
            type="button"
            onClick={() => navigate("/products?sort=deals")}
            className="text-sm font-medium text-text-secondary transition hover:text-primary"
          >
            Deals
          </button>

          {/* New Arrivals */}
          <button
            type="button"
            onClick={() => navigate("/products?sort=newest")}
            className="text-sm font-medium text-text-secondary transition hover:text-primary"
          >
            New Arrivals
          </button>

          {/* Brands */}
          <button
            type="button"
            onClick={() => navigate("/brands")}
            className="text-sm font-medium text-text-secondary transition hover:text-primary"
          >
            Brands
          </button>

          {/* Track Order */}
          <button
            type="button"
            onClick={() => navigate("/track-order")}
            className="text-sm font-medium text-text-secondary transition hover:text-primary"
          >
            Track Order
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
