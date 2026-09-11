import customerApi from "./customerApi";

/*
 * =========================
 * CUSTOMER ORDERS
 * =========================
 */

/*
 * Place a customer order.
 *
 * Used for:
 * - Cash on Delivery
 *
 * For ONLINE payment, do not call this before
 * Razorpay verification.
 */
export const placeOrder = async (orderData) => {
  const response = await customerApi.post("/orders", orderData);

  return response.data;
};

/*
 * Get logged-in customer's orders.
 */
export const getMyOrders = async (params = {}) => {
  const response = await customerApi.get("/orders/my-orders", {
    params,
  });

  return response.data;
};

/*
 * Get one logged-in customer's order.
 */
export const getOrderById = async (orderId) => {
  const response = await customerApi.get(`/orders/${orderId}`);

  return response.data;
};

/*
 * Cancel a customer order.
 */
export const cancelOrder = async (orderId) => {
  const response = await customerApi.patch(`/orders/${orderId}/cancel`);

  return response.data;
};

/*
 * =========================
 * RAZORPAY PAYMENT
 * =========================
 *
 * PAYMENT-FIRST FLOW
 *
 * Checkout
 *    ↓
 * createPaymentOrder()
 *    ↓
 * Temporary PaymentIntent
 *    ↓
 * Razorpay
 *    ↓
 * verifyPayment()
 *    ↓
 * Final MongoDB Order
 *
 * IMPORTANT:
 * createPaymentOrder() does NOT create
 * the final customer Order.
 */

/*
 * Create a temporary payment intent and
 * Razorpay order.
 *
 * Expected paymentData:
 *
 * {
 *   shippingAddress,
 *   items: [
 *     {
 *       product,
 *       quantity
 *     }
 *   ],
 *   checkoutMode
 * }
 */
export const createPaymentOrder = async (paymentData) => {
  const response = await customerApi.post(
    "/payments/create-order",
    paymentData,
  );

  return response.data;
};

/*
 * Verify successful Razorpay payment.
 *
 * The backend:
 *
 * 1. Verifies Razorpay signature
 * 2. Verifies the payment/order
 * 3. Creates the final MongoDB Order
 * 4. Marks payment as Paid
 *
 * Expected paymentData:
 *
 * {
 *   razorpay_order_id,
 *   razorpay_payment_id,
 *   razorpay_signature
 * }
 */
export const verifyPayment = async (paymentData) => {
  const response = await customerApi.post("/payments/verify", paymentData);

  return response.data;
};

/*
 * =========================
 * PAYMENT STATUS
 * =========================
 *
 * Used when the Razorpay payment:
 *
 * - Fails
 * - Is cancelled/dismissed
 *
 * No final MongoDB customer Order
 * is created for these states.
 */

/*
 * Update temporary PaymentIntent status.
 *
 * status:
 * - "Failed"
 * - "Cancelled"
 */
export const updatePaymentStatus = async (paymentIntentId, status) => {
  const response = await customerApi.post("/payments/status", {
    paymentIntentId,
    status,
  });

  return response.data;
};
