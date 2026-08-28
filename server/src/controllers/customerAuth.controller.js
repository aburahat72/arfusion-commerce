import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../services/email.services.js";

// Handle customer registration
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new customer
    // IMPORTANT:
    // Role is explicitly controlled by the server.
    // The client cannot register as admin.
    const user = await User.create({
      fullName,
      email,
      password,
      role: "customer",
    });

    // Send welcome email (don't fail registration if email fails)
    try {
      await sendWelcomeEmail(user.email, user.fullName);
    } catch (error) {
      console.error("Welcome email failed:", error);
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error registering customer:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Handle customer login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find customer only
    //
    // The role condition is important:
    // An admin account cannot log in through the
    // customer authentication endpoint.
    const user = await User.findOne({
      email,
      role: "customer",
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check whether account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // Compare password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate CUSTOMER JWT
    //
    // IMPORTANT:
    // Customer authentication uses a completely
    // separate secret from admin authentication.
    const token = jwt.sign(
      {
        userID: user._id,
      },
      process.env.CUSTOMER_JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    // Temporary development logging
    console.log("CUSTOMER JWT:", token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Customer Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Handle customer profile
export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Customer Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
