import express from "express";

import {
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  updateCustomer,
  deleteCustomer,
} from "../controllers/adminCustomer.controller.js";

import {
  protectedRoute,
  authorize,
} from "../middleware/adminAuth.middleware.js";

const router = express.Router();

// =====================================================
// ALL CUSTOMERS
// GET /api/admin/customers
// =====================================================

router.get("/", protectedRoute, authorize("admin"), getCustomers);

// =====================================================
// SINGLE CUSTOMER
// GET /api/admin/customers/:id
// =====================================================

router.get("/:id", protectedRoute, authorize("admin"), getCustomerById);

// =====================================================
// ACTIVATE / BLOCK CUSTOMER
// PATCH /api/admin/customers/:id/status
// =====================================================

router.patch(
  "/:id/status",
  protectedRoute,
  authorize("admin"),
  updateCustomerStatus,
);

// =====================================================
// UPDATE CUSTOMER
// PATCH /api/admin/customers/:id
// =====================================================

router.patch("/:id", protectedRoute, authorize("admin"), updateCustomer);

// =====================================================
// DELETE CUSTOMER
// DELETE /api/admin/customers/:id
// =====================================================

router.delete("/:id", protectedRoute, authorize("admin"), deleteCustomer);

export default router;
