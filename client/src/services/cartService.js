import customerApi from "./customerApi";

export const getCart = async () => {
  const response = await customerApi.get("/cart");

  return response.data;
};

export const addToCartApi = async (productId, quantity = 1) => {
  const response = await customerApi.post("/cart", {
    productId,
    quantity,
  });

  return response.data;
};

export const updateCartItemApi = async (productId, quantity) => {
  const response = await customerApi.patch(`/cart/${productId}`, {
    quantity,
  });

  return response.data;
};

export const removeCartItemApi = async (productId) => {
  const response = await customerApi.delete(`/cart/${productId}`);

  return response.data;
};

export const clearCartApi = async () => {
  const response = await customerApi.delete("/cart");

  return response.data;
};
