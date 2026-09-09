import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";

import {
  fetchCart,
  updateProductQuantity,
  removeProductFromCart,
  clearCustomerCart,
} from "../../store/slices/cartSlice";

import { formatCurrency } from "../../utils/currency";
import { calculateOrderSummary } from "../../utils/orderSummary";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items: cartItems,
    loading,
    actionLoading,
    error,
  } = useSelector((state) => state.cart);

  /*
   * ========================================================
   * LOAD BACKEND CART
   * ========================================================
   */

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  /*
   * ========================================================
   * ORDER SUMMARY
   * ========================================================
   */

  const { subtotal, shipping, discount, total } =
    calculateOrderSummary(cartItems);

  /*
   * ========================================================
   * INCREASE QUANTITY
   * ========================================================
   */

  const handleIncrease = (item) => {
    const stock = Number(item.stock || 0);

    if (item.quantity >= stock) {
      return;
    }

    dispatch(
      updateProductQuantity({
        productId: item.id,
        quantity: item.quantity + 1,
      }),
    ).then((result) => {
      if (!result.error) {
        dispatch(fetchCart());
      }
    });
  };

  /*
   * ========================================================
   * DECREASE QUANTITY
   * ========================================================
   */

  const handleDecrease = (item) => {
    if (item.quantity <= 1) {
      return;
    }

    dispatch(
      updateProductQuantity({
        productId: item.id,
        quantity: item.quantity - 1,
      }),
    ).then((result) => {
      if (!result.error) {
        dispatch(fetchCart());
      }
    });
  };

  /*
   * ========================================================
   * REMOVE
   * ========================================================
   */

  const handleRemove = (productId) => {
    dispatch(removeProductFromCart(productId)).then((result) => {
      if (!result.error) {
        dispatch(fetchCart());
      }
    });
  };

  /*
   * ========================================================
   * CLEAR CART
   * ========================================================
   */

  const handleClearCart = () => {
    dispatch(clearCustomerCart());
  };

  /*
   * ========================================================
   * LOADING
   * ========================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-outline-variant bg-surface p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />

            <p className="mt-4 text-sm text-text-secondary">
              Loading your cart...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ========================================================
   * ERROR
   * ========================================================
   */

  if (error && cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-error/20 bg-surface p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10 text-error">
              <ShoppingBag size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-text">
              Unable to load cart
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              {error}
            </p>

            <div className="mt-6 flex justify-center">
              <Button size="large" onClick={() => dispatch(fetchCart())}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ========================================================
   * EMPTY CART
   * ========================================================
   */

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

  /*
   * ========================================================
   * CART
   * ========================================================
   */

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
            onClick={handleClearCart}
            disabled={actionLoading}
          >
            <Trash2 size={16} />
            Clear cart
          </Button>
        </div>

        {/* Backend error */}

        {error && (
          <div className="mb-6 rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* =================================================
              CART ITEMS
          ================================================= */}

          <section className="rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <div className="space-y-5">
              {cartItems.map((item) => {
                const stock = Number(item.stock || 0);

                return (
                  <article
                    key={item.id}
                    className="flex gap-4 border-b border-outline-variant pb-5 last:border-b-0 last:pb-0"
                  >
                    {/* Product Image */}

                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-container sm:h-28 sm:w-28">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-text-secondary">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>

                    {/* Product Information */}

                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-semibold text-text sm:text-base">
                        {item.name}
                      </h2>

                      {item.brand && (
                        <p className="mt-1 text-xs text-text-secondary">
                          {item.brand}
                        </p>
                      )}

                      <p className="mt-2 font-semibold text-text">
                        {formatCurrency(item.price)}
                      </p>

                      {/* Quantity */}

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="flex items-center overflow-hidden rounded-xl border border-outline-variant bg-surface">
                          <IconButton
                            label="Decrease quantity"
                            size="small"
                            onClick={() => handleDecrease(item)}
                            disabled={actionLoading || item.quantity <= 1}
                          >
                            <Minus size={15} />
                          </IconButton>

                          <span className="min-w-10 text-center text-sm font-semibold text-text">
                            {item.quantity}
                          </span>

                          <IconButton
                            label="Increase quantity"
                            size="small"
                            onClick={() => handleIncrease(item)}
                            disabled={
                              actionLoading ||
                              stock <= 0 ||
                              item.quantity >= stock
                            }
                          >
                            <Plus size={15} />
                          </IconButton>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          disabled={actionLoading}
                          className="text-xs font-medium text-error transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>

                      {stock > 0 && stock <= 10 && (
                        <p className="mt-2 text-xs font-medium text-warning">
                          Only {stock} left in stock
                        </p>
                      )}

                      {stock <= 0 && (
                        <p className="mt-2 text-xs font-medium text-error">
                          Currently out of stock
                        </p>
                      )}
                    </div>

                    {/* Item Total */}

                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-semibold text-text">
                        {formatCurrency(
                          Number(item.price) * Number(item.quantity),
                        )}
                      </p>

                      <IconButton
                        label={`Remove ${item.name}`}
                        size="small"
                        onClick={() => handleRemove(item.id)}
                        disabled={actionLoading}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

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

                <span className="font-medium text-text">
                  {shipping === 0 ? "Free" : formatCurrency(shipping)}
                </span>
              </div>

              {/* Discount */}

              {discount > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Discount</span>

                  <span className="font-medium text-success">
                    -{formatCurrency(discount)}
                  </span>
                </div>
              )}

              <div className="border-t border-outline-variant pt-4">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold text-text">Total</span>

                  <span className="text-lg font-semibold text-text">
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
              disabled={actionLoading || cartItems.length === 0}
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
