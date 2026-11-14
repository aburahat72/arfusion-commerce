import {
  AlertCircle,
  Bell,
  CheckCheck,
  ChevronDown,
  CreditCard,
  Package,
  RotateCcw,
  RefreshCw,
  ShoppingCart,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteAdminNotification,
  getAdminNotifications,
  getAdminUnreadNotificationCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from "../../services/adminApi";

const PAGE_SIZE = 12;

const notificationTypes = [
  "Order",
  "Return",
  "Refund",
  "Replacement",
  "Inventory",
  "Product",
  "Review",
  "Coupon",
  "Payment",
  "System",
];

const notificationIcons = {
  Order: ShoppingCart,
  Return: RotateCcw,
  Refund: CreditCard,
  Replacement: Package,
  Inventory: Package,
  Product: Package,
  Review: Star,
  Coupon: CreditCard,
  Payment: CreditCard,
  System: Bell,
};

function AdminNotificationCenter() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionId, setActionId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadPage = useCallback(
    async (requestedPage, signal) => {
      const params = {
        filter,
        page: requestedPage,
        limit: PAGE_SIZE,
      };
      if (type) params.type = type;
      return getAdminNotifications(params, { signal });
    },
    [filter, type],
  );

  useEffect(() => {
    let active = true;
    getAdminUnreadNotificationCount()
      .then((response) => {
        if (active) setUnreadCount(Number(response?.unreadCount) || 0);
      })
      .catch((requestError) => {
        console.error("Unable to load admin notification count:", requestError);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleNotification = (event) => {
      if (event.detail?.recipient !== "admin") return;
      setUnreadCount((count) => count + 1);
      setRefreshKey((key) => key + 1);
    };
    window.addEventListener("arfusion:notification:new", handleNotification);
    return () =>
      window.removeEventListener(
        "arfusion:notification:new",
        handleNotification,
      );
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await loadPage(1, controller.signal);
        if (!response?.success) {
          throw new Error(response?.message || "Notifications could not be loaded.");
        }
        setNotifications(response.notifications || []);
        setUnreadCount(Number(response.unreadCount) || 0);
        setPage(1);
        setHasMore(Boolean(response.pagination?.hasMore));
      } catch (requestError) {
        if (
          requestError.name !== "CanceledError" &&
          requestError.code !== "ERR_CANCELED"
        ) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Notifications could not be loaded.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadNotifications();
    return () => controller.abort();
  }, [open, filter, type, refreshKey, loadPage]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const loadMore = async () => {
    const nextPage = page + 1;
    try {
      setLoadingMore(true);
      setError("");
      const response = await loadPage(nextPage);
      if (!response?.success) {
        throw new Error(response?.message || "More notifications could not be loaded.");
      }
      setNotifications((current) => {
        const seen = new Set(current.map((item) => item._id));
        return [
          ...current,
          ...(response.notifications || []).filter((item) => !seen.has(item._id)),
        ];
      });
      setUnreadCount(Number(response.unreadCount) || 0);
      setPage(nextPage);
      setHasMore(Boolean(response.pagination?.hasMore));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "More notifications could not be loaded.",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const openNotification = async (notification) => {
    try {
      setActionId(notification._id);
      setError("");
      if (!notification.isRead) {
        const response = await markAdminNotificationAsRead(notification._id);
        if (!response?.success) {
          throw new Error(response?.message || "Notification could not be marked as read.");
        }
        setUnreadCount((count) => Math.max(0, count - 1));
        setNotifications((current) =>
          filter === "unread"
            ? current.filter((item) => item._id !== notification._id)
            : current.map((item) =>
                item._id === notification._id
                  ? { ...item, isRead: true }
                  : item,
              ),
        );
      }
      setOpen(false);
      const destination = getNotificationDestination(notification);
      if (destination) navigate(destination);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Notification could not be marked as read.",
      );
    } finally {
      setActionId("");
    }
  };

  const removeNotification = async (event, notification) => {
    event.stopPropagation();
    try {
      setActionId(notification._id);
      setError("");
      const response = await deleteAdminNotification(notification._id);
      if (!response?.success) {
        throw new Error(response?.message || "Notification could not be deleted.");
      }
      setNotifications((current) =>
        current.filter((item) => item._id !== notification._id),
      );
      if (!notification.isRead) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Notification could not be deleted.",
      );
    } finally {
      setActionId("");
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      setError("");
      const response = await markAllAdminNotificationsAsRead();
      if (!response?.success) {
        throw new Error(response?.message || "Notifications could not be marked as read.");
      }
      setUnreadCount(0);
      setHasMore(false);
      setNotifications((current) =>
        filter === "unread"
          ? []
          : current.map((notification) => ({ ...notification, isRead: true })),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Notifications could not be marked as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="admin-notifications-panel"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition hover:bg-surface-container hover:text-text"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          id="admin-notifications-panel"
          role="dialog"
          aria-label="Admin notifications"
          className="absolute right-0 top-14 z-50 flex max-h-[min(75vh,42rem)] w-[min(92vw,26rem)] flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl"
        >
          <header className="flex items-start justify-between gap-3 border-b border-outline-variant p-4">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-text">Notifications</h2>
              <p className="mt-1 text-xs text-text-secondary">
                {formatNumber(unreadCount)} unread
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={!unreadCount || markingAll}
                title="Mark all as read"
                aria-label="Mark all notifications as read"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-container hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {markingAll ? (
                  <RefreshIndicator />
                ) : (
                  <CheckCheck size={17} />
                )}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-container"
              >
                <X size={17} />
              </button>
            </div>
          </header>

          <div className="space-y-3 border-b border-outline-variant p-3">
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-container p-1">
              {[
                ["all", "All"],
                ["unread", "Unread"],
                ["read", "Read"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={`rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                    filter === value
                      ? "bg-surface text-text shadow-sm"
                      : "text-text-secondary hover:text-text"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="flex items-center justify-between gap-2 text-xs text-text-secondary">
              Type
              <span className="relative">
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  aria-label="Filter by notification type"
                  className="h-9 min-w-36 appearance-none rounded-lg border border-outline-variant bg-surface pl-3 pr-8 text-xs text-text"
                >
                  <option value="">All types</option>
                  {notificationTypes.map((notificationType) => (
                    <option key={notificationType} value={notificationType}>
                      {notificationType}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                />
              </span>
            </label>
          </div>

          {error && (
            <div
              role="alert"
              className="mx-3 mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="min-h-24 flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="space-y-2 p-2" role="status">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-xl bg-surface-container"
                  />
                ))}
              </div>
            ) : notifications.length ? (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    disabled={actionId === notification._id}
                    onOpen={() => openNotification(notification)}
                    onDelete={(event) => removeNotification(event, notification)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-32 flex-col items-center justify-center gap-2 px-4 text-center">
                <Bell size={22} className="text-text-secondary/60" />
                <p className="text-sm font-medium text-text">
                  {filter === "unread"
                    ? "You're all caught up"
                    : "No notifications"}
                </p>
                <p className="text-xs text-text-secondary">
                  {filter === "unread"
                    ? "New admin updates will appear here."
                    : "Updates about orders and store activity will appear here."}
                </p>
              </div>
            )}
          </div>

          {hasMore && !loading && (
            <footer className="border-t border-outline-variant p-3">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold text-primary transition hover:bg-primary-container/50 disabled:opacity-60"
              >
                {loadingMore && <RefreshIndicator />}
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </footer>
          )}
        </section>
      )}
    </div>
  );
}

function NotificationItem({ notification, disabled, onOpen, onDelete }) {
  const Icon = notificationIcons[notification.type] || Bell;
  return (
    <div
      className={`group flex items-start gap-2 rounded-xl p-2 transition ${
        notification.isRead
          ? "hover:bg-surface-container"
          : "bg-primary-container/25 hover:bg-primary-container/40"
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:opacity-60"
      >
        <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-primary shadow-sm">
          <Icon size={16} />
          {!notification.isRead && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-primary" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="line-clamp-1 text-xs font-semibold text-text">
              {notification.title}
            </span>
            <span className="shrink-0 text-[10px] text-text-secondary">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </span>
          <span className="mt-1 line-clamp-2 block text-[11px] leading-4 text-text-secondary">
            {notification.message}
          </span>
          <span className="mt-1.5 inline-flex rounded-full bg-surface px-2 py-0.5 text-[9px] font-semibold text-text-secondary">
            {notification.type}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        aria-label={`Delete ${notification.title}`}
        title="Delete notification"
        className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-secondary opacity-70 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 disabled:opacity-40"
      >
        {disabled ? <RefreshIndicator /> : <Trash2 size={14} />}
      </button>
    </div>
  );
}

function RefreshIndicator() {
  return (
    <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
  );
}

function getNotificationDestination(notification) {
  const orderId =
    typeof notification.relatedOrder === "string"
      ? notification.relatedOrder
      : notification.relatedOrder?._id;
  if (orderId) return `/admin/orders/${orderId}`;

  const productId =
    typeof notification.relatedProduct === "string"
      ? notification.relatedProduct
      : notification.relatedProduct?._id;
  if (productId) return `/admin/products/${productId}`;

  if (notification.type === "Review") return "/admin/reviews";
  if (notification.type === "Inventory") return "/admin/inventory";
  if (notification.type === "Product") return "/admin/products";
  if (notification.type === "System") return "/admin";
  return null;
}

function formatRelativeTime(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Unknown date";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

export default AdminNotificationCenter;
