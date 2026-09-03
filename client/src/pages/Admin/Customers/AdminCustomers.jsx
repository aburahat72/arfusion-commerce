import {
  Ban,
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  deleteCustomer,
  getCustomers,
  updateCustomer,
  updateCustomerStatus,
} from "../../../services/adminApi.js";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [editingCustomer, setEditingCustomer] = useState(null);

  const [deletingCustomer, setDeletingCustomer] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  // =====================================================
  // GET CUSTOMERS
  // =====================================================

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCustomers();

      const apiCustomers = response.data?.customers || [];

      setCustomers(apiCustomers);
    } catch (error) {
      console.error("Failed to fetch customers:", error);

      setError(error.response?.data?.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =====================================================
  // FILTER CUSTOMERS
  // =====================================================

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const name = customer.fullName?.toLowerCase() || "";

      const email = customer.email?.toLowerCase() || "";

      const phone = customer.phone?.toLowerCase() || "";

      const id = customer._id?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        id.includes(query);

      const customerStatus = customer.isActive ? "Active" : "Blocked";

      const matchesStatus = status === "All" || customerStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, status]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.isActive,
  ).length;

  const blockedCustomers = customers.filter(
    (customer) => !customer.isActive,
  ).length;

  // Orders/revenue will be connected to Order collection later.
  const totalOrders = 0;
  const totalRevenue = 0;

  // =====================================================
  // STATUS TOGGLE
  // =====================================================

  const handleToggleStatus = async (customer) => {
    try {
      setActionLoading(true);
      setError("");

      const newStatus = !customer.isActive;

      const response = await updateCustomerStatus(customer._id, newStatus);

      const updatedCustomer = response.data?.customer;

      if (updatedCustomer) {
        setCustomers((currentCustomers) =>
          currentCustomers.map((item) =>
            item._id === updatedCustomer._id ? updatedCustomer : item,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update customer status:", error);

      setError(
        error.response?.data?.message || "Failed to update customer status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // UPDATE CUSTOMER
  // =====================================================

  const handleUpdateCustomer = async (customerId, formData) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await updateCustomer(customerId, formData);

      const updatedCustomer = response.data?.customer;

      if (updatedCustomer) {
        setCustomers((currentCustomers) =>
          currentCustomers.map((item) =>
            item._id === updatedCustomer._id ? updatedCustomer : item,
          ),
        );

        setSelectedCustomer(updatedCustomer);

        setEditingCustomer(null);
      }
    } catch (error) {
      console.error("Failed to update customer:", error);

      setError(error.response?.data?.message || "Failed to update customer.");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // DELETE CUSTOMER
  // =====================================================

  const handleDeleteCustomer = async (customer) => {
    try {
      setActionLoading(true);
      setError("");

      await deleteCustomer(customer._id);

      setCustomers((currentCustomers) =>
        currentCustomers.filter((item) => item._id !== customer._id),
      );

      setDeletingCustomer(null);
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Failed to delete customer:", error);

      setError(error.response?.data?.message || "Failed to delete customer.");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <p className="text-sm text-text-secondary">Sales</p>

          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                Customers
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Manage customer accounts, activity, and status.
              </p>
            </div>

            <button
              type="button"
              disabled
              title="Admin customer creation API will be added next"
              className="
                inline-flex
                h-11
                cursor-not-allowed
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-4
                text-sm
                font-semibold
                text-white
                opacity-60
                shadow-sm
              "
            >
              <UserPlus size={18} />
              Add Customer
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error">
            <Ban size={18} className="mt-0.5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">Something went wrong</p>

              <p className="mt-1">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0"
              aria-label="Close error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CustomerStat
            title="Total Customers"
            value={totalCustomers}
            icon={<Users size={20} />}
            iconClass="bg-primary-container text-primary"
          />

          <CustomerStat
            title="Active Customers"
            value={activeCustomers}
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-success/10 text-success"
          />

          <CustomerStat
            title="Blocked Customers"
            value={blockedCustomers}
            icon={<Ban size={20} />}
            iconClass="bg-error/10 text-error"
          />

          <CustomerStat
            title="Customer Value"
            value={formatCurrency(totalRevenue)}
            icon={<Users size={20} />}
            iconClass="bg-blue-100 text-blue-600"
          />
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-text-secondary
                "
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone or customer ID..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-outline-variant
                  bg-surface
                  pl-10
                  pr-4
                  text-sm
                  text-text
                  outline-none
                  transition
                  placeholder:text-text-secondary
                  hover:border-outline
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/15
                "
              />
            </div>

            <div className="flex gap-2">
              {["All", "Active", "Blocked"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={`
                    h-11
                    rounded-xl
                    px-4
                    text-xs
                    font-semibold
                    transition
                    ${
                      status === option
                        ? "bg-primary text-white"
                        : "border border-outline-variant text-text-secondary hover:bg-surface-container hover:text-text"
                    }
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            RESULTS
        ================================================= */}

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-semibold text-text">
              {filteredCustomers.length}
            </span>{" "}
            customers
          </p>

          <button
            type="button"
            onClick={fetchCustomers}
            disabled={loading}
            className="
              inline-flex
              items-center
              gap-2
              text-xs
              font-semibold
              text-primary
              disabled:opacity-50
            "
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Refresh
          </button>
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <section className="mt-4 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
          {loading ? (
            <LoadingCustomers />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container/60">
                    <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                      Orders
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                      Total Spent
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <CustomerRow
                      key={customer._id}
                      customer={customer}
                      onView={() => setSelectedCustomer(customer)}
                      onEdit={() => setEditingCustomer(customer)}
                      onToggleStatus={() => handleToggleStatus(customer)}
                      onDelete={() => setDeletingCustomer(customer)}
                      actionLoading={actionLoading}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredCustomers.length === 0 && <EmptyCustomers />}
        </section>

        {/* =================================================
            MOBILE
        ================================================= */}

        <section className="mt-4 space-y-3 md:hidden">
          {loading ? (
            <LoadingCustomers />
          ) : (
            <>
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer._id}
                  customer={customer}
                  onView={() => setSelectedCustomer(customer)}
                  onEdit={() => setEditingCustomer(customer)}
                  onToggleStatus={() => handleToggleStatus(customer)}
                  onDelete={() => setDeletingCustomer(customer)}
                  actionLoading={actionLoading}
                />
              ))}

              {filteredCustomers.length === 0 && (
                <div className="rounded-2xl border border-outline-variant bg-surface p-8">
                  <EmptyCustomers />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* =================================================
          VIEW CUSTOMER
      ================================================= */}

      {selectedCustomer && (
        <CustomerViewModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEdit={() => {
            setEditingCustomer(selectedCustomer);
            setSelectedCustomer(null);
          }}
          onToggleStatus={() => handleToggleStatus(selectedCustomer)}
          onDelete={() => setDeletingCustomer(selectedCustomer)}
          actionLoading={actionLoading}
          formatDate={formatDate}
        />
      )}

      {/* =================================================
          EDIT CUSTOMER
      ================================================= */}

      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSubmit={handleUpdateCustomer}
          loading={actionLoading}
        />
      )}

      {/* =================================================
          DELETE CONFIRMATION
      ================================================= */}

      {deletingCustomer && (
        <DeleteCustomerModal
          customer={deletingCustomer}
          onClose={() => setDeletingCustomer(null)}
          onConfirm={() => handleDeleteCustomer(deletingCustomer)}
          loading={actionLoading}
        />
      )}
    </main>
  );
}

// =========================================================
// STAT
// =========================================================

function CustomerStat({ title, value, icon, iconClass }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-text-secondary">{title}</p>

          <p className="mt-1 truncate text-xl font-semibold text-text sm:text-2xl">
            {value}
          </p>
        </div>
      </div>
    </article>
  );
}

// =========================================================
// DESKTOP ROW
// =========================================================

function CustomerRow({
  customer,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  actionLoading,
}) {
  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={customer.fullName} avatar={customer.avatar} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {customer.fullName || "Unnamed Customer"}
            </p>

            <p className="mt-0.5 text-xs text-text-secondary">{customer._id}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-text">{customer.email}</p>

        <p className="mt-1 text-xs text-text-secondary">
          {customer.phone || "No phone"}
        </p>
      </td>

      <td className="px-5 py-4 text-sm font-semibold text-text">0</td>

      <td className="px-5 py-4 text-sm font-semibold text-text">
        {formatCurrency(0)}
      </td>

      <td className="px-5 py-4">
        <CustomerStatus isActive={customer.isActive} />
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-1">
          <ActionButton
            icon={<Eye size={16} />}
            label="View"
            onClick={onView}
          />

          <ActionButton
            icon={<Pencil size={16} />}
            label="Edit"
            onClick={onEdit}
          />

          <ActionButton
            icon={
              customer.isActive ? <Ban size={16} /> : <CheckCircle2 size={16} />
            }
            label={customer.isActive ? "Block" : "Activate"}
            onClick={onToggleStatus}
            disabled={actionLoading}
          />

          <ActionButton
            icon={<Trash2 size={16} />}
            label="Delete"
            onClick={onDelete}
            disabled={actionLoading}
            danger
          />
        </div>
      </td>
    </tr>
  );
}

// =========================================================
// MOBILE CARD
// =========================================================

function CustomerCard({
  customer,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  actionLoading,
}) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar name={customer.fullName} avatar={customer.avatar} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">
                {customer.fullName || "Unnamed Customer"}
              </p>

              <p className="mt-1 truncate text-xs text-text-secondary">
                {customer._id}
              </p>
            </div>

            <CustomerStatus isActive={customer.isActive} />
          </div>

          <div className="mt-4 space-y-1.5 text-xs">
            <p className="truncate text-text-secondary">{customer.email}</p>

            <p className="text-text-secondary">
              {customer.phone || "No phone"}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoItem label="Orders" value="0" />

            <InfoItem label="Total Spent" value={formatCurrency(0)} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onView}
          className="
            flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-outline-variant
            text-xs
            font-semibold
            text-text
            transition
            hover:bg-surface-container
            hover:text-primary
          "
        >
          <Eye size={15} />
          View
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="
            flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-outline-variant
            text-xs
            font-semibold
            text-text
            transition
            hover:bg-surface-container
            hover:text-primary
          "
        >
          <Pencil size={15} />
          Edit
        </button>

        <button
          type="button"
          onClick={onToggleStatus}
          disabled={actionLoading}
          className="
            flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-outline-variant
            text-xs
            font-semibold
            text-text
            transition
            hover:bg-surface-container
            hover:text-primary
            disabled:opacity-50
          "
        >
          {customer.isActive ? <Ban size={15} /> : <CheckCircle2 size={15} />}

          {customer.isActive ? "Block" : "Activate"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={actionLoading}
          className="
            flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-error/20
            text-xs
            font-semibold
            text-error
            transition
            hover:bg-error/10
            disabled:opacity-50
          "
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </article>
  );
}

// =========================================================
// ACTION BUTTON
// =========================================================

function ActionButton({
  icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`
        inline-flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        transition
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${
          danger
            ? "text-error hover:bg-error/10"
            : "text-text-secondary hover:bg-surface-container hover:text-primary"
        }
      `}
    >
      {icon}
    </button>
  );
}

// =========================================================
// VIEW MODAL
// =========================================================

function CustomerViewModal({
  customer,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
  actionLoading,
  formatDate,
}) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={customer.fullName} avatar={customer.avatar} />

          <div>
            <h2 className="text-lg font-semibold text-text">
              {customer.fullName}
            </h2>

            <p className="text-xs text-text-secondary">{customer._id}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-text-secondary hover:text-text"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <DetailItem label="Full Name" value={customer.fullName} />

        <DetailItem label="Email" value={customer.email} />

        <DetailItem label="Phone" value={customer.phone || "Not provided"} />

        <DetailItem label="Role" value={customer.role} />

        <DetailItem
          label="Status"
          value={customer.isActive ? "Active" : "Blocked"}
        />

        <DetailItem
          label="Verified"
          value={customer.isVerified ? "Verified" : "Not verified"}
        />

        <DetailItem label="Joined" value={formatDate(customer.createdAt)} />

        <DetailItem
          label="Last Updated"
          value={formatDate(customer.updatedAt)}
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="
            inline-flex
            h-10
            items-center
            gap-2
            rounded-xl
            border
            border-outline-variant
            px-4
            text-xs
            font-semibold
            text-text
            hover:bg-surface-container
          "
        >
          <Pencil size={15} />
          Edit
        </button>

        <button
          type="button"
          onClick={onToggleStatus}
          disabled={actionLoading}
          className="
            inline-flex
            h-10
            items-center
            gap-2
            rounded-xl
            border
            border-outline-variant
            px-4
            text-xs
            font-semibold
            text-text
            hover:bg-surface-container
            disabled:opacity-50
          "
        >
          {customer.isActive ? <Ban size={15} /> : <CheckCircle2 size={15} />}

          {customer.isActive ? "Block Customer" : "Activate Customer"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={actionLoading}
          className="
            inline-flex
            h-10
            items-center
            gap-2
            rounded-xl
            border
            border-error/20
            px-4
            text-xs
            font-semibold
            text-error
            hover:bg-error/10
            disabled:opacity-50
          "
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </Modal>
  );
}

// =========================================================
// EDIT MODAL
// =========================================================

function EditCustomerModal({ customer, onClose, onSubmit, loading }) {
  const [fullName, setFullName] = useState(customer.fullName || "");

  const [email, setEmail] = useState(customer.email || "");

  const [phone, setPhone] = useState(customer.phone || "");

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit(customer._id, {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Edit Customer</h2>

          <p className="mt-1 text-xs text-text-secondary">
            Update customer account information.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-text-secondary hover:text-text"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField
          label="Full Name"
          value={fullName}
          onChange={setFullName}
          required
        />

        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />

        <FormField label="Phone" value={phone} onChange={setPhone} />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              h-10
              rounded-xl
              border
              border-outline-variant
              px-4
              text-xs
              font-semibold
              text-text
              hover:bg-surface-container
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="
              inline-flex
              h-10
              items-center
              gap-2
              rounded-xl
              bg-primary
              px-4
              text-xs
              font-semibold
              text-white
              hover:opacity-95
              disabled:opacity-50
            "
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

// =========================================================
// DELETE MODAL
// =========================================================

function DeleteCustomerModal({ customer, onClose, onConfirm, loading }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error">
          <Trash2 size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text">Delete Customer?</h2>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            This will permanently delete{" "}
            <span className="font-semibold text-text">{customer.fullName}</span>{" "}
            and their user account.
          </p>

          <p className="mt-2 text-xs text-error">
            This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="
            h-10
            rounded-xl
            border
            border-outline-variant
            px-4
            text-xs
            font-semibold
            text-text
            hover:bg-surface-container
            disabled:opacity-50
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="
            inline-flex
            h-10
            items-center
            gap-2
            rounded-xl
            bg-error
            px-4
            text-xs
            font-semibold
            text-white
            hover:opacity-90
            disabled:opacity-50
          "
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Delete Customer
        </button>
      </div>
    </Modal>
  );
}

// =========================================================
// MODAL
// =========================================================

function Modal({ children, onClose }) {
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-outline-variant bg-surface p-5 shadow-xl sm:p-6">
        {children}
      </div>
    </div>
  );
}

// =========================================================
// FORM FIELD
// =========================================================

function FormField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-text">
        {label}
        {required && <span className="ml-1 text-error">*</span>}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="
          h-11
          w-full
          rounded-xl
          border
          border-outline-variant
          bg-surface
          px-3.5
          text-sm
          text-text
          outline-none
          transition
          placeholder:text-text-secondary
          focus:border-primary
          focus:ring-2
          focus:ring-primary/15
        "
      />
    </label>
  );
}

// =========================================================
// DETAIL ITEM
// =========================================================

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl bg-surface-container p-3">
      <p className="text-[10px] text-text-secondary">{label}</p>

      <p className="mt-1 break-words text-xs font-semibold text-text">
        {value || "—"}
      </p>
    </div>
  );
}

// =========================================================
// AVATAR
// =========================================================

function Avatar({ name, avatar }) {
  const initials =
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CU";

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name || "Customer"}
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-xs font-semibold text-primary">
      {initials}
    </div>
  );
}

// =========================================================
// STATUS
// =========================================================

function CustomerStatus({ isActive }) {
  if (!isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-1.5 text-[10px] font-semibold text-error">
        <Ban size={12} />
        Blocked
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1.5 text-[10px] font-semibold text-success">
      <CheckCircle2 size={12} />
      Active
    </span>
  );
}

// =========================================================
// INFO
// =========================================================

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-surface-container p-3">
      <p className="text-[10px] text-text-secondary">{label}</p>

      <p className="mt-1 truncate text-xs font-semibold text-text">{value}</p>
    </div>
  );
}

// =========================================================
// LOADING
// =========================================================

function LoadingCustomers() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-text-secondary">
        <Loader2 size={28} className="animate-spin text-primary" />

        <p className="text-sm">Loading customers...</p>
      </div>
    </div>
  );
}

// =========================================================
// EMPTY
// =========================================================

function EmptyCustomers() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
        <Users size={21} className="text-text-secondary" />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-text">
        No customers found
      </h2>

      <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
        Try changing your search or customer status filter.
      </p>
    </div>
  );
}

// =========================================================
// CURRENCY
// =========================================================

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default AdminCustomers;
