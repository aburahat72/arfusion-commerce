import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from "../../store/slices/cartSlice";

import { formatCurrency } from "../../utils/currency";
import { calculateOrderSummary } from "../../utils/orderSummary";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.items);

  const { subtotal, shipping, discount, total } =
    calculateOrderSummary(cartItems);

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-outline-variant bg-surface p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <ShoppingBag size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-text">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Add some products to your cart and they will appear here.
            </p>

            <div className="mt-6 flex justify-center">
              <Button size="large" onClick={() => navigate("/products")}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-text-secondary">
          <span>Home</span>

          <span className="mx-2">/</span>

          <span className="font-medium text-text">Cart</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-primary">
              <ShoppingBag size={21} />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-text">
                Shopping Cart
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                in your cart
              </p>
            </div>
          </div>

          <Button
            variant="text"
            size="small"
            onClick={() => dispatch(clearCart())}
          >
            <Trash2 size={16} />
            Clear cart
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Cart Items */}
          <section className="rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <div className="space-y-5">
              {cartItems.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-4 border-b border-outline-variant pb-5 last:border-b-0 last:pb-0"
                >
                  {/* Product Image */}
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-container sm:h-28 sm:w-28">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Product Information */}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-text sm:text-base">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-xs text-text-secondary">
                      Premium product
                    </p>

                    <p className="mt-2 font-semibold text-text">
                      {formatCurrency(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center overflow-hidden rounded-xl border border-outline-variant bg-surface">
                        <IconButton
                          label="Decrease quantity"
                          size="small"
                          onClick={() => dispatch(decreaseQuantity(item.id))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={15} />
                        </IconButton>

                        <span className="min-w-10 text-center text-sm font-semibold text-text">
                          {item.quantity}
                        </span>

                        <IconButton
                          label="Increase quantity"
                          size="small"
                          onClick={() => dispatch(increaseQuantity(item.id))}
                        >
                          <Plus size={15} />
                        </IconButton>
                      </div>

                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="text-xs font-medium text-error transition hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-text">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </p>

                    <IconButton
                      label={`Remove ${item.name}`}
                      size="small"
                      onClick={() => dispatch(removeFromCart(item.id))}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Order Summary */}
          <aside className="h-fit rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold text-text">Order Summary</h2>

            <div className="mt-6 space-y-4 text-sm">
              {/* Subtotal */}
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Subtotal</span>

                <span className="font-medium text-text">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">Shipping</span>

                <span className="font-medium text-success">
                  {shipping === 0 ? "Free" : formatCurrency(shipping)}
                </span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Discount</span>

                  <span className="font-medium text-error">
                    -{formatCurrency(discount)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-outline-variant pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-semibold text-text">
                    Total
                  </span>

                  <span className="text-xl font-bold text-text">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout */}
            <Button
              size="large"
              className="mt-6 w-full"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </Button>

            <p className="mt-3 text-center text-xs text-text-secondary">
              Secure checkout and protected payment.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;
