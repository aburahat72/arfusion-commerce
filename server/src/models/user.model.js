import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    // Customer/Admin name
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [50, "Full name cannot exceed 50 characters"],
    },

    // Email address
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    // Phone number
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
      default: null,
    },

    // Password
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // User role
    // IMPORTANT:
    // Customer registration must always create "customer".
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    // Profile avatar
    avatar: {
      type: String,
      default: null,
    },

    // Email/account verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Admin can activate/deactivate customer accounts
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
// email already has a unique index because of unique: true.

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Remove sensitive fields from API responses
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

const User = mongoose.model("User", userSchema);

export default User;
