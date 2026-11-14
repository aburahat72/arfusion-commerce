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

function AdminStatCard({
  title,
  value,
  change,
  detail,
  comparisonLabel,
  icon,
}) {
  const config = iconMap[icon] || iconMap.products;
  const Icon = config.component;

  const hasChange = typeof change === "number" && Number.isFinite(change);
  const isPositive = hasChange && change >= 0;
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

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

          {detail ? (
            <p className="mt-1.5 text-xs text-text-secondary">{detail}</p>
          ) : hasChange ? (
            <div className="mt-1.5 flex items-center gap-1.5">
              <ChangeIcon
                size={14}
                className={isPositive ? "text-success" : "text-error"}
              />
              <span
                className={`text-xs font-semibold ${isPositive ? "text-success" : "text-error"}`}
              >
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-xs text-text-secondary">
                vs {comparisonLabel || "previous period"}
              </span>
            </div>
          ) : comparisonLabel ? (
            <p className="mt-1.5 text-xs text-text-secondary">
              No previous-period data
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default AdminStatCard;
