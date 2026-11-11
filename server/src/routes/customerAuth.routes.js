import express from "express";
import { z } from "zod";

import {
  registerUser,
  loginUser,
  getProfile,
  googleLogin,
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

router.post(
  "/google",
  authLimiter,
  validate(
    z.object({
      credential: z.string().min(1).max(8192),
    }),
  ),
  googleLogin,
);

// Get authenticated customer profile

router.get(
  "/profile",
  protectedRoute,
  getProfile,
);

export default router;
