import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  RotateCcw,
  Star,
  Truck,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById, requestReturn } from "../../services/orderService";
import {
  getMyOrderReviews,
  submitReview,
} from "../../services/reviewService";

function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");
  const [eventRefresh, setEventRefresh] = useState(0);
  const [returnReason, setReturnReason] = useState("");
  const [returnType, setReturnType] = useState("Replacement");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnMessage, setReturnMessage] = useState("");
  const [orderReviews, setOrderReviews] = useState([]);
  const [reviewLoadError, setReviewLoadError] = useState("");
  const [reviewStatusLoading, setReviewStatusLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getOrderById(orderId);

        if (!isMounted) return;

        setOrder(response?.order || null);
        setOrderReviews([]);
        setReviewLoadError("");
        setReviewStatusLoading(true);
        try {
          const reviewResponse = await getMyOrderReviews(orderId);
          if (isMounted) setOrderReviews(reviewResponse.reviews || []);
        } catch (reviewError) {
          if (!isMounted) return;
          console.error("Order review status fetch error:", reviewError);
          setReviewLoadError(
            reviewError?.response?.data?.message ||
              "Unable to load your review status.",
          );
        } finally {
          if (isMounted) setReviewStatusLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;

        setError(
          err?.response?.data?.message ||
            "Unable to load order details. Please try again.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (orderId) fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId, eventRefresh]);

  useEffect(() => {
    const refreshOrder = (event) => {
      if (event.detail?.orderId === orderId) {
        setEventRefresh((refresh) => refresh + 1);
      }
    };
    window.addEventListener("arfusion:order:status", refreshOrder);
    window.addEventListener("arfusion:payment:status", refreshOrder);
    return () => {
      window.removeEventListener("arfusion:order:status", refreshOrder);
      window.removeEventListener("arfusion:payment:status", refreshOrder);
    };
  }, [orderId]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProductImage = (product) => {
    if (!product?.images?.length) {
      return null;
    }

    const image = product.images[0];

    if (typeof image === "string") {
      return image;
    }

    return image?.url || null;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Delivered":
        return {
          icon: CheckCircle2,
          text: "Delivered",
          container: "border-green-200 bg-green-50",
          textClass: "text-green-700",
          iconClass: "text-green-600",
        };

      case "Shipped":
        return {
          icon: Truck,
          text: "Shipped",
          container: "border-blue-200 bg-blue-50",
          textClass: "text-blue-700",
          iconClass: "text-blue-600",
        };

      case "Processing":
        return {
          icon: Package,
          text: "Processing",
          container: "border-yellow-200 bg-yellow-50",
          textClass: "text-yellow-700",
          iconClass: "text-yellow-600",
        };

      case "Cancelled":
        return {
          icon: XCircle,
          text: "Cancelled",
          container: "border-red-200 bg-red-50",
          textClass: "text-red-700",
          iconClass: "text-red-600",
        };

      case "Pending":
      default:
        return {
          icon: Clock3,
          text: "Pending",
          container: "border-gray-200 bg-gray-50",
          textClass: "text-gray-700",
          iconClass: "text-gray-600",
        };
    }
  };

  const getTimelineStatus = (step) => {
    const steps = ["Pending", "Processing", "Shipped", "Delivered"];
    const currentIndex = steps.indexOf(order?.orderStatus);
    const stepIndex = steps.indexOf(step);

    if (order?.orderStatus === "Cancelled") {
      return "inactive";
    }

    if (currentIndex === -1) {
      return "inactive";
    }

    return stepIndex <= currentIndex ? "completed" : "inactive";
  };

  const calculateItemTotal = () => {
    return (
      order?.items?.reduce((total, item) => {
        return total + (Number(item.price) || 0) * (Number(item.quantity) || 0);
      }, 0) || 0
    );
  };

  const calculateTotalQuantity = () => {
    return (
      order?.items?.reduce((total, item) => {
        return total + (Number(item.quantity) || 0);
      }, 0) || 0
    );
  };

  const canRequestReturn =
    order?.orderStatus === "Delivered" &&
    order?.returnStatus === "Not Requested" &&
    Boolean(order?.returnEligibleUntil);

  const handleReviewSubmitted = (review) => {
    setOrderReviews((current) => [...current, review]);
  };

  const canRequestRefund =
    order?.paymentMethod === "ONLINE" &&
    order?.paymentStatus === "Paid";

  const submitReturnRequest = async (event) => {
    event.preventDefault();
    if (returnSubmitting) return;
    setReturnSubmitting(true);
    setReturnError("");
    setReturnMessage("");
    try {
      const response = await requestReturn(orderId, {
        returnReason,
        requestType: returnType,
      });
      if (!response?.success || !response.order) {
        throw new Error(response?.message || "Return request failed.");
      }
      setOrder(response.order);
      setReturnMessage(response.message);
      setReturnReason("");
    } catch (requestError) {
      setReturnError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to submit return request.",
      );
    } finally {
      setReturnSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-6 sm:py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-5">
            <div className="h-5 w-32 rounded bg-outline-variant" />

            <div className="h-28 rounded-2xl bg-outline-variant" />

            <div className="h-44 rounded-2xl bg-outline-variant" />

            <div className="h-72 rounded-2xl bg-outline-variant" />

            <div className="h-48 rounded-2xl bg-outline-variant" />
          </div>
        </div>
      </main>
    );
  }

  const displayError = orderId ? error : "Invalid order ID.";
  if (displayError || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <section className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <XCircle size={30} />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-text">
            Order not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {displayError || "We couldn't find this order."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/profile/orders")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <ArrowLeft size={17} />
            Back to Orders
          </button>
        </section>
      </main>
    );
  }

  const statusConfig = getStatusConfig(order.orderStatus);
  const StatusIcon = statusConfig.icon;

  const itemTotal = calculateItemTotal();
  const totalQuantity = calculateTotalQuantity();

  return (
    <main className="min-h-screen bg-background py-6 sm:py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/profile/orders")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to Orders
        </button>

        {/* Order Header */}
        <section className="rounded-2xl border border-outline-variant bg-surface shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Order ID
                </p>

                <h1 className="mt-1 break-all text-lg font-bold text-text sm:text-xl">
                  #{order.orderNumber || order._id}
                </h1>

                <p className="mt-2 text-sm text-text-secondary">
                  Ordered on {formatDate(order.createdAt)}
                </p>
              </div>

              <div
                className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 ${statusConfig.container}`}
              >
                <StatusIcon size={18} className={statusConfig.iconClass} />

                <span
                  className={`text-sm font-semibold ${statusConfig.textClass}`}
                >
                  {statusConfig.text}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tracking */}
        <section className="mt-5 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Truck size={19} className="text-primary" />

            <h2 className="text-base font-semibold text-text">
              Order Tracking
            </h2>
          </div>

          {order.orderStatus === "Cancelled" ? (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <XCircle size={22} className="shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Order Cancelled
                </p>

                <p className="mt-1 text-xs text-red-600">
                  This order has been cancelled.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-7 grid grid-cols-4">
              {["Pending", "Processing", "Shipped", "Delivered"].map(
                (step, index) => {
                  const completed = getTimelineStatus(step) === "completed";

                  return (
                    <div key={step} className="relative">
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            completed
                              ? "border-primary bg-primary text-white"
                              : "border-outline-variant bg-surface text-text-secondary"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <span className="text-xs font-semibold">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-2 text-[11px] font-medium sm:text-xs ${
                            completed ? "text-primary" : "text-text-secondary"
                          }`}
                        >
                          {step}
                        </p>
                      </div>

                      {index < 3 && (
                        <div
                          className={`absolute left-1/2 right-0 top-5 h-0.5 ${
                            getTimelineStatus(
                              ["Pending", "Processing", "Shipped", "Delivered"][
                                index + 1
                              ],
                            ) === "completed"
                              ? "bg-primary"
                              : "bg-outline-variant"
                          }`}
                        />
                      )}
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        {/* Products */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-text">
                Ordered Products
              </h2>

              <p className="mt-1 text-xs text-text-secondary">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"} in this
                order
              </p>
            </div>
          </div>

          <div className="divide-y divide-outline-variant">
            {order.items?.map((item, index) => {
              const product = item.product;
              const image = getProductImage(product);
              const productId = product?._id || item.product;
              const existingReview = orderReviews.find(
                (review) => String(review.product) === String(productId),
              );

              return (
                <div
                  key={`${order._id}-${product?._id || index}`}
                  className="flex gap-4 p-5 sm:gap-6 sm:p-6"
                >
                  {/* Product Image */}
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-background sm:h-36 sm:w-36">
                    {image ? (
                      <img
                        src={image}
                        alt={product?.name || "Product"}
                        className="h-full w-full object-contain p-2"
                        loading="lazy"
                      />
                    ) : (
                      <Package size={34} className="text-text-secondary" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-text sm:text-base">
                      {product?.name || "Product unavailable"}
                    </h3>

                    {product?.brand && (
                      <p className="mt-1 text-xs text-text-secondary">
                        Brand: {product.brand}
                      </p>
                    )}

                    {product?.category && (
                      <p className="mt-1 text-xs text-text-secondary">
                        Category:{" "}
                        {typeof product.category === "string"
                          ? product.category
                          : product.category?.name || "N/A"}
                      </p>
                    )}

                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-text-secondary">
                        Quantity:{" "}
                        <span className="font-semibold text-text">
                          {item.quantity}
                        </span>
                      </p>

                      <p className="text-sm text-text-secondary">
                        Unit Price:{" "}
                        <span className="font-semibold text-text">
                          {formatPrice(item.price)}
                        </span>
                      </p>

                      <p className="text-sm text-text-secondary">
                        Item Total:{" "}
                        <span className="font-semibold text-text">
                          {formatPrice(
                            (Number(item.price) || 0) *
                              (Number(item.quantity) || 0),
                          )}
                        </span>
                      </p>
                    </div>
                  </div>

                  {order.orderStatus === "Delivered" &&
                    productId &&
                    (reviewLoadError ? (
                      <p role="alert" className="mt-4 text-sm text-error">
                        {reviewLoadError}
                      </p>
                    ) : reviewStatusLoading ? (
                      <p className="mt-4 text-sm text-text-secondary">
                        Loading review status...
                      </p>
                    ) : (
                      <OrderItemReview
                        orderId={order._id}
                        productId={productId}
                        existingReview={existingReview}
                        onSubmitted={handleReviewSubmitted}
                      />
                    ))}
                </div>
              );
            })}
          </div>
        </section>

        {/* Delivery + Payment */}
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {/* Delivery Address */}
          <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <MapPin size={19} className="text-primary" />

              <h2 className="text-base font-semibold text-text">
                Delivery Address
              </h2>
            </div>

            <div className="mt-4 rounded-xl bg-background p-4">
              <p className="whitespace-pre-line text-sm leading-6 text-text-secondary">
                {order.shippingAddress || "Address unavailable"}
              </p>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <CreditCard size={19} className="text-primary" />

              <h2 className="text-base font-semibold text-text">
                Payment Information
              </h2>
            </div>

            <div className="mt-4 space-y-3 rounded-xl bg-background p-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-text-secondary">Payment Method</span>

                <span className="font-semibold text-text">
                  {order.paymentMethod || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-text-secondary">Payment Status</span>

                <span
                  className={`font-semibold ${
                    order.paymentStatus === "Paid"
                      ? "text-green-600"
                      : order.paymentStatus === "Failed"
                        ? "text-red-600"
                        : "text-text"
                  }`}
                >
                  {order.paymentStatus || "Pending"}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Price Details */}
        <section className="mt-5 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <CreditCard size={19} className="text-primary" />

            <h2 className="text-base font-semibold text-text">Price Details</h2>
          </div>

          <div className="mt-5 max-w-xl space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary">Total Items</span>

              <span className="font-medium text-text">{totalQuantity}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary">Item Total</span>

              <span className="font-medium text-text">
                {formatPrice(itemTotal)}
              </span>
            </div>

            <div className="border-t border-outline-variant pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-semibold text-text">
                  Total Amount
                </span>

                <span className="text-xl font-bold text-primary">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Order Metadata */}
        <section className="mt-5 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <RotateCcw size={19} className="text-primary" />
            <h2 className="text-base font-semibold text-text">
              Returns and refunds
            </h2>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-sm text-text-secondary">
              Return status:{" "}
              <span className="font-semibold text-text">
                {order.returnStatus || "Not Requested"}
              </span>
              {order.refundStatus &&
                order.refundStatus !== "Not Applicable" && (
                  <>
                    {" · "}Refund status:{" "}
                    <span className="font-semibold text-text">
                      {order.refundStatus}
                    </span>
                  </>
                )}
            </p>
            {order.returnReason && (
              <p className="text-sm text-text-secondary">
                Reason: {order.returnReason}
              </p>
            )}
            {returnMessage && (
              <p role="status" className="text-sm text-green-700">
                {returnMessage}
              </p>
            )}
            {returnError && (
              <p role="alert" className="text-sm text-red-600">
                {returnError}
              </p>
            )}
            {canRequestReturn ? (
              <form onSubmit={submitReturnRequest} className="grid gap-3">
                <label className="grid gap-1 text-sm font-medium text-text">
                  Request type
                  <select
                    value={returnType}
                    onChange={(event) => setReturnType(event.target.value)}
                    className="h-10 rounded-lg border border-outline-variant bg-surface px-3"
                  >
                    {canRequestRefund && <option value="Refund">Refund</option>}
                    <option value="Replacement">Replacement</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium text-text">
                  Reason (10-500 characters)
                  <textarea
                    value={returnReason}
                    onChange={(event) => setReturnReason(event.target.value)}
                    minLength={10}
                    maxLength={500}
                    required
                    rows={3}
                    className="rounded-lg border border-outline-variant bg-surface px-3 py-2"
                  />
                </label>
                <button
                  type="submit"
                  disabled={returnSubmitting || returnReason.trim().length < 10}
                  className="h-10 justify-self-start rounded-lg bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {returnSubmitting ? "Submitting..." : "Submit request"}
                </button>
              </form>
            ) : (
              <p className="text-xs text-text-secondary">
                Returns can be requested for delivered orders before the return window expires.
              </p>
            )}
          </div>
        </section>

        {/* Order Metadata */}
        <section className="mt-5 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-text">
            Order Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-text-secondary">Order ID</p>

              <p className="mt-1 break-all text-sm font-medium text-text">
                {order._id}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-secondary">Order Number</p>

              <p className="mt-1 break-all text-sm font-medium text-text">
                {order.orderNumber || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-secondary">Order Date</p>

              <p className="mt-1 text-sm font-medium text-text">
                {formatDateTime(order.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-secondary">Last Updated</p>

              <p className="mt-1 text-sm font-medium text-text">
                {formatDateTime(order.updatedAt)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function OrderItemReview({
  orderId,
  productId,
  existingReview,
  onSubmitted,
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await submitReview({
        orderId,
        productId,
        rating,
        comment: comment.trim(),
      });
      onSubmitted(response.review);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to submit your review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (existingReview?.status === "deleted") {
    return (
      <div className="mt-4 rounded-xl bg-surface-container p-4">
        <p className="text-sm font-semibold text-text">
          This order item has already used its review.
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          An administrator permanently deleted the review content. A new review
          cannot be submitted for this order item.
        </p>
      </div>
    );
  }

  if (existingReview) {
    const statusText = {
      pending: "Your review is awaiting admin approval.",
      approved: "Your review is published.",
      rejected: "Your review was not approved.",
      removed: "Your review was removed by an administrator.",
    }[existingReview.status] || "Your review has been submitted.";

    return (
      <div className="mt-4 rounded-xl bg-surface-container p-4">
        <p className="text-sm font-semibold text-text">
          Review submitted · {existingReview.rating}/5
        </p>
        <p className="mt-1 text-xs text-text-secondary">{statusText}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid gap-3 rounded-xl bg-surface-container p-4"
    >
      <div>
        <p className="text-sm font-semibold text-text">Rate this product</p>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              aria-pressed={rating === value}
              className="rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Star
                size={20}
                className={
                  value <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-outline-variant"
                }
              />
            </button>
          ))}
        </div>
      </div>
      <label className="grid gap-1 text-sm font-medium text-text">
        Your review
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
          minLength={5}
          maxLength={1000}
          rows={3}
          placeholder="Share your experience (5-1000 characters)"
          className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm font-normal"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting || comment.trim().length < 5}
        className="h-10 justify-self-start rounded-lg bg-primary px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit review"}
      </button>
      <p className="text-xs text-text-secondary">
        One review per delivered order and product. Reviews appear after admin approval.
      </p>
    </form>
  );
}

export default OrderDetails;
