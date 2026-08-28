import express from "express";

import { getDashboardStats } from "../controllers/dashboard.controller.js";

import {
  protectedRoute,
  authorize,
} from "../middleware/adminAuth.middleware.js";

const router = express.Router();

// Get Dashboard Statistics (Admin)

router.get("/", protectedRoute, authorize("admin"), getDashboardStats);

export default router;

