import { useEffect, useState } from "react";
import { Lock, ShoppingBag, Truck, Check } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";

import { formatCurrency } from "../../utils/currency";
import { calculateOrderSummary } from "../../utils/orderSummary";

import { getAddresses, addAddress } from "../../services/addressService";

function Checkout() {
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
  });

  const [errors, setErrors] = useState({});

  /*
   * =========================
   * SAVED ADDRESS STATE
   * =========================
   */

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);

  /*
   * =========================
   * FILL FORM FROM ADDRESS
   * =========================
   */

  const fillFormFromAddress = (address) => {
    const fullName = (address.fullName || "").trim();

    const nameParts = fullName ? fullName.split(/\s+/) : [];

    const firstName = nameParts.shift() || "";
    const lastName = nameParts.join(" ");

    setFormData({
      firstName,
      lastName,
      address: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      pinCode: address.postalCode || "",
      phone: address.phone || "",
    });

    setErrors({});
  };

  /*
   * =========================
   * LOAD SAVED ADDRESSES
   * =========================
   */

  useEffect(() => {
    let mounted = true;

    const loadAddresses = async () => {
      try {
        setLoadingAddresses(true);

        const response = await getAddresses();

        if (!mounted) {
          return;
        }

        const addresses = response?.addresses || [];

        setSavedAddresses(addresses);

        /*
         * Automatically select the backend
         * default address when available.
         */
        const defaultAddress = addresses.find((address) => address.isDefault);

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
          fillFormFromAddress(defaultAddress);
        }
      } catch (error) {
        console.error("Failed to load saved addresses:", error);
      } finally {
        if (mounted) {
          setLoadingAddresses(false);
        }
      }
    };

    loadAddresses();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =========================
   * SELECT SAVED ADDRESS
   * =========================
   */

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id);

    fillFormFromAddress(address);
  };

  /*
   * =========================
   * USE NEW ADDRESS
   * =========================
   */

  const handleUseNewAddress = () => {
    setSelectedAddressId("");

    setFormData({
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      phone: "",
    });

    setErrors({});
  };

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

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * =========================
   * SAVE ADDRESS
   * =========================
   */

  const saveCurrentAddress = async () => {
    /*
     * If an existing saved address is selected,
     * it does not need to be created again.
     */
    if (selectedAddressId) {
      return null;
    }

    const fullName = [formData.firstName.trim(), formData.lastName.trim()]
      .filter(Boolean)
      .join(" ");

    const addressData = {
      fullName,
      phone: formData.phone.trim(),
      addressLine: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      postalCode: formData.pinCode.trim(),
      country: "India",

      /*
       * If this is the first address,
       * automatically make it default.
       */
      isDefault: savedAddresses.length === 0,
    };

    const response = await addAddress(addressData);

    const newAddress = response?.address;

    if (newAddress) {
      setSavedAddresses((current) => [newAddress, ...current]);

      setSelectedAddressId(newAddress._id);

      return newAddress;
    }

    return null;
  };

  /*
   * =========================
   * CONTINUE TO PAYMENT
   * =========================
   */

  const handleContinue = async (event) => {
    event.preventDefault();

    /*
     * Prevent duplicate checkout submissions.
     */
    if (savingAddress) {
      return;
    }

    /*
     * Validate delivery information before continuing.
     */
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSavingAddress(true);

      /*
       * Save the address to backend if this
       * is a newly entered address.
       */
      await saveCurrentAddress();

      /*
       * Build the shipping address that will be
       * submitted with the payment/order process.
       */
      const shippingAddress = [
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.address.trim(),
        formData.city.trim(),
        formData.state.trim(),
        formData.pinCode.trim(),
        formData.phone.trim(),
      ].join(", ");

      /*
       * Send the actual products and quantities
       * to the Payment page.
       *
       * The backend will calculate the real prices
       * from the database.
       */
      const items = itemsToCheckout.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      }));

      /*
       * Move to the complete Payment Method page.
       */
      navigate("/payment", {
        state: {
          shippingAddress,
          items,
          checkoutMode: isBuyNow ? "buyNow" : "cart",
        },
      });
    } catch (error) {
      console.error("Failed to save address:", error);

      const message =
        error?.response?.data?.message ||
        "Unable to save your address. Please try again.";

      setErrors((current) => ({
        ...current,
        address: message,
      }));
    } finally {
      setSavingAddress(false);
    }
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
          onSubmit={handleContinue}
          noValidate
          className="grid gap-6 lg:grid-cols-[1fr_380px]"
        >
          {/* =========================================
              LEFT SIDE
          ========================================== */}

          <section className="space-y-6">
            {/* =========================================
                SAVED ADDRESSES
            ========================================== */}

            {!loadingAddresses && savedAddresses.length > 0 && (
              <div className="rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-text">
                      Saved Addresses
                    </h2>

                    <p className="mt-1 text-xs text-text-secondary">
                      Select an address for delivery.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseNewAddress}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      selectedAddressId === ""
                        ? "border-primary bg-primary-container text-primary"
                        : "border-outline-variant text-text hover:border-primary hover:text-primary"
                    }`}
                  >
                    Use New Address
                  </button>
                </div>

                <div className="mt-5 grid gap-3">
                  {savedAddresses.map((address) => {
                    const isSelected = selectedAddressId === address._id;

                    return (
                      <button
                        key={address._id}
                        type="button"
                        onClick={() => handleSelectAddress(address)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-primary bg-primary-container/40"
                            : "border-outline-variant hover:border-primary/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : "border-outline"
                            }`}
                          >
                            {isSelected && <Check size={13} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-text">
                                {address.fullName}
                              </p>

                              {address.isDefault && (
                                <span className="rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-semibold text-primary">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-text-secondary">
                              {address.phone}
                            </p>

                            <p className="mt-2 text-sm leading-5 text-text-secondary">
                              {address.addressLine}, {address.city},{" "}
                              {address.state} - {address.postalCode}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================
                DELIVERY INFORMATION
            ========================================== */}

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

            {/* Continue */}
            <Button
              type="submit"
              size="large"
              className="mt-6 w-full"
              disabled={savingAddress}
            >
              {savingAddress ? "Saving Address..." : "Continue"}
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
