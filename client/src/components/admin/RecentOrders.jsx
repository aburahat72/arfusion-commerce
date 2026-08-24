import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { recentOrders } from "../../data/adminDashboard";

function RecentOrders() {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/admin/orders");
  };

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-text sm:text-lg">
          Recent Orders
        </h3>

        <button
          type="button"
          onClick={handleViewAll}
          className="
            inline-flex
            items-center
            gap-1
            text-xs
            font-semibold
            text-primary
            transition
            hover:underline
          "
        >
          View all
          <ArrowRight size={14} />
        </button>
      </div>

      {/* =================================================
          ORDER LIST
      ================================================= */}

      <div className="mt-4 divide-y divide-outline-variant">
        {recentOrders.map((order) => (
          <RecentOrderItem
            key={order.id}
            order={order}
            onClick={() =>
              navigate(`/admin/orders/${order.id.replace("#", "")}`)
            }
          />
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   ORDER ITEM
========================================================= */

function RecentOrderItem({ order, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-3
        py-3
        text-left
        transition
        hover:bg-surface-container
        first:pt-1
        last:pb-1
      "
    >
      {/* Product image */}

      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-container">
        <img
          src={order.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Order information */}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="shrink-0 text-xs font-semibold text-text">{order.id}</p>

          <span className="truncate text-xs text-text-secondary">
            {order.customer}
          </span>
        </div>

        <p className="mt-1 text-[11px] text-text-secondary">{order.time}</p>
      </div>

      {/* Amount + status */}

      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold text-text">
          {formatCurrency(order.amount)}
        </p>

        <OrderStatus status={order.status} />
      </div>
    </button>
  );
}

/* =========================================================
   ORDER STATUS
========================================================= */

function OrderStatus({ status }) {
  const statusStyles = {
    Pending: "bg-orange-50 text-orange-600",
    Processing: "bg-blue-50 text-blue-600",
    Shipped: "bg-violet-50 text-violet-600",
    Delivered: "bg-green-50 text-green-600",
    Cancelled: "bg-red-50 text-red-600",
  };

  const className =
    statusStyles[status] || "bg-surface-container text-text-secondary";

  return (
    <span
      className={`
        mt-1
        inline-flex
        rounded-full
        px-2
        py-1
        text-[10px]
        font-semibold
        ${className}
      `}
    >
      {status}
    </span>
  );
}

/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(value) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return value;
}

export default RecentOrders;
