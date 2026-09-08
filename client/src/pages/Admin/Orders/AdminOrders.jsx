import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Loader2,
  Search,
  Truck,
  XCircle,
  LockKeyhole,
  CircleDot,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "../../../services/adminApi";

function AdminOrders() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const limit = 10;

  // =====================================================
  // STATUS FILTERS
  // =====================================================

  const statuses = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminOrders({
        page,
        limit,
      });

      const data = response?.data;

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load orders.");
      }

      const receivedOrders = Array.isArray(data.orders) ? data.orders : [];

      setOrders(receivedOrders);

      setTotalOrders(
        Number(
          data.totalOrders ?? data.total ?? data.count ?? receivedOrders.length,
        ) || 0,
      );

      setTotalPages(
        Math.max(Number(data.totalPages ?? data.pages ?? 1) || 1, 1),
      );
    } catch (error) {
      console.error("Fetch admin orders error:", error);

      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load orders.",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // =====================================================
  // SEARCH + STATUS FILTER
  // =====================================================

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderId = String(order?._id || "").toLowerCase();

      const displayOrderId = getDisplayOrderId(order).toLowerCase();

      const customerName = String(
        order?.user?.fullName ||
          order?.customer?.fullName ||
          order?.shippingAddress?.fullName ||
          "",
      ).toLowerCase();

      const customerEmail = String(
        order?.user?.email || order?.customer?.email || "",
      ).toLowerCase();

      const matchesSearch =
        !query ||
        orderId.includes(query) ||
        displayOrderId.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query);

      const matchesStatus =
        status === "All" ||
        String(order?.orderStatus || "").toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  // =====================================================
  // VIEW ORDER
  // =====================================================

  const handleViewOrder = (order) => {
    if (!order?._id) {
      return;
    }

    navigate(`/admin/orders/${order._id}`);
  };

  // =====================================================
  // CHANGE ORDER STATUS
  // =====================================================

  const handleStatusChange = async (order, nextStatus) => {
    if (!order?._id || !nextStatus) {
      return;
    }

    const currentStatus = order?.orderStatus || "Unknown";

    if (currentStatus === nextStatus) {
      return;
    }

    // -------------------------------------------------
    // FRONTEND SAFETY CHECK
    // -------------------------------------------------

    const validation = validateStatusTransition(order, nextStatus);

    if (!validation.allowed) {
      setError(validation.message);
      return;
    }

    const confirmationMessage =
      nextStatus === "Cancelled"
        ? `Cancel order ${getDisplayOrderId(
            order,
          )}?\n\nThis action will cancel the order and restore the ordered product stock.`
        : `Move order ${getDisplayOrderId(
            order,
          )} from "${currentStatus}" to "${nextStatus}"?`;

    const confirmed = window.confirm(confirmationMessage);

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(order._id);
      setError("");

      const response = await updateAdminOrderStatus(order._id, nextStatus);

      const data = response?.data;

      if (!data?.success) {
        throw new Error(data?.message || "Failed to update order status.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((item) => {
          if (item._id !== order._id) {
            return item;
          }

          if (data.order && typeof data.order === "object") {
            return {
              ...item,
              ...data.order,
            };
          }

          return {
            ...item,
            orderStatus: nextStatus,
          };
        }),
      );
    } catch (error) {
      console.error("Update admin order status error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update order status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // STATUS FILTER
  // =====================================================

  const handleStatusFilterChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearchChange = (event) => {
    setSearch(event.target.value);

    if (page !== 1) {
      setPage(1);
    }
  };

  // =====================================================
  // RETRY
  // =====================================================

  const handleRetry = () => {
    fetchOrders();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <p className="text-sm text-text-secondary">Sales</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Manage customer orders and fulfillment.
          </p>
        </div>

        <section className="flex min-h-80 items-center justify-center rounded-2xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-primary" />

            <p className="text-sm text-text-secondary">Loading orders...</p>
          </div>
        </section>
      </main>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      {/* HEADER */}

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
            {totalOrders} {totalOrders === 1 ? "order" : "orders"}
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-700">
              Order operation failed
            </p>

            <p className="mt-1 break-words text-xs text-red-600">{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 text-xs font-semibold text-red-700 hover:underline"
            >
              Try again
            </button>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* FILTER BAR */}

      <section className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            />

            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search order ID, customer or email..."
              className="h-11 w-full rounded-xl border border-outline-variant bg-surface pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-text-secondary hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(event) => handleStatusFilterChange(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-outline-variant bg-surface py-2 pl-3 pr-9 text-sm text-text outline-none transition hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-48"
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

      {/* RESULTS INFO */}

      {(search.trim() || status !== "All") && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-text-secondary">
            Showing {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "order" : "orders"} on this page
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("All");
              setPage(1);
            }}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* DESKTOP TABLE */}

      <section className="mt-6 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/60">
                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Order
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Customer
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Items
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Amount
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Payment
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                  Created
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <OrderTableRow
                  key={order._id}
                  order={order}
                  onView={handleViewOrder}
                  onStatusChange={handleStatusChange}
                  actionLoading={actionLoading}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && <EmptyOrders />}
      </section>

      {/* MOBILE */}

      <section className="mt-6 space-y-3 md:hidden">
        {filteredOrders.map((order) => (
          <OrderMobileCard
            key={order._id}
            order={order}
            onView={handleViewOrder}
            onStatusChange={handleStatusChange}
            actionLoading={actionLoading}
          />
        ))}

        {filteredOrders.length === 0 && (
          <div className="rounded-2xl border border-outline-variant bg-surface p-8">
            <EmptyOrders />
          </div>
        )}
      </section>

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">
            Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              className="rounded-xl border border-outline-variant px-4 py-2 text-xs font-semibold text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((current) => Math.min(current + 1, totalPages))
              }
              className="rounded-xl border border-outline-variant px-4 py-2 text-xs font-semibold text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   TABLE ROW
