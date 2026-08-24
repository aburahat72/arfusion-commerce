import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  CircleDollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { salesData } from "../../../data/adminDashboard";

function AdminAnalytics() {
  const periods = Object.keys(salesData);

  const [period, setPeriod] = useState(
    periods.includes("Last 30 Days") ? "Last 30 Days" : periods[0],
  );

  const analytics = useMemo(() => {
    const data = salesData[period] || salesData[periods[0]];

    return buildAnalytics(data);
  }, [period, periods]);

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-text-secondary">Analytics</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Analytics Overview
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Monitor sales, orders, customers and store performance.
            </p>
          </div>

          {/* Period */}

          <div className="relative">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              aria-label="Analytics period"
              className="
                h-11
                appearance-none
                rounded-xl
                border
                border-outline-variant
                bg-surface
                py-2
                pl-3
                pr-9
                text-sm
                font-medium
                text-text
                outline-none
                transition
                hover:border-outline
                focus:border-primary
                focus:ring-2
                focus:ring-primary/15
              "
            >
              {periods.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
          </div>
        </div>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsStat
            title="Revenue"
            value={formatCurrency(analytics.totalRevenue)}
            change="12.5%"
            positive
            icon={<CircleDollarSign size={21} />}
            iconClass="bg-primary-container text-primary"
          />

          <AnalyticsStat
            title="Orders"
            value={analytics.totalOrders.toLocaleString("en-IN")}
            change="8.3%"
            positive
            icon={<ShoppingCart size={21} />}
            iconClass="bg-blue-100 text-blue-600"
          />

          <AnalyticsStat
            title="Average Order Value"
            value={formatCurrency(analytics.averageOrderValue)}
            change="6.8%"
            positive
            icon={<BarChart3 size={21} />}
            iconClass="bg-violet-100 text-violet-600"
          />

          <AnalyticsStat
            title="Conversion Trend"
            value="4.8%"
            change="2.1%"
            positive
            icon={<TrendingUp size={21} />}
            iconClass="bg-green-100 text-green-600"
          />
        </section>

        {/* =================================================
            REVENUE + ORDERS
        ================================================= */}

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
          <RevenueChart data={analytics} period={period} />

          <OrderPerformance data={analytics} />
        </section>

        {/* =================================================
            LOWER ANALYTICS
        ================================================= */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <TrafficOverview />

          <CustomerGrowth />

          <TopCategories />
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   ANALYTICS STAT
========================================================= */

function AnalyticsStat({ title, value, change, positive, icon, iconClass }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-text-secondary">{title}</p>

          <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-text">
            {value}
          </p>

          <div className="mt-2 flex items-center gap-1.5">
            {positive ? (
              <ArrowUpRight size={14} className="text-success" />
            ) : (
              <ArrowDownRight size={14} className="text-error" />
            )}

            <span
              className={
                positive
                  ? "text-xs font-semibold text-success"
                  : "text-xs font-semibold text-error"
              }
            >
              {change}
            </span>

            <span className="text-xs text-text-secondary">
              vs previous period
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   REVENUE CHART
========================================================= */

function RevenueChart({ data, period }) {
  const revenuePoints = createPoints(data.revenue);

  const ordersPoints = createPoints(data.orders);

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text sm:text-lg">
            Revenue & Orders
          </h2>

          <p className="mt-1 text-xs text-text-secondary">
            Performance for {period.toLowerCase()}.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Legend dotClass="bg-primary" label="Revenue" />

          <Legend dotClass="bg-blue-500" label="Orders" />
        </div>
      </div>

      <div className="mt-5 h-[300px] overflow-hidden rounded-xl bg-background sm:h-[340px]">
        <AnalyticsChart
          revenue={revenuePoints}
          orders={ordersPoints}
          labels={data.labels}
        />
      </div>
    </section>
  );
}

function AnalyticsChart({ revenue, orders, labels }) {
  return (
    <div className="relative h-full w-full">
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-3 py-5">
        {[0, 1, 2, 3, 4].map((line) => (
          <div key={line} className="border-t border-outline-variant/60" />
        ))}
      </div>

      <svg
        viewBox="0 0 1000 250"
        preserveAspectRatio="none"
        className="relative h-full w-full"
        role="img"
        aria-label="Revenue and orders chart"
      >
        <polyline
          points={revenue}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />

        <polyline
          points={orders}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-500"
        />
      </svg>

      <div className="absolute bottom-2 left-4 right-4 flex justify-between gap-2 overflow-hidden text-[9px] text-text-secondary sm:text-[10px]">
        {labels.map((label, index) => (
          <span key={`${label}-${index}`} className="whitespace-nowrap">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   ORDER PERFORMANCE
========================================================= */

function OrderPerformance({ data }) {
  const highestOrders = Math.max(...data.orders, 0);

  const lowestOrders = Math.min(...data.orders, 0);

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold text-text sm:text-lg">
        Order Performance
      </h2>

      <p className="mt-1 text-xs text-text-secondary">
        Order activity for the selected period.
      </p>

      <div className="mt-6 space-y-5">
        <MetricRow label="Total Orders" value={data.totalOrders} />

        <MetricRow label="Highest Day" value={highestOrders} />

        <MetricRow label="Lowest Day" value={lowestOrders} />

        <MetricRow
          label="Average Daily Orders"
          value={Math.round(data.totalOrders / Math.max(data.orders.length, 1))}
        />
      </div>

      <div className="mt-6 rounded-xl bg-primary-container p-4">
        <div className="flex items-center gap-2 text-primary">
          <TrendingUp size={17} />

          <p className="text-xs font-semibold">Positive sales trend</p>
        </div>

        <p className="mt-2 text-xs leading-5 text-text-secondary">
          Your order volume is showing steady activity across the selected
          period.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   TRAFFIC
========================================================= */

function TrafficOverview() {
  const channels = [
    {
      label: "Organic Search",
      value: 42,
    },
    {
      label: "Direct",
      value: 28,
    },
    {
      label: "Social",
      value: 18,
    },
    {
      label: "Referral",
      value: 12,
    },
  ];

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold text-text sm:text-lg">
        Traffic Sources
      </h2>

      <p className="mt-1 text-xs text-text-secondary">
        How customers discover your store.
      </p>

      <div className="mt-5 space-y-4">
        {channels.map((channel) => (
          <div key={channel.label}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-text-secondary">{channel.label}</span>

              <span className="font-semibold text-text">{channel.value}%</span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${channel.value}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   CUSTOMER GROWTH
========================================================= */

function CustomerGrowth() {
  const months = [
    {
      month: "Jan",
      value: 320,
    },
    {
      month: "Feb",
      value: 410,
    },
    {
      month: "Mar",
      value: 465,
    },
    {
      month: "Apr",
      value: 530,
    },
    {
      month: "May",
      value: 625,
    },
    {
      month: "Jun",
      value: 710,
    },
  ];

  const max = Math.max(...months.map((item) => item.value));

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold text-text sm:text-lg">
        Customer Growth
      </h2>

      <p className="mt-1 text-xs text-text-secondary">
        New customer registrations.
      </p>

      <div className="mt-6 flex h-44 items-end gap-3">
        {months.map((item) => (
          <div
            key={item.month}
            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-[10px] font-semibold text-text-secondary">
              {item.value}
            </span>

            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-lg bg-primary"
                style={{
                  height: `${(item.value / max) * 100}%`,
                }}
              />
            </div>

            <span className="text-[10px] text-text-secondary">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   TOP CATEGORIES
========================================================= */

function TopCategories() {
  const categories = [
    {
      name: "Electronics",
      value: 38,
    },
    {
      name: "Fashion",
      value: 27,
    },
    {
      name: "Accessories",
      value: 19,
    },
    {
      name: "Home",
      value: 10,
    },
    {
      name: "Other",
      value: 6,
    },
  ];

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold text-text sm:text-lg">
        Top Categories
      </h2>

      <p className="mt-1 text-xs text-text-secondary">
        Revenue contribution by category.
      </p>

      <div className="mt-5 space-y-4">
        {categories.map((category) => (
          <div key={category.name} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-xs font-semibold text-primary">
              {category.value}%
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-xs font-medium text-text">
                  {category.name}
                </span>

                <span className="text-xs font-semibold text-text">
                  {category.value}%
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${category.value}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function Legend({ dotClass, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />

      <span className="text-[10px] text-text-secondary sm:text-xs">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   METRIC
========================================================= */

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-text-secondary">{label}</span>

      <span className="text-sm font-semibold text-text">
        {Number(value).toLocaleString("en-IN")}
      </span>
    </div>
  );
}

/* =========================================================
   ANALYTICS DATA
========================================================= */

function buildAnalytics(data) {
  const revenue = Array.isArray(data?.revenue) ? data.revenue.map(Number) : [];

  const orders = Array.isArray(data?.orders) ? data.orders.map(Number) : [];

  const labels = Array.isArray(data?.labels) ? data.labels : [];

  const totalRevenue = revenue.reduce(
    (sum, value) => sum + (Number.isFinite(value) ? value : 0),
    0,
  );

  const totalOrders = orders.reduce(
    (sum, value) => sum + (Number.isFinite(value) ? value : 0),
    0,
  );

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    labels,
    revenue,
    orders,
    totalRevenue,
    totalOrders,
    averageOrderValue,
  };
}

/* =========================================================
   CHART POINTS
========================================================= */

function createPoints(values) {
  if (!values.length) {
    return "";
  }

  const width = 1000;
  const height = 250;

  const paddingX = 25;
  const paddingY = 25;

  const min = Math.min(...values);
  const max = Math.max(...values);

  const usableWidth = width - paddingX * 2;

  const usableHeight = height - paddingY * 2;

  return values
    .map((value, index) => {
      const x =
        paddingX + (index / Math.max(values.length - 1, 1)) * usableWidth;

      const normalized = (value - min) / Math.max(max - min, 1);

      const y = height - paddingY - normalized * usableHeight;

      return `${x},${y}`;
    })
    .join(" ");
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

export default AdminAnalytics;
