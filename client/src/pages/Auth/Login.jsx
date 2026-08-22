import { useState } from "react";
import { ShoppingCart, Mail, Lock, Eye, EyeOff, Check } from "lucide-react";

function Login() {
  // =====================================================
  // STATE
  // =====================================================

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const newErrors = {};

    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const loginData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      };

      console.log("Login data:", loginData);

      /*
       * Connect your backend here.
       *
       * Example:
       *
       * const response = await axios.post(
       *   "/api/auth/login",
       *   loginData
       * );
       *
       * console.log(response.data);
       */

      await new Promise((resolve) => setTimeout(resolve, 700));

      console.log("Login successful");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleLogin = () => {
    /*
     * Connect Google OAuth here.
     */

    console.log("Continue with Google");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main
      className="
        relative
        min-h-dvh
        w-full
        overflow-x-hidden
        bg-[#F8F7FF]
      "
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        {/* Left decoration */}

        <div
          className="
            absolute
            -left-82.5
            top-1/2
            h-135
            w-135
            -translate-y-1/2
            rounded-full
            bg-[#EEE8FF]
            sm:-left-72.5
          "
        />

        {/* Top-right dots */}

        <div
          className="
            absolute
            -right-10
            -top-8
            h-80
            w-112.5
            opacity-60
            bg-[radial-gradient(#D9CFFF_2px,transparent_2px)]
            bg-size-[25px_25px]
            max-sm:h-55
            max-sm:w-70
            max-sm:-right-12
            max-sm:-top-5
            max-sm:bg-size-[19px_19px]
          "
        />

        {/* Center glow */}

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-162.5
            w-162.5
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-white/50
            blur-3xl
          "
        />
      </div>

      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <div
        className="
          relative
          z-10
          flex
          min-h-dvh
          w-full
          items-center
          justify-center
          px-4
          py-6
          sm:px-6
          sm:py-8
          md:px-8
          md:py-10
          lg:px-10
          lg:py-10
        "
      >
        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <section
          className="
            w-full
            max-w-130
            rounded-2xl
            border
            border-white
            bg-white
            px-5
            py-7
            shadow-[0_20px_55px_rgba(35,20,80,0.08)]
            sm:px-8
            sm:py-8
            md:px-9
            md:py-9
          "
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <div
            className="
              mb-4
              flex
              items-center
              justify-center
              gap-3
              sm:gap-3.5
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-[10px]
                bg-linear-to-br
                from-[#673DE6]
                to-[#5130C8]
                text-white
                shadow-[0_6px_15px_rgba(93,53,211,0.20)]
                sm:h-12
                sm:w-12
                sm:rounded-xl
              "
            >
              <ShoppingCart
                size={24}
                strokeWidth={2.2}
                className="sm:h-6.75 sm:w-6.75"
              />
            </div>

            <span
              className="
                text-[21px]
                font-medium
                tracking-[-0.5px]
                text-[#111827]
                sm:text-[24px]
              "
            >
              ARFusion
            </span>
          </div>

          {/* =================================================
              HEADING
          ================================================= */}

          <div
            className="
              mb-5
              text-center
              sm:mb-6
            "
          >
            <h1
              className="
                mx-auto
                mb-1
                text-[23px]
                font-semibold
                leading-tight
                tracking-[-0.4px]
                text-[#111827]
                sm:text-[26px]
                lg:text-[28px]
              "
            >
              Welcome back
            </h1>

            <p
              className="
                text-[12.5px]
                leading-5
                text-[#64748B]
                sm:text-[14px]
              "
            >
              Sign in to continue shopping with ARFusion.
            </p>
          </div>

          {/* =================================================
              GOOGLE BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="
              flex
              h-11.25
              w-full
              items-center
              justify-center
              gap-3
              rounded-[9px]
              border
              border-[#D7DCE4]
              bg-white
              text-[13.5px]
              font-semibold
              text-[#111827]
              transition
              duration-200
              hover:border-[#C5CAD4]
              hover:shadow-[0_5px_14px_rgba(20,30,50,0.08)]
              active:translate-y-px
              sm:h-11.75
              sm:text-[14px]
            "
          >
            <span
              className="
                font-[Arial]
                text-[18px]
                font-bold
                text-[#4285F4]
              "
            >
              G
            </span>

            <span>Continue with Google</span>
          </button>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div
            className="
              my-4
              flex
              items-center
              gap-3
              sm:gap-4
            "
          >
            <span className="h-px flex-1 bg-[#D7DCE4]" />

            <span
              className="
                shrink-0
                text-[11px]
                font-medium
                text-[#64748B]
                sm:text-xs
              "
            >
              OR
            </span>

            <span className="h-px flex-1 bg-[#D7DCE4]" />
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit} noValidate>
            {/* EMAIL */}

            <div className="mb-4">
              <label
                htmlFor="email"
                className="
                  mb-1
                  block
                  text-[12px]
                  font-semibold
                  text-[#111827]
                  sm:text-[12.5px]
                "
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    z-10
                    -translate-y-1/2
                    text-[#64748B]
                    sm:left-3.5
                  "
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  className={`
                    h-10.75
                    w-full
                    rounded-lg
                    border
                    bg-white
                    pl-10.5
                    pr-3.5
                    text-[13px]
                    text-[#111827]
                    outline-none
                    transition
                    duration-200
                    placeholder:text-[#94A3B8]
                    sm:h-11.25
                    sm:pl-11.75
                    sm:text-[13.5px]
                    ${
                      errors.email
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#D6DBE3] hover:border-[#C5CAD4] focus:border-[#6840DC]"
                    }
                    focus:ring-[3px]
                    focus:ring-[#6840DC]/10
                  `}
                />
              </div>

              {errors.email && (
                <p className="mt-0.5 text-[10px] text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}

            <div className="mb-3">
              <label
                htmlFor="password"
                className="
                  mb-1
                  block
                  text-[12px]
                  font-semibold
                  text-[#111827]
                  sm:text-[12.5px]
                "
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    z-10
                    -translate-y-1/2
                    text-[#64748B]
                    sm:left-3.5
                  "
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  className={`
                    h-10.75
                    w-full
                    rounded-lg
                    border
                    bg-white
                    pl-10.5
                    pr-10
                    text-[13px]
                    text-[#111827]
                    outline-none
                    transition
                    duration-200
                    placeholder:text-[#94A3B8]
                    sm:h-11.25
                    sm:pl-11.75
                    sm:text-[13.5px]
                    ${
                      errors.password
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#D6DBE3] hover:border-[#C5CAD4] focus:border-[#6840DC]"
                    }
                    focus:ring-[3px]
                    focus:ring-[#6840DC]/10
                  `}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="
                    absolute
                    right-2
                    top-1/2
                    flex
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded
                    p-1
                    text-[#64748B]
                    transition
                    hover:text-[#111827]
                    focus:outline-none
                  "
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {errors.password && (
                <p className="mt-0.5 text-[10px] text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            {/* =================================================
                REMEMBER + FORGOT
            ================================================= */}

            <div
              className="
                mb-4
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <label
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-2
                  text-[11.5px]
                  text-[#64748B]
                  sm:text-xs
                "
              >
                <span className="relative flex h-4 w-4">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="
                      peer
                      h-4
                      w-4
                      cursor-pointer
                      appearance-none
                      rounded-sm
                      border
                      border-[#CBD2DC]
                      bg-white
                      transition
                      checked:border-[#673DE6]
                      checked:bg-[#673DE6]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#6840DC]/20
                    "
                  />

                  <Check
                    size={11}
                    strokeWidth={3}
                    className="
                      pointer-events-none
                      absolute
                      left-0.5
                      top-0.5
                      hidden
                      text-white
                      peer-checked:block
                    "
                  />
                </span>
                Remember me
              </label>

              <a
                href="/forgot-password"
                className="
                  text-[11.5px]
                  font-semibold
                  text-[#5D35D3]
                  hover:underline
                  sm:text-xs
                "
              >
                Forgot password?
              </a>
            </div>

            {/* =================================================
                SIGN IN
            ================================================= */}

            <button
              type="submit"
              disabled={isLoading}
              className="
                flex
                h-11.75
                w-full
                items-center
                justify-center
                rounded-[9px]
                bg-linear-to-br
                from-[#673DE6]
                to-[#5933D2]
                text-[14px]
                font-semibold
                text-white
                shadow-[0_7px_16px_rgba(95,55,215,0.18)]
                transition
                duration-200
                hover:-translate-y-px
                hover:brightness-105
                hover:shadow-[0_9px_20px_rgba(95,55,215,0.25)]
                active:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-70
                sm:h-12.25
                sm:text-[15px]
              "
            >
              {isLoading ? (
                <>
                  <span
                    className="
                      mr-2
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/40
                      border-t-white
                    "
                  />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* =================================================
              REGISTER
          ================================================= */}

          <p
            className="
              mt-4
              text-center
              text-[12px]
              text-[#111827]
              sm:text-[13px]
            "
          >
            Don't have an account?{" "}
            <a
              href="/register"
              className="
                font-semibold
                text-[#5D35D3]
                hover:underline
              "
            >
              Create account
            </a>
          </p>

          {/* =================================================
              TERMS
          ================================================= */}

          <p
            className="
              mt-3
              text-center
              text-[10.5px]
              leading-normal
              text-[#8A94A6]
              sm:text-[11px]
            "
          >
            By continuing, you agree to our
            <br />
            <a
              href="/terms"
              className="
                font-semibold
                text-[#5D35D3]
                hover:underline
              "
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="
                font-semibold
                text-[#5D35D3]
                hover:underline
              "
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

export default Login;
