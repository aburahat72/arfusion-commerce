import { ChevronDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { salesData } from "../../data/adminDashboard";

const periods = Object.keys(salesData);

function SalesOverview() {
  const [period, setPeriod] = useState(
    periods.includes("Last 30 Days") ? "Last 30 Days" : periods[0],
  );

  /*
   * Select the data for the currently selected period.
   */
  const chartData = useMemo(() => {
    const selectedData = salesData[period] || {};

    return buildChartData(selectedData);
  }, [period]);

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-text sm:text-lg">
              Sales Overview
            </h3>

            <span className="hidden items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success sm:inline-flex">
              <TrendingUp size={12} />
              Growing
            </span>
          </div>

          {/* Legend */}

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Legend dotClass="bg-primary" label="Revenue (₹)" />

            <Legend dotClass="bg-blue-500" label="Orders" />
          </div>
        </div>

        {/* =================================================
            PERIOD SELECTOR
        ================================================= */}

        <div className="relative shrink-0">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Sales period"
            className="
              h-10
              appearance-none
              rounded-xl
              border
              border-outline-variant
              bg-surface
              py-2
              pl-3
              pr-9
              text-xs
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
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-sm">
        <SummaryItem
          label="Revenue"
          value={formatCurrency(chartData.totalRevenue)}
          accent="text-primary"
        />

        <SummaryItem
          label="Orders"
          value={chartData.totalOrders.toLocaleString("en-IN")}
          accent="text-blue-600"
        />
      </div>

      {/* =================================================
          CHART
      ================================================= */}

      <div className="mt-5">
        <SalesChart data={chartData} period={period} />
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

      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({ label, value, accent }) {
  return (
    <div className="rounded-xl bg-surface-container px-3.5 py-3">
      <p className="text-[11px] text-text-secondary">{label}</p>

      <p className={`mt-1 text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

/* =========================================================
   SALES CHART
========================================================= */

function SalesChart({ data, period }) {
  if (!data.revenue.length || !data.orders.length) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl bg-surface-container text-sm text-text-secondary sm:h-[320px]">
        No sales data available.
      </div>
    );
  }

  const revenuePoints = createPoints(data.revenue);

  const orderPoints = createPoints(data.orders);

  const revenueArea = createAreaPoints(data.revenue);

  const orderArea = createAreaPoints(data.orders);

  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-xl bg-background sm:h-[320px]">
      {/* =================================================
          GRID
      ================================================= */}

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-2 py-5">
        {[0, 1, 2, 3, 4].map((line) => (
          <div key={line} className="border-t border-outline-variant/60" />
        ))}
      </div>

      {/* =================================================
          Y AXIS
      ================================================= */}

      <div className="pointer-events-none absolute bottom-8 left-2 top-4 flex flex-col justify-between text-[9px] text-text-secondary sm:text-[10px]">
        {data.yLabels.map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>

      {/* =================================================
          CHART
      ================================================= */}

      <svg
        viewBox="0 0 1000 250"
        preserveAspectRatio="none"
        className="relative h-full w-full pl-7"
        role="img"
        aria-label={`Sales overview for ${period}`}
      >
        {/* Revenue area */}

        <polygon
          points={revenueArea}
          fill="currentColor"
          opacity="0.08"
          className="text-primary"
        />

        {/* Orders area */}

        <polygon
          points={orderArea}
          fill="currentColor"
          opacity="0.05"
          className="text-blue-500"
        />

        {/* Revenue line */}

        <polyline
          points={revenuePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />

        {/* Orders line */}

        <polyline
          points={orderPoints}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-500"
        />

        {/* Revenue points */}

        {createDots(data.revenue, "text-primary")}

        {/* Order points */}

        {createDots(data.orders, "text-blue-500")}
      </svg>

      {/* =================================================
          X AXIS
      ================================================= */}

      <div className="absolute bottom-2 left-10 right-3 flex justify-between gap-2 overflow-hidden text-[9px] text-text-secondary sm:text-[10px]">
        {data.labels.map((label, index) => (
          <span key={`${label}-${index}`} className="whitespace-nowrap">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   CHART DATA
========================================================= */

function buildChartData(data) {
  const revenue = Array.isArray(data.revenue) ? data.revenue : [];

  const orders = Array.isArray(data.orders) ? data.orders : [];

  const labels = Array.isArray(data.labels) ? data.labels : [];

  const totalRevenue = revenue.reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  const totalOrders = orders.reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  const maxRevenue = Math.max(...revenue, 0);

  return {
    labels,
    revenue,
    orders,
    totalRevenue,
    totalOrders,
    yLabels: buildYAxisLabels(maxRevenue),
  };
}

/* =========================================================
   LINE POINTS
========================================================= */

function createPoints(values) {
  if (!values.length) {
    return "";
  }

  const width = 1000;
  const height = 250;

  const paddingX = 20;
  const paddingY = 20;

  const max = Math.max(...values);
  const min = Math.min(...values);

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
   AREA POINTS
========================================================= */

function createAreaPoints(values) {
  if (!values.length) {
    return "";
  }

  const width = 1000;
  const height = 250;

  const paddingX = 20;
  const paddingY = 20;

  const max = Math.max(...values);
  const min = Math.min(...values);

  const usableWidth = width - paddingX * 2;

  const usableHeight = height - paddingY * 2;

  const points = values.map((value, index) => {
    const x = paddingX + (index / Math.max(values.length - 1, 1)) * usableWidth;

    const normalized = (value - min) / Math.max(max - min, 1);

    const y = height - paddingY - normalized * usableHeight;

    return `${x},${y}`;
  });

  return [
    `${paddingX},${height - paddingY}`,
    ...points,
    `${width - paddingX},${height - paddingY}`,
  ].join(" ");
}

/* =========================================================
   CHART DOTS
========================================================= */

function createDots(values, className) {
  if (!values.length) {
    return null;
  }

  const width = 1000;
  const height = 250;

  const paddingX = 20;
  const paddingY = 20;

  const max = Math.max(...values);
  const min = Math.min(...values);

  const usableWidth = width - paddingX * 2;

  const usableHeight = height - paddingY * 2;

  return values.map((value, index) => {
    const x = paddingX + (index / Math.max(values.length - 1, 1)) * usableWidth;

    const normalized = (value - min) / Math.max(max - min, 1);

    const y = height - paddingY - normalized * usableHeight;

    return (
      <circle
        key={`${index}-${value}`}
        cx={x}
        cy={y}
        r="3.5"
        fill="currentColor"
        className={className}
      />
    );
  });
}

/* =========================================================
   Y AXIS LABELS
========================================================= */

function buildYAxisLabels(maxValue) {
  if (!maxValue) {
    return ["₹0", "₹0", "₹0", "₹0", "₹0"];
  }

  const step = Math.ceil(maxValue / 4 / 1000) * 1000;

  return [step * 4, step * 3, step * 2, step, 0].map((value) => {
    if (value >= 100000) {
      return `₹${Math.round(value / 1000)}K`;
    }

    return `₹${Math.round(value / 1000)}K`;
  });
}

/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default SalesOverview;
