import {
  BarChart3,
  Boxes,
  ChevronDown,
  FileBarChart,
  House,
  Image,
  LayoutDashboard,
  LogOut,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Star,
  Tags,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminSidebar({ mobileOpen = false, onClose }) {
  const navigate = useNavigate();

  const goTo = (path) => {
    onClose?.();
    navigate(path);
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

          {/* Mobile close */}

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
          <AdminNavItem
            icon={<LayoutDashboard size={19} />}
            label="Dashboard"
            onClick={() => goTo("/admin")}
            active
          />

          <NavSection label="Sales" />

          <AdminNavItem
            icon={<ShoppingCart size={19} />}
            label="Orders"
            onClick={() => goTo("/admin/orders")}
            expandable
          />

          <AdminNavItem
            icon={<Users size={19} />}
            label="Customers"
            onClick={() => goTo("/admin/customers")}
          />

          <AdminNavItem
            icon={<Star size={19} />}
            label="Reviews"
            onClick={() => goTo("/admin/reviews")}
          />

          <NavSection label="Catalog" />

          <AdminNavItem
            icon={<Package size={19} />}
            label="Products"
            onClick={() => goTo("/admin/products")}
            expandable
          />

          <AdminNavItem
            icon={<Tags size={19} />}
            label="Categories"
            onClick={() => goTo("/admin/categories")}
            expandable
          />

          <AdminNavItem
            icon={<Warehouse size={19} />}
            label="Inventory"
            onClick={() => goTo("/admin/inventory")}
            expandable
          />

          <AdminNavItem
            icon={<Percent size={19} />}
            label="Coupons & Discounts"
            onClick={() => goTo("/admin/coupons")}
          />

          <AdminNavItem
            icon={<Image size={19} />}
            label="Banners"
            onClick={() => goTo("/admin/banners")}
          />

          <NavSection label="Analytics" />

          <AdminNavItem
            icon={<BarChart3 size={19} />}
            label="Analytics"
            onClick={() => goTo("/admin/analytics")}
          />

          <AdminNavItem
            icon={<FileBarChart size={19} />}
            label="Reports"
            onClick={() => goTo("/admin/reports")}
          />

          <NavSection label="Settings" />

          <AdminNavItem
            icon={<Settings size={19} />}
            label="Settings"
            onClick={() => goTo("/admin/settings")}
          />

          <AdminNavItem
            icon={<House size={19} />}
            label="Admin Profile"
            onClick={() => goTo("/admin/profile")}
          />
        </nav>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="shrink-0 border-t border-outline-variant p-3">
          <button
            type="button"
            onClick={() => navigate("/login")}
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

function AdminNavItem({
  icon,
  label,
  onClick,
  active = false,
  expandable = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
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
          active
            ? "bg-primary-container text-primary"
            : "text-text-secondary hover:bg-surface-container hover:text-text"
        }
      `}
    >
      <span
        className={`
          shrink-0
          ${
            active
              ? "text-primary"
              : "text-text-secondary group-hover:text-text"
          }
        `}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1 truncate">{label}</span>

      {expandable && (
        <ChevronDown size={15} className="shrink-0 text-text-secondary" />
      )}
    </button>
  );
}

export default AdminSidebar;
