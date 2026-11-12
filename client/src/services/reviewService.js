import customerApi from "./customerApi";

export const getProductReviews = async (productId, params = {}) => {
  const response = await customerApi.get(`/reviews/${productId}`, { params });
  return response.data;
};

export const getMyOrderReviews = async (orderId) => {
  const response = await customerApi.get(`/reviews/mine/order/${orderId}`);
  return response.data;
};

export const submitReview = async (review) => {
  const response = await customerApi.post("/reviews", review);
  return response.data;
};