========================================================= */

function OrderTableRow({ order, onView, onStatusChange, actionLoading }) {
  const customerName =
    order?.user?.fullName ||
    order?.customer?.fullName ||
    order?.shippingAddress?.fullName ||
    "Unknown Customer";

  const customerEmail =
    order?.user?.email || order?.customer?.email || "No email";

  const isLoading = actionLoading === order?._id;

  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onView(order)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {getDisplayOrderId(order)}
        </button>

        <p className="mt-1 max-w-32 truncate text-[10px] text-text-secondary">
          {order?._id || "No order ID"}
        </p>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
            <span className="text-xs font-semibold">
              {getInitials(customerName)}
            </span>
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">
              {customerName}
            </p>

            <p className="max-w-44 truncate text-[10px] text-text-secondary">
              {customerEmail}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="text-sm text-text">
          {Array.isArray(order?.items) ? order.items.length : 0}
        </span>

        <p className="text-[10px] text-text-secondary">
          {getItemQuantity(order)} units
        </p>
      </td>

      <td className="px-5 py-4 text-sm font-semibold text-text">
        {formatCurrency(
          order?.totalPrice ?? order?.totalAmount ?? order?.grandTotal,
        )}
      </td>

      <td className="px-5 py-4">
        <PaymentInfo order={order} />
      </td>

      <td className="px-5 py-4">
        <OrderStatus status={order?.orderStatus} order={order} />
      </td>

      <td className="px-5 py-4 text-sm text-text-secondary">
        {formatDate(order?.createdAt)}
      </td>

      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onView(order)}
            aria-label={`View ${getDisplayOrderId(order)}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-container hover:text-primary"
          >
            <Eye size={18} />
          </button>

          <OrderActions
            order={order}
            onStatusChange={onStatusChange}
            loading={isLoading}
          />
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function OrderMobileCard({ order, onView, onStatusChange, actionLoading }) {
  const customerName =
    order?.user?.fullName ||
    order?.customer?.fullName ||
    order?.shippingAddress?.fullName ||
    "Unknown Customer";

  const customerEmail =
    order?.user?.email || order?.customer?.email || "No email";

  const isLoading = actionLoading === order?._id;

  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
          <span className="text-sm font-semibold">
            {getInitials(customerName)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onView(order)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {getDisplayOrderId(order)}
              </button>

              <p className="mt-1 truncate text-sm font-medium text-text">
                {customerName}
              </p>

              <p className="truncate text-[10px] text-text-secondary">
                {customerEmail}
              </p>
            </div>

            <OrderStatus status={order?.orderStatus} order={order} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-text-secondary">Amount</p>

              <p className="mt-0.5 text-sm font-semibold text-text">
                {formatCurrency(
                  order?.totalPrice ?? order?.totalAmount ?? order?.grandTotal,
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-text-secondary">Items</p>

              <p className="mt-0.5 text-sm font-semibold text-text">
                {getItemQuantity(order)}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-text-secondary">Payment</p>

              <p className="mt-0.5 text-xs font-semibold text-text">
                {order?.paymentMethod || order?.payment?.method || "COD"}
              </p>

              <p className="mt-0.5 text-[10px] text-text-secondary">
                {getPaymentStatus(order)}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-text-secondary">Created</p>

              <p className="mt-0.5 text-xs text-text-secondary">
                {formatDate(order?.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onView(order)}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant text-sm font-semibold text-text transition hover:bg-surface-container hover:text-primary"
        >
          <Eye size={16} />
          View
        </button>

        <OrderActions
          order={order}
          onStatusChange={onStatusChange}
          loading={isLoading}
          mobile
        />
      </div>
    </article>
  );
}

/* =========================================================
   ORDER ACTIONS
========================================================= */

function OrderActions({ order, onStatusChange, loading, mobile = false }) {
  const actions = getAvailableActions(order);

  if (actions.length === 0) {
    return (
      <span
        className={
          mobile
            ? "flex h-10 flex-1 items-center justify-center rounded-xl bg-surface-container px-2 text-center text-xs font-semibold text-text-secondary"
            : "px-2 text-[10px] text-text-secondary"
        }
      >
        {getNoActionMessage(order)}
      </span>
    );
  }

  return (
    <div className={mobile ? "flex flex-1 gap-2" : "flex items-center gap-1"}>
      {actions.map((action) => {
        const ActionIcon = action.icon;

        return (
          <button
            key={action.status}
            type="button"
            disabled={loading || action.disabled}
            title={action.disabled ? action.disabledReason : action.label}
            onClick={() => onStatusChange(order, action.status)}
            className={`
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                px-3
                text-xs
                font-semibold
                transition
                disabled:cursor-not-allowed
                disabled:opacity-45
                ${
                  action.danger
                    ? "border border-red-200 text-red-600 hover:bg-red-50"
                    : action.disabled
                      ? "border border-outline-variant bg-surface-container text-text-secondary"
                      : "bg-primary text-white hover:opacity-90"
                }
                ${mobile ? "flex-1" : "h-9 px-2.5"}
              `}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ActionIcon size={14} />
            )}

            <span className={mobile ? "" : "hidden xl:inline"}>
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   AVAILABLE ACTIONS
========================================================= */

function getAvailableActions(order) {
  const status = order?.orderStatus;

  const paymentStatus = getPaymentStatus(order);

  switch (status) {
    case "Pending":
      return [
        {
          label: "Process",
          status: "Processing",
          icon: Clock3,
          danger: false,
          disabled: false,
        },
        {
          label: "Cancel",
          status: "Cancelled",
          icon: XCircle,
          danger: true,
          disabled: false,
        },
      ];

    case "Processing":
      return [
        {
          label: "Ship",
          status: "Shipped",
          icon: Truck,
          danger: false,
          disabled: false,
        },
        {
          label: "Cancel",
          status: "Cancelled",
          icon: XCircle,
          danger: true,
          disabled: false,
        },
      ];

    case "Shipped": {
      const isPaid = paymentStatus === "Paid";

      return [
        {
          label: isPaid ? "Deliver" : "Payment Pending",
          status: "Delivered",
          icon: isPaid ? CheckCircle2 : LockKeyhole,
          danger: false,
          disabled: !isPaid,
          disabledReason:
            "COD order cannot be delivered until payment is marked as Paid.",
        },
      ];
    }

    case "Delivered":
      return [];

    case "Cancelled":
      return [];

    default:
      return [];
  }
}

/* =========================================================
   STATUS TRANSITION VALIDATION
========================================================= */

function validateStatusTransition(order, nextStatus) {
  const currentStatus = order?.orderStatus;

  const paymentStatus = getPaymentStatus(order);

  if (
    nextStatus === "Delivered" &&
    currentStatus === "Shipped" &&
    paymentStatus !== "Paid"
  ) {
    return {
      allowed: false,
      message:
        "This order cannot be delivered because the payment is still Pending. For COD orders, mark payment as Paid after receiving the payment.",
    };
  }

  const transitions = {
    Pending: ["Processing", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered"],
    Delivered: [],
    Cancelled: [],
  };

  const allowed = transitions[currentStatus]?.includes(nextStatus);

  if (!allowed) {
    return {
      allowed: false,
      message: `Order cannot move from ${currentStatus} to ${nextStatus}.`,
    };
  }

  return {
    allowed: true,
  };
}

/* =========================================================
   PAYMENT INFO
========================================================= */

function PaymentInfo({ order }) {
  const method = order?.paymentMethod || order?.payment?.method || "COD";

  const paymentStatus = getPaymentStatus(order);

  const isPaid = paymentStatus === "Paid";

  const isFailed = paymentStatus === "Failed";

  return (
    <div>
      <p className="text-xs font-semibold text-text">{method}</p>

      <p
        className={`
          mt-0.5
          text-[10px]
          font-medium
          ${
            isPaid
              ? "text-green-600"
              : isFailed
                ? "text-red-600"
                : "text-orange-600"
          }
        `}
      >
        {paymentStatus}
      </p>

      {method === "COD" && !isPaid && (
        <p className="mt-1 flex items-center gap-1 text-[9px] font-medium text-orange-600">
          <LockKeyhole size={10} />
          Delivery locked
        </p>
      )}
    </div>
  );
}

/* =========================================================
   PAYMENT STATUS
========================================================= */

function getPaymentStatus(order) {
  return order?.paymentStatus || order?.payment?.status || "Pending";
}

/* =========================================================
   ORDER STATUS
========================================================= */

function OrderStatus({ status, order }) {
  const paymentStatus = getPaymentStatus(order);

  const config = {
    Pending: {
      className: "bg-orange-50 text-orange-600",
      icon: Clock3,
    },

    Processing: {
      className: "bg-blue-50 text-blue-600",
      icon: CircleDot,
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
    <div className="flex flex-col items-start gap-1">
      <span
        className={`
          inline-flex
          items-center
          gap-1.5
          whitespace-nowrap
          rounded-full
          px-2.5
          py-1.5
          text-[10px]
          font-semibold
          ${item.className}
        `}
      >
        <Icon size={12} />
        {status || "Unknown"}
      </span>

      {status === "Shipped" && paymentStatus !== "Paid" && (
        <span className="flex items-center gap-1 text-[9px] font-medium text-orange-600">
          <LockKeyhole size={9} />
          Awaiting payment
        </span>
      )}
    </div>
  );
}

/* =========================================================
   NO ACTION MESSAGE
========================================================= */

function getNoActionMessage(order) {
  const status = order?.orderStatus;

  if (status === "Delivered") {
    return "Completed";
  }

  if (status === "Cancelled") {
    return "Cancelled";
  }

  return "No actions";
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
   ORDER DISPLAY ID
========================================================= */

function getDisplayOrderId(order) {
  if (!order?._id) {
    return "#ORDER";
  }

  return `#${order._id.toString().slice(-8).toUpperCase()}`;
}

/* =========================================================
   ITEM QUANTITY
========================================================= */

function getItemQuantity(order) {
  if (!Array.isArray(order?.items)) {
    return 0;
  }

  return order.items.reduce(
    (total, item) => total + (Number(item?.quantity) || 0),
    0,
  );
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {
  if (!name) {
    return "CU";
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "CU";
}

/* =========================================================
   DATE
========================================================= */

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default AdminOrders;
