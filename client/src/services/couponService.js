import adminApi from "./adminApi";
import customerApi from "./customerApi";

export const getAdminCoupons = async () => {
  const response = await adminApi.get("/coupons");
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch coupons.");
  }
  return response.data.coupons || [];
};

export const createAdminCoupon = async (data) => {
  const response = await adminApi.post("/coupons", data);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to create coupon.");
  }
  return response.data.coupon;
};

export const updateAdminCoupon = async (id, data) => {
  const response = await adminApi.put(`/coupons/${encodeURIComponent(id)}`, data);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to update coupon.");
  }
  return response.data.coupon;
};

export const deleteAdminCoupon = async (id) => {
  const response = await adminApi.delete(
    `/coupons/${encodeURIComponent(id)}`,
  );
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to delete coupon.");
  }
  return response.data;
};

export const getEligibleCoupons = async (items, couponCode) => {
  const body = { items };
  if (couponCode !== undefined) body.couponCode = couponCode;
  const response = await customerApi.post("/coupons/eligible", body);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Unable to load coupons.");
  }
  return response.data.pricing;
};
