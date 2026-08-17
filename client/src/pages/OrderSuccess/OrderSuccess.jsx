import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";

function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-outline-variant bg-surface p-8 text-center shadow-sm sm:p-12">
          {/* Success Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-container text-primary">
            <CheckCircle2 size={42} />
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Order Placed Successfully!
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary sm:text-base">
            Thank you for your order. Your order has been successfully placed
            and will be processed shortly.
          </p>

          {/* Order Information */}
          <div className="mx-auto mt-8 max-w-md rounded-2xl bg-surface-container p-5 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
                <Package size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-text">
                  Order confirmed
                </p>

                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  You will receive your order within 3–7 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="large" onClick={() => navigate("/products")}>
              <ShoppingBag size={18} />
              Continue Shopping
            </Button>

            <Button
              size="large"
              variant="outlined"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>

          {/* Security */}
          <p className="mt-6 text-xs text-text-secondary">
            Thank you for shopping with ARFusion.
          </p>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccess;
