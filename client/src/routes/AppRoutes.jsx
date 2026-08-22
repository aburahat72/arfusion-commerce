import { BrowserRouter, Routes, Route } from "react-router-dom";

// =====================================================
// LAYOUTS
// =====================================================

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";

// =====================================================
// CUSTOMER PAGES
// =====================================================

import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import ProductDetails from "../pages/Products/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";
import Wishlist from "../pages/Wishlist/Wishlist";
import Compare from "../pages/Compare/Compare";

// =====================================================
// PROFILE PAGES
// =====================================================

import Profile from "../pages/Profile/Profile";
import PersonalInformation from "../pages/PersonalInformation/PersonalInformation";
import Addresses from "../pages/Addresses/Addresses";
import Orders from "../pages/Orders/Orders";
import Settings from "../pages/Settings/Settings";

// =====================================================
// AUTHENTICATION PAGES
// =====================================================

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";

// =====================================================
// ADMIN PAGES
// =====================================================

function AdminDashboard() {
  return (
    <div className="min-h-dvh bg-background p-6 text-text">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
    </div>
  );
}

// =====================================================
// 404 PAGE
// =====================================================

function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text">404</h1>

        <p className="mt-3 text-base text-text-secondary">Page not found</p>

        <a
          href="/"
          className="
            mt-6
            inline-flex
            items-center
            justify-center
            rounded-lg
            bg-primary
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:opacity-90
          "
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}

// =====================================================
// APP ROUTES
// =====================================================

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =================================================
            AUTHENTICATION ROUTES

            Dedicated authentication UI.
            No customer Navbar/Footer.
        ================================================= */}

        <Route element={<AuthLayout />}>
          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Register */}
          <Route path="/register" element={<Register />} />

          {/* Forgot Password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* =================================================
            CUSTOMER ROUTES

            MainLayout:
              Navbar
              Page Content
              Footer
        ================================================= */}

        <Route element={<MainLayout />}>
          {/* ================= HOME ================= */}

          <Route path="/" element={<Home />} />

          {/* ================= PRODUCTS ================= */}

          <Route path="/products" element={<Products />} />

          <Route path="/products/:productId" element={<ProductDetails />} />

          {/* ================= SHOPPING ================= */}

          <Route path="/cart" element={<Cart />} />

          <Route path="/wishlist" element={<Wishlist />} />

          <Route path="/compare" element={<Compare />} />

          {/* ================= PROFILE ================= */}

          <Route path="/profile" element={<Profile />} />

          <Route
            path="/profile/personal-information"
            element={<PersonalInformation />}
          />

          <Route path="/profile/addresses" element={<Addresses />} />

          <Route path="/profile/orders" element={<Orders />} />

          <Route path="/profile/settings" element={<Settings />} />

          {/* ================= CHECKOUT ================= */}

          <Route path="/checkout" element={<Checkout />} />

          <Route path="/order-success" element={<OrderSuccess />} />
        </Route>

        {/* =================================================
            ADMIN ROUTES

            Admin has its own layout.
        ================================================= */}

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* =================================================
            404
        ================================================= */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
