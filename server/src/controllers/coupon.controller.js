import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";
import PaymentIntent from "../models/paymentIntent.model.js";
import User from "../models/user.model.js";
import {
  CheckoutInputError,
  normalizeCheckoutItems,
} from "../utils/checkoutItems.js";
import {
  calculateCouponPricing,
  CouponEligibilityError,
} from "../utils/couponPricing.js";

const validateAssignedCustomers = async (customerIds = []) => {
  const uniqueIds = [...new Set(customerIds.map(String))];
  if (uniqueIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    return false;
  }
  if (uniqueIds.length === 0) return true;

  const customers = await User.find({
    _id: { $in: uniqueIds },
    role: "customer",
  }).select("_id");

  return customers.length === uniqueIds.length;
};

const getCheckoutLines = async (items) => {
  const normalizedItems = normalizeCheckoutItems(items);
  const lines = [];

  for (const item of normalizedItems) {
    const product = await Product.findById(item.productId).select(
      "price isActive",
    );
    if (!product || !product.isActive) {
      throw new CheckoutInputError("A selected product is no longer available.");
    }

    lines.push({
      product: product._id,
      quantity: item.quantity,
      price: Number(product.price),
    });
  }

  return lines;
};

const handleCouponError = (res, error, operation) => {
  console.error(`${operation} Error:`, error);

  if (
    error instanceof CheckoutInputError ||
    error instanceof CouponEligibilityError
  ) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Coupon code already exists.",
    });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount = 0,
      maximumDiscount = 0,
      usageLimit = 0,
      expiresAt,
      isActive = true,
      isPublic = true,
      assignedCustomers = [],
    } = req.body;

    if (
      !isPublic &&
      (!assignedCustomers.length ||
        !(await validateAssignedCustomers(assignedCustomers)))
    ) {
      return res.status(400).json({
        success: false,
        message: "Assign at least one valid customer to a private coupon.",
      });
    }

    const coupon = await Coupon.create({
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      expiresAt,
      isActive,
      isPublic,
      assignedCustomers: isPublic ? [] : assignedCustomers,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    return handleCouponError(res, error, "Create Coupon");
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate("assignedCustomers", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    return handleCouponError(res, error, "Get Coupons");
  }
};

export const getCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    const coupon = await Coupon.findById(couponId).populate(
      "assignedCustomers",
      "fullName email",
    );
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({ success: true, coupon });
  } catch (error) {
    return handleCouponError(res, error, "Get Coupon");
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      expiresAt,
      isActive,
      isPublic,
      assignedCustomers,
    } = req.body;

    const nextIsPublic = isPublic ?? coupon.isPublic;
    const nextAssignedCustomers =
      assignedCustomers ?? coupon.assignedCustomers.map(String);
    if (
      !nextIsPublic &&
      (!nextAssignedCustomers.length ||
        !(await validateAssignedCustomers(nextAssignedCustomers)))
    ) {
      return res.status(400).json({
        success: false,
        message: "Assign at least one valid customer to a private coupon.",
      });
    }
    if (
      (discountType ?? coupon.discountType) === "PERCENTAGE" &&
      (discountValue ?? coupon.discountValue) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%.",
      });
    }

    if (code !== undefined) coupon.code = code;
    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minimumOrderAmount !== undefined) {
      coupon.minimumOrderAmount = minimumOrderAmount;
    }
    if (maximumDiscount !== undefined) coupon.maximumDiscount = maximumDiscount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt;
    if (isActive !== undefined) coupon.isActive = isActive;
    coupon.isPublic = nextIsPublic;
    coupon.assignedCustomers = nextIsPublic ? [] : nextAssignedCustomers;

    await coupon.save();
    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    return handleCouponError(res, error, "Update Coupon");
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    const pendingPayment = await PaymentIntent.exists({
      coupon: couponId,
      status: "Created",
    });
    if (pendingPayment) {
      return res.status(409).json({
        success: false,
        message: "This coupon is attached to a pending payment and cannot be deleted yet.",
      });
    }

    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    return handleCouponError(res, error, "Delete Coupon");
  }
};

export const getEligibleCoupons = async (req, res) => {
  try {
    const lines = await getCheckoutLines(req.body.items);
    const hasCouponCode = Object.prototype.hasOwnProperty.call(
      req.body,
      "couponCode",
    );
    const pricing = await calculateCouponPricing(
      lines,
      req.user._id,
      hasCouponCode ? req.body.couponCode : undefined,
    );

    return res.status(200).json({ success: true, pricing });
  } catch (error) {
    return handleCouponError(res, error, "Get Eligible Coupons");
  }
};

export const applyCoupon = getEligibleCoupons;

export const removeCoupon = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Coupon removed successfully",
  });
};
