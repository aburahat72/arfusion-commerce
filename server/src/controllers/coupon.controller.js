import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";

// createCoupon
// Create Coupon
export const createCoupon = async (req, res) => {
  try {
    // Logic started
    // Get request data
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      expiresAt,
      isActive,
    } = req.body;

    // Check whether coupon already exists
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscount: maximumDiscount || 0,
      usageLimit: usageLimit || 0,
      usedCount: 0,
      expiresAt,
      isActive: isActive ?? true,
    });

    // Return created coupon
    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getCoupons
// Get All Coupons
export const getCoupons = async (req, res) => {
  try {
    // Logic started
    // Get all coupons
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    // Check whether coupons exist
    if (coupons.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No coupons found",
        coupons: [],
      });
    }

    // Return coupons
    return res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Get Coupons Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getCoupon
// Get Single Coupon
export const getCoupon = async (req, res) => {
  try {
    // Logic started
    // Get coupon ID from URL
    const { couponId } = req.params;

    // Check whether coupon ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    // Find coupon
    const coupon = await Coupon.findById(couponId);

    // Check whether coupon exists
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Return coupon
    return res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error("Get Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// updateCoupon
// Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    // Logic started
    // Get coupon ID from URL
    const { couponId } = req.params;

    // Get request data
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      expiresAt,
      isActive,
    } = req.body;

    // Check whether coupon ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    // Find coupon
    const coupon = await Coupon.findById(couponId);

    // Check whether coupon exists
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check whether another coupon already uses this code
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: code.toUpperCase(),
      });

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        });
      }

      coupon.code = code.toUpperCase();
    }

    // Update coupon fields
    coupon.discountType = discountType ?? coupon.discountType;
    coupon.discountValue = discountValue ?? coupon.discountValue;
    coupon.minimumOrderAmount = minimumOrderAmount ?? coupon.minimumOrderAmount;
    coupon.maximumDiscount = maximumDiscount ?? coupon.maximumDiscount;
    coupon.usageLimit = usageLimit ?? coupon.usageLimit;
    coupon.expiresAt = expiresAt ?? coupon.expiresAt;

    if (isActive !== undefined) {
      coupon.isActive = isActive;
    }

    // Save updated coupon
    await coupon.save();

    // Return updated coupon
    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Update Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// deleteCoupon
// Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    // Logic started
    // Get coupon ID from URL
    const { couponId } = req.params;

    // Check whether coupon ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    // Find coupon
    const coupon = await Coupon.findById(couponId);

    // Check whether coupon exists
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Delete coupon
    await coupon.deleteOne();

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// applyCoupon
// Apply Coupon
export const applyCoupon = async (req, res) => {
  try {
    // Logic started
    // Get request data
    const { code, orderAmount } = req.body;

    // Find active coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    // Check whether coupon exists
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Check whether coupon has expired
    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit exceeded",
      });
    }

    // Check minimum order amount
    if (orderAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
      });
    }

    // Calculate discount
    let discount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discount = (orderAmount * coupon.discountValue) / 100;

      if (coupon.maximumDiscount > 0 && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Calculate final amount
    const finalAmount = Math.max(orderAmount - discount, 0);

    // Return result
    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: coupon.code,
      discount,
      finalAmount,
    });
  } catch (error) {
    console.error("Apply Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// removeCoupon
// Remove Coupon
export const removeCoupon = async (req, res) => {
  try {
    // Logic started
    // Return success response
    return res.status(200).json({
      success: true,
      message: "Coupon removed successfully",
    });
  } catch (error) {
    console.error("Remove Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
