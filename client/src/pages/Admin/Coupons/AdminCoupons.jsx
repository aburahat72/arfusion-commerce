import {
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  Percent,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const coupons = [
  {
    id: "CPN-1001",
    code: "WELCOME10",
    description: "10% off for new customers",
    type: "Percentage",
    value: 10,
    minOrder: 999,
    usage: 145,
    usageLimit: 500,
    expires: "31 Dec 2026",
    status: "Active",
  },
  {
    id: "CPN-1002",
    code: "SAVE500",
    description: "₹500 off on orders above ₹3,000",
    type: "Fixed",
    value: 500,
    minOrder: 3000,
    usage: 82,
    usageLimit: 200,
    expires: "30 Sep 2026",
    status: "Active",
  },
  {
    id: "CPN-1003",
    code: "FESTIVE20",
    description: "20% festive season discount",
    type: "Percentage",
    value: 20,
    minOrder: 1999,
    usage: 310,
    usageLimit: 350,
    expires: "15 Sep 2026",
    status: "Active",
  },
  {
    id: "CPN-1004",
    code: "OLD15",
    description: "15% seasonal discount",
    type: "Percentage",
    value: 15,
    minOrder: 1499,
    usage: 500,
    usageLimit: 500,
    expires: "01 Aug 2026",
    status: "Expired",
  },
  {
    id: "CPN-1005",
    code: "FLASH100",
    description: "₹100 limited-time discount",
    type: "Fixed",
    value: 100,
    minOrder: 799,
    usage: 21,
    usageLimit: 100,
    expires: "05 Sep 2026",
    status: "Disabled",
  },
];

function AdminCoupons() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch =
        !query ||
        coupon.code.toLowerCase().includes(query) ||
        coupon.description.toLowerCase().includes(query) ||
        coupon.id.toLowerCase().includes(query);

      const matchesStatus = status === "All" || coupon.status === status;

      const matchesType = type === "All" || coupon.type === type;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, status, type]);

  const activeCount = coupons.filter(
    (coupon) => coupon.status === "Active",
  ).length;

  const expiredCount = coupons.filter(
    (coupon) => coupon.status === "Expired",
  ).length;

  const disabledCount = coupons.filter(
    (coupon) => coupon.status === "Disabled",
  ).length;

  const totalUsage = coupons.reduce((sum, coupon) => sum + coupon.usage, 0);

  const handleAddCoupon = () => {
    navigate("/admin/coupons/new");
  };

  const handleViewCoupon = (coupon) => {
    navigate(`/admin/coupons/${coupon.id}`);
  };

  const handleEditCoupon = (coupon) => {
    navigate(`/admin/coupons/${coupon.id}/edit`);
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <p className="text-sm text-text-secondary">Marketing</p>

          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                Coupons & Discounts
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Create and manage promotional offers for your customers.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddCoupon}
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
              <Plus size={18} />
              Create Coupon
            </button>
          </div>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CouponStat
            title="Total Coupons"
            value={coupons.length}
            icon={<Percent size={20} />}
            iconClass="bg-primary-container text-primary"
          />

          <CouponStat
            title="Active"
            value={activeCount}
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-success/10 text-success"
          />

          <CouponStat
            title="Expired"
            value={expiredCount}
            icon={<XCircle size={20} />}
            iconClass="bg-error/10 text-error"
          />

          <CouponStat
            title="Total Uses"
            value={totalUsage.toLocaleString("en-IN")}
            icon={<Copy size={20} />}
            iconClass="bg-blue-100 text-blue-600"
          />
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
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
                placeholder="Search coupon code or description..."
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

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="
                h-11
                rounded-xl
                border
                border-outline-variant
                bg-surface
                px-3
                text-sm
                text-text
                outline-none
                transition
                focus:border-primary
                focus:ring-2
                focus:ring-primary/15
              "
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Disabled">Disabled</option>
            </select>

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="
                h-11
                rounded-xl
                border
                border-outline-variant
                bg-surface
                px-3
                text-sm
                text-text
                outline-none
                transition
                focus:border-primary
                focus:ring-2
                focus:ring-primary/15
              "
            >
              <option value="All">All Types</option>
              <option value="Percentage">Percentage</option>
              <option value="Fixed">Fixed Amount</option>
            </select>
          </div>
        </section>

        {/* =================================================
            COUNT
        ================================================= */}

        <div className="mt-5">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-semibold text-text">
              {filteredCoupons.length}
            </span>{" "}
            coupons
          </p>
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <section className="mt-4 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/60">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Coupon
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Discount
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Min Order
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Usage
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Expires
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
                {filteredCoupons.map((coupon) => (
                  <CouponRow
                    key={coupon.id}
                    coupon={coupon}
                    onView={handleViewCoupon}
                    onEdit={handleEditCoupon}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredCoupons.length === 0 && <EmptyCoupons />}
        </section>

        {/* =================================================
            MOBILE
        ================================================= */}

        <section className="mt-4 space-y-3 md:hidden">
          {filteredCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onView={handleViewCoupon}
              onEdit={handleEditCoupon}
            />
          ))}

          {filteredCoupons.length === 0 && (
            <div className="rounded-2xl border border-outline-variant bg-surface p-8">
              <EmptyCoupons />
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

function CouponStat({ title, value, icon, iconClass }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs text-text-secondary">{title}</p>

          <p className="mt-1 text-2xl font-semibold text-text">{value}</p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   ROW
========================================================= */

function CouponRow({ coupon, onView, onEdit }) {
  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="px-5 py-4">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onView(coupon)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {coupon.code}
          </button>

          <p className="mt-1 max-w-xs truncate text-xs text-text-secondary">
            {coupon.description}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-text">
          {formatDiscount(coupon)}
        </p>

        <p className="mt-1 text-[11px] text-text-secondary">{coupon.type}</p>
      </td>

      <td className="px-5 py-4 text-sm text-text-secondary">
        {formatCurrency(coupon.minOrder)}
      </td>

      <td className="px-5 py-4">
        <div className="w-32">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-secondary">{coupon.usage}</span>

            <span className="text-text-secondary">{coupon.usageLimit}</span>
          </div>

          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(
                  (coupon.usage / coupon.usageLimit) * 100,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-text-secondary">
        {coupon.expires}
      </td>

      <td className="px-5 py-4">
        <CouponStatus status={coupon.status} />
      </td>

      <td className="px-5 py-4">
        <CouponActions coupon={coupon} onView={onView} onEdit={onEdit} />
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function CouponCard({ coupon, onView, onEdit }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onView(coupon)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {coupon.code}
          </button>

          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {coupon.description}
          </p>
        </div>

        <CouponStatus status={coupon.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoItem label="Discount" value={formatDiscount(coupon)} />

        <InfoItem label="Min Order" value={formatCurrency(coupon.minOrder)} />

        <InfoItem
          label="Usage"
          value={`${coupon.usage} / ${coupon.usageLimit}`}
        />

        <InfoItem label="Expires" value={coupon.expires} />
      </div>

      <CouponActions coupon={coupon} onView={onView} onEdit={onEdit} mobile />
    </article>
  );
}

/* =========================================================
   ACTIONS
========================================================= */

function CouponActions({ coupon, onView, onEdit, mobile = false }) {
  if (mobile) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onView(coupon)}
          className="
            inline-flex
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
          "
        >
          <Eye size={15} />
          View
        </button>

        <button
          type="button"
          onClick={() => onEdit(coupon)}
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            text-xs
            font-semibold
            text-white
            transition
            hover:opacity-90
          "
        >
          <Edit3 size={15} />
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() => onView(coupon)}
        aria-label={`View ${coupon.code}`}
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
      >
        <Eye size={17} />
      </button>

      <button
        type="button"
        onClick={() => onEdit(coupon)}
        aria-label={`Edit ${coupon.code}`}
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
      >
        <Edit3 size={17} />
      </button>

      <button
        type="button"
        aria-label={`Delete ${coupon.code}`}
        className="
          inline-flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          text-text-secondary
          transition
          hover:bg-error/5
          hover:text-error
        "
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function CouponStatus({ status }) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1.5 text-[10px] font-semibold text-success">
        <CheckCircle2 size={12} />
        Active
      </span>
    );
  }

  if (status === "Expired") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-1.5 text-[10px] font-semibold text-error">
        <XCircle size={12} />
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1.5 text-[10px] font-semibold text-text-secondary">
      Disabled
    </span>
  );
}

/* =========================================================
   INFO ITEM
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

function EmptyCoupons() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
        <Percent size={21} className="text-text-secondary" />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-text">No coupons found</h2>

      <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
        Try changing your search or filters.
      </p>
    </div>
  );
}

/* =========================================================
   DISCOUNT
========================================================= */

function formatDiscount(coupon) {
  if (coupon.type === "Percentage") {
    return `${coupon.value}% OFF`;
  }

  return `${formatCurrency(coupon.value)} OFF`;
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

export default AdminCoupons;
