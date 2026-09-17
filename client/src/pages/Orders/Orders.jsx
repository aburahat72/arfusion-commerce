import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Package,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../../services/orderService";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyOrders();

      setOrders(response?.orders || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load your orders. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getProductImage = (product) => {
    if (!product?.images?.length) return null;

    const firstImage = product.images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    return firstImage?.url || null;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return {
          dot: "bg-green-500",
          text: "text-green-700",
          bg: "bg-green-50",
        };

      case "Shipped":
        return {
          dot: "bg-blue-500",
          text: "text-blue-700",
          bg: "bg-blue-50",
        };

      case "Processing":
        return {
          dot: "bg-yellow-500",
          text: "text-yellow-700",
          bg: "bg-yellow-50",
        };

      case "Cancelled":
        return {
          dot: "bg-red-500",
          text: "text-red-700",
          bg: "bg-red-50",
        };

      case "Pending":
      default:
        return {
          dot: "bg-gray-500",
          text: "text-gray-700",
          bg: "bg-gray-50",
        };
    }
  };

  return (
    <main className="min-h-screen bg-background py-6 sm:py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to Profile
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            My Orders
          </h1>

          {!loading && !error && orders.length > 0 && (
            <p className="mt-1 text-sm text-text-secondary">
              {orders.length} {orders.length === 1 ? "order" : "orders"} placed
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm"
              >
                <div className="animate-pulse">
                  <div className="h-14 bg-outline-variant/40" />

                  <div className="flex gap-4 p-5">
                    <div className="h-28 w-28 shrink-0 rounded-xl bg-outline-variant/50" />

                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-2/3 rounded bg-outline-variant/50" />
                      <div className="h-4 w-1/3 rounded bg-outline-variant/50" />
                      <div className="h-4 w-1/4 rounded bg-outline-variant/50" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <section className="rounded-2xl border border-outline-variant bg-surface p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <RefreshCw size={24} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-text">
              Something went wrong
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchOrders}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </section>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <section className="rounded-2xl border border-outline-variant bg-surface p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <ShoppingBag size={34} />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-text">
              You haven't placed any orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Once you place an order, you can view your products, order status,
              payment details, and more here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <ShoppingBag size={17} />
              Continue Shopping
            </button>
          </section>
        )}

        {/* Orders */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => {
              const status = getStatusStyle(order.orderStatus);

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm"
                >
                  {/* Order Header */}
                  <div className="border-b border-outline-variant bg-background px-4 py-4 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                          Order ID
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-text">
                          #{order.orderNumber || order._id}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                        <span>
                          Ordered on{" "}
                          <span className="font-medium text-text">
                            {formatDate(order.createdAt)}
                          </span>
                        </span>

                        <span className="hidden h-4 w-px bg-outline-variant sm:block" />

                        <span>
                          Total{" "}
                          <span className="font-semibold text-text">
                            {formatPrice(order.totalPrice)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="divide-y divide-outline-variant">
                    {order.items?.map((item, index) => {
                      const product = item.product;
                      const image = getProductImage(product);

                      return (
                        <div
                          key={`${order._id}-${product?._id || index}`}
                          className="flex gap-4 p-4 sm:gap-5 sm:p-6"
                        >
                          {/* Product Image */}
                          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-background sm:h-32 sm:w-32">
                            {image ? (
                              <img
                                src={image}
                                alt={product?.name || "Product"}
                                className="h-full w-full object-contain p-2"
                                loading="lazy"
                              />
                            ) : (
                              <Package
                                size={30}
                                className="text-text-secondary"
                              />
                            )}
                          </div>

                          {/* Product Information */}
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-semibold text-text sm:text-base">
                              {product?.name || "Product unavailable"}
                            </h3>

                            {product?.brand && (
                              <p className="mt-1 text-xs text-text-secondary">
                                {product.brand}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                              <span>
                                Qty:{" "}
                                <span className="font-medium text-text">
                                  {item.quantity}
                                </span>
                              </span>

                              <span>
                                Price:{" "}
                                <span className="font-medium text-text">
                                  {formatPrice(item.price)}
                                </span>
                              </span>
                            </div>

                            <div className="mt-4">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${status.bg} ${status.text}`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${status.dot}`}
                                />
                                {order.orderStatus || "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col gap-3 border-t border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span>
                        Payment:{" "}
                        <span className="font-semibold text-text">
                          {order.paymentMethod || "N/A"}
                        </span>
                      </span>

                      <span>•</span>

                      <span>{order.paymentStatus || "Pending"}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/profile/orders/${order._id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
                    >
                      View Order Details
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Orders;
