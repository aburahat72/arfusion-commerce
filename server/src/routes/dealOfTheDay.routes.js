import express from "express";

import {
  getActiveDeal,
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  toggleDealStatus,
  deleteDeal,
} from "../controllers/dealOfTheDay.controller.js";

import {
  protectedRoute,
  authorize,
} from "../middleware/adminAuth.middleware.js";

const router = express.Router();

// =====================================================
// PUBLIC
// =====================================================

// Get the currently active, non-expired deal
// GET /api/deals/active
router.get("/active", getActiveDeal);

// =====================================================
// ADMIN
// =====================================================

// Get all deals (including inactive/expired)
// GET /api/deals
router.get("/", protectedRoute, authorize("admin"), getAllDeals);

// Get single deal by ID
// GET /api/deals/:id
router.get("/:id", protectedRoute, authorize("admin"), getDealById);

// Create a new deal
// POST /api/deals
router.post("/", protectedRoute, authorize("admin"), createDeal);

// Update a deal
// PATCH /api/deals/:id
router.patch("/:id", protectedRoute, authorize("admin"), updateDeal);

// Toggle deal active/inactive
// PATCH /api/deals/:id/status
router.patch(
  "/:id/status",
  protectedRoute,
  authorize("admin"),
  toggleDealStatus,
);

// Delete a deal
// DELETE /api/deals/:id
router.delete("/:id", protectedRoute, authorize("admin"), deleteDeal);

export default router;
