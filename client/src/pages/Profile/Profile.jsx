import {
  ChevronRight,
  Heart,
  MapPin,
  Package,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Profile() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const cartItems = useSelector((state) => state.cart.items);

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const wishlistCount = wishlistItems.length;

  const userName = user?.fullName || "Customer";
  const userEmail = user?.email || "";
  const userRole = user?.role || "customer";

  const membership = userRole === "admin" ? "Administrator" : "Premium Member";

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}

        <div className="mb-6 text-sm text-text-secondary">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="transition hover:text-primary"
          >
            Home
          </button>

          <span className="mx-2">/</span>

          <span className="font-medium text-text">My Profile</span>
        </div>

        {/* Profile Header */}

        <section className="overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-sm">
          <div className="h-28 bg-primary-container sm:h-36" />

          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-surface bg-primary text-2xl font-semibold text-white shadow-md sm:h-28 sm:w-28">
                  {userName.charAt(0).toUpperCase()}
                </div>

                <div className="pb-1">
                  <h1 className="text-2xl font-semibold text-text sm:text-3xl">
                    {userName}
                  </h1>

                  <p className="mt-1 text-sm text-text-secondary">
                    {userEmail}
                  </p>

                  <span className="mt-2 inline-flex rounded-full bg-primary-container px-3 py-1 text-xs font-semibold text-primary">
                    {membership}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/profile/personal-information")}
                className="w-fit rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-medium text-text transition hover:border-primary hover:text-primary"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        {/* Quick Stats */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <ProfileStat
            icon={<Package size={20} />}
            label="Orders"
            value="0"
            onClick={() => navigate("/profile/orders")}
          />

          <ProfileStat
            icon={<Heart size={20} />}
            label="Wishlist"
            value={wishlistCount}
            onClick={() => navigate("/wishlist")}
          />

          <ProfileStat
            icon={<ShoppingCart size={20} />}
            label="Cart Items"
            value={cartCount}
            onClick={() => navigate("/cart")}
          />
        </section>

        {/* Account */}

        <section className="mt-6 rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-text">Account</h2>

            <p className="mt-1 text-sm text-text-secondary">
              Manage your account and shopping preferences.
            </p>
          </div>

          <div className="divide-y divide-outline-variant">
            <ProfileMenuItem
              icon={<User size={19} />}
              title="Personal Information"
              description="Manage your name, email and phone number"
              onClick={() => navigate("/profile/personal-information")}
            />

            <ProfileMenuItem
              icon={<MapPin size={19} />}
              title="Addresses"
              description="Manage your delivery addresses"
              onClick={() => navigate("/profile/addresses")}
            />

            <ProfileMenuItem
              icon={<Package size={19} />}
              title="My Orders"
              description="View your order history and status"
              onClick={() => navigate("/profile/orders")}
            />

            <ProfileMenuItem
              icon={<Heart size={19} />}
              title="Wishlist"
              description="View your saved products"
              onClick={() => navigate("/wishlist")}
            />

            <ProfileMenuItem
              icon={<Settings size={19} />}
              title="Settings"
              description="Manage account preferences"
              onClick={() => navigate("/profile/settings")}
            />
          </div>
        </section>

        {/* Sign Out */}

        <div className="mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-2xl border border-error/20 bg-error/5 px-5 py-4 text-sm font-semibold text-error transition hover:bg-error/10"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}

/* =====================================================
   PROFILE STAT
===================================================== */

function ProfileStat({ icon, label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-outline-variant
        bg-surface
        p-5
        text-left
        shadow-sm
        transition
        hover:border-primary/40
        hover:shadow-md
      "
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-primary transition group-hover:scale-105">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-xs text-text-secondary">{label}</p>

        <p className="mt-1 text-xl font-semibold text-text">{value}</p>
      </div>

      <ChevronRight
        size={18}
        className="text-text-secondary transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </button>
  );
}

/* =====================================================
   PROFILE MENU ITEM
===================================================== */

function ProfileMenuItem({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        w-full
        items-center
        gap-4
        py-4
        text-left
        transition
      "
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-text-secondary transition group-hover:bg-primary-container group-hover:text-primary">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{title}</p>

        <p className="mt-1 text-xs text-text-secondary">{description}</p>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-text-secondary transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </button>
  );
}

export default Profile;
