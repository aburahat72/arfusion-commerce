import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/auth.controller.js";

import validate from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";

import { protectedRoute, authorize } from "../middleware/auth.middleware.js";

import { authLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// Register
// Rate-limited to help prevent registration abuse.
router.post("/register", authLimiter, validate(registerSchema), registerUser);

// Login
// Rate-limited to help prevent brute-force login attempts.
router.post("/login", authLimiter, validate(loginSchema), loginUser);

// Get authenticated user profile
router.get("/profile", protectedRoute, getProfile);

// Admin test route
router.get("/admin-test", protectedRoute, authorize("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin",
  });
});

export default router;
