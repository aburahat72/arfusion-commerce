import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// =====================================================
// ADMIN PROTECTED ROUTE
// =====================================================
// Verifies an admin JWT and loads the current admin
// from the database.
//
// IMPORTANT:
// - Uses ADMIN_JWT_SECRET only
// - Does not trust role from the JWT
// - Verifies the database role is "admin"
// - Checks whether the account is active
// =====================================================

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("ADMIN AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing or malformed",
      });
    }

    // Get token from Bearer header
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    // Verify ADMIN JWT using admin-only secret
    const decoded = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET,
    );

    // Make sure token contains user ID
    if (!decoded.userID) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin authentication token",
      });
    }

    // Find logged-in user
    const user = await User.findById(decoded.userID);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin middleware only allows admin accounts
    //
    // The role is read directly from MongoDB and is not
    // trusted from the frontend or JWT payload.
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // Check whether account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // Attach authenticated admin to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Admin authentication error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Admin session has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin authentication token",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};


// =====================================================
// ADMIN AUTHORIZATION
// =====================================================
// Optional role-based authorization.
//
// protectedRoute already verifies that the authenticated
// account is an admin. This middleware is available for
// routes that require an explicit allowed role.
// =====================================================

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }

    next();
  };
};

