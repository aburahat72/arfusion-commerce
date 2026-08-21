import {
  Heart,
  Search,
  ShoppingCart,
  GitCompareArrows,
  X,
  ChevronDown,
  Menu,
  User,
  Package,
  LayoutGrid,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import IconButton from "../ui/IconButton";

import products from "../../data/products";

function Navbar() {
  const navigate = useNavigate();

  /* =====================================================
     REFS
  ===================================================== */

  const searchRef = useRef(null);
  const mobileNavRef = useRef(null);

  const mobileNavTimerRef = useRef(null);
  const mobileNavResumeRef = useRef(null);
  const mobileNavAnimationRef = useRef(null);

  /* =====================================================
     REDUX STATE
  ===================================================== */

  const cartItems = useSelector((state) => state.cart.items);

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const compareItems = useSelector((state) => state.compare?.items || []);

  /* =====================================================
     UI STATE
  ===================================================== */

  const [search, setSearch] = useState("");

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* =====================================================
     COUNTS
  ===================================================== */

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const wishlistCount = wishlistItems.length;

  const compareCount = compareItems.length;

  /* =====================================================
     SEARCH SUGGESTIONS
  ===================================================== */

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

  const showSuggestions = isSearchFocused && search.trim().length > 0;

  /* =====================================================
     MOBILE NAVIGATION
  ===================================================== */

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigateTo = (path) => {
    closeMobileMenu();
    navigate(path);
  };

  /* =====================================================
     SEARCH SUBMIT
  ===================================================== */

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
     * Clear search after submit.
     */
    setSearch("");
    setSelectedIndex(-1);
    setIsSearchFocused(false);
  };

  /* =====================================================
     SUGGESTION CLICK
  ===================================================== */

  const handleSuggestionClick = (product) => {
    const productId = product.id || product._id;

    setSearch("");
    setSelectedIndex(-1);
    setIsSearchFocused(false);

    navigate(`/products/${productId}`);
  };

  /* =====================================================
     CLEAR SEARCH
  ===================================================== */

  const handleClearSearch = () => {
    /*
     * Only clear text.
     * Do not navigate.
     */
    setSearch("");
    setSelectedIndex(-1);
  };

  /* =====================================================
     SEARCH KEYBOARD NAVIGATION
  ===================================================== */

  const handleSearchKeyDown = (event) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === "Escape") {
        setIsSearchFocused(false);
        setSelectedIndex(-1);
      }

      return;
    }

    /* Arrow Down */

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

    /* Arrow Up */

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

    /* Escape */

    if (event.key === "Escape") {
      event.preventDefault();

      setIsSearchFocused(false);
      setSelectedIndex(-1);
    }
  };

  /* =====================================================
     CLICK OUTSIDE SEARCH
  ===================================================== */

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

  /* =====================================================
     LOCK BODY WHEN MOBILE MENU IS OPEN
  ===================================================== */

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  /* =====================================================
     MOBILE NAV AUTO SCROLL

     Professional e-commerce behavior:

     Pause
       ↓
     Slow acceleration
       ↓
     Smooth movement
       ↓
     Slow deceleration
       ↓
     Pause
       ↓
     Repeat

     User interaction immediately pauses
     automatic movement.
  ===================================================== */

  useEffect(() => {
    const nav = mobileNavRef.current;

    if (!nav) {
      return;
    }

    let isUserInteracting = false;

    const PAUSE_BEFORE_MOVE = 4200;
    const PAUSE_AFTER_MOVE = 2500;
    const USER_RESUME_DELAY = 3500;

    /*
     * Clear all timers safely.
     */
    const clearTimers = () => {
      clearTimeout(mobileNavTimerRef.current);

      clearTimeout(mobileNavResumeRef.current);
    };

    /*
     * Professional ease-in-out curve.
     *
     * Starts slowly,
     * becomes smoother in the middle,
     * then slows down before stopping.
     */
    const easeInOut = (progress) => {
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    };

    /*
     * Animate scroll manually.
     *
     * This gives us better control than
     * native scroll-behavior: smooth.
     */
    const animateScroll = (start, target, duration, onComplete) => {
      const startTime = performance.now();

      const animate = (currentTime) => {
        if (isUserInteracting) {
          mobileNavAnimationRef.current = null;

          return;
        }

        const elapsed = currentTime - startTime;

        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = easeInOut(progress);

        nav.scrollLeft = start + (target - start) * easedProgress;

        if (progress < 1) {
          mobileNavAnimationRef.current = requestAnimationFrame(animate);
        } else {
          mobileNavAnimationRef.current = null;

          if (onComplete) {
            onComplete();
          }
        }
      };

      mobileNavAnimationRef.current = requestAnimationFrame(animate);
    };

    /*
     * Calculate how far the navigation
     * should move.
     */
    const getScrollDistance = () => {
      const maxScroll = nav.scrollWidth - nav.clientWidth;

      if (maxScroll <= 0) {
        return 0;
      }

      /*
       * Around 48% of visible width.
       *
       * This prevents the navigation from
       * moving too aggressively.
       */
      return Math.min(nav.clientWidth * 0.48, maxScroll);
    };

    /*
     * Schedule next movement.
     */
    const scheduleNextMovement = (delay = PAUSE_BEFORE_MOVE) => {
      clearTimeout(mobileNavTimerRef.current);

      mobileNavTimerRef.current = setTimeout(() => {
        startNextMovement();
      }, delay);
    };

    /*
     * Start one automatic movement.
     */
    const startNextMovement = () => {
      if (isUserInteracting) {
        return;
      }

      const maxScroll = nav.scrollWidth - nav.clientWidth;

      if (maxScroll <= 1) {
        return;
      }

      const currentScroll = nav.scrollLeft;

      /*
       * If we're at the end,
       * smoothly return to the beginning.
       */
      if (currentScroll >= maxScroll - 4) {
        animateScroll(currentScroll, 0, 1900, () => {
          scheduleNextMovement(PAUSE_AFTER_MOVE);
        });

        return;
      }

      const distance = getScrollDistance();

      const target = Math.min(currentScroll + distance, maxScroll);

      /*
       * 1700ms movement gives a
       * slow, premium feel.
       */
      animateScroll(currentScroll, target, 1700, () => {
        scheduleNextMovement(PAUSE_AFTER_MOVE);
      });
    };

    /*
     * Pause autoplay when the user
     * interacts with the navigation.
     */
    const pauseForUser = () => {
      isUserInteracting = true;

      clearTimers();

      if (mobileNavAnimationRef.current) {
        cancelAnimationFrame(mobileNavAnimationRef.current);

        mobileNavAnimationRef.current = null;
      }

      /*
       * Resume after the user stops
       * interacting.
       */
      mobileNavResumeRef.current = setTimeout(() => {
        isUserInteracting = false;

        scheduleNextMovement(1800);
      }, USER_RESUME_DELAY);
    };

    /*
     * Touch interaction.
     */
    nav.addEventListener("touchstart", pauseForUser, {
      passive: true,
    });

    /*
     * Pointer interaction.
     */
    nav.addEventListener("pointerdown", pauseForUser);

    /*
     * Mouse wheel.
     */
    nav.addEventListener("wheel", pauseForUser, {
      passive: true,
    });

    /*
     * Start autoplay.
     */
    scheduleNextMovement(PAUSE_BEFORE_MOVE);

    /*
     * Cleanup.
     */
    return () => {
      clearTimers();

      if (mobileNavAnimationRef.current) {
        cancelAnimationFrame(mobileNavAnimationRef.current);
      }

      nav.removeEventListener("touchstart", pauseForUser);

      nav.removeEventListener("pointerdown", pauseForUser);

      nav.removeEventListener("wheel", pauseForUser);
    };
  }, []);

  return (
    <>
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* =================================================
              DESKTOP / TABLET HEADER
          ================================================= */}

          <div className="hidden h-18 items-center gap-4 md:flex">
            {/* Logo */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex shrink-0 items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <ShoppingCart size={20} />
              </div>

              <span className="text-lg font-semibold text-text">ARFusion</span>
            </button>

            {/* Search */}

            <SearchBox
              search={search}
              setSearch={setSearch}
              searchRef={searchRef}
              showSuggestions={showSuggestions}
              suggestions={suggestions}
              selectedIndex={selectedIndex}
              setIsSearchFocused={setIsSearchFocused}
              setSelectedIndex={setSelectedIndex}
              handleSearch={handleSearch}
              handleClearSearch={handleClearSearch}
              handleSearchKeyDown={handleSearchKeyDown}
              handleSuggestionClick={handleSuggestionClick}
            />

            {/* Actions */}

            <div className="ml-auto flex items-center gap-1">
              {/* Wishlist */}

              <div className="hidden lg:block">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate("/wishlist")}
                >
                  <Heart
                    size={18}
                    fill={wishlistCount > 0 ? "currentColor" : "none"}
                  />
                  Wishlist
                  {wishlistCount > 0 && (
                    <Badge>{wishlistCount > 99 ? "99+" : wishlistCount}</Badge>
                  )}
                </Button>
              </div>

              {/* Compare */}

              <div className="hidden lg:block">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate("/compare")}
                >
                  <GitCompareArrows size={18} />
                  Compare
                  {compareCount > 0 && <Badge>{compareCount}</Badge>}
                </Button>
              </div>

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
                  <CountBadge>{cartCount > 99 ? "99+" : cartCount}</CountBadge>
                )}
              </div>

              {/* Account */}

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="
                  ml-2
                  hidden
                  items-center
                  gap-2
                  rounded-xl
                  p-1.5
                  transition
                  hover:bg-surface-container
                  sm:flex
                "
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

          {/* =================================================
              MOBILE HEADER
          ================================================= */}

          <div className="md:hidden">
            {/* Top row */}

            <div className="flex h-16 items-center justify-between">
              {/* Logo */}

              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                  <ShoppingCart size={19} />
                </div>

                <span className="text-lg font-semibold tracking-tight text-text">
                  ARFusion
                </span>
              </button>

              {/* Mobile actions */}

              <div className="flex items-center gap-1">
                {/* Wishlist */}

                <div className="relative">
                  <IconButton
                    label="Wishlist"
                    size="medium"
                    variant="standard"
                    onClick={() => navigate("/wishlist")}
                  >
                    <Heart
                      size={20}
                      fill={wishlistCount > 0 ? "currentColor" : "none"}
                    />
                  </IconButton>

                  {wishlistCount > 0 && (
                    <CountBadge>
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </CountBadge>
                  )}
                </div>

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
                    <CountBadge>
                      {cartCount > 99 ? "99+" : cartCount}
                    </CountBadge>
                  )}
                </div>

                {/* Hamburger */}

                <IconButton
                  label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  size="medium"
                  variant="standard"
                  onClick={() => setIsMobileMenuOpen((current) => !current)}
                >
                  <span className="flex h-5 w-5 items-center justify-center">
                    {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
                  </span>
                </IconButton>
              </div>
            </div>

            {/* Mobile search */}

            <div className="pb-3">
              <SearchBox
                search={search}
                setSearch={setSearch}
                searchRef={searchRef}
                showSuggestions={showSuggestions}
                suggestions={suggestions}
                selectedIndex={selectedIndex}
                setIsSearchFocused={setIsSearchFocused}
                setSelectedIndex={setSelectedIndex}
                handleSearch={handleSearch}
                handleClearSearch={handleClearSearch}
                handleSearchKeyDown={handleSearchKeyDown}
                handleSuggestionClick={handleSuggestionClick}
                mobile
              />
            </div>

            {/* =================================================
                MOBILE QUICK NAV
            ================================================= */}

            <div className="relative -mx-4 border-t border-outline-variant">
              {/* Left fade */}

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-0
                  left-0
                  top-0
                  z-10
                  w-7
                  bg-gradient-to-r
                  from-surface
                  to-transparent
                "
              />

              {/* Right fade */}

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-0
                  right-0
                  top-0
                  z-10
                  w-8
                  bg-gradient-to-l
                  from-surface
                  to-transparent
                "
              />

              <nav
                ref={mobileNavRef}
                className="
                  flex
                  gap-2
                  overflow-x-auto
                  px-4
                  py-2.5
                  scrollbar-none
                  overscroll-x-contain
                  touch-pan-x
                "
              >
                <MobileNavButton
                  icon={<LayoutGrid size={15} />}
                  label="Categories"
                  onClick={() => navigateTo("/products")}
                />

                <MobileNavButton
                  label="Products"
                  onClick={() => navigateTo("/products")}
                />

                <MobileNavButton
                  label="Deals"
                  onClick={() => navigateTo("/products?sort=deals")}
                />

                <MobileNavButton
                  label="New Arrivals"
                  onClick={() => navigateTo("/products?sort=newest")}
                />

                <MobileNavButton
                  label="Brands"
                  onClick={() => navigateTo("/brands")}
                />

                <MobileNavButton
                  label="Track Order"
                  onClick={() => navigateTo("/track-order")}
                />
              </nav>
            </div>
          </div>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav className="hidden h-12 items-center gap-8 md:flex">
            <button
              type="button"
              className="
                flex
                items-center
                gap-1
                text-sm
                font-medium
                text-text
                transition
                hover:text-primary
              "
            >
              Categories
              <ChevronDown size={15} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="
                text-sm
                font-medium
                text-text-secondary
                transition
                hover:text-primary
              "
            >
              Products
            </button>

            <button
              type="button"
              onClick={() => navigate("/products?sort=deals")}
              className="
                text-sm
                font-medium
                text-text-secondary
                transition
                hover:text-primary
              "
            >
              Deals
            </button>

            <button
              type="button"
              onClick={() => navigate("/products?sort=newest")}
              className="
                text-sm
                font-medium
                text-text-secondary
                transition
                hover:text-primary
              "
            >
              New Arrivals
            </button>

            <button
              type="button"
              onClick={() => navigate("/brands")}
              className="
                text-sm
                font-medium
                text-text-secondary
                transition
                hover:text-primary
              "
            >
              Brands
            </button>

            <button
              type="button"
              onClick={() => navigate("/track-order")}
              className="
                text-sm
                font-medium
                text-text-secondary
                transition
                hover:text-primary
              "
            >
              Track Order
            </button>
          </nav>
        </div>
      </header>

      {/* =====================================================
          MOBILE MENU DRAWER
      ===================================================== */}

      <div
        className={`
          fixed
          inset-0
          z-[60]
          md:hidden
          transition-opacity
          duration-300
          ease-out
          ${
            isMobileMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      >
        {/* Backdrop */}

        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className="
            absolute
            inset-0
            bg-black/40
            backdrop-blur-sm
          "
        />

        {/* Drawer */}

        <aside
          className={`
            absolute
            right-0
            top-0
            flex
            h-full
            w-[min(88%,380px)]
            flex-col
            bg-surface
            shadow-2xl
            transition-transform
            duration-300
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* Drawer header */}

          <div className="flex h-16 items-center justify-between border-b border-outline-variant px-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <ShoppingCart size={19} />
              </div>

              <span className="font-semibold text-text">ARFusion</span>
            </div>

            <IconButton
              label="Close menu"
              size="medium"
              variant="standard"
              onClick={closeMobileMenu}
            >
              <X size={20} />
            </IconButton>
          </div>

          {/* Account */}

          <button
            type="button"
            onClick={() => navigateTo("/profile")}
            className="
              flex
              items-center
              gap-3
              border-b
              border-outline-variant
              px-5
              py-5
              text-left
              transition
              hover:bg-surface-container
              active:bg-surface-container
            "
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-primary">
              J
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-text">John Doe</p>

              <p className="mt-0.5 text-xs text-text-secondary">
                Premium Member
              </p>
            </div>

            <ChevronDown
              size={17}
              className="rotate-[-90deg] text-text-secondary"
            />
          </button>

          {/* Menu */}

          <nav className="flex-1 overflow-y-auto p-3">
            <MobileMenuItem
              icon={<User size={19} />}
              label="My Profile"
              onClick={() => navigateTo("/profile")}
            />

            <MobileMenuItem
              icon={<Package size={19} />}
              label="Track Order"
              onClick={() => navigateTo("/track-order")}
            />

            <MobileMenuItem
              icon={<Heart size={19} />}
              label="Wishlist"
              count={wishlistCount}
              onClick={() => navigateTo("/wishlist")}
            />

            <MobileMenuItem
              icon={<GitCompareArrows size={19} />}
              label="Compare"
              count={compareCount}
              onClick={() => navigateTo("/compare")}
            />

            <MobileMenuItem
              icon={<ShoppingCart size={19} />}
              label="Shopping Cart"
              count={cartCount}
              onClick={() => navigateTo("/cart")}
            />

            <div className="my-3 border-t border-outline-variant" />

            <MobileMenuItem
              icon={<LayoutGrid size={19} />}
              label="Categories"
              onClick={() => navigateTo("/products")}
            />

            <MobileMenuItem
              label="Products"
              onClick={() => navigateTo("/products")}
            />

            <MobileMenuItem
              label="Deals"
              onClick={() => navigateTo("/products?sort=deals")}
            />

            <MobileMenuItem
              label="New Arrivals"
              onClick={() => navigateTo("/products?sort=newest")}
            />

            <MobileMenuItem
              label="Brands"
              onClick={() => navigateTo("/brands")}
            />
          </nav>

          {/* Footer */}

          <div className="border-t border-outline-variant p-5">
            <p className="text-center text-xs text-text-secondary">
              ARFusion Commerce
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

/* =========================================================
   SEARCH BOX
========================================================= */

function SearchBox({
  search,
  setSearch,
  searchRef,
  showSuggestions,
  suggestions,
  selectedIndex,
  setIsSearchFocused,
  setSelectedIndex,
  handleSearch,
  handleClearSearch,
  handleSearchKeyDown,
  handleSuggestionClick,
  mobile = false,
}) {
  return (
    <form
      ref={searchRef}
      onSubmit={handleSearch}
      className={
        mobile
          ? "relative w-full"
          : "relative mx-auto hidden max-w-xl flex-1 md:block"
      }
    >
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

        {/* Input */}

        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsSearchFocused(true)}
          onKeyDown={handleSearchKeyDown}
          placeholder={
            mobile
              ? "Search products, brands..."
              : "Search for products, brands and more..."
          }
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

            [&::-webkit-search-cancel-button]:appearance-none
            [&::-webkit-search-decoration]:appearance-none
          "
        />

        {/* Clear */}

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
              active:scale-95
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
            active:scale-95
          "
        >
          <Search size={17} />
        </button>
      </div>

      {/* =================================================
          SEARCH SUGGESTIONS
      ================================================= */}

      {showSuggestions && (
        <div
          className="
            absolute
            left-0
            right-0
            top-full
            z-50
            mt-2
            max-h-[min(70vh,420px)]
            overflow-y-auto
            overflow-hidden
            rounded-2xl
            border
            border-outline-variant
            bg-surface
            shadow-xl
          "
        >
          {suggestions.length > 0 ? (
            <>
              <div className="border-b border-outline-variant px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Products
                </p>
              </div>

              <div className="p-2">
                {suggestions.map((product, index) => {
                  const productId = product.id || product._id;

                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={productId}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
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
                          <span className="truncate text-xs text-text-secondary">
                            {product.categoryLabel || product.category}
                          </span>

                          {product.brand && (
                            <>
                              <span className="text-xs text-outline">•</span>

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

              {/* Search all */}

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
  );
}

/* =========================================================
   BADGE
========================================================= */

function Badge({ children }) {
  return (
    <span className="ml-1 rounded-full bg-primary-container px-1.5 py-0.5 text-[10px] font-semibold text-primary">
      {children}
    </span>
  );
}

/* =========================================================
   COUNT BADGE
========================================================= */

function CountBadge({ children }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
      {children}
    </span>
  );
}

/* =========================================================
   MOBILE NAV BUTTON
========================================================= */

function MobileNavButton({ label, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        shrink-0
        items-center
        gap-1.5
        rounded-full
        border
        border-outline-variant
        bg-surface
        px-3.5
        py-1.5
        text-xs
        font-medium
        text-text-secondary
        transition-all
        duration-200
        hover:border-primary
        hover:text-primary
        active:scale-95
      "
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   MOBILE MENU ITEM
========================================================= */

function MobileMenuItem({ icon, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-3
        py-3
        text-left
        text-sm
        font-medium
        text-text
        transition-all
        duration-200
        hover:bg-surface-container
        active:scale-[0.99]
      "
    >
      {icon && <span className="text-text-secondary">{icon}</span>}

      <span className="flex-1">{label}</span>

      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-container px-1.5 text-[10px] font-semibold text-primary">
          {count > 99 ? "99+" : count}
        </span>
      )}

      <ChevronDown size={16} className="rotate-[-90deg] text-text-secondary" />
    </button>
  );
}

export default Navbar;
