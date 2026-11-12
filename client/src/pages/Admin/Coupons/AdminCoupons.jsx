import {
  CheckCircle2,
  Edit3,
  Percent,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getCustomers } from "../../../services/adminApi";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupons,
  updateAdminCoupon,
} from "../../../services/couponService";
import { formatCurrency } from "../../../utils/currency";

const emptyForm = () => ({
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minimumOrderAmount: 0,
  maximumDiscount: 0,
  usageLimit: 0,
  expiresAt: toLocalDateTime(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  isActive: true,
  isPublic: true,
  assignedCustomers: [],
});

function toLocalDateTime(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getCouponStatus(coupon) {
  if (new Date(coupon.expiresAt) <= new Date()) return "Expired";
  return coupon.isActive ? "Active" : "Disabled";
}

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [couponResult, customerResult] = await Promise.allSettled([
        getAdminCoupons(),
        getCustomers(),
      ]);
      if (couponResult.status === "rejected") throw couponResult.reason;
      setCoupons(couponResult.value);
      if (customerResult.status === "fulfilled") {
        setCustomers(customerResult.value.data?.customers || []);
      } else {
        console.error("Unable to load coupon customer assignments:", customerResult.reason);
        setErrorMessage("Customer list is unavailable; private coupon assignments may not be editable.");
      }
    } catch (error) {
      console.error("Unable to load coupon management data:", error);
      setErrorMessage(
        error?.response?.data?.message || error.message || "Unable to load coupons.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getAdminCoupons(), getCustomers()]).then(
      ([couponResult, customerResult]) => {
        if (!active) return;
        if (couponResult.status === "fulfilled") {
          setCoupons(couponResult.value);
        } else {
          console.error("Unable to load coupons:", couponResult.reason);
          setErrorMessage(
            couponResult.reason?.response?.data?.message ||
              couponResult.reason?.message ||
              "Unable to load coupons.",
          );
        }
        if (customerResult.status === "fulfilled") {
          setCustomers(customerResult.value.data?.customers || []);
        } else {
          console.error(
            "Unable to load coupon customer assignments:",
            customerResult.reason,
          );
        }
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();
    return coupons.filter((coupon) => {
      const couponStatus = getCouponStatus(coupon);
      const matchesSearch =
        !query ||
        coupon.code.toLowerCase().includes(query) ||
        (coupon.description || "").toLowerCase().includes(query);
      return (
        matchesSearch &&
        (status === "All" || couponStatus === status) &&
        (type === "All" ||
          coupon.discountType ===
            (type === "Percentage" ? "PERCENTAGE" : "FIXED"))
      );
    });
  }, [coupons, search, status, type]);

  const activeCount = coupons.filter(
    (coupon) => getCouponStatus(coupon) === "Active",
  ).length;
  const expiredCount = coupons.filter(
    (coupon) => getCouponStatus(coupon) === "Expired",
  ).length;
  const totalUsage = coupons.reduce(
    (sum, coupon) => sum + Number(coupon.usedCount || 0),
    0,
  );

  const openEditor = (coupon = null) => {
    setErrorMessage("");
    setEditor(coupon || {});
    if (!coupon) {
      setForm(emptyForm());
      return;
    }
    setForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "PERCENTAGE",
      discountValue: coupon.discountValue ?? "",
      minimumOrderAmount: coupon.minimumOrderAmount ?? 0,
      maximumDiscount: coupon.maximumDiscount ?? 0,
      usageLimit: coupon.usageLimit ?? 0,
      expiresAt: toLocalDateTime(new Date(coupon.expiresAt)),
      isActive: coupon.isActive,
      isPublic: coupon.isPublic !== false,
      assignedCustomers: (coupon.assignedCustomers || []).map((customer) =>
        typeof customer === "string" ? customer : customer._id,
      ),
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrorMessage("");
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        minimumOrderAmount: Number(form.minimumOrderAmount),
        maximumDiscount: Number(form.maximumDiscount),
        usageLimit: Number(form.usageLimit),
        expiresAt: new Date(form.expiresAt).toISOString(),
        assignedCustomers: form.isPublic ? [] : form.assignedCustomers,
      };
      if (editor?._id) {
        await updateAdminCoupon(editor._id, payload);
      } else {
        await createAdminCoupon(payload);
      }
      setEditor(null);
      await loadData();
    } catch (error) {
      console.error("Unable to save coupon:", error);
      setErrorMessage(
        error?.response?.data?.message || error.message || "Unable to save coupon.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await updateAdminCoupon(coupon._id, { isActive: !coupon.isActive });
      await loadData();
    } catch (error) {
      console.error("Unable to change coupon status:", error);
      setErrorMessage(
        error?.response?.data?.message || error.message || "Unable to update coupon.",
      );
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await deleteAdminCoupon(coupon._id);
      setCoupons((current) =>
        current.filter((entry) => entry._id !== coupon._id),
      );
    } catch (error) {
      console.error("Unable to delete coupon:", error);
      setErrorMessage(
        error?.response?.data?.message || error.message || "Unable to delete coupon.",
      );
    }
  };

  const updateForm = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
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
              onClick={() => openEditor()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              <Plus size={18} />
              Create Coupon
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CouponStat title="Total Coupons" value={coupons.length} icon={<Percent size={20} />} />
          <CouponStat title="Active" value={activeCount} icon={<CheckCircle2 size={20} />} />
          <CouponStat title="Expired" value={expiredCount} icon={<XCircle size={20} />} />
          <CouponStat title="Total Uses" value={totalUsage.toLocaleString("en-IN")} icon={<span className="text-lg font-bold">#</span>} />
        </section>

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search coupon code or description..."
                className="h-11 w-full rounded-xl border border-outline-variant bg-surface pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-xl border border-outline-variant bg-surface px-3 text-sm text-text"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Disabled">Disabled</option>
            </select>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-11 rounded-xl border border-outline-variant bg-surface px-3 text-sm text-text"
            >
              <option value="All">All Types</option>
              <option value="Percentage">Percentage</option>
              <option value="Fixed">Fixed Amount</option>
            </select>
          </div>
        </section>

        <div className="mt-5">
          <p className="text-sm text-text-secondary">
            Showing <span className="font-semibold text-text">{filteredCoupons.length}</span> coupons
          </p>
        </div>

        <section className="mt-4 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/60">
                  {["Coupon", "Discount", "Minimum", "Usage", "Expires", "Status", "Actions"].map((heading) => (
                    <th key={heading} className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <CouponRow
                    key={coupon._id}
                    coupon={coupon}
                    onEdit={openEditor}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {loading && <p className="p-8 text-center text-sm text-text-secondary">Loading coupons...</p>}
          {!loading && filteredCoupons.length === 0 && <EmptyCoupons />}
        </section>

        <section className="mt-4 space-y-3 md:hidden">
          {filteredCoupons.map((coupon) => (
            <CouponCard
              key={coupon._id}
              coupon={coupon}
              onEdit={openEditor}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
          {loading && <p className="p-8 text-center text-sm text-text-secondary">Loading coupons...</p>}
          {!loading && filteredCoupons.length === 0 && <EmptyCoupons />}
        </section>
      </div>

      {editor !== null && (
        <CouponEditor
          coupon={editor?._id ? editor : null}
          form={form}
          customers={customers}
          saving={saving}
          errorMessage={errorMessage}
          updateForm={updateForm}
          onClose={() => {
            setEditor(null);
            setErrorMessage("");
          }}
          onSave={handleSave}
        />
      )}
    </main>
  );
}

function CouponEditor({ coupon, form, customers, saving, errorMessage, updateForm, onClose, onSave }) {
  const fieldClass = "mt-1 h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm text-text";
  const numberField = (label, field, min = 0) => (
    <label className="text-xs font-medium text-text-secondary">
      {label}
      <input
        className={fieldClass}
        type="number"
        min={min}
        step="0.01"
        value={form[field]}
        onChange={(event) => updateForm(field, event.target.value)}
        required={field === "discountValue"}
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={onSave} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text">{coupon ? "Edit Coupon" : "Create Coupon"}</h2>
          <button type="button" onClick={onClose} aria-label="Close coupon form" className="rounded-lg p-2 hover:bg-surface-container">
            <X size={18} />
          </button>
        </div>
        {errorMessage && <p className="mb-4 rounded-lg bg-error/5 p-3 text-sm text-error">{errorMessage}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-text-secondary">
            Coupon code
            <input className={fieldClass} value={form.code} onChange={(event) => updateForm("code", event.target.value)} minLength={3} maxLength={20} required />
          </label>
          <label className="text-xs font-medium text-text-secondary">
            Discount type
            <select className={fieldClass} value={form.discountType} onChange={(event) => updateForm("discountType", event.target.value)}>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed amount</option>
            </select>
          </label>
          {numberField(form.discountType === "PERCENTAGE" ? "Discount percent" : "Discount amount", "discountValue", 0.01)}
          {numberField("Minimum order amount", "minimumOrderAmount")}
          {form.discountType === "PERCENTAGE" && numberField("Maximum discount (0 = unlimited)", "maximumDiscount")}
          {numberField("Usage limit (0 = unlimited)", "usageLimit")}
          <label className="text-xs font-medium text-text-secondary">
            Expiry date
            <input className={fieldClass} type="datetime-local" value={form.expiresAt} onChange={(event) => updateForm("expiresAt", event.target.value)} required />
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-text">
            <input type="checkbox" checked={form.isActive} onChange={(event) => updateForm("isActive", event.target.checked)} />
            Active
          </label>
          <label className="text-xs font-medium text-text-secondary sm:col-span-2">
            Description
            <input className={fieldClass} maxLength={200} value={form.description} onChange={(event) => updateForm("description", event.target.value)} />
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-xs font-medium text-text-secondary">Who can use this coupon?</legend>
            <div className="flex gap-5 text-sm text-text">
              <label className="flex items-center gap-2">
                <input type="radio" checked={form.isPublic} onChange={() => updateForm("isPublic", true)} />
                Public
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={!form.isPublic} onChange={() => updateForm("isPublic", false)} />
                Assigned customers only
              </label>
            </div>
          </fieldset>
          {!form.isPublic && (
            <label className="text-xs font-medium text-text-secondary sm:col-span-2">
              Assigned customers (Ctrl/Cmd-click to select multiple)
              <select
                multiple
                required
                className="mt-1 min-h-32 w-full rounded-lg border border-outline-variant bg-surface p-2 text-sm text-text"
                value={form.assignedCustomers}
                onChange={(event) =>
                  updateForm(
                    "assignedCustomers",
                    Array.from(event.target.selectedOptions, (option) => option.value),
                  )
                }
              >
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.fullName} ({customer.email})
                  </option>
                ))}
              </select>
              {customers.length === 0 && <span className="mt-1 block text-error">No customer accounts are available to assign.</span>}
            </label>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-outline-variant px-4 text-sm font-medium text-text">Cancel</button>
          <button type="submit" disabled={saving} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving..." : coupon ? "Save Changes" : "Create Coupon"}
          </button>
        </div>
      </form>
    </div>
  );
}

function CouponStat({ title, value, icon }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">{icon}</div>
        <div>
          <p className="text-xs text-text-secondary">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-text">{value}</p>
        </div>
      </div>
    </article>
  );
}

function CouponRow({ coupon, onEdit, onToggle, onDelete }) {
  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-primary">{coupon.code}</p>
        <p className="mt-1 max-w-xs truncate text-xs text-text-secondary">{coupon.description || (coupon.isPublic ? "Public coupon" : "Customer-specific coupon")}</p>
        <p className="mt-1 text-[10px] font-medium text-text-secondary">
          {coupon.isPublic === false
            ? `Private · ${(coupon.assignedCustomers || []).length} assigned`
            : "Public"}
        </p>
      </td>
      <td className="px-5 py-4 text-sm font-semibold text-text">{formatDiscount(coupon)}</td>
      <td className="px-5 py-4 text-sm text-text-secondary">{formatCurrency(coupon.minimumOrderAmount)}</td>
      <td className="px-5 py-4 text-sm text-text-secondary">
        {coupon.usedCount || 0} / {coupon.usageLimit || "∞"}
      </td>
      <td className="px-5 py-4 text-sm text-text-secondary">{new Date(coupon.expiresAt).toLocaleDateString()}</td>
      <td className="px-5 py-4"><CouponStatus status={getCouponStatus(coupon)} /></td>
      <td className="px-5 py-4">
        <CouponActions coupon={coupon} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function CouponCard({ coupon, onEdit, onToggle, onDelete }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">{coupon.code}</p>
          <p className="mt-1 text-xs text-text-secondary">{coupon.description || (coupon.isPublic ? "Public coupon" : "Customer-specific coupon")}</p>
          <p className="mt-1 text-[10px] font-medium text-text-secondary">
            {coupon.isPublic === false
              ? `Private · ${(coupon.assignedCustomers || []).length} assigned`
              : "Public"}
          </p>
        </div>
        <CouponStatus status={getCouponStatus(coupon)} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <span>Discount: {formatDiscount(coupon)}</span>
        <span>Minimum: {formatCurrency(coupon.minimumOrderAmount)}</span>
        <span>Usage: {coupon.usedCount || 0} / {coupon.usageLimit || "∞"}</span>
        <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
      </div>
      <div className="mt-4"><CouponActions coupon={coupon} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} /></div>
    </article>
  );
}

function CouponActions({ coupon, onEdit, onToggle, onDelete }) {
  return (
    <div className="flex justify-end gap-1">
      <button type="button" onClick={() => onEdit(coupon)} aria-label={`Edit ${coupon.code}`} className="rounded-lg p-2 text-text-secondary hover:bg-surface-container hover:text-primary"><Edit3 size={16} /></button>
      <button type="button" onClick={() => onToggle(coupon)} aria-label={`${coupon.isActive ? "Deactivate" : "Activate"} ${coupon.code}`} className="rounded-lg px-2 text-xs font-medium text-text-secondary hover:bg-surface-container">
        {coupon.isActive ? "Deactivate" : "Activate"}
      </button>
      <button type="button" onClick={() => onDelete(coupon)} aria-label={`Delete ${coupon.code}`} className="rounded-lg p-2 text-text-secondary hover:bg-error/5 hover:text-error"><Trash2 size={16} /></button>
    </div>
  );
}

function CouponStatus({ status }) {
  if (status === "Active") {
    return <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1.5 text-[10px] font-semibold text-success"><CheckCircle2 size={12} />Active</span>;
  }
  if (status === "Expired") {
    return <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2.5 py-1.5 text-[10px] font-semibold text-error"><XCircle size={12} />Expired</span>;
  }
  return <span className="rounded-full bg-surface-container px-2.5 py-1.5 text-[10px] font-semibold text-text-secondary">Disabled</span>;
}

function EmptyCoupons() {
  return <div className="py-10 text-center text-sm text-text-secondary">No coupons found.</div>;
}

function formatDiscount(coupon) {
  return coupon.discountType === "PERCENTAGE"
    ? `${coupon.discountValue}% OFF`
    : `${formatCurrency(coupon.discountValue)} OFF`;
}

export default AdminCoupons;
