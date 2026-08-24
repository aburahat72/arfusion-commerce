import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

const iconMap = {
  revenue: {
    component: CircleDollarSign,
    className: "bg-primary-container text-primary",
  },

  orders: {
    component: ShoppingCart,
    className: "bg-blue-100 text-blue-600",
  },

  customers: {
    component: Users,
    className: "bg-green-100 text-green-600",
  },

  products: {
    component: Package,
    className: "bg-orange-100 text-orange-600",
  },
};

function AdminStatCard({ title, value, change, trend, icon }) {
  const config = iconMap[icon];
  const Icon = config.component;

  const isPositive = trend === "up";

  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${config.className}`}
        >
          <Icon size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-text-secondary">{title}</p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-text">
            {value}
          </p>

          <div className="mt-1.5 flex items-center gap-1.5">
            {isPositive ? (
              <ArrowUpRight size={14} className="text-success" />
            ) : (
              <ArrowDownRight size={14} className="text-error" />
            )}

            <span
              className={
                isPositive
                  ? "text-xs font-semibold text-success"
                  : "text-xs font-semibold text-error"
              }
            >
              {change}
            </span>

            <span className="text-xs text-text-secondary">vs last 30 days</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default AdminStatCard;
