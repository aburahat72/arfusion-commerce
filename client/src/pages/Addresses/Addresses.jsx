import {
  ArrowLeft,
  Check,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  addAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from "../../services/addressService";

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

function Addresses() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddress);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [defaultId, setDefaultId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD SAVED ADDRESSES
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadAddresses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAddresses();

        if (!mounted) {
          return;
        }

        setAddresses(
          Array.isArray(response?.addresses) ? response.addresses : [],
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
            "Unable to load your saved addresses.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAddresses();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // CLEAR MESSAGES
  // =====================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    clearMessages();
  };

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyAddress });
    setShowForm(true);
    clearMessages();
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const openEditForm = (address) => {
    setEditingId(address._id);

    setForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
    });

    setShowForm(true);
    clearMessages();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyAddress });
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {
    const fullName = form.fullName.trim();
    const phone = form.phone.trim();
    const addressLine = form.addressLine.trim();
    const city = form.city.trim();
    const state = form.state.trim();
    const postalCode = form.postalCode.trim();

    if (!fullName) {
      return "Please enter the recipient's full name.";
    }

    if (!phone) {
      return "Please enter a mobile number.";
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!addressLine) {
      return "Please enter your complete address.";
    }

    if (!city) {
      return "Please enter your city.";
    }

    if (!state) {
      return "Please enter your state.";
    }

    if (!postalCode) {
      return "Please enter your PIN code.";
    }

    if (!/^\d{6}$/.test(postalCode)) {
      return "Please enter a valid 6-digit PIN code.";
    }

    return "";
  };

  // =====================================================
  // SAVE / UPDATE ADDRESS
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      const addressData = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        addressLine: form.addressLine.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        country: "India",
      };

      // =================================================
      // UPDATE
      // =================================================

      if (editingId) {
        const currentAddress = addresses.find(
          (address) => address._id === editingId,
        );

        const response = await updateAddress(editingId, {
          ...addressData,
          isDefault: currentAddress?.isDefault || false,
        });

        if (response?.address) {
          setAddresses((current) =>
            current.map((address) =>
              address._id === editingId ? response.address : address,
            ),
          );
        }

        setSuccess("Your address has been updated successfully.");
      }

      // =================================================
      // ADD
      // =================================================
      else {
        const response = await addAddress({
          ...addressData,
          isDefault: addresses.length === 0,
        });

        if (response?.address) {
          setAddresses((current) => [response.address, ...current]);
        }

        setSuccess("Your new address has been saved.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyAddress });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to save your address. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE ADDRESS
  // =====================================================

  const requestDelete = (address) => {
    if (deletingId || defaultId) {
      return;
    }

    setDeleteTarget(address);
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id || deletingId) {
      return;
    }

    const addressToDelete = deleteTarget;

    try {
      setDeletingId(addressToDelete._id);
      setDeleteTarget(null);
      clearMessages();

      await deleteAddress(addressToDelete._id);

      const remaining = addresses.filter(
        (address) => address._id !== addressToDelete._id,
      );

      setAddresses(remaining);

      // =================================================
      // IF DEFAULT WAS DELETED
      // =================================================

      if (addressToDelete.isDefault && remaining.length > 0) {
        const nextDefault = remaining[0];

        try {
          const response = await setDefaultAddress(nextDefault._id);

          setAddresses((current) =>
            current.map((address) => {
              if (address._id === nextDefault._id) {
                return (
                  response?.address || {
                    ...address,
                    isDefault: true,
                  }
                );
              }

              return {
                ...address,
                isDefault: false,
              };
            }),
          );
        } catch (defaultError) {
          setError(
            defaultError?.response?.data?.message ||
              "Address was deleted, but the default address could not be updated.",
          );

          return;
        }
      }

      setSuccess("Address deleted successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to delete this address. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // SET DEFAULT
  // =====================================================

  const handleSetDefault = async (addressId) => {
    if (!addressId || defaultId) {
      return;
    }

    try {
      setDefaultId(addressId);
      clearMessages();

      const response = await setDefaultAddress(addressId);

      setAddresses((current) =>
        current.map((address) => {
          if (address._id === addressId) {
            return (
              response?.address || {
                ...address,
                isDefault: true,
              }
            );
          }

          return {
            ...address,
            isDefault: false,
          };
        }),
      );

      setSuccess("Default delivery address updated.");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to update the default address.",
      );
    } finally {
      setDefaultId(null);
    }
  };

  return (
    <main className="min-h-screen bg-background py-7 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* =================================================
            BACK TO PROFILE
        ================================================= */}

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to Profile
        </button>

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-primary">
                  <MapPin size={21} />
                </div>

                <div>
                  <h1 className="text-xl font-semibold text-text sm:text-2xl">
                    Saved Addresses
                  </h1>

                  <p className="mt-1 text-sm text-text-secondary">
                    {addresses.length === 0
                      ? "Add an address for a faster checkout."
                      : `${addresses.length} ${
                          addresses.length === 1 ? "address" : "addresses"
                        } saved`}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus size={17} />
              Add New Address
            </button>
          </div>
        </section>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
            <Check size={18} className="mt-0.5 shrink-0" />

            <p className="flex-1">{success}</p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0 opacity-70 transition hover:opacity-100"
              aria-label="Close message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            <X size={18} className="mt-0.5 shrink-0" />

            <p className="flex-1">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 opacity-70 transition hover:opacity-100"
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}

        {showForm && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <div className="border-b border-outline-variant px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-text">
                    {editingId
                      ? "Edit Delivery Address"
                      : "Add Delivery Address"}
                  </h2>

                  <p className="mt-1 text-sm text-text-secondary">
                    Enter the details where your order should be delivered.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-container hover:text-text disabled:opacity-50"
                  aria-label="Close form"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter recipient name"
                  required
                  autoComplete="name"
                />

                <Field
                  label="Mobile Number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Address"
                    name="addressLine"
                    value={form.addressLine}
                    onChange={handleChange}
                    placeholder="House no., building, street, area"
                    required
                    autoComplete="street-address"
                  />
                </div>

                <Field
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                  autoComplete="address-level2"
                />

                <Field
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  required
                  autoComplete="address-level1"
                />

                <Field
                  label="PIN Code"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="postal-code"
                />

                <div>
                  <label
                    htmlFor="country"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Country
                  </label>

                  <div
                    id="country"
                    className="flex min-h-11 items-center rounded-xl border border-outline-variant bg-surface-container px-4 text-sm text-text"
                  >
                    India
                  </div>
                </div>
              </div>

              {/* FORM ACTIONS */}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-outline-variant pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-outline-variant px-5 py-3 text-sm font-medium text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? editingId
                      ? "Updating Address..."
                      : "Saving Address..."
                    : editingId
                      ? "Update Address"
                      : "Save Address"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="mt-5 space-y-4">
            {[1, 2].map((item) => (
              <AddressSkeleton key={item} />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <section className="mt-5 rounded-2xl border border-outline-variant bg-surface px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <MapPin size={30} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-text">
              No saved addresses
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Save your delivery address once and use it for faster checkout on
              future orders.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus size={17} />
              Add Your First Address
            </button>
          </section>
        ) : (
          /* =================================================
             SAVED ADDRESSES
          ================================================= */

          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">
                Your Addresses
              </h2>

              <span className="text-xs text-text-secondary">
                {addresses.length} saved
              </span>
            </div>

            <div className="space-y-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address._id}
                  address={address}
                  onEdit={() => openEditForm(address)}
                  onDelete={() => requestDelete(address)}
                  onSetDefault={() => handleSetDefault(address._id)}
                  deleting={deletingId === address._id}
                  settingDefault={defaultId === address._id}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-text">
                  Delete address?
                </h2>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  This saved address will be permanently removed from your
                  account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-container hover:text-text"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-surface-container p-4">
              <p className="text-sm font-semibold text-text">
                {deleteTarget.fullName}
              </p>

              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {deleteTarget.addressLine}
              </p>

              <p className="text-sm text-text-secondary">
                {deleteTarget.city}, {deleteTarget.state}{" "}
                {deleteTarget.postalCode}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-outline-variant px-5 py-3 text-sm font-medium text-text transition hover:bg-surface-container"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-error px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Delete Address
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =====================================================
   ADDRESS CARD
===================================================== */

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  deleting,
  settingDefault,
}) {
  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-surface shadow-sm transition ${
        address.isDefault ? "border-primary/40" : "border-outline-variant"
      }`}
    >
      {/* DEFAULT HEADER */}

      {address.isDefault && (
        <div className="flex items-center gap-2 border-b border-primary/10 bg-primary-container px-5 py-2.5 sm:px-6">
          <Check size={15} className="text-primary" />

          <span className="text-xs font-semibold text-primary">
            Default delivery address
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
          {/* ADDRESS INFORMATION */}

          <div className="flex min-w-0 gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary">
              <MapPin size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-text">
                  {address.fullName}
                </h3>

                {address.isDefault && (
                  <span className="rounded-full bg-primary-container px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Default
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {address.addressLine}
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                {address.city}, {address.state} - {address.postalCode}
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                {address.country || "India"}
              </p>

              <p className="mt-2 text-sm font-medium text-text">
                Mobile: {address.phone}
              </p>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
            <button
              type="button"
              onClick={onEdit}
              disabled={deleting || settingDefault}
              className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-3.5 py-2 text-xs font-semibold text-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={14} />
              Edit
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting || settingDefault}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-text-secondary transition hover:border-error/30 hover:bg-error/5 hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Delete address"
            >
              {deleting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-error/30 border-t-error" />
              ) : (
                <Trash2 size={15} />
              )}
            </button>
          </div>
        </div>

        {/* SET DEFAULT */}

        {!address.isDefault && (
          <div className="mt-5 border-t border-outline-variant pt-4">
            <button
              type="button"
              onClick={onSetDefault}
              disabled={deleting || settingDefault}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {settingDefault ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              ) : (
                <Check size={15} />
              )}

              {settingDefault ? "Updating default..." : "Set as default"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

/* =====================================================
   ADDRESS SKELETON
===================================================== */

function AddressSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex gap-4">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-outline-variant" />

        <div className="flex-1 space-y-3">
          <div className="h-4 w-40 rounded bg-outline-variant" />

          <div className="h-3 w-full max-w-lg rounded bg-outline-variant" />

          <div className="h-3 w-64 rounded bg-outline-variant" />

          <div className="h-3 w-32 rounded bg-outline-variant" />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   FORM FIELD
===================================================== */

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  inputMode,
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-text"
      >
        {label}

        {required && <span className="ml-1 text-error">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="
          min-h-11
          w-full
          rounded-xl
          border
          border-outline-variant
          bg-surface
          px-4
          text-sm
          text-text
          outline-none
          transition
          placeholder:text-text-secondary
          focus:border-primary
          focus:ring-2
          focus:ring-primary/20
        "
      />
    </div>
  );
}

export default Addresses;
