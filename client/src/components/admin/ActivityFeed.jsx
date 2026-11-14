import { Clock3, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ActivityFeed({ orders = [] }) {
  const navigate = useNavigate();

  return (
    <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-text sm:text-lg">
          Latest order activity
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          Orders received during this period
        </p>
      </div>
      <div className="mt-4 space-y-1">
        {orders.length ? (
          orders.slice(0, 5).map((order) => {
            const orderId = String(order._id);
            return (
              <button
                key={orderId}
                type="button"
                onClick={() => navigate(`/admin/orders/${orderId}`)}
                className="flex w-full items-start gap-3 rounded-xl p-2 text-left transition hover:bg-surface-container"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
                  <ShoppingCart size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-text">
                    Order #{orderId.slice(-6).toUpperCase()} received
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-text-secondary">
                    <Clock3 size={12} />
                    {formatDateTime(order.createdAt)}
                  </span>
                </span>
                <span className="mt-1 shrink-0 text-[10px] font-semibold text-text-secondary">
                  {order.orderStatus}
                </span>
              </button>
            );
          })
        ) : (
          <p className="py-8 text-center text-sm text-text-secondary">
            No order activity in this period.
          </p>
        )}
      </div>
    </section>
  );
}

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date unavailable";

export default ActivityFeed;
