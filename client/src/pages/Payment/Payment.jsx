import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
  createPaymentOrder,
  placeOrder,
  updatePaymentStatus,
  verifyPayment,
} from "../../services/orderService";

import { clearCheckout } from "../../store/slices/checkoutSlice";

import Button from "../../components/ui/Button";

import { formatCurrency } from "../../utils/currency";
import { calculateOrderSummary } from "../../utils/orderSummary";

import {
  Banknote,
  Check,
  ChevronLeft,
  CreditCard,
  Lock,
  ShieldCheck,
  Truck,
} from "lucide-react";

/*
 * =====================================================
 * RAZORPAY CONFIGURATION
 * =====================================================
 *
 * Only the PUBLIC key belongs in frontend code.
 *
 * NEVER put RAZORPAY_KEY_SECRET here.
 */
const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

const RAZORPAY_KEY_ID = "rzp_test_TJP6tHYViiuxXy";

/*
 * =====================================================
 * LOAD RAZORPAY SCRIPT
 * =====================================================
 */

function loadRazorpayScript() {
  return new Promise((resolve) => {
    /*
     * Already loaded.
     */
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    /*
     * Script is already being loaded.
     */
    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT}"]`,
    );

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve(true);
        return;
      }

      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });

      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });

      return;
    }

    /*
     * Create Razorpay script.
     */
    const script = document.createElement("script");

    script.src = RAZORPAY_SCRIPT;
    script.async = true;

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

