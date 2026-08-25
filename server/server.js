import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

import express from "express";
import connectDB from "./src/config/db.js";

// API rate limiter middleware
import { apiLimiter } from "./src/middleware/rateLimit.middleware.js";

import authRoutes from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import cartRoutes from "./src/routes/cart.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import wishlistRoutes from "./src/routes/wishlist.routes.js";
import reviewRoutes from "./src/routes/review.routes.js";
import addressRoutes from "./src/routes/address.routes.js";
import couponRoutes from "./src/routes/coupon.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import returnRoutes from "./src/routes/return.routes.js";
import inventoryRoutes from "./src/routes/inventory.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS
// CORS configuration
// Allows the frontend application to communicate with this backend.
// The allowed frontend URL is stored in the environment variables.
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//   }),
// );

// temporary
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);


// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Response compression
// Compresses API responses to reduce response size and improve network performance.
app.use(compression());

// HTTP request logging
app.use(morgan("dev"));

// Global API rate limiter
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/notifications", notificationRoutes);

// admin dashboard routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to ARFusion Commerce API");
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
