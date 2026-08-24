import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { recentOrders } from "../../../data/adminDashboard";

function AdminOrders() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const statuses = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recentOrders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query);

      const matchesStatus = status === "All" || order.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const handleViewOrder = (order) => {
    const orderId = order.id.replace("#", "");

    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">
        <p className="text-sm text-text-secondary">Sales</p>

        <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Orders
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Manage customer orders and fulfillment.
            </p>
          </div>

          <div className="text-sm text-text-secondary">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "order" : "orders"}
          </div>
        </div>
      </div>

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <section className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}

          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-text-secondary
              "
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order ID or customer..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-outline-variant
                bg-surface
                pl-10
                pr-4
                text-sm
                text-text
                outline-none
                transition
                placeholder:text-text-secondary
                hover:border-outline
                focus:border-primary
                focus:ring-2
                focus:ring-primary/15
              "
            />
          </div>

          {/* Status */}

          <div className="relative">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="
                h-11
                w-full
                appearance-none
                rounded-xl
                border
                border-outline-variant
                bg-surface
                py-2
                pl-3
                pr-9
                text-sm
                text-text
                outline-none
                transition
                hover:border-outline
                focus:border-primary
                focus:ring-2
                focus:ring-primary/15
                sm:w-48
              "
              aria-label="Filter orders by status"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
          </div>
        </div>
      </section>

      {/* =================================================
          DESKTOP TABLE
      ================================================= */}

      <section className="mt-6 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/60">
                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Order
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Customer
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Amount
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Time
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold text-text-secondary">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <OrderTableRow
                  key={order.id}
                  order={order}
                  onView={handleViewOrder}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && <EmptyOrders />}
      </section>

      {/* =================================================
          MOBILE CARDS
      ================================================= */}

      <section className="mt-6 space-y-3 md:hidden">
        {filteredOrders.map((order) => (
          <OrderMobileCard
            key={order.id}
            order={order}
            onView={handleViewOrder}
          />
        ))}

        {filteredOrders.length === 0 && (
          <div className="rounded-2xl border border-outline-variant bg-surface p-8">
            <EmptyOrders />
          </div>
        )}
      </section>
    </main>
  );
}

/* =========================================================
   TABLE ROW
========================================================= */

function OrderTableRow({ order, onView }) {
  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onView(order)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {order.id}
        </button>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-surface-container">
            <img
              src={order.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>

          <span className="text-sm font-medium text-text">
            {order.customer}
          </span>
        </div>
      </td>

      <td className="px-5 py-4 text-sm font-semibold text-text">
        {formatCurrency(order.amount)}
      </td>

      <td className="px-5 py-4">
        <OrderStatus status={order.status} />
      </td>

      <td className="px-5 py-4 text-sm text-text-secondary">{order.time}</td>

      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => onView(order)}
          aria-label={`View ${order.id}`}
          className="
            inline-flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            text-text-secondary
            transition
            hover:bg-surface-container
            hover:text-primary
          "
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function OrderMobileCard({ order, onView }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-container">
          <img
            src={order.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onView(order)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {order.id}
            </button>

            <OrderStatus status={order.status} />
          </div>

          <p className="mt-1 truncate text-sm font-medium text-text">
            {order.customer}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-text-secondary">Amount</p>

              <p className="mt-0.5 text-sm font-semibold text-text">
                {formatCurrency(order.amount)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-text-secondary">Created</p>

              <p className="mt-0.5 text-xs text-text-secondary">{order.time}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onView(order)}
        className="
          mt-4
          flex
          h-10
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-outline-variant
          text-sm
          font-semibold
          text-text
          transition
          hover:bg-surface-container
          hover:text-primary
        "
      >
        <Eye size={16} />
        View Order
      </button>
    </article>
  );
}

/* =========================================================
   ORDER STATUS
========================================================= */

function OrderStatus({ status }) {
  const config = {
    Pending: {
      className: "bg-orange-50 text-orange-600",
      icon: Clock3,
    },

    Processing: {
      className: "bg-blue-50 text-blue-600",
      icon: Clock3,
    },

    Shipped: {
      className: "bg-violet-50 text-violet-600",
      icon: Truck,
    },

    Delivered: {
      className: "bg-green-50 text-green-600",
      icon: CheckCircle2,
    },

    Cancelled: {
      className: "bg-red-50 text-red-600",
      icon: XCircle,
    },
  };

  const item = config[status] || {
    className: "bg-surface-container text-text-secondary",
    icon: Clock3,
  };

  const Icon = item.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1.5
        text-[10px]
        font-semibold
        ${item.className}
      `}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
        <Search size={20} className="text-text-secondary" />
      </div>

      <h3 className="mt-3 text-sm font-semibold text-text">No orders found</h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
        Try changing your search or order status filter.
      </p>
    </div>
  );
}

/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default AdminOrders;
