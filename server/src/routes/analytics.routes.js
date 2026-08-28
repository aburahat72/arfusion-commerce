import express from "express";

import { getAnalytics } from "../controllers/analytics.controller.js";

import {
  protectedRoute,
  authorize,
} from "../middleware/adminAuth.middleware.js";

const router = express.Router();

// Get Analytics (Admin)

router.get("/", protectedRoute, authorize("admin"), getAnalytics);

export default router;
