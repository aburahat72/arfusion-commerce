// =====================================================
// ADMIN SIDEBAR
// =====================================================

import {
  BarChart3,
  ChevronDown,
  FileBarChart,
  House,
  Image,
  LayoutDashboard,
  LogOut,
  Package,
  Percent,
  ShoppingCart,
  Star,
  Settings,
  Tags,
  Users,
  Warehouse,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

import { useAdminAuth } from "../../context/AdminAuthContext";

function AdminSidebar({ mobileOpen = false, onClose }) {
  const navigate = useNavigate();

  // =====================================================
  // ADMIN AUTH CONTEXT
  // =====================================================
  // IMPORTANT:
  // Use ADMIN authentication only.
  // Do NOT use the customer AuthContext here.
  // =====================================================

  const { logoutAdmin } = useAdminAuth();

  // =====================================================
  // NAVIGATION HELPER
  // =====================================================

  const goTo = (path) => {
    onClose?.();
    navigate(path);
  };

  // =====================================================
  // ADMIN SIGN OUT
  // =====================================================
  // Clears only:
  //   arfusion_admin_token
  //   arfusion_admin_user
  //
  // Customer authentication remains untouched.
  // =====================================================

  const handleAdminLogout = () => {
    onClose?.();

    // Clear admin session
    logoutAdmin();

    // Redirect to ADMIN login only
    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <>
      {/* =================================================
          MOBILE BACKDROP
      ================================================= */}

      <button
        type="button"
        aria-label="Close admin menu"
        onClick={onClose}
        className={`
          fixed
          inset-0
          z-40
          bg-black/40
          backdrop-blur-sm
          transition-opacity
          duration-200
          lg:hidden
          ${
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-60
          flex-col
          border-r
          border-outline-variant
          bg-surface
          shadow-sm
          transition-transform
          duration-300
          ease-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* =================================================
            BRAND
        ================================================= */}

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-outline-variant px-5">
          <button
            type="button"
            onClick={() => goTo("/admin")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <ShoppingCart size={20} />
            </div>

            <div className="text-left">
              <p className="text-base font-semibold tracking-tight text-text">
                ARFusion
              </p>

              <p className="text-[11px] text-text-secondary">Admin Panel</p>
            </div>
          </button>

          {/* =================================================
              MOBILE CLOSE
          ================================================= */}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin navigation"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-text-secondary
              transition
              hover:bg-surface-container
              hover:text-text
              lg:hidden
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* =================================================
              DASHBOARD
          ================================================= */}

          <AdminNavItem
            to="/admin"
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            onClose={onClose}
          />

          {/* =================================================
              SALES
          ================================================= */}

          <NavSection label="Sales" />

          <AdminNavItem
            to="/admin/orders"
            icon={<ShoppingCart size={19} />}
            label="Orders"
            expandable
            onClose={onClose}
          />

          <AdminNavItem
            to="/admin/customers"
            icon={<Users size={19} />}
            label="Customers"
            onClose={onClose}
          />

          <AdminNavItem
            to="/admin/reviews"
            icon={<Star size={19} />}
            label="Reviews"
            onClose={onClose}
          />

          {/* =================================================
              CATALOG
          ================================================= */}

          <NavSection label="Catalog" />

          <AdminNavItem
            to="/admin/products"
            icon={<Package size={19} />}
            label="Products"
            expandable
            onClose={onClose}
          />

          <AdminNavItem
            to="/admin/categories"
            icon={<Tags size={19} />}
            label="Categories"
            expandable
            onClose={onClose}
          />

          <AdminNavItem
            to="/admin/inventory"
            icon={<Warehouse size={19} />}
            label="Inventory"
            expandable
            onClose={onClose}
          />

          <AdminNavItem
            to="/admin/coupons"
            icon={<Percent size={19} />}
            label="Coupons & Discounts"
            onClose={onClose}
          />

          <AdminNavItem
            to="/admin/banners"
            icon={<Image size={19} />}
            label="Banners"
            onClose={onClose}
          />

          {/* =================================================
              ANALYTICS
          ================================================= */}

          <NavSection label="Analytics" />

          <AdminNavItem
            to="/admin/analytics"
            icon={<BarChart3 size={19} />}
            label="Analytics"
            onClose={onClose}
          />

          <AdminNavItem
            to="/admin/reports"
            icon={<FileBarChart size={19} />}
            label="Reports"
            onClose={onClose}
          />

          {/* =================================================
              SETTINGS
          ================================================= */}

          <NavSection label="Settings" />

          <AdminNavItem
            to="/admin/settings"
            icon={<Settings size={19} />}
            label="Settings"
            onClose={onClose}
          />

          <AdminNavItem
            to="/admin/profile"
            icon={<House size={19} />}
            label="Admin Profile"
            onClose={onClose}
          />
        </nav>

        {/* =================================================
            ADMIN LOGOUT
        ================================================= */}

        <div className="shrink-0 border-t border-outline-variant p-3">
          <button
            type="button"
            onClick={handleAdminLogout}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-sm
              font-medium
              text-error
              transition
              hover:bg-error/5
            "
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   NAV SECTION
========================================================= */

function NavSection({ label }) {
  return (
    <div className="px-3 pb-2 pt-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   NAV ITEM
========================================================= */

function AdminNavItem({ to, icon, label, expandable = false, onClose }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      onClick={() => onClose?.()}
      className={({ isActive }) =>
        `
          group
          mb-1
          flex
          w-full
          items-center
          gap-3
          rounded-xl
          px-3
          py-2.5
          text-left
          text-sm
          font-medium
          transition-all
          duration-150
          ${
            isActive
              ? "bg-primary-container text-primary shadow-sm"
              : "text-text-secondary hover:bg-surface-container hover:text-text"
          }
        `
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`
              shrink-0
              transition-colors
              ${
                isActive
                  ? "text-primary"
                  : "text-text-secondary group-hover:text-text"
              }
            `}
          >
            {icon}
          </span>

          <span className="min-w-0 flex-1 truncate">{label}</span>

          {expandable && (
            <ChevronDown
              size={15}
              className={`
                shrink-0
                transition-colors
                ${isActive ? "text-primary" : "text-text-secondary"}
              `}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default AdminSidebar;
