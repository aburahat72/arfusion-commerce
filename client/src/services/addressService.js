import customerApi from "./customerApi";

export const getAddresses = async () => {
  const response = await customerApi.get("/addresses");
  return response.data;
};

export const getAddressById = async (addressId) => {
  const response = await customerApi.get(`/addresses/${addressId}`);
  return response.data;
};

export const addAddress = async (addressData) => {
  const response = await customerApi.post("/addresses", addressData);
  return response.data;
};

export const updateAddress = async (addressId, addressData) => {
  const response = await customerApi.put(
    `/addresses/${addressId}`,
    addressData,
  );

  return response.data;
};

export const deleteAddress = async (addressId) => {
  const response = await customerApi.delete(`/addresses/${addressId}`);
  return response.data;
};

export const setDefaultAddress = async (addressId) => {
  const response = await customerApi.patch(`/addresses/${addressId}/default`);

  return response.data;
};
