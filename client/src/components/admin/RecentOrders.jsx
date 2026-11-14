import { ArrowRight, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const statuses = ["All statuses", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function RecentOrders({ orders = [] }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const visibleOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          statusFilter === "All statuses" || order.orderStatus === statusFilter,
      ),
    [orders, statusFilter],
  );

  return (
    <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text sm:text-lg">
          Recent orders
        </h2>
        <button
          type="button"
          onClick={() => navigate("/admin/orders")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:underline"
        >
          View all
          <ArrowRight size={14} />
        </button>
      </div>

      <label className="mt-4 flex items-center justify-between gap-3 text-xs text-text-secondary">
        <span>Filter by status</span>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter recent orders by status"
          className="h-9 rounded-lg border border-outline-variant bg-surface px-2 text-xs text-text"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-2 divide-y divide-outline-variant">
        {visibleOrders.length ? (
          visibleOrders.map((order) => (
            <RecentOrderItem
              key={order._id}
              order={order}
              onClick={() => navigate(`/admin/orders/${order._id}`)}
            />
          ))
        ) : (
          <p className="py-8 text-center text-sm text-text-secondary">
            {orders.length
              ? "No orders match this status."
              : "No orders in the selected period."}
          </p>
        )}
      </div>
    </section>
  );
}

function RecentOrderItem({ order, onClick }) {
  const customerName = order.user?.fullName || "Deleted customer";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-surface-container first:pt-2 last:pb-2"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
        <ShoppingBag size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="shrink-0 text-xs font-semibold text-text">
            #{String(order._id).slice(-6).toUpperCase()}
          </p>
          <span className="truncate text-xs text-text-secondary">
            {customerName}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-text-secondary">
          {formatDateTime(order.createdAt)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold text-text">
          {formatCurrency(order.totalPrice)}
        </p>
        <OrderStatus status={order.orderStatus} />
      </div>
    </button>
  );
}

function OrderStatus({ status }) {
  const styles = {
    Pending: "bg-orange-50 text-orange-600",
    Processing: "bg-blue-50 text-blue-600",
    Shipped: "bg-violet-50 text-violet-600",
    Delivered: "bg-green-50 text-green-600",
    Cancelled: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
        styles[status] || "bg-surface-container text-text-secondary"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date unavailable";

export default RecentOrders;
