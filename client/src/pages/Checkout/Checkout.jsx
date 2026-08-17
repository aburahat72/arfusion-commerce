import { useState } from "react";
import { Banknote, CreditCard, Lock, ShoppingBag, Truck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";

import { removePurchasedItems } from "../../store/slices/cartSlice";
import { clearCheckout } from "../../store/slices/checkoutSlice";

import { formatCurrency } from "../../utils/currency";
import { calculateOrderSummary } from "../../utils/orderSummary";

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /*
   * =========================
   * CART / CHECKOUT STATE
   * =========================
   */

  // Normal cart items
  const cartItems = useSelector((state) => state.cart.items);

  // Buy Now checkout state
  const checkoutMode = useSelector((state) => state.checkout.mode);
  const checkoutItems = useSelector((state) => state.checkout.items);

  /*
   * If Buy Now was used,
   * checkoutSlice contains the items.
   *
   * Otherwise use the normal cart.
   */
  const isBuyNow = checkoutMode === "buyNow";

  const itemsToCheckout = isBuyNow ? checkoutItems : cartItems;

  /*
   * =========================
   * ORDER SUMMARY
   * =========================
   */

  const { subtotal, shipping, discount, total } =
    calculateOrderSummary(itemsToCheckout);

  /*
   * =========================
   * FORM STATE
   * =========================
   */

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
    paymentMethod: "",
  });

  const [errors, setErrors] = useState({});

  /*
   * =========================
   * HANDLE INPUT
   * =========================
   */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    // Remove field error while typing
    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  /*
   * =========================
   * VALIDATE FORM
   * =========================
   */

  const validateForm = () => {
    const newErrors = {};

    // First name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Address
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // City
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    // State
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    // PIN
    if (!formData.pinCode.trim()) {
      newErrors.pinCode = "PIN code is required";
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "Enter a valid 6-digit PIN code";
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian phone number";
    }

    // Payment
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Select a payment method";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * =========================
   * PLACE ORDER
   * =========================
   */

  const handlePlaceOrder = (event) => {
    event.preventDefault();

    // Validate everything first
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    /*
     * Get IDs of products that are
     * actually being purchased.
     */
    const purchasedItemIds = itemsToCheckout.map((item) => item.id);

    /*
     * Create order object.
     *
     * Currently this is frontend-only.
     * Later send this object to your backend API.
     */
    const orderData = {
      customer: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pinCode: formData.pinCode,
        phone: formData.phone,
      },

      paymentMethod: formData.paymentMethod,

      items: itemsToCheckout,

      subtotal,
      shipping,
      discount,
      total,

      checkoutMode: isBuyNow ? "buyNow" : "cart",
    };

    /*
     * TEMPORARY FRONTEND TEST
     *
     * Later replace this with your API request.
     */
    console.log("Order placed:", orderData);

    /*
     * IMPORTANT:
     *
     * Only remove purchased products AFTER
     * the order is considered successful.
     *
     * This also handles Buy Now:
     *
     * If the product already exists in the cart,
     * it will now be removed.
     */
    dispatch(removePurchasedItems(purchasedItemIds));

    /*
     * Clear temporary checkout state.
     */
    dispatch(clearCheckout());

    /*
     * Redirect to order success page.
     */
    navigate("/order-success");
  };

  /*
   * =========================
   * EMPTY CHECKOUT
   * =========================
   */

  if (itemsToCheckout.length === 0) {
    return (
      <main className="min-h-screen bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-outline-variant bg-surface p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <ShoppingBag size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-text">
              Nothing to checkout
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Add products before proceeding to checkout.
            </p>

            <Button
              size="large"
              className="mt-6"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =========================
   * INPUT CLASS
   * =========================
   */

  const inputClass = (fieldName) =>
    `mt-2 h-11 w-full rounded-xl border bg-surface px-3 text-sm text-text outline-none transition focus:ring-2 ${
      errors[fieldName]
        ? "border-error focus:ring-error/20"
        : "border-outline-variant focus:border-primary focus:ring-primary/20"
    }`;

  /*
   * =========================
   * UI
   * =========================
   */

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-text-secondary">
          <span>Home</span>

          <span className="mx-2">/</span>

          <span className="font-medium text-text">Checkout</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-text-secondary sm:text-base">
            {isBuyNow
              ? "Complete your purchase."
              : "Complete your order securely."}
          </p>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          noValidate
          className="grid gap-6 lg:grid-cols-[1fr_380px]"
        >
          {/* =========================================
              LEFT SIDE
          ========================================== */}

          <section className="space-y-6">
            {/* Delivery Information */}
            <div className="rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-primary">
                  <Truck size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text">
                    Delivery Information
                  </h2>

                  <p className="text-xs text-text-secondary">
                    All fields are required.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium text-text"
                  >
                    First Name <span className="text-error">*</span>
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    autoComplete="given-name"
                    className={inputClass("firstName")}
                  />

                  {errors.firstName && (
                    <p className="mt-1 text-xs text-error">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium text-text"
                  >
                    Last Name <span className="text-error">*</span>
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    autoComplete="family-name"
                    className={inputClass("lastName")}
                  />

                  {errors.lastName && (
                    <p className="mt-1 text-xs text-error">{errors.lastName}</p>
                  )}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="text-sm font-medium text-text"
                  >
                    Address <span className="text-error">*</span>
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House number, street, area"
                    autoComplete="street-address"
                    className={inputClass("address")}
                  />

                  {errors.address && (
                    <p className="mt-1 text-xs text-error">{errors.address}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="text-sm font-medium text-text"
                  >
                    City <span className="text-error">*</span>
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    autoComplete="address-level2"
                    className={inputClass("city")}
                  />

                  {errors.city && (
                    <p className="mt-1 text-xs text-error">{errors.city}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label
                    htmlFor="state"
                    className="text-sm font-medium text-text"
                  >
                    State <span className="text-error">*</span>
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    autoComplete="address-level1"
                    className={inputClass("state")}
                  />

                  {errors.state && (
                    <p className="mt-1 text-xs text-error">{errors.state}</p>
                  )}
                </div>

                {/* PIN Code */}
                <div>
                  <label
                    htmlFor="pinCode"
                    className="text-sm font-medium text-text"
                  >
                    PIN Code <span className="text-error">*</span>
                  </label>

                  <input
                    id="pinCode"
                    name="pinCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={formData.pinCode}
                    onChange={(event) => {
                      const value = event.target.value.replace(/\D/g, "");

                      setFormData((current) => ({
                        ...current,
                        pinCode: value,
                      }));

                      if (errors.pinCode) {
                        setErrors((current) => ({
                          ...current,
                          pinCode: "",
                        }));
                      }
                    }}
                    placeholder="6-digit PIN"
                    autoComplete="postal-code"
                    className={inputClass("pinCode")}
                  />

                  {errors.pinCode && (
                    <p className="mt-1 text-xs text-error">{errors.pinCode}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-text"
                  >
                    Phone Number <span className="text-error">*</span>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(event) => {
                      const value = event.target.value.replace(/\D/g, "");

                      setFormData((current) => ({
                        ...current,
                        phone: value,
                      }));

                      if (errors.phone) {
                        setErrors((current) => ({
                          ...current,
                          phone: "",
                        }));
                      }
                    }}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    className={inputClass("phone")}
                  />

                  {errors.phone && (
                    <p className="mt-1 text-xs text-error">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* =========================================
                PAYMENT
            ========================================== */}

            <div className="rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-primary">
                  <CreditCard size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text">
                    Payment Method
                  </h2>

                  <p className="text-xs text-text-secondary">
                    Select your preferred payment method.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {/* Online Payment */}
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                    formData.paymentMethod === "online"
                      ? "border-primary bg-primary-container/30"
                      : "border-outline-variant hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === "online"}
                    onChange={handleChange}
                    className="h-4 w-4 accent-primary"
                  />

                  <CreditCard size={20} className="text-primary" />

                  <div>
                    <p className="text-sm font-semibold text-text">
                      Online Payment
                    </p>

                    <p className="mt-1 text-xs text-text-secondary">
                      UPI, debit card, credit card and net banking
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                    formData.paymentMethod === "cod"
                      ? "border-primary bg-primary-container/30"
                      : "border-outline-variant hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                    className="h-4 w-4 accent-primary"
                  />

                  <Banknote size={20} className="text-primary" />

                  <div>
                    <p className="text-sm font-semibold text-text">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-text-secondary">
                      Pay when your order is delivered
                    </p>
                  </div>
                </label>
              </div>

              {errors.paymentMethod && (
                <p className="mt-2 text-xs text-error">
                  {errors.paymentMethod}
                </p>
              )}
            </div>
          </section>

          {/* =========================================
              RIGHT SIDE
          ========================================== */}

          <aside className="h-fit rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold text-text">Order Summary</h2>

            {/* Checkout Items */}
            <div className="mt-5 space-y-4">
              {itemsToCheckout.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {/* Image */}
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-text-secondary">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  {/* Item Total */}
                  <p className="text-sm font-semibold text-text">
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-4 border-t border-outline-variant pt-5 text-sm">
              {/* Subtotal */}
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>

                <span className="font-medium text-text">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between">
                <span className="text-text-secondary">Shipping</span>

                <span className="font-medium text-success">
                  {shipping === 0 ? "Free" : formatCurrency(shipping)}
                </span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Discount</span>

                  <span className="font-medium text-error">
                    -{formatCurrency(discount)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-outline-variant pt-4">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-text">
                    Total
                  </span>

                  <span className="text-xl font-bold text-text">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Place Order */}
            <Button type="submit" size="large" className="mt-6 w-full">
              {formData.paymentMethod === "cod"
                ? "Place COD Order"
                : "Place Order"}
            </Button>

            {/* Security */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-secondary">
              <Lock size={14} />
              Secure and encrypted checkout
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;
