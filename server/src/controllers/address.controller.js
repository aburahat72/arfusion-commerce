import mongoose from "mongoose";
import Address from "../models/address.model.js";

// addAddress
// Add Address
export const addAddress = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get request data
    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // If this address is marked as default,
    // remove default from other addresses
    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    // Create address
    const address = await Address.create({
      user: userId,
      fullName,
      phone,
      addressLine,
      city,
      state,
      postalCode,
      country: country || "India",
      isDefault: isDefault || false,
    });

    // Return created address
    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("Add Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getAddresses
// Get All Addresses
export const getAddresses = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Find all addresses of the user
    const addresses = await Address.find({
      user: userId,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    // Check whether addresses exist
    if (addresses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No addresses found",
        addresses: [],
      });
    }

    // Return addresses
    return res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Get Addresses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// getAddress
// Get Single Address
export const getAddress = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get address ID from URL
    const { addressId } = req.params;

    // Check whether address ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    // Find user's address
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    });

    // Check whether address exists
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Return address
    return res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Get Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// updateAddress
// Update Address
export const updateAddress = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get address ID from URL
    const { addressId } = req.params;

    // Get updated data
    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // Check whether address ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    // Find user's address
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    });

    // Check whether address exists
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // If this address is marked as default,
    // remove default from other addresses
    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    // Update address
    address.fullName = fullName ?? address.fullName;
    address.phone = phone ?? address.phone;
    address.addressLine = addressLine ?? address.addressLine;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.postalCode = postalCode ?? address.postalCode;
    address.country = country ?? address.country;

    if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }

    // Save updated address
    await address.save();

    // Return updated address
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Update Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// deleteAddress
// Delete Address
export const deleteAddress = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get address ID from URL
    const { addressId } = req.params;

    // Check whether address ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    // Find user's address
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    });

    // Check whether address exists
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Delete address
    await address.deleteOne();

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// setDefaultAddress
// Set Default Address
export const setDefaultAddress = async (req, res) => {
  try {
    // Logic started
    // Get logged-in user ID
    const userId = req.user._id;

    // Get address ID from URL
    const { addressId } = req.params;

    // Check whether address ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    // Find user's address
    const address = await Address.findOne({
      _id: addressId,
      user: userId,
    });

    // Check whether address exists
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Remove default from all user's addresses
    await Address.updateMany({ user: userId }, { isDefault: false });

    // Set selected address as default
    address.isDefault = true;

    // Save address
    await address.save();

    // Return updated address
    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Set Default Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
