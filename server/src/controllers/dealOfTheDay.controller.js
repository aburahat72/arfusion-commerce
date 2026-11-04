import mongoose from "mongoose";

import DealOfTheDay from "../models/dealOfTheDay.model.js";
import Product from "../models/product.model.js";

// =====================================================
// PUBLIC — GET ACTIVE DEAL
// =====================================================
// Returns the latest active deal that is either unexpired
// or ongoing. Used by the homepage DealOfTheDay component.

export const getActiveDeal = async (req, res) => {
  try {
    const now = new Date();

    // Query active deals
    const deals = await DealOfTheDay.find({ isActive: true })
      .populate("product")
      .sort({ createdAt: -1 })
      .lean();

    if (!deals || deals.length === 0) {
      return res.status(200).json({
        success: true,
        deal: null,
      });
    }

    // Find the first deal that is not yet expired
    const activeDeal = deals.find((deal) => {
      const expiry = deal.expiresAt || deal.endsAt;
      return !expiry || new Date(expiry) > now;
    });

    if (!activeDeal) {
      return res.status(200).json({
        success: true,
        deal: null,
      });
    }

    // Normalize backwards-compatible fields
    const normalizedDeal = {
      ...activeDeal,
      expiresAt: activeDeal.expiresAt || activeDeal.endsAt || null,
      discountLabel: activeDeal.discountLabel || activeDeal.discount || "",
    };

    return res.status(200).json({
      success: true,
      deal: normalizedDeal,
    });
  } catch (error) {
    console.error("Get Active Deal Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// ADMIN — GET ALL DEALS
// =====================================================

export const getAllDeals = async (req, res) => {
  try {
    const deals = await DealOfTheDay.find()
      .populate("product")
      .sort({ createdAt: -1 })
      .lean();

    const normalizedDeals = deals.map((d) => ({
      ...d,
      expiresAt: d.expiresAt || d.endsAt || null,
      discountLabel: d.discountLabel || d.discount || "",
    }));

    return res.status(200).json({
      success: true,
      count: normalizedDeals.length,
      deals: normalizedDeals,
    });
  } catch (error) {
    console.error("Get All Deals Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// ADMIN — GET SINGLE DEAL
// =====================================================

export const getDealById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deal ID",
      });
    }

    const deal = await DealOfTheDay.findById(id).populate("product").lean();

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    const normalizedDeal = {
      ...deal,
      expiresAt: deal.expiresAt || deal.endsAt || null,
      discountLabel: deal.discountLabel || deal.discount || "",
    };

    return res.status(200).json({
      success: true,
      deal: normalizedDeal,
    });
  } catch (error) {
    console.error("Get Deal By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// ADMIN — CREATE DEAL
// =====================================================

export const createDeal = async (req, res) => {
  try {
    const { product, title, description, badge, discountLabel, expiresAt } =
      req.body;

    // Validate product ID
    if (!product || !mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    // Verify product exists
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate expiry date if provided
    let expiryDate = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Valid expiry date is required",
        });
      }
      if (expiryDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be in the future",
        });
      }
    }

    // Validate required text fields
    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Title must be at least 3 characters",
      });
    }

    if (!description || description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 5 characters",
      });
    }

    const deal = await DealOfTheDay.create({
      product,
      title: title.trim(),
      description: description.trim(),
      badge: badge?.trim() || "Deal of the Day",
      discountLabel: discountLabel?.trim() || "",
      discount: discountLabel?.trim() || "",
      expiresAt: expiryDate,
      endsAt: expiryDate,
      isActive: true,
    });

    const populatedDeal = await DealOfTheDay.findById(deal._id)
      .populate("product")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Deal created successfully",
      deal: populatedDeal,
    });
  } catch (error) {
    console.error("Create Deal Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// ADMIN — UPDATE DEAL
// =====================================================

export const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deal ID",
      });
    }

    const deal = await DealOfTheDay.findById(id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    const { product, title, description, badge, discountLabel, expiresAt } =
      req.body;

    // Validate and update product if provided
    if (product !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(product)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }
      deal.product = product;
    }

    // Validate and update expiry if provided
    if (expiresAt !== undefined) {
      if (expiresAt === null || expiresAt === "") {
        deal.expiresAt = null;
        deal.endsAt = null;
      } else {
        const expiryDate = new Date(expiresAt);

        if (isNaN(expiryDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Valid expiry date is required",
          });
        }

        if (expiryDate <= new Date()) {
          return res.status(400).json({
            success: false,
            message: "Expiry date must be in the future",
          });
        }

        deal.expiresAt = expiryDate;
        deal.endsAt = expiryDate;
      }
    }

    if (title !== undefined) deal.title = title.trim();
    if (description !== undefined) deal.description = description.trim();
    if (badge !== undefined) deal.badge = badge.trim();
    if (discountLabel !== undefined) {
      deal.discountLabel = discountLabel.trim();
      deal.discount = discountLabel.trim();
    }

    await deal.save();

    const updatedDeal = await DealOfTheDay.findById(id)
      .populate("product")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Deal updated successfully",
      deal: updatedDeal,
    });
  } catch (error) {
    console.error("Update Deal Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// ADMIN — TOGGLE DEAL ACTIVE STATUS
// =====================================================

export const toggleDealStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deal ID",
      });
    }

    const deal = await DealOfTheDay.findById(id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    deal.isActive = !deal.isActive;

    await deal.save();

    const updatedDeal = await DealOfTheDay.findById(id)
      .populate("product")
      .lean();

    return res.status(200).json({
      success: true,
      message: `Deal ${deal.isActive ? "activated" : "deactivated"} successfully`,
      deal: updatedDeal,
    });
  } catch (error) {
    console.error("Toggle Deal Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// ADMIN — DELETE DEAL
// =====================================================

export const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deal ID",
      });
    }

    const deal = await DealOfTheDay.findByIdAndDelete(id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deal deleted successfully",
    });
  } catch (error) {
    console.error("Delete Deal Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
