import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { recentOrders } from "../../../data/adminDashboard";

function AdminOrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const order = useMemo(() => {
    if (!orderId) {
      return null;
    }

    return recentOrders.find((item) => item.id.replace("#", "") === orderId);
  }, [orderId]);

  /* =====================================================
     ORDER NOT FOUND
  ===================================================== */

  if (!order) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-text-secondary
              transition
              hover:text-primary
            "
          >
            <ArrowLeft size={17} />
            Back to Orders
          </button>

          <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
              <XCircle size={22} />
            </div>

            <h1 className="mt-4 text-xl font-semibold text-text">
              Order not found
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              We couldn't find order #{orderId}.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-text-secondary
              transition
              hover:text-primary
            "
          >
            <ArrowLeft size={17} />
            Back to Orders
          </button>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-text-secondary">Order Details</p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                  {order.id}
                </h1>

                <OrderStatus status={order.status} />
              </div>

              <p className="mt-2 text-sm text-text-secondary">
                Created {order.time}
              </p>
            </div>

            <button
              type="button"
              className="
                inline-flex
                h-10
                items-center
                justify-center
                rounded-xl
                bg-primary
                px-4
                text-sm
                font-semibold
                text-white
                transition
                hover:opacity-90
              "
            >
              Update Order
            </button>
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">
            {/* Customer */}

            <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <SectionTitle
                icon={<User size={18} />}
                title="Customer Information"
              />

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
                  <User size={24} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text">
                    {order.customer}
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    customer@example.com
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
                    <Phone size={13} />
                    +91 98765 43210
                  </div>
                </div>
              </div>
            </section>

            {/* Product */}

            <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <SectionTitle icon={<Package size={18} />} title="Order Items" />

              <div className="mt-5 rounded-xl border border-outline-variant">
                <div className="flex items-center gap-4 p-4">
                  <img
                    src={order.image}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text">
                      {orderProductName(order)}
                    </p>

                    <p className="mt-1 text-xs text-text-secondary">
                      Quantity: 1
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-text">
                    {formatCurrency(order.amount)}
                  </p>
                </div>
              </div>

              {/* Totals */}

              <div className="mt-5 space-y-3 border-t border-outline-variant pt-5">
                <SummaryRow
                  label="Subtotal"
                  value={formatCurrency(order.amount)}
                />

                <SummaryRow label="Shipping" value="Free" />

                <SummaryRow label="Tax" value="Included" />

                <div className="flex items-center justify-between border-t border-outline-variant pt-3">
                  <span className="text-sm font-semibold text-text">Total</span>

                  <span className="text-lg font-semibold text-primary">
                    {formatCurrency(order.amount)}
                  </span>
                </div>
              </div>
            </section>

            {/* Shipping */}

            <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <SectionTitle
                icon={<MapPin size={18} />}
                title="Shipping Address"
              />

              <div className="mt-5 rounded-xl bg-surface-container p-4">
                <p className="text-sm font-semibold text-text">
                  {order.customer}
                </p>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  123 Main Street
                  <br />
                  Guwahati, Assam 781001
                  <br />
                  India
                </p>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <div className="space-y-6">
            {/* Order status */}

            <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <SectionTitle icon={<Truck size={18} />} title="Order Status" />

              <div className="mt-5 space-y-4">
                <TimelineItem
                  active
                  icon={<CheckCircle2 size={16} />}
                  title="Order placed"
                  description="Order successfully received."
                  time={order.time}
                />

                <TimelineItem
                  active={order.status !== "Pending"}
                  icon={<Clock3 size={16} />}
                  title="Processing"
                  description="Order is being prepared."
                  time="Processing stage"
                />

                <TimelineItem
                  active={
                    order.status === "Shipped" || order.status === "Delivered"
                  }
                  icon={<Truck size={16} />}
                  title="Shipped"
                  description="Package handed to carrier."
                  time="Shipping stage"
                />

                <TimelineItem
                  active={order.status === "Delivered"}
                  icon={<CheckCircle2 size={16} />}
                  title="Delivered"
                  description="Order delivered successfully."
                  time="Delivery stage"
                  last
                />
              </div>
            </section>

            {/* Payment */}

            <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <SectionTitle
                icon={<Package size={18} />}
                title="Payment Information"
              />

              <div className="mt-5 space-y-3">
                <SummaryRow label="Payment Method" value="UPI" />

                <SummaryRow label="Payment Status" value="Paid" />

                <SummaryRow label="Transaction ID" value="TXN10293847" />
              </div>
            </section>

            {/* Notes */}

            <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <SectionTitle icon={<Clock3 size={18} />} title="Admin Notes" />

              <textarea
                placeholder="Add an internal note about this order..."
                className="
                  mt-5
                  min-h-28
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-outline-variant
                  bg-surface
                  p-3
                  text-sm
                  text-text
                  outline-none
                  transition
                  placeholder:text-text-secondary
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/15
                "
              />

              <button
                type="button"
                className="
                  mt-3
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-outline-variant
                  text-sm
                  font-semibold
                  text-text
                  transition
                  hover:bg-surface-container
                "
              >
                Save Note
              </button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-primary">
        {icon}
      </div>

      <h2 className="text-sm font-semibold text-text sm:text-base">{title}</h2>
    </div>
  );
}

/* =========================================================
   TIMELINE
========================================================= */

function TimelineItem({
  active,
  icon,
  title,
  description,
  time,
  last = false,
}) {
  return (
    <div className="relative flex gap-3">
      {!last && (
        <div
          className={`
            absolute
            left-4
            top-8
            h-8
            w-px
            ${active ? "bg-primary/40" : "bg-outline-variant"}
          `}
        />
      )}

      <div
        className={`
          z-10
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          ${
            active
              ? "bg-primary text-white"
              : "bg-surface-container text-text-secondary"
          }
        `}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className={
                active
                  ? "text-xs font-semibold text-text"
                  : "text-xs font-medium text-text-secondary"
              }
            >
              {title}
            </p>

            <p className="mt-1 text-[11px] leading-5 text-text-secondary">
              {description}
            </p>
          </div>

          <span className="shrink-0 text-[10px] text-text-secondary">
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-text-secondary">{label}</span>

      <span className="text-xs font-semibold text-text">{value}</span>
    </div>
  );
}

/* =========================================================
   STATUS
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
   TEMPORARY PRODUCT NAME
========================================================= */

function orderProductName(order) {
  const productMap = {
    "#AF1256": "Wireless Headphones",
    "#AF1255": "Smart Watch",
    "#AF1254": "Running Shoes",
    "#AF1253": "Travel Backpack",
    "#AF1252": "Bluetooth Speaker",
  };

  return productMap[order.id] || "Product";
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

export default AdminOrderDetails;
