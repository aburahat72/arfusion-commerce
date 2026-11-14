import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import ActivityFeed from "../../../components/admin/ActivityFeed";
import AdminStatCard from "../../../components/admin/AdminStatCard";
import LowStockProducts from "../../../components/admin/LowStockProducts";
import RecentOrders from "../../../components/admin/RecentOrders";
import SalesOverview from "../../../components/admin/SalesOverview";
import TopProducts from "../../../components/admin/TopProducts";
import { getAdminDashboard } from "../../../services/adminApi";

const DAY_MS = 24 * 60 * 60 * 1000;
const today = () => new Date().toISOString().slice(0, 10);
const dateDaysAgo = (days) =>
  new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);
const initialRange = { from: dateDaysAgo(29), to: today() };

function getPresetRange(preset) {
  const end = today();
  if (preset === "7") return { from: dateDaysAgo(6), to: end };
  if (preset === "90") return { from: dateDaysAgo(89), to: end };
  if (preset === "year") return { from: `${end.slice(0, 4)}-01-01`, to: end };
  return { from: dateDaysAgo(29), to: end };
}

function AdminDashboard() {
  const [range, setRange] = useState(initialRange);
  const [draftRange, setDraftRange] = useState(initialRange);
  const [preset, setPreset] = useState("30");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAdminDashboard(range, {
          signal: controller.signal,
        });
        if (!response?.success || !response.dashboard) {
          throw new Error(response?.message || "Dashboard data could not be loaded.");
        }
        setDashboard(response.dashboard);
      } catch (requestError) {
        if (requestError.name !== "CanceledError") {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Dashboard data could not be loaded.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadDashboard();
    return () => controller.abort();
  }, [range, refreshKey]);

  const applyCustomRange = (event) => {
    event.preventDefault();
    if (!draftRange.from || !draftRange.to || draftRange.from > draftRange.to) {
      setError("Choose a valid date range.");
      return;
    }

    const dayCount =
      (Date.parse(`${draftRange.to}T00:00:00Z`) -
        Date.parse(`${draftRange.from}T00:00:00Z`)) /
        DAY_MS +
      1;
    if (dayCount > 366) {
      setError("Date ranges cannot exceed 366 days.");
      return;
    }

    setPreset("custom");
    setRange(draftRange);
  };

  const selectPreset = (value) => {
    setPreset(value);
    if (value !== "custom") {
      const nextRange = getPresetRange(value);
      setDraftRange(nextRange);
      setRange(nextRange);
    }
  };

  const overview = dashboard?.overview;
  const comparisonLabel = `${getRangeDays(range)}-day comparison`;
  const stats = overview
    ? [
        {
          id: "revenue",
          title: "Paid revenue",
          value: formatCurrency(overview.revenue),
          change: overview.revenueChange,
          icon: "revenue",
          comparisonLabel,
        },
        {
          id: "orders",
          title: "Orders",
          value: formatNumber(overview.totalOrders),
          change: overview.ordersChange,
          icon: "orders",
          comparisonLabel,
        },
        {
          id: "customers",
          title: "New customers",
          value: formatNumber(overview.newCustomers),
          change: overview.customersChange,
          icon: "customers",
          comparisonLabel,
        },
        {
          id: "products",
          title: "Products",
          value: formatNumber(overview.totalProducts),
          detail: `${formatNumber(overview.totalCustomers)} customers in store`,
          icon: "products",
        },
      ]
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm text-text-secondary">Overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Store overview
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Live performance and operations for your store.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="grid gap-1 text-xs font-medium text-text-secondary">
            Period
            <span className="relative">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              />
              <select
                value={preset}
                onChange={(event) => selectPreset(event.target.value)}
                aria-label="Dashboard date preset"
                className="h-10 w-full appearance-none rounded-lg border border-outline-variant bg-surface pl-9 pr-3 text-sm text-text sm:w-44"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="year">Year to date</option>
                <option value="custom">Custom range</option>
              </select>
            </span>
          </label>

          <form
            onSubmit={applyCustomRange}
            className="flex flex-wrap items-end gap-2"
          >
            <DateField
              label="From"
              value={draftRange.from}
              max={draftRange.to || today()}
              onChange={(from) => {
                setPreset("custom");
                setDraftRange((current) => ({ ...current, from }));
              }}
            />
            <DateField
              label="To"
              value={draftRange.to}
              min={draftRange.from}
              max={today()}
              onChange={(to) => {
                setPreset("custom");
                setDraftRange((current) => ({ ...current, to }));
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Apply
            </button>
          </form>

          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
            aria-label="Refresh dashboard"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 text-sm font-medium text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !dashboard ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-surface-container"
            />
          ))}
        </div>
      ) : dashboard ? (
        <>
          <section
            aria-label="Dashboard statistics"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat) => (
              <AdminStatCard key={stat.id} {...stat} />
            ))}
          </section>

          {loading && (
            <p className="mt-3 text-right text-xs text-text-secondary" role="status">
              Updating dashboard…
            </p>
          )}

          <section
            aria-label="Sales and recent orders"
            className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(340px,0.85fr)]"
          >
            <SalesOverview data={dashboard.salesTrend} />
            <RecentOrders orders={dashboard.recentOrders} />
          </section>

          <section
            aria-label="Products and operations overview"
            className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
          >
            <TopProducts products={dashboard.topProducts} />
            <LowStockProducts products={dashboard.lowStockProducts} />
            <ActivityFeed orders={dashboard.recentOrders} />
          </section>

          <section className="mt-6">
            <OrdersByStatus data={dashboard.ordersByStatus} />
          </section>
        </>
      ) : (
        !loading && (
          <div className="rounded-2xl border border-outline-variant bg-surface p-8 text-center text-sm text-text-secondary">
            No dashboard data is available for this period.
          </div>
        )
      )}
    </div>
  );
}

function DateField({ label, value, min, max, onChange }) {
  return (
    <label className="grid gap-1 text-xs font-medium text-text-secondary">
      {label}
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-[118px] rounded-lg border border-outline-variant bg-surface px-2 text-sm text-text sm:w-[138px]"
      />
    </label>
  );
}

function OrdersByStatus({ data = [] }) {
  const colors = {
    Pending: "bg-orange-500",
    Processing: "bg-blue-500",
    Shipped: "bg-violet-500",
    Delivered: "bg-green-500",
    Cancelled: "bg-red-500",
  };
  const total = data.reduce((count, item) => count + item.count, 0);

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-text sm:text-lg">
            Order status
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            {formatNumber(total)} orders in the selected period
          </p>
        </div>
      </div>
      {data.length ? (
        <div className="space-y-4">
          {data.map(({ _id, count }) => (
            <div key={_id} className="grid grid-cols-[90px_minmax(0,1fr)_55px] items-center gap-3">
              <span className="truncate text-xs font-medium text-text-secondary">{_id}</span>
              <div
                className="h-2 overflow-hidden rounded-full bg-surface-container"
                role="img"
                aria-label={`${_id}: ${count} orders`}
              >
                <div
                  className={`h-full rounded-full ${colors[_id] || "bg-primary"}`}
                  style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-right text-xs font-semibold text-text">
                {formatNumber(count)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-5 text-center text-sm text-text-secondary">
          No orders in the selected period.
        </p>
      )}
    </section>
  );
}

function getRangeDays({ from, to }) {
  return Math.max(
    1,
    Math.round(
      (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
        DAY_MS,
    ) + 1,
  );
}

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default AdminDashboard;
