import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);

router.post("/login", validate(loginSchema), loginUser);

router.get("/profile", authenticate, getProfile);

export default router;
