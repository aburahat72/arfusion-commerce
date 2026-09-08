import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  RotateCcw,
  Truck,
  User,
  XCircle,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminOrderById,
  updateAdminOrderStatus,
} from "../../../services/adminApi";

function AdminOrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [copied, setCopied] = useState("");

  // =====================================================
  // FETCH ORDER
  // =====================================================

  const fetchOrder = useCallback(
    async (isRefresh = false) => {
      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getAdminOrderById(orderId);

        const data = response?.data;

        if (!data?.success) {
          throw new Error(
            data?.message || "Failed to load order details.",
          );
        }

        if (!data?.order) {
          throw new Error(
            "Order information was not returned by the server.",
          );
        }

        setOrder(data.order);
      } catch (error) {
        console.error(
          "Fetch admin order details error:",
          error,
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load order details.",
        );

        if (!isRefresh) {
          setOrder(null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // =====================================================
  // DERIVED DATA
  // =====================================================

  const itemQuantity = useMemo(() => {
    if (!Array.isArray(order?.items)) {
      return 0;
    }

    return order.items.reduce(
      (total, item) =>
        total + (Number(item?.quantity) || 0),
      0,
    );
  }, [order]);

  const subtotal = useMemo(() => {
    if (!Array.isArray(order?.items)) {
      return 0;
    }

    return order.items.reduce((total, item) => {
      const quantity =
        Number(item?.quantity) || 0;

      const price =
        Number(item?.price) ||
        Number(item?.unitPrice) ||
        Number(item?.productPrice) ||
        0;

      return total + price * quantity;
    }, 0);
  }, [order]);

  const totalPrice =
    Number(order?.totalPrice) ||
    Number(order?.totalAmount) ||
    Number(order?.grandTotal) ||
    0;

  const shippingPrice =
    Number(order?.shippingPrice) ||
    Number(order?.shippingCost) ||
    Number(order?.shippingFee) ||
    0;

  const taxPrice =
    Number(order?.taxPrice) ||
    Number(order?.tax) ||
    Number(order?.taxAmount) ||
    0;

  const discountPrice =
    Number(order?.discountPrice) ||
    Number(order?.discount) ||
    Number(order?.discountAmount) ||
    0;

  const currentStatus =
    order?.orderStatus || "Pending";

  const paymentMethod =
    order?.paymentMethod || "COD";

  const paymentStatus =
    order?.paymentStatus || "Pending";

  const isCod =
    String(paymentMethod).toUpperCase() === "COD";

  const codPaymentPending =
    isCod &&
    String(paymentStatus).toLowerCase() ===
      "pending";

  const customer = order?.user || {};

  const customerName =
    customer?.fullName ||
    customer?.name ||
    order?.shippingAddress?.fullName ||
    "Unknown Customer";

  const customerEmail =
    customer?.email || "No email";

  const customerPhone =
    customer?.phone ||
    customer?.mobile ||
    customer?.phoneNumber ||
    "";

  const displayOrderId =
    getDisplayOrderId(order);

  const availableActions =
    getAvailableActions({
      status: currentStatus,
      paymentMethod,
      paymentStatus,
    });

  // =====================================================
  // STATUS CHANGE
  // =====================================================

  const handleStatusChange = async (
    nextStatus,
  ) => {
    if (
      !order?._id ||
      !nextStatus ||
      actionLoading
    ) {
      return;
    }

    if (currentStatus === nextStatus) {
      return;
    }

    // -------------------------------------------------
    // FRONTEND BUSINESS RULE
    // COD + PAYMENT PENDING
    // CANNOT BE DELIVERED
    // -------------------------------------------------

    if (
      nextStatus === "Delivered" &&
      codPaymentPending
    ) {
      setError(
        "COD order cannot be marked as Delivered while the payment status is Pending. Confirm the COD payment first.",
      );

      return;
    }

    // -------------------------------------------------
    // CONFIRMATION
    // -------------------------------------------------

    const confirmationMessage =
      nextStatus === "Cancelled"
        ? `Cancel ${displayOrderId}?\n\nThis will cancel the order and restore the ordered product stock.`
        : nextStatus === "Delivered"
          ? `Mark ${displayOrderId} as Delivered?\n\nConfirm that the order has been successfully delivered and payment has been collected if this is a COD order.`
          : `Change ${displayOrderId} from "${currentStatus}" to "${nextStatus}"?`;

    const confirmed =
      window.confirm(
        confirmationMessage,
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      setError("");

      const response =
        await updateAdminOrderStatus(
          order._id,
          nextStatus,
        );

      const data = response?.data;

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Failed to update order status.",
        );
      }

      // -------------------------------------------------
      // USE REAL BACKEND RESPONSE
      // -------------------------------------------------

      if (
        data?.order &&
        typeof data.order === "object"
      ) {
        setOrder(data.order);
      } else {
        await fetchOrder(true);
      }
    } catch (error) {
      console.error(
        "Update admin order status error:",
        error,
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update order status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // COPY
  // =====================================================

  const handleCopy = async (
    value,
    type,
  ) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        String(value),
      );

      setCopied(type);

      window.setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch (error) {
      console.error(
        "Copy failed:",
        error,
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <PageBackButton navigate={navigate} />

        <div className="mt-6 mb-6">
          <p className="text-sm text-text-secondary">
            Sales / Orders
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Order Details
          </h1>
        </div>

        <section className="flex min-h-96 items-center justify-center rounded-2xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={30}
              className="animate-spin text-primary"
            />

            <p className="text-sm text-text-secondary">
              Loading order details...
            </p>
          </div>
        </section>
      </main>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (!order) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <PageBackButton navigate={navigate} />

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <Package
              size={25}
              className="text-red-600"
            />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-text">
            Unable to load order
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            {error ||
              "The requested order could not be found."}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                navigate("/admin/orders")
              }
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-outline-variant
                px-4
                text-sm
                font-semibold
                text-text
                transition
                hover:bg-surface-container
              "
            >
              <ArrowLeft size={16} />
              Back to Orders
            </button>

            <button
              type="button"
              onClick={() => fetchOrder()}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
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
              <RefreshCw size={16} />
              Try Again
            </button>
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
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">
        <PageBackButton navigate={navigate} />

        <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm text-text-secondary">
              Sales / Orders
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                {displayOrderId}
              </h1>

              <OrderStatus
                status={currentStatus}
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
              <span>
                Created{" "}
                {formatDate(order.createdAt)}
              </span>

              {order.updatedAt && (
                <>
                  <span className="hidden sm:inline">
                    •
                  </span>

                  <span>
                    Updated{" "}
                    {formatDate(
                      order.updatedAt,
                    )}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() =>
              fetchOrder(true)
            }
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              self-start
              rounded-xl
              border
              border-outline-variant
              px-4
              text-sm
              font-semibold
              text-text
              transition
              hover:bg-surface-container
              disabled:cursor-not-allowed
              disabled:opacity-50
              lg:self-auto
            "
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-red-700">
                Order operation failed
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          COD PAYMENT WARNING
      ================================================= */}

      {codPaymentPending &&
        currentStatus === "Shipped" && (
          <section className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <CreditCard size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-orange-800">
                  COD payment is still pending
                </p>

                <p className="mt-1 text-xs leading-5 text-orange-700">
                  This COD order cannot be marked as
                  Delivered until the payment status is
                  confirmed as Paid.
                </p>
              </div>
            </div>
          </section>
        )}

      {/* =================================================
          FULFILLMENT ACTIONS
      ================================================= */}

      <section className="mb-6 rounded-2xl border border-outline-variant bg-surface shadow-sm">
        <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-text">
                Fulfillment
              </h2>

              <p className="mt-1 text-xs text-text-secondary">
                Manage the order through its
                fulfillment lifecycle.
              </p>
            </div>

            <OrderStatus
              status={currentStatus}
            />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <OrderTimeline
            status={currentStatus}
          />

          {availableActions.length > 0 && (
            <div className="mt-6 flex flex-col gap-2 border-t border-outline-variant pt-5 sm:flex-row sm:justify-end">
              {availableActions.map(
                (action) => {
                  const ActionIcon =
                    action.icon;

                  const isBlocked =
                    action.status ===
                      "Delivered" &&
                    codPaymentPending;

                  return (
                    <div
                      key={action.status}
                      className="flex flex-col"
                    >
                      <button
                        type="button"
                        disabled={
                          actionLoading ||
                          isBlocked
                        }
                        onClick={() =>
                          handleStatusChange(
                            action.status,
                          )
                        }
                        title={
                          isBlocked
                            ? "COD payment must be marked Paid before delivery."
                            : undefined
                        }
                        className={`
                          inline-flex
                          h-10
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          px-4
                          text-sm
                          font-semibold
                          transition
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                          ${
                            action.danger
                              ? "border border-red-200 text-red-600 hover:bg-red-50"
                              : "bg-primary text-white hover:opacity-90"
                          }
                        `}
                      >
                        {actionLoading ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <ActionIcon
                            size={16}
                          />
                        )}

                        {action.label}
                      </button>

                      {isBlocked && (
                        <p className="mt-1.5 max-w-xs text-center text-[10px] leading-4 text-orange-600">
                          COD payment must be
                          marked Paid first.
                        </p>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          )}

          {currentStatus ===
            "Delivered" && (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-green-50 p-3">
              <CheckCircle2
                size={18}
                className="shrink-0 text-green-600"
              />

              <div>
                <p className="text-xs font-semibold text-green-700">
                  Order completed
                </p>

                <p className="mt-0.5 text-[10px] text-green-600">
                  This order has been delivered
                  successfully.
                </p>
              </div>
            </div>
          )}

          {currentStatus ===
            "Cancelled" && (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-red-50 p-3">
              <XCircle
                size={18}
                className="shrink-0 text-red-600"
              />

              <div>
                <p className="text-xs font-semibold text-red-700">
                  Order cancelled
                </p>

                <p className="mt-0.5 text-[10px] text-red-600">
                  This order can no longer be
                  updated.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* =================================================
            LEFT
        ================================================= */}

        <div className="space-y-6">
          {/* =================================================
              ORDER ITEMS
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-text">
                    Order Items
                  </h2>

                  <p className="mt-1 text-xs text-text-secondary">
                    {Array.isArray(
                      order.items,
                    )
                      ? order.items.length
                      : 0}{" "}
                    {Array.isArray(
                      order.items,
                    ) &&
                    order.items.length === 1
                      ? "product"
                      : "products"}{" "}
                    · {itemQuantity}{" "}
                    {itemQuantity === 1
                      ? "unit"
                      : "units"}
                  </p>
                </div>

                <Package
                  size={19}
                  className="text-text-secondary"
                />
              </div>
            </div>

            <div className="divide-y divide-outline-variant">
              {Array.isArray(
                order.items,
              ) &&
              order.items.length > 0 ? (
                order.items.map(
                  (item, index) => (
                    <OrderItem
                      key={
                        item?._id ||
                        item?.product?._id ||
                        `${index}-${item?.product?.name || "item"}`
                      }
                      item={item}
                    />
                  ),
                )
              ) : (
                <div className="p-8 text-center text-sm text-text-secondary">
                  No order items available.
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <section className="rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold text-text">
                Order Summary
              </h2>
            </div>

            <div className="p-4 sm:p-5">
              <div className="space-y-3">
                <SummaryRow
                  label="Subtotal"
                  value={formatCurrency(
                    subtotal || totalPrice,
                  )}
                />

                {discountPrice > 0 && (
                  <SummaryRow
                    label="Discount"
                    value={`-${formatCurrency(
                      discountPrice,
                    )}`}
                    valueClassName="text-green-600"
                  />
                )}

                {shippingPrice > 0 && (
                  <SummaryRow
                    label="Shipping"
                    value={formatCurrency(
                      shippingPrice,
                    )}
                  />
                )}

                {taxPrice > 0 && (
                  <SummaryRow
                    label="Tax"
                    value={formatCurrency(
                      taxPrice,
                    )}
                  />
                )}

                <div className="border-t border-outline-variant pt-3">
                  <SummaryRow
                    label="Total"
                    value={formatCurrency(
                      totalPrice,
                    )}
                    strong
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              SHIPPING ADDRESS
          ================================================= */}

          <section className="rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2">
                <MapPin
                  size={18}
                  className="text-text-secondary"
                />

                <h2 className="text-sm font-semibold text-text">
                  Shipping Address
                </h2>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <AddressBlock
                address={
                  order.shippingAddress ||
                  order.deliveryAddress ||
                  order.address
                }
                customerName={
                  customerName
                }
                customerPhone={
                  customerPhone
                }
              />
            </div>
          </section>

          {/* =================================================
              RETURN / REFUND
          ================================================= */}

          <ReturnInformation
            order={order}
          />
        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="space-y-6">
          {/* =================================================
              CUSTOMER
          ================================================= */}

          <section className="rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2">
                <User
                  size={18}
                  className="text-text-secondary"
                />

                <h2 className="text-sm font-semibold text-text">
                  Customer
                </h2>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
                  <span className="text-sm font-semibold">
                    {getInitials(
                      customerName,
                    )}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">
                    {customerName}
                  </p>

                  <p className="truncate text-xs text-text-secondary">
                    {customerEmail}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <InfoRow
                  icon={User}
                  label="Customer ID"
                  value={
                    customer?._id ||
                    customer?.id
                  }
                  copyable={Boolean(
                    customer?._id ||
                      customer?.id,
                  )}
                  copied={
                    copied ===
                    "customer-id"
                  }
                  onCopy={() =>
                    handleCopy(
                      customer?._id ||
                        customer?.id,
                      "customer-id",
                    )
                  }
                />

                {customerPhone && (
                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={
                      customerPhone
                    }
                    copyable
                    copied={
                      copied ===
                      "phone"
                    }
                    onCopy={() =>
                      handleCopy(
                        customerPhone,
                        "phone",
                      )
                    }
                  />
                )}

                <InfoRow
                  icon={CreditCard}
                  label="Email"
                  value={
                    customerEmail
                  }
                  copyable={Boolean(
                    customer?.email,
                  )}
                  copied={
                    copied ===
                    "email"
                  }
                  onCopy={() =>
                    handleCopy(
                      customerEmail,
                      "email",
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* =================================================
              PAYMENT
          ================================================= */}

          <section className="rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2">
                <CreditCard
                  size={18}
                  className="text-text-secondary"
                />

                <h2 className="text-sm font-semibold text-text">
                  Payment
                </h2>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-text-secondary">
                    Payment Method
                  </p>

                  <p className="mt-1 text-sm font-semibold text-text">
                    {paymentMethod}
                  </p>
                </div>

                <PaymentStatus
                  status={
                    paymentStatus
                  }
                />
              </div>

              {isCod &&
                String(
                  paymentStatus,
                ).toLowerCase() ===
                  "pending" && (
                  <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3">
                    <p className="text-xs font-semibold text-orange-700">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-orange-600">
                      Payment is still pending.
                      Delivery confirmation
                      requires payment to be
                      marked as Paid.
                    </p>
                  </div>
                )}

              {order.paymentId && (
                <CopyableValue
                  label="Payment ID"
                  value={
                    order.paymentId
                  }
                  copied={
                    copied ===
                    "payment-id"
                  }
                  onCopy={() =>
                    handleCopy(
                      order.paymentId,
                      "payment-id",
                    )
                  }
                />
              )}

              {order.transactionId && (
                <CopyableValue
                  label="Transaction ID"
                  value={
                    order.transactionId
                  }
                  copied={
                    copied ===
                    "transaction-id"
                  }
                  onCopy={() =>
                    handleCopy(
                      order.transactionId,
                      "transaction-id",
                    )
                  }
                />
              )}
            </div>
          </section>

          {/* =================================================
              ORDER INFORMATION
          ================================================= */}

          <section className="rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold text-text">
                Order Information
              </h2>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <InfoRow
                icon={Package}
                label="Order ID"
                value={
                  order._id
                }
                copyable
                copied={
                  copied ===
                  "order-id"
                }
                onCopy={() =>
                  handleCopy(
                    order._id,
                    "order-id",
                  )
                }
              />

              <InfoRow
                icon={Clock3}
                label="Created"
                value={formatDate(
                  order.createdAt,
                )}
              />

              {order.updatedAt && (
                <InfoRow
                  icon={RefreshCw}
                  label="Last Updated"
                  value={formatDate(
                    order.updatedAt,
                  )}
                />
              )}

              {order.returnEligibleUntil && (
                <InfoRow
                  icon={RotateCcw}
                  label="Return Eligible Until"
                  value={formatDate(
                    order.returnEligibleUntil,
                  )}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   PAGE BACK BUTTON
========================================================= */

function PageBackButton({
  navigate,
}) {
  return (
    <button
      type="button"
      onClick={() =>
        navigate("/admin/orders")
      }
      className="
        inline-flex
        items-center
        gap-2
        text-sm
        font-semibold
        text-text-secondary
        transition
        hover:text-primary
      "
    >
      <ArrowLeft size={17} />
      Back to Orders
    </button>
  );
}

/* =========================================================
   ORDER TIMELINE
========================================================= */

function OrderTimeline({
  status,
}) {
  const cancelled =
    status === "Cancelled";

  const stages = [
    {
      key: "Pending",
      title: "Pending",
      description:
        "Order received and awaiting processing.",
      icon: Clock3,
    },
    {
      key: "Processing",
      title: "Processing",
      description:
        "Order is being prepared for shipment.",
      icon: Package,
    },
    {
      key: "Shipped",
      title: "Shipped",
      description:
        "Package has been handed over for delivery.",
      icon: Truck,
    },
    {
      key: "Delivered",
      title: "Delivered",
      description:
        "Order has been delivered successfully.",
      icon: CheckCircle2,
    },
  ];

  if (cancelled) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle size={19} />
          </div>

          <div>
            <p className="text-sm font-semibold text-red-700">
              Order Cancelled
            </p>

            <p className="mt-1 text-xs leading-5 text-red-600">
              This order was cancelled and
              fulfillment has stopped.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeIndex =
    stages.findIndex(
      (stage) => stage.key === status,
    );

  return (
    <div className="overflow-x-auto pb-1">
      <div className="grid min-w-[620px] grid-cols-4">
        {stages.map(
          (stage, index) => {
            const StageIcon =
              stage.icon;

            const completed =
              activeIndex >= index;

            const current =
              activeIndex === index;

            return (
              <div
                key={stage.key}
                className="relative px-2"
              >
                {index < stages.length - 1 && (
                  <div
                    className={`
                      absolute
                      left-1/2
                      right-[-50%]
                      top-5
                      h-px
                      ${
                        activeIndex >
                        index
                          ? "bg-primary"
                          : "bg-outline-variant"
                      }
                    `}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      ${
                        completed
                          ? "border-primary bg-primary text-white"
                          : "border-outline-variant bg-surface text-text-secondary"
                      }
                      ${
                        current
                          ? "ring-4 ring-primary/10"
                          : ""
                      }
                    `}
                  >
                    {completed &&
                    !current ? (
                      <Check
                        size={17}
                      />
                    ) : (
                      <StageIcon
                        size={17}
                      />
                    )}
                  </div>

                  <p
                    className={`
                      mt-3
                      text-xs
                      font-semibold
                      ${
                        completed
                          ? "text-text"
                          : "text-text-secondary"
                      }
                    `}
                  >
                    {stage.title}
                  </p>

                  <p className="mt-1 max-w-32 text-[10px] leading-4 text-text-secondary">
                    {stage.description}
                  </p>

                  {current && (
                    <span className="mt-2 rounded-full bg-primary-container px-2 py-0.5 text-[9px] font-semibold text-primary">
                      Current
                    </span>
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ORDER ITEM
========================================================= */

function OrderItem({
  item,
}) {
  const product =
    item?.product || {};

  const productName =
    item?.productName ||
    item?.name ||
    product?.name ||
    product?.title ||
    "Product";

  const productImage =
    item?.image ||
    item?.productImage ||
    product?.image ||
    product?.images?.[0] ||
    "";

  const quantity =
    Number(item?.quantity) || 0;

  const unitPrice =
    Number(item?.price) ||
    Number(item?.unitPrice) ||
    Number(
      item?.productPrice,
    ) ||
    0;

  const itemTotal =
    Number(item?.totalPrice) ||
    Number(item?.subtotal) ||
    unitPrice * quantity;

  const productId =
    typeof product === "object"
      ? product?._id
      : product;

  return (
    <div className="flex gap-4 p-4 sm:p-5">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container sm:h-24 sm:w-24">
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package
              size={24}
              className="text-text-secondary"
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text">
              {productName}
            </p>

            {productId && (
              <p className="mt-1 truncate text-[10px] text-text-secondary">
                Product ID:{" "}
                {String(productId)}
              </p>
            )}
          </div>

          <p className="shrink-0 text-sm font-semibold text-text">
            {formatCurrency(
              itemTotal,
            )}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          {item?.size && (
            <span>
              Size:{" "}
              <span className="font-medium text-text">
                {item.size}
              </span>
            </span>
          )}

          {item?.color && (
            <span>
              Color:{" "}
              <span className="font-medium text-text">
                {item.color}
              </span>
            </span>
          )}

          <span>
            Qty:{" "}
            <span className="font-medium text-text">
              {quantity}
            </span>
          </span>
        </div>

        <p className="mt-3 text-xs text-text-secondary">
          {formatCurrency(
            unitPrice,
          )}{" "}
          × {quantity}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ADDRESS BLOCK
========================================================= */

function AddressBlock({
  address,
  customerName,
  customerPhone,
}) {
  /*
   * Your current order example stores shippingAddress
   * as a plain string:
   *
   * "House No. 45, College Road, Hailakandi,
   *  Assam - 788151, India"
   *
   * This component therefore supports BOTH:
   *
   * 1. string address
   * 2. structured address object
   */

  if (!address) {
    return (
      <div className="rounded-xl bg-surface-container p-4">
        <p className="text-sm text-text-secondary">
          No shipping address available.
        </p>
      </div>
    );
  }

  if (
    typeof address ===
    "string"
  ) {
    return (
      <div className="rounded-xl bg-surface-container p-4">
        {customerName && (
          <p className="text-sm font-semibold text-text">
            {customerName}
          </p>
        )}

        {customerPhone && (
          <p className="mt-1 text-xs text-text-secondary">
            {customerPhone}
          </p>
        )}

        <div className="mt-3 flex items-start gap-2">
          <MapPin
            size={15}
            className="mt-0.5 shrink-0 text-text-secondary"
          />

          <p className="whitespace-pre-line text-sm leading-6 text-text-secondary">
            {address}
          </p>
        </div>
      </div>
    );
  }

  const name =
    address?.fullName ||
    address?.name ||
    address?.recipientName ||
    customerName ||
    "";

  const phone =
    address?.phone ||
    address?.mobile ||
    address?.phoneNumber ||
    customerPhone ||
    "";

  const addressLines = [
    address?.addressLine1,
    address?.addressLine2,
    address?.street,
    address?.area,
    address?.landmark,
  ].filter(Boolean);

  const city =
    address?.city ||
    address?.town ||
    "";

  const state =
    address?.state ||
    address?.stateName ||
    "";

  const postalCode =
    address?.postalCode ||
    address?.pincode ||
    address?.pinCode ||
    address?.zipCode ||
    "";

  const country =
    address?.country ||
    "India";

  return (
    <div className="rounded-xl bg-surface-container p-4">
      {name && (
        <p className="text-sm font-semibold text-text">
          {name}
        </p>
      )}

      {phone && (
        <p className="mt-1 text-xs text-text-secondary">
          {phone}
        </p>
      )}

      {addressLines.length >
        0 && (
        <div className="mt-3 space-y-0.5 text-sm leading-5 text-text-secondary">
          {addressLines.map(
            (line, index) => (
              <p
                key={`${line}-${index}`}
              >
                {line}
              </p>
            ),
          )}
        </div>
      )}

      {(city ||
        state ||
        postalCode) && (
        <p className="mt-1 text-sm leading-5 text-text-secondary">
          {[
            city,
            state,
            postalCode,
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}

      {country && (
        <p className="text-sm leading-5 text-text-secondary">
          {country}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   RETURN INFORMATION
========================================================= */

function ReturnInformation({
  order,
}) {
  const hasReturnData =
    order?.returnStatus ||
    order?.returnReason ||
    order?.returnRequestedAt ||
    order?.refundStatus ||
    order?.refundRequested ||
    order?.replacementRequested;

  if (!hasReturnData) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface shadow-sm">
      <div className="border-b border-outline-variant px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <RotateCcw
            size={18}
            className="text-text-secondary"
          />

          <h2 className="text-sm font-semibold text-text">
            Return & Refund
          </h2>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {order.returnStatus && (
          <SummaryRow
            label="Return Status"
            value={
              order.returnStatus
            }
          />
        )}

        {order.refundStatus && (
          <SummaryRow
            label="Refund Status"
            value={
              order.refundStatus
            }
          />
        )}

        {typeof order.refundRequested ===
          "boolean" && (
          <SummaryRow
            label="Refund Requested"
            value={
              order.refundRequested
                ? "Yes"
                : "No"
            }
          />
        )}

        {typeof order.replacementRequested ===
          "boolean" && (
          <SummaryRow
            label="Replacement Requested"
            value={
              order.replacementRequested
                ? "Yes"
                : "No"
            }
          />
        )}

        {order.returnRequestedAt && (
          <SummaryRow
            label="Requested"
            value={formatDate(
              order.returnRequestedAt,
            )}
          />
        )}

        {order.returnReason && (
          <div className="rounded-xl bg-surface-container p-3">
            <p className="text-[10px] font-medium text-text-secondary">
              Return Reason
            </p>

            <p className="mt-1 text-xs leading-5 text-text">
              {order.returnReason}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon: Icon,
  label,
  value,
  copyable = false,
  copied = false,
  onCopy,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-text-secondary">
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-text-secondary">
          {label}
        </p>

        <div className="mt-0.5 flex items-start gap-2">
          <p className="min-w-0 flex-1 break-words text-xs font-medium text-text">
            {value ||
              "Not available"}
          </p>

          {copyable &&
            value && (
              <button
                type="button"
                onClick={onCopy}
                className="shrink-0 text-text-secondary transition hover:text-primary"
                aria-label={`Copy ${label}`}
              >
                {copied ? (
                  <CheckCircle2
                    size={14}
                  />
                ) : (
                  <Copy
                    size={14}
                  />
                )}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COPYABLE VALUE
========================================================= */

function CopyableValue({
  label,
  value,
  copied,
  onCopy,
}) {
  return (
    <div className="mt-4 rounded-xl bg-surface-container p-3">
      <p className="text-[10px] font-medium text-text-secondary">
        {label}
      </p>

      <div className="mt-1 flex items-start gap-2">
        <p className="min-w-0 flex-1 break-all text-xs font-medium text-text">
          {value}
        </p>

        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 text-text-secondary transition hover:text-primary"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <CheckCircle2
              size={15}
            />
          ) : (
            <Copy size={15} />
          )}
        </button>
      </div>

      {copied && (
        <p className="mt-1 text-[9px] font-medium text-green-600">
          Copied
        </p>
      )}
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
  strong = false,
  valueClassName = "",
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p
        className={
          strong
            ? "text-sm font-semibold text-text"
            : "text-sm text-text-secondary"
        }
      >
        {label}
      </p>

      <p
        className={`
          text-right
          ${
            strong
              ? "text-base font-bold text-text"
              : "text-sm font-medium text-text"
          }
          ${valueClassName}
        `}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   AVAILABLE ACTIONS
========================================================= */

function getAvailableActions({
  status,
  paymentMethod,
  paymentStatus,
}) {
  const isCod =
    String(
      paymentMethod || "",
    ).toUpperCase() ===
    "COD";

  const paymentPending =
    String(
      paymentStatus || "",
    ).toLowerCase() ===
    "pending";

  const cannotDeliver =
    isCod && paymentPending;

  switch (status) {
    case "Pending":
      return [
        {
          label: "Process Order",
          status: "Processing",
          icon: Package,
          danger: false,
        },
        {
          label: "Cancel Order",
          status: "Cancelled",
          icon: XCircle,
          danger: true,
        },
      ];

    case "Processing":
      return [
        {
          label: "Mark as Shipped",
          status: "Shipped",
          icon: Truck,
          danger: false,
        },
        {
          label: "Cancel Order",
          status: "Cancelled",
          icon: XCircle,
          danger: true,
        },
      ];

    case "Shipped":
      return [
        {
          label: "Mark as Delivered",
          status: "Delivered",
          icon: CheckCircle2,
          danger: false,
          blocked:
            cannotDeliver,
        },
      ];

    case "Delivered":
    case "Cancelled":
    default:
      return [];
  }
}

/* =========================================================
   ORDER STATUS
========================================================= */

function OrderStatus({
  status,
}) {
  const config = {
    Pending: {
      className:
        "bg-orange-50 text-orange-600",
      icon: Clock3,
    },

    Processing: {
      className:
        "bg-blue-50 text-blue-600",
      icon: Package,
    },

    Shipped: {
      className:
        "bg-violet-50 text-violet-600",
      icon: Truck,
    },

    Delivered: {
      className:
        "bg-green-50 text-green-600",
      icon: CheckCircle2,
    },

    Cancelled: {
      className:
        "bg-red-50 text-red-600",
      icon: XCircle,
    },
  };

  const item =
    config[status] || {
      className:
        "bg-surface-container text-text-secondary",
      icon: Clock3,
    };

  const Icon =
    item.icon;

  return (
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

      {status ||
        "Unknown"}
    </span>
  );
}

/* =========================================================
   PAYMENT STATUS
========================================================= */

function PaymentStatus({
  status,
}) {
  const normalized =
    String(
      status || "Pending",
    );

  const lower =
    normalized.toLowerCase();

  const className =
    lower === "paid"
      ? "bg-green-50 text-green-600"
      : lower === "failed"
        ? "bg-red-50 text-red-600"
        : "bg-orange-50 text-orange-600";

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5
        py-1.5
        text-[10px]
        font-semibold
        ${className}
      `}
    >
      {normalized}
    </span>
  );
}

/* =========================================================
   DISPLAY ORDER ID
========================================================= */

function getDisplayOrderId(
  order,
) {
  if (!order?._id) {
    return "#ORDER";
  }

  return `#${String(
    order._id,
  )
    .slice(-8)
    .toUpperCase()}`;
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(
  name,
) {
  if (!name) {
    return "CU";
  }

  const initials =
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (part) =>
          part
            .charAt(0)
            .toUpperCase(),
      )
      .join("");

  return initials || "CU";
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value,
) {
  if (!value) {
    return "Unknown";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(
  value,
) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount,
    )
  ) {
    return "₹0";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(amount);
}

export default AdminOrderDetails;
