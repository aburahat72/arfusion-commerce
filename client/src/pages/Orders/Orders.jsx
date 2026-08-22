import { ArrowLeft, Package, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Orders() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="mb-6 flex items-center gap-2 text-sm text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to Profile
        </button>

        <section className="rounded-3xl border border-outline-variant bg-surface p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-primary">
            <Package size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-text">My Orders</h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
            Your completed orders will appear here. Once you place your first
            order, you can track its status from this page.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <ShoppingBag size={17} />
            Start Shopping
          </button>
        </section>
      </div>
    </main>
  );
}

export default Orders;
