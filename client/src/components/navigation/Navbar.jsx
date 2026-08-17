import {
  Heart,
  Search,
  ShoppingCart,
  GitCompareArrows,
  User,
  ChevronDown,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import IconButton from "../ui/IconButton";

function Navbar() {
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.items);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

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
          <div className="mx-auto hidden max-w-xl flex-1 md:block">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                type="search"
                placeholder="Search for products, brands and more..."
                className="h-11 w-full rounded-xl border border-outline-variant bg-surface-container pl-11 pr-16 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-surface px-2 py-1 text-xs text-text-secondary shadow-sm">
                ⌘ K
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1">
            {/* Desktop wishlist */}
            <div className="hidden lg:block">
              <Button variant="text" size="small">
                <Heart size={18} />
                Wishlist
              </Button>
            </div>

            {/* Desktop compare */}
            <div className="hidden lg:block">
              <Button variant="text" size="small">
                <GitCompareArrows size={18} />
                Compare
              </Button>
            </div>

            {/* Mobile wishlist */}
            <IconButton label="Wishlist" size="medium" variant="standard">
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
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-text transition hover:text-primary"
          >
            Categories
            <ChevronDown size={15} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="text-sm font-medium text-text-secondary transition hover:text-primary"
          >
            Products
          </button>

          <a
            href="#deals"
            className="text-sm font-medium text-text-secondary transition hover:text-primary"
          >
            Deals
          </a>

          <a
            href="#new-arrivals"
            className="text-sm font-medium text-text-secondary transition hover:text-primary"
          >
            New Arrivals
          </a>

          <a
            href="#brands"
            className="text-sm font-medium text-text-secondary transition hover:text-primary"
          >
            Brands
          </a>

          <a
            href="#track-order"
            className="text-sm font-medium text-text-secondary transition hover:text-primary"
          >
            Track Order
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
