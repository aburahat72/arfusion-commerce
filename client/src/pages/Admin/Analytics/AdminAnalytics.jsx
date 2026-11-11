import { useEffect, useState } from "react";
import {
  AlertCircle,
  ChartNoAxesCombined,
  CircleDollarSign,
  PackageCheck,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";
import { getAdminAnalytics } from "../../../services/adminApi";

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (days) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

function AdminAnalytics() {
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(today());
  const [appliedRange, setAppliedRange] = useState({ from: daysAgo(29), to: today() });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAdminAnalytics(appliedRange, {
          signal: controller.signal,
        });
        if (!response?.success) {
          throw new Error(response?.message || "Analytics could not be loaded.");
        }
        setAnalytics(response);
      } catch (requestError) {
        if (requestError.name !== "CanceledError") {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Analytics could not be loaded.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadAnalytics();
    return () => controller.abort();
  }, [appliedRange]);

  const applyRange = (event) => {
    event.preventDefault();
    if (!from || !to || from > to) {
      setError("Choose a valid date range.");
      return;
    }
    setAppliedRange({ from, to });
  };

  const overview = analytics?.overview;
  const inventory = analytics?.inventory;
  const returns = analytics?.returns;
  const refunds = analytics?.refunds;

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-text-secondary">Admin / Analytics</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Store analytics
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Live sales, customer, inventory, return, and refund data.
            </p>
          </div>
          <form onSubmit={applyRange} className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-xs font-medium text-text-secondary">
              From
              <input
                type="date"
                value={from}
                max={to || today()}
                onChange={(event) => setFrom(event.target.value)}
                className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-text-secondary">
              To
              <input
                type="date"
                value={to}
                min={from}
                max={today()}
                onChange={(event) => setTo(event.target.value)}
                className="h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm text-text"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Apply
            </button>
          </form>
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

        {loading && !analytics ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-surface-container"
              />
            ))}
          </div>
        ) : analytics ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Net recognized revenue"
                value={formatCurrency(overview.revenue)}
                icon={CircleDollarSign}
              />
              <StatCard
                title="Orders placed"
                value={formatNumber(overview.totalOrders)}
                detail={`${formatNumber(overview.paidOrders)} paid`}
                icon={ShoppingCart}
              />
              <StatCard
                title="Average paid order"
                value={formatCurrency(overview.averageOrderValue)}
                icon={ChartNoAxesCombined}
              />
              <StatCard
                title="Customers"
                value={formatNumber(overview.totalCustomers)}
                detail={`${formatNumber(overview.newCustomers)} new in range`}
                icon={Users}
              />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
              <Panel title="Daily sales trend">
                <SalesTrend data={analytics.salesTrend} />
              </Panel>
              <Panel title="Inventory overview">
                <div className="grid grid-cols-2 gap-3">
                  <NumberTile label="Products" value={inventory.totalProducts} />
                  <NumberTile label="Active" value={inventory.activeProducts} />
                  <NumberTile label="Units in stock" value={inventory.unitsInStock} />
                  <NumberTile label="Low stock (≤ 10)" value={inventory.lowStockProducts} />
                  <NumberTile label="Out of stock" value={inventory.outOfStockProducts} />
                </div>
              </Panel>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              <Panel title="Top products by paid sales">
                <DataTable
                  empty="No paid product sales in this date range."
                  columns={["Product", "Units", "Revenue"]}
                  rows={analytics.topProducts.map((item) => [
                    item.name,
                    formatNumber(item.quantitySold),
                    formatCurrency(item.revenue),
                  ])}
                />
              </Panel>
              <Panel title="Top customers by paid spend">
                <DataTable
                  empty="No paid customer orders in this date range."
                  columns={["Customer", "Orders", "Spend"]}
                  rows={analytics.topCustomers.map((item) => [
                    item.fullName,
                    formatNumber(item.totalOrders),
                    formatCurrency(item.totalSpent),
                  ])}
                />
              </Panel>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-3">
              <Panel title="Returns">
                <div className="space-y-3">
                  <Metric label="Total requests" value={returns.total} />
                  {Object.entries(returns)
                    .filter(([status]) => status !== "total")
                    .map(([status, value]) => (
                      <Metric key={status} label={status} value={value} />
                    ))}
                </div>
              </Panel>
              <Panel title="Refunds">
                <div className="space-y-3">
                  <Metric label="Completed refunds" value={refunds.count} />
                  <Metric label="Refunded amount" value={formatCurrency(refunds.total)} />
                </div>
              </Panel>
              <Panel title="Revenue by payment method">
                <div className="space-y-3">
                  {analytics.paymentMethods.length ? (
                    analytics.paymentMethods.map((item) => (
                      <Metric
                        key={item._id || "unknown"}
                        label={item._id || "Other"}
                        value={formatCurrency(item.revenue)}
                      />
                    ))
                  ) : (
                    <EmptyState message="No paid orders in this date range." />
                  )}
                  <Metric label="Cancelled orders" value={overview.cancelledOrders} />
                </div>
              </Panel>
            </section>

            <section className="mt-6">
              <Panel title="Products requiring attention">
                <DataTable
                  empty="No products are at or below the low-stock threshold."
                  columns={["Product", "Stock", "Availability"]}
                  rows={inventory.lowStockItems.map((item) => [
                    item.name,
                    formatNumber(item.stock),
                    item.isActive ? "Active" : "Inactive",
                  ])}
                />
              </Panel>
            </section>
          </>
        ) : (
          !loading && (
            <EmptyState message="No analytics data is available for this range." />
          )
        )}
      </div>
    </main>
  );
}

function StatCard({ title, value, detail, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-text-secondary">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
          {detail && <p className="mt-1 text-xs text-text-secondary">{detail}</p>}
        </div>
        <span className="rounded-xl bg-primary-container p-3 text-primary">
          <Icon size={20} />
        </span>
      </div>
    </article>
  );
}

function Panel({ title, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-text">{title}</h2>
      {children}
    </section>
  );
}

function SalesTrend({ data }) {
  if (!data?.length) return <EmptyState message="No order activity in this range." />;
  const width = Math.max(data.length * 12, 640);
  const height = 220;
  const max = Math.max(...data.map((point) => point.revenue), 1);
  const points = data
    .map((point, index) => {
      const x = 8 + (index / Math.max(data.length - 1, 1)) * (width - 16);
      const y = height - 12 - (point.revenue / max) * (height - 24);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Daily recognized revenue trend"
        className="h-56 min-w-full text-primary"
        style={{ width }}
      >
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="0"
            x2={width}
            y1={12 + line * 64}
            y2={12 + line * 64}
            stroke="currentColor"
            opacity="0.12"
          />
        ))}
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-text-secondary">
        <span>{formatDate(data[0].date)}</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
      </div>
      <div className="mt-4 max-h-40 overflow-auto">
        <DataTable
          empty=""
          columns={["Date", "Orders", "Revenue"]}
          rows={data.map((point) => [
            formatDate(point.date),
            formatNumber(point.orders),
            formatCurrency(point.revenue),
          ])}
        />
      </div>
    </div>
  );
}

function DataTable({ columns, rows, empty }) {
  if (!rows.length) return <EmptyState message={empty} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="text-xs text-text-secondary">
          <tr>{columns.map((column) => <th key={column} className="pb-3 pr-4 font-medium">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`} className="text-text">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-3 pr-4">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NumberTile({ label, value }) {
  return (
    <div className="rounded-xl bg-background p-3">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text">{formatNumber(value)}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-text">{value}</span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-text-secondary">
      <PackageCheck size={17} />
      {message}
    </div>
  );
}

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default AdminAnalytics;
