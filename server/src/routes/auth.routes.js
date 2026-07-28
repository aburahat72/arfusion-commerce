import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { protectedRoute, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);

router.post("/login", validate(loginSchema), loginUser);

router.get("/profile", protectedRoute, getProfile);

router.get("/admin-test", protectedRoute, authorize("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin",
  });
});
export default router;
