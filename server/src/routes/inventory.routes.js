import express from "express";

import {
  getInventory,
  getLowStockProducts,
  restockProduct,
  getInventoryHistory,
} from "../controllers/inventory.controller.js";

import {
  protectedRoute,
  authorize,
} from "../middleware/adminAuth.middleware.js";

const router = express.Router();

// Get all inventory

router.get("/", protectedRoute, authorize("admin"), getInventory);

// Get low stock products

router.get(
  "/low-stock",
  protectedRoute,
  authorize("admin"),
  getLowStockProducts,
);

// Restock product

router.put(
  "/:productId/restock",
  protectedRoute,
  authorize("admin"),
  restockProduct,
);

// Get inventory history

router.get("/history", protectedRoute, authorize("admin"), getInventoryHistory);

export default router;
