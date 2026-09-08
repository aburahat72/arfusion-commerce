import customerApi from "./customerApi";

export const placeOrder = async (orderData) => {
  const response = await customerApi.post("/orders", orderData);
  return response.data;
};

export const getMyOrders = async (params = {}) => {
  const response = await customerApi.get("/orders/my-orders", {
    params,
  });

  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await customerApi.get(`/orders/${orderId}`);

  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await customerApi.patch(
    `/orders/${orderId}/cancel`,
  );

  return response.data;
};

export const createPaymentOrder = async (orderId) => {
  const response = await customerApi.post(
    "/payments/create-order",
    {
      orderId,
    },
  );

  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await customerApi.post(
    "/payments/verify",
    paymentData,
  );

  return response.data;
};
