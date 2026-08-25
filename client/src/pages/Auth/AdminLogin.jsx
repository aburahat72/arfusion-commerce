import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Settings,
  User,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { saveAuth } from "../../utils/authStorage";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (!response.data?.success) {
        setError(response.data?.message || "Unable to sign in.");
        return;
      }

      const { token, user } = response.data;

      if (user?.role !== "admin") {
        setError("This account does not have administrator access.");
        return;
      }

      saveAuth(token, user);

      const redirectPath = location.state?.from?.pathname || "/admin";

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#f5f6fb] p-0 sm:p-4 lg:p-6">
      <div
        className="
          mx-auto
          flex
          min-h-dvh
          w-full
          max-w-[1280px]
          overflow-hidden
          bg-white
          shadow-none
          sm:min-h-[calc(100dvh-2rem)]
          sm:rounded-2xl
          sm:shadow-[0_20px_60px_rgba(15,23,42,0.10)]
          lg:min-h-[calc(100dvh-3rem)]
        "
      >
        {/* =================================================
            LEFT BRAND PANEL
        ================================================= */}

        <section
          className="
            relative
            hidden
            w-[44%]
            overflow-hidden
            bg-[#061a3a]
            px-8
            py-10
            text-white
            lg:flex
            lg:flex-col
            lg:justify-between
            xl:px-14
            xl:py-12
          "
        >
          {/* Background decoration */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/5" />

          <div className="pointer-events-none absolute -left-32 bottom-16 h-80 w-80 rounded-full border border-white/5" />

          <div className="pointer-events-none absolute right-10 top-48 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

          {/* Logo */}

          <div className="relative z-10 flex items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border-2
                border-violet-400
                text-violet-300
              "
            >
              <span className="text-2xl font-bold">A</span>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-violet-400">AR</span>
                Fusion
              </h1>

              <p className="text-sm text-slate-300">Admin Panel</p>
            </div>
          </div>

          {/* Main content */}

          <div className="relative z-10 -mt-2">
            <h2 className="max-w-md text-3xl font-bold leading-tight xl:text-[38px]">
              Welcome Back,
              <br />
              Admin!
            </h2>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-300 xl:text-base">
              Sign in to manage your store, track orders, manage products and
              grow your business.
            </p>

            {/* Dashboard illustration */}

            <div className="relative mx-auto mt-10 flex h-[270px] max-w-[500px] items-center justify-center">
              {/* Glow */}

              <div className="absolute h-52 w-72 rounded-full bg-violet-600/20 blur-3xl" />

              {/* Laptop */}

              <div className="relative w-[330px]">
                <div
                  className="
                    relative
                    mx-auto
                    h-[185px]
                    w-[275px]
                    rounded-xl
                    border
                    border-slate-500/50
                    bg-slate-900
                    p-2
                    shadow-[0_25px_60px_rgba(0,0,0,0.45)]
                  "
                >
                  <div className="h-full overflow-hidden rounded-lg bg-[#101d3a] p-3">
                    {/* Dashboard top */}

                    <div className="flex gap-2">
                      <div className="h-2 w-12 rounded bg-violet-400" />
                      <div className="h-2 w-8 rounded bg-blue-400" />
                      <div className="h-2 w-10 rounded bg-slate-600" />
                    </div>

                    {/* Dashboard body */}

                    <div className="mt-4 flex gap-3">
                      <div className="w-10 space-y-2">
                        <div className="h-2 rounded bg-slate-600" />
                        <div className="h-2 rounded bg-violet-500" />
                        <div className="h-2 rounded bg-slate-600" />
                        <div className="h-2 rounded bg-slate-600" />
                      </div>

                      <div className="flex-1">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-10 rounded bg-violet-500/20" />
                          <div className="h-10 rounded bg-blue-500/20" />
                          <div className="h-10 rounded bg-purple-500/20" />
                        </div>

                        <div className="mt-3 h-20 rounded bg-slate-800 p-2">
                          <div className="flex h-full items-end gap-2">
                            <div className="h-7 w-4 rounded-t bg-violet-500" />
                            <div className="h-12 w-4 rounded-t bg-blue-500" />
                            <div className="h-9 w-4 rounded-t bg-violet-400" />
                            <div className="h-16 w-4 rounded-t bg-purple-500" />
                            <div className="h-11 w-4 rounded-t bg-blue-400" />
                            <div className="h-14 w-4 rounded-t bg-violet-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Laptop base */}

                <div className="mx-auto h-4 w-[320px] rounded-b-[50%] bg-slate-700 shadow-xl" />

                {/* Floating analytics card */}

                <div
                  className="
                    absolute
                    -right-2
                    top-20
                    w-28
                    rounded-xl
                    border
                    border-white/10
                    bg-white/10
                    p-3
                    shadow-xl
                    backdrop-blur-md
                  "
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 size={13} className="text-blue-400" />

                    <span className="text-[9px] text-slate-300">Sales</span>
                  </div>

                  <p className="mt-2 text-sm font-bold">+24.8%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature cards */}

          <div
            className="
              relative
              z-10
              grid
              grid-cols-3
              gap-2
              rounded-xl
              bg-white/[0.04]
              p-3
              backdrop-blur-sm
              xl:gap-3
              xl:p-4
            "
          >
            <Feature
              icon={<ShieldCheck size={18} />}
              title="Secure"
              description="Data Protection"
            />

            <Feature
              icon={<BarChart3 size={18} />}
              title="Analytics"
              description="Business Insights"
            />

            <Feature
              icon={<Settings size={18} />}
              title="Control"
              description="Full Management"
            />
          </div>
        </section>

        {/* =================================================
            RIGHT LOGIN PANEL
        ================================================= */}

        <section className="flex w-full flex-1 items-center justify-center bg-white px-5 py-10 sm:px-10 lg:px-12 xl:px-20">
          <div className="w-full max-w-[470px]">
            {/* Mobile logo */}

            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#061a3a]
                  text-xl
                  font-bold
                  text-violet-400
                "
              >
                A
              </div>

              <div>
                <h1 className="text-xl font-bold text-[#101828]">
                  <span className="text-violet-600">AR</span>
                  Fusion
                </h1>

                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </div>

            {/* Header */}

            <div className="text-center lg:text-left">
              <div
                className="
                  mx-auto
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-violet-100
                  text-violet-600
                  lg:mx-0
                "
              >
                <ShieldCheck size={23} />
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#101828] sm:text-[34px]">
                Admin Login
              </h2>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Enter your credentials to access the admin panel
              </p>
            </div>

            {/* Form */}

            <form onSubmit={handleSubmit} className="mt-8">
              {/* Error */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Email */}

              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-2 block text-sm font-semibold text-[#172033]"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={loading}
                    className="
                      h-14
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      pl-12
                      pr-4
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                      disabled:cursor-not-allowed
                      disabled:bg-slate-50
                    "
                  />
                </div>
              </div>

              {/* Password */}

              <div className="mt-5">
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-sm font-semibold text-[#172033]"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={19}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="
                      h-14
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      pl-12
                      pr-12
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                      disabled:cursor-not-allowed
                      disabled:bg-slate-50
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      transition
                      hover:text-slate-700
                    "
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}

              <div className="mt-5 flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="
                      h-4
                      w-4
                      rounded
                      border-slate-300
                      text-violet-600
                      focus:ring-violet-500
                    "
                  />

                  <span className="text-sm font-medium text-slate-600">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/admin/forgot-password")}
                  className="
                    text-sm
                    font-semibold
                    text-violet-600
                    transition
                    hover:text-violet-700
                  "
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In */}

              <button
                type="submit"
                disabled={loading}
                className="
                  mt-7
                  flex
                  h-14
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-gradient-to-r
                  from-violet-600
                  to-purple-600
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-violet-500/20
                  transition
                  hover:from-violet-700
                  hover:to-purple-700
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <LogIn size={18} />
                  </>
                )}
              </button>

              {/* Divider */}

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-sm text-slate-400">or continue with</span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Google */}

              <button
                type="button"
                disabled
                className="
                  flex
                  h-14
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                "
              >
                <span className="text-lg font-bold text-blue-500">G</span>
                Sign in with Google
              </button>
            </form>

            {/* Footer */}

            <p className="mt-12 text-center text-xs text-slate-500">
              © 2026 ARFusion. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =====================================================
   FEATURE
===================================================== */

function Feature({ icon, title, description }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-white">{title}</p>

        <p className="mt-0.5 truncate text-[9px] text-slate-400 xl:text-[10px]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
