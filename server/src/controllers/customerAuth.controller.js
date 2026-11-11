import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../services/email.services.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client();

const toPublicCustomer = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  isActive: user.isActive,
  avatar: user.avatar,
});

const issueCustomerToken = (user) =>
  jwt.sign(
    { userID: user._id },
    process.env.CUSTOMER_JWT_SECRET,
    { expiresIn: "1h" },
  );

// Handle customer registration
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

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
    // Role is always controlled by the server.
    // The client cannot register as admin.
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: "customer",
    });

    // Send welcome email
    // Registration should succeed even if email sending fails.
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
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
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
    // An admin cannot log in through
    // the customer authentication endpoint.
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
    // Admin can control this from the admin panel.
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
    // Customer authentication uses a separate
    // secret from admin authentication.
    const token = issueCustomerToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
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

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({
        success: false,
        message: "Google sign-in is not configured.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const claims = ticket.getPayload();
    if (
      !claims?.sub ||
      !claims.email ||
      claims.email_verified !== true ||
      typeof claims.name !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Google did not provide a verified customer identity.",
      });
    }

    const email = claims.email.toLowerCase();
    let user = await User.findOne({ googleId: claims.sub }).select("+googleId");

    if (!user) {
      const emailUser = await User.findOne({ email }).select("+googleId +password");
      if (emailUser?.role === "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin accounts must use the admin sign-in page.",
        });
      }
      if (emailUser?.googleId && emailUser.googleId !== claims.sub) {
        return res.status(409).json({
          success: false,
          message: "This account is linked to a different Google identity.",
        });
      }

      if (emailUser) {
        user = await User.findOneAndUpdate(
          {
            _id: emailUser._id,
            role: "customer",
            $or: [
              { googleId: { $exists: false } },
              { googleId: null },
              { googleId: claims.sub },
            ],
          },
          {
            $set: {
              googleId: claims.sub,
              isVerified: true,
              ...(emailUser.avatar ? {} : { avatar: claims.picture || null }),
              authProvider: emailUser.password ? "mixed" : "google",
            },
          },
          { new: true, runValidators: true },
        ).select("+googleId");
        if (!user) {
          return res.status(409).json({
            success: false,
            message: "This account changed while Google sign-in was in progress. Try again.",
          });
        }
      } else {
        const fullName = claims.name.trim().slice(0, 50);
        user = await User.create({
          fullName: fullName.length >= 3 ? fullName : `${email.split("@")[0]} User`,
          email,
          googleId: claims.sub,
          authProvider: "google",
          isVerified: true,
          avatar: claims.picture || null,
          role: "customer",
        });
      }
    }

    if (user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts must use the admin sign-in page.",
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Google sign-in successful.",
      token: issueCustomerToken(user),
      user: toPublicCustomer(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this Google identity already exists. Try signing in again.",
      });
    }
    console.error("Google customer sign-in failed:", error);
    return res.status(401).json({
      success: false,
      message: "Google sign-in could not be verified.",
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
