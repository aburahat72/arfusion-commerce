import { Ban, CheckCircle2, Eye, Search, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const customers = [
  {
    id: "CUS-1001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 98765 43210",
    orders: 12,
    spent: 18450,
    status: "Active",
    joined: "24 Aug 2026",
    avatar: null,
  },
  {
    id: "CUS-1002",
    name: "Emily Johnson",
    email: "emily@example.com",
    phone: "+91 98765 12345",
    orders: 8,
    spent: 12990,
    status: "Active",
    joined: "22 Aug 2026",
    avatar: null,
  },
  {
    id: "CUS-1003",
    name: "Michael Smith",
    email: "michael@example.com",
    phone: "+91 91234 56789",
    orders: 5,
    spent: 7890,
    status: "Active",
    joined: "18 Aug 2026",
    avatar: null,
  },
  {
    id: "CUS-1004",
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+91 99887 66554",
    orders: 15,
    spent: 24600,
    status: "Active",
    joined: "14 Aug 2026",
    avatar: null,
  },
  {
    id: "CUS-1005",
    name: "David Brown",
    email: "david@example.com",
    phone: "+91 90123 45678",
    orders: 2,
    spent: 1999,
    status: "Blocked",
    joined: "10 Aug 2026",
    avatar: null,
  },
];

function AdminCustomers() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query);

      const matchesStatus = status === "All" || customer.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active",
  ).length;

  const blockedCustomers = customers.filter(
    (customer) => customer.status === "Blocked",
  ).length;

  const totalRevenue = customers.reduce(
    (total, customer) => total + customer.spent,
    0,
  );

  const handleViewCustomer = (customer) => {
    navigate(`/admin/customers/${customer.id}`);
  };

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
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-4
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:opacity-95
                hover:shadow-md
              "
            >
              <UserPlus size={18} />
              Add Customer
            </button>
          </div>
        </div>

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

        <div className="mt-5">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-semibold text-text">
              {filteredCustomers.length}
            </span>{" "}
            customers
          </p>
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <section className="mt-4 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
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
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    onView={handleViewCustomer}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && <EmptyCustomers />}
        </section>

        {/* =================================================
            MOBILE
        ================================================= */}

        <section className="mt-4 space-y-3 md:hidden">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onView={handleViewCustomer}
            />
          ))}

          {filteredCustomers.length === 0 && (
            <div className="rounded-2xl border border-outline-variant bg-surface p-8">
              <EmptyCustomers />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   STAT
========================================================= */

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

/* =========================================================
   DESKTOP ROW
========================================================= */

function CustomerRow({ customer, onView }) {
  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={customer.name} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {customer.name}
            </p>

            <p className="mt-0.5 text-xs text-text-secondary">{customer.id}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-text">{customer.email}</p>

        <p className="mt-1 text-xs text-text-secondary">{customer.phone}</p>
      </td>

      <td className="px-5 py-4 text-sm font-semibold text-text">
        {customer.orders}
      </td>

      <td className="px-5 py-4 text-sm font-semibold text-text">
        {formatCurrency(customer.spent)}
      </td>

      <td className="px-5 py-4">
        <CustomerStatus status={customer.status} />
      </td>

      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => onView(customer)}
          className="
            inline-flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            text-text-secondary
            transition
            hover:bg-surface-container
            hover:text-primary
          "
          aria-label={`View ${customer.name}`}
        >
          <Eye size={17} />
        </button>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function CustomerCard({ customer, onView }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar name={customer.name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">
                {customer.name}
              </p>

              <p className="mt-1 text-xs text-text-secondary">{customer.id}</p>
            </div>

            <CustomerStatus status={customer.status} />
          </div>

          <div className="mt-4 space-y-1.5 text-xs">
            <p className="truncate text-text-secondary">{customer.email}</p>

            <p className="text-text-secondary">{customer.phone}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoItem label="Orders" value={customer.orders} />

            <InfoItem
              label="Total Spent"
              value={formatCurrency(customer.spent)}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onView(customer)}
        className="
          mt-4
          flex
          h-10
          w-full
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
        View Customer
      </button>
    </article>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-xs font-semibold text-primary">
      {initials}
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function CustomerStatus({ status }) {
  if (status === "Blocked") {
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

/* =========================================================
   INFO
========================================================= */

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-surface-container p-3">
      <p className="text-[10px] text-text-secondary">{label}</p>

      <p className="mt-1 truncate text-xs font-semibold text-text">{value}</p>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

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

/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default AdminCustomers;
