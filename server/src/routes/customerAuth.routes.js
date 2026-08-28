import express from "express";

import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/customerAuth.controller.js";

import validate from "../middleware/validate.middleware.js";

import {
  registerSchema,
  loginSchema,
} from "../validations/customerAuth.validation.js";

import {
  protectedRoute,
} from "../middleware/customerAuth.middleware.js";

import { authLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// Register

// Rate-limited to help prevent registration abuse.

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  registerUser,
);

// Login

// Rate-limited to help prevent brute-force login attempts.

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  loginUser,
);

// Get authenticated customer profile

router.get(
  "/profile",
  protectedRoute,
  getProfile,
);

export default router;
