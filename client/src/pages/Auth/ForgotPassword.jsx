import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (event) => {
    setEmail(event.target.value);

    if (error) {
      setError("");
    }
  };

  /* =====================================================
     EMAIL VALIDATION
  ===================================================== */

  const validateEmail = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email address is required.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return false;
    }

    return true;
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail()) {
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      const resetData = {
        email: email.trim().toLowerCase(),
      };

      /*
       * Connect this to your Express backend
       * when the authentication API is ready.
       *
       * Example:
       *
       * const response = await fetch(
       *   `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
       *   {
       *     method: "POST",
       *     headers: {
       *       "Content-Type": "application/json",
       *     },
       *     body: JSON.stringify(resetData),
       *   },
       * );
       *
       * const data = await response.json();
       *
       * if (!response.ok) {
       *   throw new Error(
       *     data.message ||
       *       "Unable to process your request.",
       *   );
       * }
       */

      console.log("Forgot password request:", resetData);

      /*
       * Temporary frontend simulation.
       * Remove this once the backend endpoint is connected.
       */
      await new Promise((resolve) => setTimeout(resolve, 700));

      setIsSubmitted(true);
    } catch (err) {
      console.error("Forgot password request failed:", err);

      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="
        relative
        min-h-dvh
        w-full
        overflow-x-hidden
        bg-background
      "
    >
      {/* =================================================
          BACKGROUND DECORATION
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
        {/* Left soft shape */}

        <div
          className="
            absolute
            -left-70
            top-1/2
            h-125
            w-125
            -translate-y-1/2
            rounded-full
            bg-primary-container
            opacity-70
            blur-3xl
            sm:-left-62.5
          "
        />

        {/* Top-right dots */}

        <div
          className="
            absolute
            -right-12
            -top-8
            h-75
            w-105
            opacity-50
            bg-[radial-gradient(#d9cfff_2px,transparent_2px)]
            bg-size-[24px_24px]
            max-sm:h-55
            max-sm:w-70
            max-sm:bg-size-[19px_19px]
          "
        />

        {/* Center glow */}

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-150
            w-150
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-white/60
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
          py-6
          sm:px-6
          sm:py-8
          md:px-8
          md:py-10
          lg:px-10
          lg:py-12
        "
      >
        {/* =================================================
            CARD
        ================================================= */}

        <section
          className="
            w-full
            max-w-130
            rounded-3xl
            border
            border-white/80
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
              mb-5
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
                rounded-xl
                bg-primary
                text-white
                shadow-[0_6px_15px_rgba(93,53,211,0.20)]
                sm:h-12
                sm:w-12
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
                text-text
                sm:text-2xl
              "
            >
              ARFusion
            </span>
          </div>

          {!isSubmitted ? (
            <>
              {/* =================================================
                  HEADING
              ================================================= */}

              <div
                className="
                  mb-6
                  text-center
                  sm:mb-7
                "
              >
                <h1
                  className="
                    text-2xl
                    font-semibold
                    leading-tight
                    tracking-tight
                    text-text
                    sm:text-[26px]
                    lg:text-[28px]
                  "
                >
                  Forgot your password?
                </h1>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-97.5
                    text-sm
                    leading-5
                    text-text-secondary
                    sm:text-[14px]
                  "
                >
                  Enter the email address associated with your account and we'll
                  send you instructions to reset your password.
                </p>
              </div>

              {/* =================================================
                  FORM
              ================================================= */}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label
                    htmlFor="forgot-email"
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-semibold
                      text-text
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
                        text-text-secondary
                        sm:left-3.5
                      "
                    />

                    <input
                      id="forgot-email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={handleChange}
                      autoComplete="email"
                      autoFocus
                      aria-invalid={Boolean(error)}
                      className={`
                        min-h-11
                        w-full
                        rounded-xl
                        border
                        bg-white
                        pl-10.5
                        pr-3.5
                        text-sm
                        text-text
                        outline-none
                        transition-all
                        duration-200
                        placeholder:text-text-secondary
                        sm:h-11.25
                        sm:pl-11.75
                        ${
                          error
                            ? "border-error focus:border-error"
                            : "border-outline-variant hover:border-outline focus:border-primary"
                        }
                        focus:ring-2
                        focus:ring-primary/10
                      `}
                    />
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="
                        mt-1
                        text-[11px]
                        leading-4
                        text-error
                      "
                    >
                      {error}
                    </p>
                  )}
                </div>

                {/* =================================================
                    SEND RESET LINK
                ================================================= */}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-primary
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_7px_16px_rgba(95,55,215,0.18)]
                    transition-all
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
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/40
                          border-t-white
                        "
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              {/* =================================================
                  BACK TO LOGIN
              ================================================= */}

              <div className="mt-5 flex justify-center">
                <Link
                  to="/login"
                  className="
                    flex
                    items-center
                    gap-1.5
                    text-xs
                    font-semibold
                    text-primary
                    transition
                    hover:underline
                    sm:text-[13px]
                  "
                >
                  <ArrowLeft size={15} />
                  Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            /* =================================================
               SUCCESS STATE
            ================================================= */

            <div className="text-center">
              <div
                className="
                  mx-auto
                  mb-5
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-primary-container
                  text-primary
                "
              >
                <CheckCircle2 size={27} />
              </div>

              <h1
                className="
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-text
                  sm:text-[26px]
                "
              >
                Check your email
              </h1>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-97.5
                  text-sm
                  leading-5
                  text-text-secondary
                "
              >
                If an account exists for{" "}
                <span className="font-semibold text-text">{email.trim()}</span>,
                we've sent instructions to reset your password.
              </p>

              <p
                className="
                  mt-3
                  text-xs
                  leading-5
                  text-text-secondary
                "
              >
                Didn't receive the email? Check your spam folder or try again.
              </p>

              {/* Back to login */}

              <Link
                to="/login"
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-1.5
                  text-xs
                  font-semibold
                  text-primary
                  hover:underline
                  sm:text-[13px]
                "
              >
                <ArrowLeft size={15} />
                Back to Sign In
              </Link>
            </div>
          )}

          {/* =================================================
              REGISTER
          ================================================= */}

          {!isSubmitted && (
            <p
              className="
                mt-5
                text-center
                text-xs
                text-text
                sm:text-[13px]
              "
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                className="
                  font-semibold
                  text-primary
                  hover:underline
                "
              >
                Create account
              </Link>
            </p>
          )}

          {/* =================================================
              TERMS
          ================================================= */}

          <p
            className="
              mt-3
              text-center
              text-[10.5px]
              leading-normal
              text-text-secondary
              sm:text-[11px]
            "
          >
            By continuing, you agree to our{" "}
            <Link
              to="/terms"
              className="
                font-semibold
                text-primary
                hover:underline
              "
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="
                font-semibold
                text-primary
                hover:underline
              "
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;
