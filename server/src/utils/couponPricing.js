import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";

const roundCurrency = (amount) => Number(Number(amount).toFixed(2));

export class CouponEligibilityError extends Error {
  constructor(message) {
    super(message);
    this.name = "CouponEligibilityError";
    this.statusCode = 400;
  }
}

export const calculateBaseOrderAmounts = (items) => {
  const subtotal = roundCurrency(
    items.reduce((total, item) => total + Number(item.price) * item.quantity, 0),
  );
  const shipping = subtotal === 0 ? 0 : subtotal >= 500 ? 0 : 50;
  const discount = subtotal > 3000 ? Math.min(250, subtotal) : 0;

  return { subtotal, shipping, discount };
};

export const calculateCouponDiscount = (coupon, subtotal, existingDiscount) => {
  let amount =
    coupon.discountType === "PERCENTAGE"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (
    coupon.discountType === "PERCENTAGE" &&
    coupon.maximumDiscount > 0
  ) {
    amount = Math.min(amount, coupon.maximumDiscount);
  }

  return roundCurrency(Math.max(0, Math.min(amount, subtotal - existingDiscount)));
};

export const isCouponEligible = (coupon, userId, subtotal, now = new Date()) => {
  const isAssignedCustomer = (coupon.assignedCustomers || []).some(
    (customerId) => String(customerId._id || customerId) === String(userId),
  );
  const usageLimit = Number(coupon.usageLimit || 0);

  return (
    coupon.isActive !== false &&
    new Date(coupon.expiresAt) > now &&
    (coupon.isPublic !== false || isAssignedCustomer) &&
    (usageLimit === 0 || Number(coupon.usedCount || 0) < usageLimit) &&
    subtotal >= Number(coupon.minimumOrderAmount || 0)
  );
};

export const buildCouponAvailabilityFilter = (userId, now) => ({
  isActive: true,
  expiresAt: mongoose.trusted({ $gt: now }),
  $or: [
    { isPublic: true },
    { isPublic: mongoose.trusted({ $exists: false }) },
    { assignedCustomers: userId },
  ],
});

export const calculateCouponPricing = async (
  items,
  userId,
  requestedCode,
  { session } = {},
) => {
  const amounts = calculateBaseOrderAmounts(items);
  const query = Coupon.find(buildCouponAvailabilityFilter(userId, new Date())).sort({
    createdAt: -1,
  });
  if (session) query.session(session);

  const coupons = await query;
  const visibleCoupons = coupons
    .filter((coupon) => isCouponEligible(coupon, userId, amounts.subtotal))
    .map((coupon) => ({
    coupon,
    discountAmount: calculateCouponDiscount(
      coupon,
      amounts.subtotal,
      amounts.discount,
    ),
  }));
  const eligibleCoupons = visibleCoupons.filter(
    ({ discountAmount }) => discountAmount > 0,
  );

  let selected = null;
  if (requestedCode === undefined) {
    selected = [...eligibleCoupons].sort(
      (left, right) =>
        right.discountAmount - left.discountAmount ||
        left.coupon.code.localeCompare(right.coupon.code),
    )[0] || null;
  } else if (requestedCode !== null && requestedCode !== "") {
    const normalizedCode = String(requestedCode).trim().toUpperCase();
    const match = visibleCoupons.find(
      ({ coupon }) => coupon.code === normalizedCode,
    );
    if (!match) {
      throw new CouponEligibilityError("This coupon is not available.");
    }
    if (amounts.subtotal < match.coupon.minimumOrderAmount) {
      throw new CouponEligibilityError(
        `Minimum order amount is ₹${match.coupon.minimumOrderAmount}.`,
      );
    }
    if (match.discountAmount <= 0) {
      throw new CouponEligibilityError(
        "This coupon cannot be applied to this order.",
      );
    }
    selected = match;
  }

  const couponDiscount = selected?.discountAmount || 0;
  const totalPrice = roundCurrency(
    Math.max(
      0,
      amounts.subtotal + amounts.shipping - amounts.discount - couponDiscount,
    ),
  );

  return {
    ...amounts,
    items: items.map((item) => ({
      productId: String(item.product?._id || item.product),
      quantity: item.quantity,
      price: roundCurrency(item.price),
    })),
    couponDiscount,
    totalPrice,
    couponId: selected?.coupon._id || null,
    couponCode: selected?.coupon.code || "",
    availableCoupons: eligibleCoupons
      .sort(
        (left, right) =>
          right.discountAmount - left.discountAmount ||
          left.coupon.code.localeCompare(right.coupon.code),
      )
      .map(({ coupon, discountAmount }) => ({
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscount: coupon.maximumDiscount,
        discountAmount,
        expiresAt: coupon.expiresAt,
      })),
  };
};

export const redeemCoupon = async (
  { couponId, subtotal },
  userId,
  session,
  { paymentSnapshot = false } = {},
) => {
  if (!couponId) return;

  const filter = {
    _id: couponId,
    $or: [
      { usageLimit: 0 },
      { usageLimit: { $exists: false } },
      {
        $expr: {
          $lt: [
            { $ifNull: ["$usedCount", 0] },
            { $ifNull: ["$usageLimit", 0] },
          ],
        },
      },
    ],
  };
  if (!paymentSnapshot) {
    filter.minimumOrderAmount = { $lte: subtotal };
    filter.isActive = true;
    filter.expiresAt = { $gt: new Date() };
    filter.$and = [
      {
        $or: [
          { isPublic: true },
          { isPublic: { $exists: false } },
          { assignedCustomers: userId },
        ],
      },
    ];
  }

  const result = await Coupon.collection.updateOne(
    filter,
    { $inc: { usedCount: 1 } },
    { session },
  );

  if (result.modifiedCount !== 1) {
    const error = new Error(
      "The selected coupon has reached its usage limit. Please retry checkout without it.",
    );
    error.statusCode = 409;
    throw error;
  }
};
