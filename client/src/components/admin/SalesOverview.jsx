import { useMemo, useState } from "react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
const formatCompactCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

function SalesOverview({ data = [] }) {
  const [metric, setMetric] = useState("revenue");
  const summary = useMemo(
    () =>
      data.reduce(
        (result, point) => ({
          revenue: result.revenue + Number(point.revenue || 0),
          orders: result.orders + Number(point.orders || 0),
        }),
        { revenue: 0, orders: 0 },
      ),
    [data],
  );
  const chartData = useMemo(
    () => createChartData(data, metric),
    [data, metric],
  );

  return (
    <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text sm:text-lg">
            Sales performance
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            Daily activity for the selected period
          </p>
        </div>
        <div
          className="inline-flex rounded-lg bg-surface-container p-1"
          role="group"
          aria-label="Sales chart metric"
        >
          {[
            ["revenue", "Revenue"],
            ["orders", "Orders"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMetric(value)}
              aria-pressed={metric === value}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                metric === value
                  ? "bg-surface text-text shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
        <SummaryItem
          label="Paid revenue"
          value={formatCurrency(summary.revenue)}
          accent="text-primary"
        />
        <SummaryItem
          label="Orders"
          value={formatNumber(summary.orders)}
          accent="text-blue-600"
        />
      </div>

      <div className="mt-5">
        {data.length ? (
          <SalesChart data={chartData} metric={metric} />
        ) : (
          <div className="flex h-[280px] items-center justify-center rounded-xl bg-background text-sm text-text-secondary">
            No sales activity in this period.
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryItem({ label, value, accent }) {
  return (
    <div className="rounded-xl bg-surface-container px-3.5 py-3">
      <p className="text-[11px] text-text-secondary">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function SalesChart({ data, metric }) {
  const color = metric === "revenue" ? "#6d4aff" : "#2563eb";
  const areaColor = metric === "revenue" ? "rgba(109, 74, 255, 0.10)" : "rgba(37, 99, 235, 0.10)";
  const unit = metric === "revenue" ? "revenue" : "orders";
  const axisLabels = [0, 1, 2, 3, 4].map((step) =>
    metric === "revenue"
      ? formatCompactCurrency((data.maxValue * (4 - step)) / 4)
      : formatNumber(Math.round((data.maxValue * (4 - step)) / 4)),
  );

  return (
    <div className="relative h-[280px] overflow-hidden rounded-xl bg-background sm:h-[320px]">
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-8 pl-[4.5rem] pr-3 pt-5">
        {axisLabels.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="flex h-0 items-center border-t border-outline-variant/60"
          >
            <span className="absolute left-2 w-14 -translate-y-1/2 truncate text-[9px] text-text-secondary sm:text-[10px]">
              {label}
            </span>
          </div>
        ))}
      </div>

      <svg
        viewBox="0 0 1000 260"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${metric === "revenue" ? "Revenue" : "Orders"} by day`}
        className="absolute inset-0 h-[calc(100%-2rem)] w-full pl-16 pr-3 pt-3"
      >
        <polygon points={data.area} fill={areaColor} />
        <polyline
          points={data.points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.rows.map((point) => (
          <circle
            key={point.date}
            cx={point.x}
            cy={point.y}
            r={data.rows.length < 50 ? 3.2 : 1.8}
            fill={color}
          >
            <title>
              {`${formatDate(point.date)}: ${
                metric === "revenue"
                  ? formatCurrency(point.value)
                  : `${formatNumber(point.value)} orders`
              }`}
            </title>
          </circle>
        ))}
      </svg>

      <div className="absolute bottom-2 left-[4.5rem] right-3 flex justify-between gap-2 text-[9px] text-text-secondary sm:text-[10px]">
        {data.labels.map((label) => (
          <span key={label.date} className="whitespace-nowrap">
            {formatDate(label.date, true)}
          </span>
        ))}
      </div>
      <span className="sr-only">{unit}</span>
    </div>
  );
}

function createChartData(rows, metric) {
  const width = 1000;
  const height = 260;
  const paddingX = 12;
  const paddingY = 16;
  const values = rows.map((point) => Number(point[metric] || 0));
  const maxValue = Math.max(...values, 0);
  const scaleMax = maxValue || 1;
  const points = rows.map((point, index) => {
    const x =
      paddingX + (index / Math.max(rows.length - 1, 1)) * (width - paddingX * 2);
    const y =
      height - paddingY - (Number(point[metric] || 0) / scaleMax) * (height - paddingY * 2);
    return { date: point.date, value: Number(point[metric] || 0), x, y };
  });
  const line = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = points.length
    ? [
        `${paddingX},${height - paddingY}`,
        ...points.map(({ x, y }) => `${x},${y}`),
        `${width - paddingX},${height - paddingY}`,
      ].join(" ")
    : "";
  const labelIndexes = new Set(
    Array.from({ length: Math.min(5, rows.length) }, (_, index) =>
      Math.round((index / Math.max(Math.min(5, rows.length) - 1, 1)) * (rows.length - 1)),
    ),
  );

  return {
    rows: points,
    maxValue,
    points: line,
    area,
    labels: rows.filter((_, index) => labelIndexes.has(index)),
  };
}

function formatDate(value, short = false) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: short ? "short" : "long",
  });
}

export default SalesOverview;
