import express from "express";

import {
  getAdminHomepageStatistics,
  getPublicHomepageStatistics,
  updateAdminHomepageStatistics,
} from "../controllers/homepageStatistics.controller.js";
import {
  authorize,
  protectedRoute,
} from "../middleware/adminAuth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { updateHomepageStatisticsSchema } from "../validations/homepageStatistics.validation.js";

const router = express.Router();

router.get("/", getPublicHomepageStatistics);

router.get(
  "/admin",
  protectedRoute,
  authorize("admin"),
  getAdminHomepageStatistics,
);

router.patch(
  "/admin",
  protectedRoute,
  authorize("admin"),
  validate(updateHomepageStatisticsSchema),
  updateAdminHomepageStatistics,
);

export default router;