/*
 * =====================================================
 * PAYMENT PAGE
 * =====================================================
 */

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /*
   * ===================================================
   * CHECKOUT DATA
   * ===================================================
   *
   * Checkout.jsx sends:
   *
   * {
   *   shippingAddress,
   *   items,
   *   checkoutMode
   * }
   */

  const {
    shippingAddress = "",
    items = [],
    checkoutMode = "cart",
  } = location.state || {};

  /*
   * ===================================================
   * STATE
   * ===================================================
   */

  const [paymentMethod, setPaymentMethod] = useState("");

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  /*
   * ===================================================
   * RAZORPAY REFS
   * ===================================================
   */

  const razorpayRef = useRef(null);

  const paymentIntentRef = useRef(null);

  const paymentCompletedRef = useRef(false);

  /*
   * ===================================================
   * VALIDATE CHECKOUT STATE
   * ===================================================
   *
   * If user opens /payment directly without coming
   * from Checkout, send them back.
   */

  useEffect(() => {
    if (!shippingAddress || !Array.isArray(items) || items.length === 0) {
      navigate("/checkout", {
        replace: true,
      });
    }
  }, [shippingAddress, items, navigate]);

  /*
   * ===================================================
   * NORMALIZE ITEMS
   * ===================================================
   */

  const normalizedItems = useMemo(() => {
    return items
      .map((item) => ({
        product: item?.product || item?.id || item?._id,

        quantity: Number(item?.quantity) || 1,

        /*
         * These values are ONLY used to display
         * the summary.
         *
         * The backend calculates the real payment
         * amount from MongoDB.
         */
        price: Number(item?.price) || 0,

        name: item?.name || item?.title || "Product",

        image: item?.image || item?.images?.[0] || "",
      }))
      .filter(
        (item) =>
          item.product && Number.isInteger(item.quantity) && item.quantity > 0,
      );
  }, [items]);

  /*
   * ===================================================
   * ORDER SUMMARY
   * ===================================================
   */

  const summary = useMemo(() => {
    try {
      return calculateOrderSummary(normalizedItems);
    } catch (error) {
      console.error("Unable to calculate payment summary:", error);

      const subtotal = normalizedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );

      return {
        subtotal,
        shipping: 0,
        discount: 0,
        total: subtotal,
      };
    }
  }, [normalizedItems]);

  const subtotal =
    Number(summary?.subtotal) ||
    Number(summary?.subTotal) ||
    Number(summary?.itemsTotal) ||
    0;

  const shipping =
    Number(summary?.shipping) || Number(summary?.shippingFee) || 0;

  const discount =
    Number(summary?.discount) || Number(summary?.discountAmount) || 0;

  const total =
    Number(summary?.total) ||
    Number(summary?.totalPrice) ||
    Number(summary?.grandTotal) ||
    subtotal + shipping - discount;

  /*
   * ===================================================
   * ERROR HELPER
   * ===================================================
   */

  const getErrorMessage = (error, fallback) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    );
  };

  /*
   * ===================================================
   * COD
   * ===================================================
   *
   * COD remains separate from Razorpay.
   *
   * Payment
   * ↓
   * COD
   * ↓
   * POST /api/orders
   */

  const handleCashOnDelivery = async () => {
    if (loading) {
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await placeOrder({
        shippingAddress,
        paymentMethod: "COD",
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to place your order.");
      }

      const createdOrder = response?.order;

      if (!createdOrder?._id) {
        throw new Error("Order was placed but the order ID was not returned.");
      }

      /*
       * Clear checkout ONLY after successful
       * order creation.
       */
      dispatch(clearCheckout());

      navigate(`/order-success?orderId=${createdOrder._id}`, {
        replace: true,
      });
    } catch (error) {
      console.error("COD order failed:", error);

      setErrorMessage(
        getErrorMessage(error, "Unable to place your order. Please try again."),
      );

      setLoading(false);
    }
  };

  /*
   * ===================================================
   * ONLINE PAYMENT
   * ===================================================
   *
   * FINAL FLOW:
   *
   * Checkout
   *    ↓
   * createPaymentOrder()
   *    ↓
   * PaymentIntent
   *    ↓
   * Razorpay Order
   *    ↓
   * Razorpay Checkout
   *    ↓
   * Payment successful
   *    ↓
   * verifyPayment()
   *    ↓
   * Signature verified
   *    ↓
   * Final MongoDB Order
   *    ↓
   * Order Success
   */

  const handleOnlinePayment = async () => {
    if (loading) {
      return;
    }

    /*
     * Basic validation.
     */

    if (!shippingAddress) {
      setErrorMessage(
        "Shipping address is missing. Please return to checkout.",
      );
      return;
    }

    if (normalizedItems.length === 0) {
      setErrorMessage("No products were found for this checkout.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    /*
     * Reset payment state for a new attempt.
     */
    paymentCompletedRef.current = false;

    paymentIntentRef.current = null;

    try {
      /*
       * =================================================
       * STEP 1
       * LOAD RAZORPAY
       * =================================================
       */

      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please check your internet connection and try again.",
        );
      }

      /*
       * =================================================
       * STEP 2
       * CREATE PAYMENT ORDER
       * =================================================
       *
       * IMPORTANT:
       *
       * This creates:
       *
       * - PaymentIntent
       * - Razorpay Order
       *
       * It does NOT create the final customer Order.
       */

      const paymentResponse = await createPaymentOrder({
        shippingAddress,
        checkoutMode,

        items: normalizedItems.map((item) => ({
          product: item.product,

          quantity: item.quantity,
        })),
      });

      if (!paymentResponse?.success) {
        throw new Error(
          paymentResponse?.message || "Unable to create payment order.",
        );
      }

      /*
       * Backend PaymentIntent ID.
       */
      if (!paymentResponse?.paymentIntentId) {
        throw new Error("Payment intent ID was not returned by the server.");
      }

      /*
       * Razorpay Order ID.
       */
      if (!paymentResponse?.orderId) {
        throw new Error("Razorpay order ID was not returned by the server.");
      }

      paymentIntentRef.current = paymentResponse.paymentIntentId;

      /*
       * =================================================
       * STEP 3
       * RAZORPAY OPTIONS
       * =================================================
       */

      const razorpayOptions = {
        key: RAZORPAY_KEY_ID,

        /*
         * Amount comes from backend.
         *
         * Razorpay expects paise.
         */
        amount: paymentResponse.amount,

        currency: paymentResponse.currency || "INR",

        name: "AR Fusion",

        description: "Secure payment for your order",

        /*
         * Razorpay Order ID.
         */
        order_id: paymentResponse.orderId,

        /*
         * Keep prefill generic.
         *
         * The customer information is already
         * associated with the authenticated account
         * on the backend.
         */
        prefill: {
          email: "",
          contact: "",
        },

        /*
         * Useful internal Razorpay metadata.
         */
        notes: {
          paymentIntentId: paymentResponse.paymentIntentId,

          checkoutMode,
        },

        theme: {
          color: "#000000",
        },

        /*
         * =================================================
         * PAYMENT SUCCESS
         * =================================================
         */

        handler: async (razorpayResponse) => {
          /*
           * Prevent duplicate handler execution.
           */
          if (paymentCompletedRef.current) {
            return;
          }

          setLoading(true);
          setErrorMessage("");

          try {
            /*
             * =================================================
             * STEP 4
             * VERIFY PAYMENT ON SERVER
             * =================================================
             *
             * Backend verifies:
             *
             * - Razorpay signature
             * - Razorpay order
             * - amount
             * - payment intent
             * - product
             * - stock
             *
             * Then creates the final Order.
             */

            const verification = await verifyPayment({
              razorpay_order_id: razorpayResponse.razorpay_order_id,

              razorpay_payment_id: razorpayResponse.razorpay_payment_id,

              razorpay_signature: razorpayResponse.razorpay_signature,
            });

            if (!verification?.success) {
              throw new Error(
                verification?.message || "Payment verification failed.",
              );
            }

            /*
             * =================================================
             * STEP 5
             * FINAL ORDER
             * =================================================
             */

            const createdOrder = verification?.order;

            if (!createdOrder?._id) {
              throw new Error(
                "Payment was verified but the final order ID was not returned.",
              );
            }

            /*
             * Payment + final Order completed.
             */
            paymentCompletedRef.current = true;

            /*
             * =================================================
             * STEP 6
             * CLEAR CHECKOUT
             * =================================================
             *
             * Never clear checkout before the backend
             * confirms successful final order creation.
             */

            dispatch(clearCheckout());

            /*
             * =================================================
             * STEP 7
             * ORDER SUCCESS
             * =================================================
             */

            navigate(`/order-success?orderId=${createdOrder._id}`, {
              replace: true,
            });
          } catch (error) {
            console.error("Payment verification failed:", error);

            setErrorMessage(
              getErrorMessage(
                error,
                "Payment verification failed. If your amount was deducted, please contact support.",
              ),
            );

            setLoading(false);
          }
        },

        /*
         * =================================================
         * RAZORPAY MODAL
         * =================================================
         */

        modal: {
          ondismiss: async () => {
            /*
             * If payment already completed,
             * don't mark it cancelled.
             */
            if (paymentCompletedRef.current) {
              return;
            }

            const paymentIntentId = paymentIntentRef.current;

            /*
             * Mark the temporary payment
             * intent as Cancelled.
             *
             * No final Order is created.
             */
            if (paymentIntentId) {
              try {
                await updatePaymentStatus(paymentIntentId, "Cancelled");
              } catch (error) {
                console.error("Unable to update cancelled payment:", error);
              }
            }

            setLoading(false);

            setPaymentMethod("");

            setErrorMessage(
              "Payment was cancelled. You can choose a payment method and try again.",
            );
          },
        },
      };

      /*
       * =================================================
       * STEP 3.5
       * CREATE RAZORPAY INSTANCE
       * =================================================
       */

      const razorpay = new window.Razorpay(razorpayOptions);

      razorpayRef.current = razorpay;

      /*
       * =================================================
       * PAYMENT FAILED EVENT
       * =================================================
       */

      razorpay.on("payment.failed", async (paymentError) => {
        console.error("Razorpay payment failed:", paymentError);

        /*
         * If some unexpected duplicate callback
         * occurs after successful verification,
         * don't overwrite Paid state.
         */
        if (paymentCompletedRef.current) {
          return;
        }

        const paymentIntentId = paymentIntentRef.current;

        /*
         * Mark PaymentIntent Failed.
         *
         * No final Order is created.
         */
        if (paymentIntentId) {
          try {
            await updatePaymentStatus(paymentIntentId, "Failed");
          } catch (error) {
            console.error("Unable to update failed payment:", error);
          }
        }

        setLoading(false);

        setErrorMessage(
          paymentError?.error?.description ||
            "Payment failed. Please try again.",
        );
      });

      /*
       * =================================================
       * STEP 4
       * OPEN RAZORPAY
       * =================================================
       */

      razorpay.open();

      /*
       * Keep loading active while Razorpay is open.
       *
       * The callback / dismiss handler will reset it.
       */
    } catch (error) {
      console.error("Payment initialization failed:", error);

      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to initialize payment. Please try again.",
        ),
      );

      setLoading(false);
    }
  };

  /*
   * ===================================================
   * CONTINUE BUTTON
   * ===================================================
   */

  const handleContinue = async () => {
    if (!paymentMethod) {
      setErrorMessage("Please select a payment method.");
      return;
    }

    if (paymentMethod === "COD") {
      await handleCashOnDelivery();
      return;
    }

    if (paymentMethod === "ONLINE") {
      await handleOnlinePayment();
    }
  };

  /*
   * ===================================================
   * CLEANUP
   * ===================================================
   */

  useEffect(() => {
    return () => {
      if (razorpayRef.current) {
        try {
          razorpayRef.current.close();
        } catch (error) {
          console.error("Unable to close Razorpay Checkout:", error);
        }

        razorpayRef.current = null;
      }
    };
  }, []);

  /*
   * ===================================================
   * UI
   * ===================================================
   */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* =============================================
            BACK
        ============================================= */}

        <button
          type="button"
          onClick={() => navigate("/checkout")}
          disabled={loading}
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={18} />
          Back to Checkout
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ===========================================
              LEFT
          =========================================== */}

          <div className="space-y-6">
            {/* HEADER */}

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Payment</h1>

              <p className="mt-1 text-sm text-gray-500">
                Choose your preferred payment method.
              </p>
            </div>

            {/* =========================================
                DELIVERY ADDRESS
            ========================================= */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Truck size={19} className="text-gray-700" />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Delivery Address
                  </h2>

                  <p className="text-xs text-gray-500">
                    Your order will be delivered here
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="text-sm leading-6 text-gray-700">
                  {shippingAddress}
                </p>
              </div>
            </div>

            {/* =========================================
                PAYMENT METHODS
            ========================================= */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="font-semibold text-gray-900">Payment Method</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select how you would like to pay.
                </p>
              </div>

              <div className="space-y-3">
                {/* =====================================
                    COD
                ===================================== */}

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("COD");

                    setErrorMessage("");
                  }}
                  disabled={loading}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    paymentMethod === "COD"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Banknote size={21} className="text-gray-700" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Cash on Delivery
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Pay when your order arrives.
                          </p>
                        </div>

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            paymentMethod === "COD"
                              ? "border-black bg-black"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === "COD" && (
                            <Check size={13} className="text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* =====================================
                    ONLINE
                ===================================== */}

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("ONLINE");

                    setErrorMessage("");
                  }}
                  disabled={loading}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    paymentMethod === "ONLINE"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <CreditCard size={21} className="text-gray-700" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Online Payment
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Pay securely with Razorpay.
                          </p>
                        </div>

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            paymentMethod === "ONLINE"
                              ? "border-black bg-black"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === "ONLINE" && (
                            <Check size={13} className="text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* ERROR */}

              {errorMessage && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm leading-5 text-red-700">
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* =========================================
                SECURITY
            ========================================= */}

            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
              <ShieldCheck size={20} className="shrink-0 text-gray-700" />

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Secure Checkout
                </p>

                <p className="text-xs text-gray-500">
                  Your payment information is securely processed.
                </p>
              </div>
            </div>
          </div>

          {/* ===========================================
              RIGHT - ORDER SUMMARY
          =========================================== */}

          <aside>
            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h2>

              {/* PRODUCTS */}

              <div className="mt-5 space-y-4">
                {normalizedItems.map((item, index) => (
                  <div key={`${item.product}-${index}`} className="flex gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
                        <CreditCard size={18} className="text-gray-400" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* TOTALS */}

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>

                  <span className="font-medium text-gray-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>

                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? "Free" : formatCurrency(shipping)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Discount</span>

                    <span className="font-medium text-gray-900">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="font-semibold text-gray-900">Total</span>

                  <span className="text-xl font-semibold text-gray-900">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* =======================================
                  CONTINUE
              ======================================= */}

              <Button
                type="button"
                onClick={handleContinue}
                disabled={!paymentMethod || loading}
                className="mt-6 w-full"
              >
                {loading
                  ? paymentMethod === "ONLINE"
                    ? "Processing Payment..."
                    : "Placing Order..."
                  : paymentMethod === "ONLINE"
                    ? "Pay Securely"
                    : paymentMethod === "COD"
                      ? "Place Order"
                      : "Continue"}
              </Button>

              {/* SECURE NOTE */}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Lock size={13} />

                <span>Secure and protected checkout</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Payment;
