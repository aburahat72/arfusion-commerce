import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// =====================================================
// CUSTOMER PROTECTED ROUTE
// =====================================================
// Verifies a customer JWT and loads the current customer
// from the database.
//
// IMPORTANT:
// - Uses CUSTOMER_JWT_SECRET only
// - Does not trust role from the JWT
// - Verifies the database role is "customer"
// - Checks whether the account is active
// =====================================================

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("CUSTOMER AUTH HEADER:", authHeader);

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

    // Verify token using CUSTOMER JWT secret
    const decoded = jwt.verify(
      token,
      process.env.CUSTOMER_JWT_SECRET,
    );

    // Ensure token contains user ID
    if (!decoded.userID) {
      return res.status(401).json({
        success: false,
        message: "Invalid customer authentication token",
      });
    }

    // Find current user in database
    const user = await User.findById(decoded.userID);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // IMPORTANT:
    // Customer authentication only allows customer accounts.
    //
    // The role is read from MongoDB and is never trusted
    // from the frontend or JWT payload.
    if (user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer access required",
      });
    }

    // Check whether account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // Attach authenticated customer to request
    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Customer authentication error:",
      error.message,
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Customer session has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid customer authentication token",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};


// =====================================================
// CUSTOMER AUTHORIZATION
// =====================================================
// Optional role-based authorization.
//
// protectedRoute already verifies that the authenticated
// account is a customer. This middleware can be used when
// a route requires an explicit allowed role.
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

