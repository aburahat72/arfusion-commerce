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
            AUTHENTICATION
            Dedicated authentication UI
        ================================================= */}

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* =================================================
            CUSTOMER
            Uses MainLayout
        ================================================= */}

        <Route element={<MainLayout />}>
          {/* Home */}

          <Route path="/" element={<Home />} />

          {/* Products */}

          <Route path="/products" element={<Products />} />

          <Route path="/products/:productId" element={<ProductDetails />} />

          {/* Shopping */}

          <Route path="/cart" element={<Cart />} />

          <Route path="/wishlist" element={<Wishlist />} />

          <Route path="/compare" element={<Compare />} />

          {/* Profile */}

          <Route path="/profile" element={<Profile />} />

          <Route
            path="/profile/personal-information"
            element={<PersonalInformation />}
          />

          <Route path="/profile/addresses" element={<Addresses />} />

          <Route path="/profile/orders" element={<Orders />} />

          <Route path="/profile/settings" element={<Settings />} />

          {/* Checkout */}

          <Route path="/checkout" element={<Checkout />} />

          <Route path="/order-success" element={<OrderSuccess />} />
        </Route>

        {/* =================================================
            ADMIN
            Uses AdminLayout
        ================================================= */}

        <Route element={<AdminLayout />}>
          {/* Dashboard */}

          <Route path="/admin" element={<AdminDashboard />} />

          {/* Orders */}

          <Route path="/admin/orders" element={<AdminOrders />} />

          <Route
            path="/admin/orders/:orderId"
            element={<AdminOrderDetails />}
          />

          {/* Products */}

          <Route path="/admin/products" element={<AdminProducts />} />

          {/* Customers */}

          <Route path="/admin/customers" element={<AdminCustomers />} />

          {/* Inventory */}

          <Route path="/admin/inventory" element={<AdminInventory />} />

          {/* Reviews */}

          <Route path="/admin/reviews" element={<AdminReviews />} />

          {/* Categories */}

          <Route path="/admin/categories" element={<AdminCategories />} />

          {/* Coupons */}

          <Route path="/admin/coupons" element={<AdminCoupons />} />

          {/* Banners */}

          <Route path="/admin/banners" element={<AdminBanners />} />

          {/* Analytics */}

          <Route path="/admin/analytics" element={<AdminAnalytics />} />

          {/* Reports */}

          <Route path="/admin/reports" element={<AdminReports />} />

          {/* Settings */}

          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* Admin Profile */}

          <Route path="/admin/profile" element={<AdminProfile />} />
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
