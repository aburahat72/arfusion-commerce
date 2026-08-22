import { ArrowLeft, Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAddresses, saveAddresses } from "../../utils/profileStorage";

const emptyAddress = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  type: "Home",
};

function Addresses() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState(getAddresses());

  const [form, setForm] = useState(emptyAddress);

  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const updateAddresses = (next) => {
    setAddresses(next);
    saveAddresses(next);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyAddress);
    setShowForm(true);
  };

  const openEditForm = (address) => {
    setEditingId(address.id);
    setForm(address);
    setShowForm(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (editingId) {
      const updated = addresses.map((address) =>
        address.id === editingId
          ? {
              ...form,
              id: editingId,
              isDefault: address.isDefault,
            }
          : address,
      );

      updateAddresses(updated);
    } else {
      const newAddress = {
        ...form,
        id: crypto.randomUUID(),
        isDefault: addresses.length === 0,
      };

      updateAddresses([...addresses, newAddress]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyAddress);
  };

  const deleteAddress = (id) => {
    const address = addresses.find((item) => item.id === id);

    if (!address) {
      return;
    }

    const remaining = addresses.filter((item) => item.id !== id);

    if (address.isDefault && remaining.length > 0) {
      remaining[0].isDefault = true;
    }

    updateAddresses(remaining);
  };

  const setDefault = (id) => {
    const updated = addresses.map((address) => ({
      ...address,
      isDefault: address.id === id,
    }));

    updateAddresses(updated);
  };

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

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text">Addresses</h1>

            <p className="mt-1 text-sm text-text-secondary">
              Manage your delivery addresses.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">Add Address</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Form */}

        {showForm && (
          <section className="mb-6 rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text">
              {editingId ? "Edit Address" : "Add New Address"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <Field
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <Field
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <div className="sm:col-span-2">
                <Field
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <Field
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />

              <Field
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                required
              />

              <Field
                label="PIN Code"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                required
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Address Type
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="min-h-11 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm text-text outline-none focus:border-primary"
                >
                  <option value="Home">Home</option>

                  <option value="Work">Work</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 sm:col-span-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-medium text-text"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                >
                  {editingId ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Address list */}

        {addresses.length === 0 ? (
          <section className="rounded-3xl border border-outline-variant bg-surface p-10 text-center shadow-sm">
            <MapPin size={32} className="mx-auto text-text-secondary" />

            <h2 className="mt-4 text-lg font-semibold text-text">
              No addresses yet
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Add an address for faster checkout.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Add Address
            </button>
          </section>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => openEditForm(address)}
                onDelete={() => deleteAddress(address.id)}
                onSetDefault={() => setDefault(address.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
            <MapPin size={19} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-text">{address.name}</h2>

              <span className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                {address.type}
              </span>

              {address.isDefault && (
                <span className="rounded-full bg-primary-container px-2.5 py-1 text-[11px] font-semibold text-primary">
                  Default
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-text-secondary">
              {address.address}
            </p>

            <p className="mt-1 text-sm text-text-secondary">
              {address.city}, {address.state} {address.pincode}
            </p>

            <p className="mt-1 text-sm text-text-secondary">{address.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-container hover:text-primary"
            aria-label="Edit address"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-error/10 hover:text-error"
            aria-label="Delete address"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      {!address.isDefault && (
        <button
          type="button"
          onClick={onSetDefault}
          className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary"
        >
          <Check size={15} />
          Set as default
        </button>
      )}
    </article>
  );
}

function Field({ label, name, value, onChange, required = false }) {
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
        value={value}
        onChange={onChange}
        required={required}
        className="min-h-11 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

export default Addresses;
