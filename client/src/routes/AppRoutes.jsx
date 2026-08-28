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
// CUSTOMER PROFILE PAGES
// =====================================================

import Profile from "../pages/Profile/Profile";
import PersonalInformation from "../pages/PersonalInformation/PersonalInformation";
import Addresses from "../pages/Addresses/Addresses";
import Orders from "../pages/Orders/Orders";
import Settings from "../pages/Settings/Settings";

// =====================================================
// CUSTOMER AUTHENTICATION
// =====================================================

import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";

// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

import AdminLogin from "../pages/Auth/AdminLogin";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "../pages/Admin/Dashboard/AdminDashboard";
import AdminOrders from "../pages/Admin/Orders/AdminOrders";
import AdminOrderDetails from "../pages/Admin/Orders/AdminOrderDetails";
import AdminProducts from "../pages/Admin/Products/AdminProducts";
import AdminInventory from "../pages/Admin/Inventory/AdminInventory";
import AdminCustomers from "../pages/Admin/Customers/AdminCustomers";
import AdminReviews from "../pages/Admin/Reviews/AdminReviews";
import AdminCategories from "../pages/Admin/Categories/AdminCategories";
import AdminCoupons from "../pages/Admin/Coupons/AdminCoupons";
import AdminBanners from "../pages/Admin/Banners/AdminBanners";
import AdminAnalytics from "../pages/Admin/Analytics/AdminAnalytics";
import AdminReports from "../pages/Admin/Reports/AdminReports";
import AdminSettings from "../pages/Admin/Settings/AdminSettings";
import AdminProfile from "../pages/Admin/Profile/AdminProfile";

// =====================================================
// ROUTE GUARDS
// =====================================================

// Customer authentication guard
import ProtectedRoute from "./ProtectedRoute";

// Admin authentication + role guard
import AdminRoute from "./AdminRoute";

// =====================================================
// 404 PAGE
// =====================================================

function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text">404</h1>

        <p className="mt-3 text-base text-text-secondary">Page not found</p>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
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
        </button>
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
            CUSTOMER AUTHENTICATION
            Public routes
        ================================================= */}

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* =================================================
            ADMIN AUTHENTICATION
            Completely separate from customer authentication
        ================================================= */}

        <Route path="/admin/login" element={<AdminLogin />} />

        {/* =================================================
            CUSTOMER ROUTES
            Uses MainLayout
        ================================================= */}

        <Route element={<MainLayout />}>
          {/* =================================================
              PUBLIC CUSTOMER ROUTES
          ================================================= */}

          <Route path="/" element={<Home />} />

          <Route path="/products" element={<Products />} />

          <Route path="/products/:productId" element={<ProductDetails />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/wishlist" element={<Wishlist />} />

          <Route path="/compare" element={<Compare />} />

          {/* =================================================
              PROTECTED CUSTOMER ROUTES

              Requires:
              - Customer JWT
              - Valid customer session
          ================================================= */}

          <Route element={<ProtectedRoute />}>
            {/* Customer Profile */}

            <Route path="/profile" element={<Profile />} />

            <Route
              path="/profile/personal-information"
              element={<PersonalInformation />}
            />

            <Route path="/profile/addresses" element={<Addresses />} />

            <Route path="/profile/orders" element={<Orders />} />

            <Route path="/profile/settings" element={<Settings />} />

            {/* Customer Checkout */}

            <Route path="/checkout" element={<Checkout />} />

            {/* Order Success */}

            <Route path="/order-success" element={<OrderSuccess />} />
          </Route>
        </Route>

        {/* =================================================
            ADMIN ROUTES

            Requires:
            - Admin JWT
            - Admin authentication
            - Admin role

            Admin routes NEVER use ProtectedRoute.
        ================================================= */}

        <Route element={<AdminRoute />}>
          {/* =================================================
              ADMIN LAYOUT
          ================================================= */}

          <Route element={<AdminLayout />}>
            {/* =================================================
                ADMIN DASHBOARD
            ================================================= */}

            <Route path="/admin" element={<AdminDashboard />} />

            {/* =================================================
                ADMIN ORDERS
            ================================================= */}

            <Route path="/admin/orders" element={<AdminOrders />} />

            <Route
              path="/admin/orders/:orderId"
              element={<AdminOrderDetails />}
            />

            {/* =================================================
                ADMIN PRODUCTS
            ================================================= */}

            <Route path="/admin/products" element={<AdminProducts />} />

            {/* =================================================
                ADMIN INVENTORY
            ================================================= */}

            <Route path="/admin/inventory" element={<AdminInventory />} />

            {/* =================================================
                ADMIN CUSTOMERS
            ================================================= */}

            <Route path="/admin/customers" element={<AdminCustomers />} />

            {/* =================================================
                ADMIN REVIEWS
            ================================================= */}

            <Route path="/admin/reviews" element={<AdminReviews />} />

            {/* =================================================
                ADMIN CATEGORIES
            ================================================= */}

            <Route path="/admin/categories" element={<AdminCategories />} />

            {/* =================================================
                ADMIN COUPONS
            ================================================= */}

            <Route path="/admin/coupons" element={<AdminCoupons />} />

            {/* =================================================
                ADMIN BANNERS
            ================================================= */}

            <Route path="/admin/banners" element={<AdminBanners />} />

            {/* =================================================
                ADMIN ANALYTICS
            ================================================= */}

            <Route path="/admin/analytics" element={<AdminAnalytics />} />

            {/* =================================================
                ADMIN REPORTS
            ================================================= */}

            <Route path="/admin/reports" element={<AdminReports />} />

            {/* =================================================
                ADMIN SETTINGS
            ================================================= */}

            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* =================================================
                ADMIN PROFILE
            ================================================= */}

            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
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
