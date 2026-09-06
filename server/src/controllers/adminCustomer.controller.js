import mongoose from "mongoose";
import User from "../models/user.model.js";

// =====================================================
// GET ALL CUSTOMERS
// =====================================================

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get Customers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET CUSTOMER BY ID
// =====================================================

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await User.findOne({
      _id: id,
      role: "customer",
    }).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// UPDATE CUSTOMER STATUS
// Active / Deactive / Block
// =====================================================

export const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const customer = await User.findOneAndUpdate(
      {
        _id: id,
        role: "customer",
      },
      {
        $set: {
          isActive,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Customer activated successfully"
        : "Customer blocked successfully",
      customer,
    });
  } catch (error) {
    console.error("Update Customer Status Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Customer information already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// UPDATE CUSTOMER
// Name / Email / Phone / Avatar
// =====================================================

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, avatar } = req.body;

    // =================================================
    // VALIDATE CUSTOMER ID
    // =================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // =================================================
    // FIND CUSTOMER
    // =================================================

    const customer = await User.findOne({
      _id: id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // =================================================
    // UPDATE FULL NAME
    // =================================================

    if (fullName !== undefined) {
      customer.fullName = fullName;
    }

    // =================================================
    // UPDATE PHONE
    // =================================================

    if (phone !== undefined) {
      customer.phone = phone;
    }

    // =================================================
    // UPDATE AVATAR
    // =================================================

    if (avatar !== undefined) {
      customer.avatar = avatar;
    }

    // =================================================
    // UPDATE EMAIL
    // =================================================

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
      }).select("_id role");

      if (existingUser && existingUser._id.toString() !== id.toString()) {
        return res.status(409).json({
          success: false,
          message: "Email is already being used by another account",
        });
      }

      customer.email = normalizedEmail;
    }

    // =================================================
    // SAVE CUSTOMER
    // =================================================

    await customer.save();

    // =================================================
    // RETURN UPDATED CUSTOMER
    // =================================================

    const updatedCustomer = await User.findById(customer._id).select(
      "-password",
    );

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Update Customer Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already being used by another account",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid value for ${error.path}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// DELETE CUSTOMER
// =====================================================

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await User.findOneAndDelete({
      _id: id,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
