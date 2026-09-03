import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import customerApi from "../../services/customerApi";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name] || errors.general) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
        general: "",
      }));
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const newErrors = {};

    const trimmedName = formData.fullName.trim();

    const trimmedEmail = formData.email.trim();

    const trimmedPhone = formData.phone.trim();

    if (!trimmedName) {
      newErrors.fullName = "Full name is required";
    } else if (trimmedName.length < 2) {
      newErrors.fullName = "Enter a valid name";
    }

    if (!trimmedEmail) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!trimmedPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(trimmedPhone)) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      setSuccessMessage("");

      // IMPORTANT:
      // Phone is now included in the backend payload.
      const registrationData = {
        fullName: formData.fullName.trim(),

        email: formData.email.trim().toLowerCase(),

        phone: formData.phone.trim(),

        password: formData.password,
      };

      console.log("Sending customer registration request:", registrationData);

      const response = await customerApi.post(
        "/auth/customer/register",
        registrationData,
      );

      console.log("Customer registration response:", response.data);

      if (!response.data?.success) {
        setErrors({
          general:
            response.data?.message || "Registration failed. Please try again.",
        });

        return;
      }

      console.log("Customer registration successful:", response.data.user);

      setSuccessMessage(
        "Account created successfully! Redirecting to login...",
      );

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect after successful registration.
      navigate("/login", {
        replace: true,
        state: {
          message: "Registration successful! Please sign in.",
        },
      });
    } catch (error) {
      console.error("Customer registration failed:", error);

      const backendMessage = error.response?.data?.message;

      if (error.response?.status === 400) {
        setErrors({
          general: backendMessage || "Please check your registration details.",
        });
      } else if (error.response?.status === 429) {
        setErrors({
          general: "Too many registration attempts. Please try again later.",
        });
      } else {
        setErrors({
          general:
            backendMessage ||
            "Unable to connect to the server. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // GOOGLE REGISTER
  // =====================================================

  const handleGoogleRegister = () => {
    console.log("Continue with Google");
  };

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
          PAGE
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
          py-5
          sm:px-6
          sm:py-7
          md:px-8
          md:py-8
          lg:px-10
          lg:py-8
        "
      >
        <section
          className="
            w-full
            max-w-130
            rounded-2xl
            border
            border-white
            bg-white
            px-5
            py-6
            shadow-[0_20px_55px_rgba(35,20,80,0.08)]
            sm:px-7
            sm:py-7
            md:px-8
            md:py-8
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
              mb-4
              text-center
              sm:mb-5
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
              Create your account
            </h1>

            <p
              className="
                text-[12.5px]
                leading-5
                text-[#64748B]
                sm:text-[14px]
              "
            >
              Join ARFusion and start shopping.
            </p>
          </div>

          {/* =================================================
              GOOGLE
          ================================================= */}

          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isLoading}
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
              disabled:cursor-not-allowed
              disabled:opacity-60
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
              my-3.5
              flex
              items-center
              gap-3
              sm:my-4
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
            {successMessage && (
              <div
                className="
                  mb-3
                  rounded-lg
                  border
                  border-green-200
                  bg-green-50
                  px-3
                  py-2.5
                  text-center
                  text-[11px]
                  text-green-700
                  sm:text-xs
                "
                role="status"
              >
                {successMessage}
              </div>
            )}

            {errors.general && (
              <div
                className="
                  mb-3
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-3
                  py-2.5
                  text-center
                  text-[11px]
                  text-red-600
                  sm:text-xs
                "
                role="alert"
              >
                {errors.general}
              </div>
            )}

            <FormField
              label="Full Name"
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              icon={<User size={17} />}
              error={errors.fullName}
              autoComplete="name"
            />

            <FormField
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={17} />}
              error={errors.email}
              autoComplete="email"
            />

            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={formData.phone}
              onChange={handleChange}
              icon={<Phone size={17} />}
              error={errors.phone}
              autoComplete="tel"
            />

            <PasswordField
              label="Password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              visible={showPassword}
              setVisible={setShowPassword}
              error={errors.password}
              autoComplete="new-password"
            />

            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              visible={showConfirmPassword}
              setVisible={setShowConfirmPassword}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="
                mt-0.5
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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* =================================================
              LOGIN
          ================================================= */}

          <p
            className="
              mt-3
              text-center
              text-[12px]
              text-[#111827]
              sm:text-[13px]
            "
          >
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                font-semibold
                text-[#5D35D3]
                hover:underline
              "
            >
              Sign in
            </button>
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
              sm:mt-3.5
              sm:text-[11px]
            "
          >
            By creating an account, you agree to our
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

// =====================================================
// FORM FIELD
// =====================================================

function FormField({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  icon,
  error,
  autoComplete,
}) {
  return (
    <div className="mb-3 sm:mb-3.5">
      <label
        htmlFor={name}
        className="
          mb-1
          block
          text-[12px]
          font-semibold
          text-[#111827]
          sm:text-[12.5px]
        "
      >
        {label}
      </label>

      <div className="relative">
        <span
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
        >
          {icon}
        </span>

        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
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
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                : "border-[#D6DBE3] hover:border-[#C5CAD4] focus:border-[#6840DC] focus:ring-[#6840DC]/10"
            }
            focus:ring-[3px]
          `}
        />
      </div>

      {error && (
        <p id={`${name}-error`} className="mt-0.5 text-[10px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

// =====================================================
// PASSWORD FIELD
// =====================================================

function PasswordField({
  label,
  name,
  placeholder,
  value,
  onChange,
  visible,
  setVisible,
  error,
  autoComplete,
}) {
  return (
    <div className="mb-3 sm:mb-3.5">
      <label
        htmlFor={name}
        className="
          mb-1
          block
          text-[12px]
          font-semibold
          text-[#111827]
          sm:text-[12.5px]
        "
      >
        {label}
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
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={8}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
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
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                : "border-[#D6DBE3] hover:border-[#C5CAD4] focus:border-[#6840DC] focus:ring-[#6840DC]/10"
            }
            focus:ring-[3px]
          `}
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
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
            focus:ring-2
            focus:ring-[#6840DC]/20
          "
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {error && (
        <p id={`${name}-error`} className="mt-0.5 text-[10px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default Register;
