import express from "express";

import {
  loginAdmin,
  getAdminProfile,
} from "../controllers/adminAuth.controller.js";

import validate from "../middleware/validate.middleware.js";

import { loginSchema } from "../validations/adminAuth.validation.js";

import { protectedRoute } from "../middleware/adminAuth.middleware.js";

import { authLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// Admin Login

// Rate-limited to help prevent brute-force login attempts.

router.post("/login", authLimiter, validate(loginSchema), loginAdmin);

// Get authenticated admin profile

router.get("/profile", protectedRoute, getAdminProfile);

export default router;
