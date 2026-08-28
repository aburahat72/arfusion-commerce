import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Handle admin login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin only
    //
    // The role condition is important:
    // A customer account cannot log in through the
    // admin authentication endpoint.
    const user = await User.findOne({
      email,
      role: "admin",
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

    // Generate ADMIN JWT
    //
    // IMPORTANT:
    // Admin authentication uses a completely separate
    // secret from customer authentication.
    const token = jwt.sign(
      {
        userID: user._id,
      },
      process.env.ADMIN_JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    // Temporary development logging
    console.log("ADMIN JWT:", token);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Handle admin profile
export const getAdminProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Admin Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
