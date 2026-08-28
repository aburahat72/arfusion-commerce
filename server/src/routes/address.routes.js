import express from "express";

import {
  addAddress,
  getAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";

import { protectedRoute } from "../middleware/customerAuth.middleware.js";

import validate from "../middleware/validate.middleware.js";

import {
  addAddressSchema,
  updateAddressSchema,
} from "../validations/address.validation.js";

const router = express.Router();

// Add Address

router.post("/", protectedRoute, validate(addAddressSchema), addAddress);

// Get All Addresses

router.get("/", protectedRoute, getAddresses);

// Get Single Address

router.get("/:addressId", protectedRoute, getAddress);

// Update Address

router.put(
  "/:addressId",
  protectedRoute,
  validate(updateAddressSchema),
  updateAddress,
);

// Delete Address

router.delete("/:addressId", protectedRoute, deleteAddress);

// Set Default Address

router.patch("/:addressId/default", protectedRoute, setDefaultAddress);

export default router;
