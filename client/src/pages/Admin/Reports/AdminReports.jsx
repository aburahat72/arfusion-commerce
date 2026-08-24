import {
  BarChart3,
  ChevronDown,
  Download,
  FileBarChart2,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { salesData } from "../../../data/adminDashboard";

function AdminReports() {
  const periods = Object.keys(salesData);

  const [period, setPeriod] = useState(
    periods.includes("Last 30 Days") ? "Last 30 Days" : periods[0],
  );

  const report = useMemo(() => {
    return buildReport(salesData[period] || {});
  }, [period]);

  const handleExport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Period", period],
      ["Revenue", report.totalRevenue],
      ["Orders", report.totalOrders],
      ["Average Order Value", report.averageOrderValue],
      ["Highest Revenue Day", report.highestRevenue],
      ["Lowest Revenue Day", report.lowestRevenue],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `arfusion-report-${period
      .toLowerCase()
      .replace(/\s+/g, "-")}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-text-secondary">Analytics</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Reports
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Generate and export performance reports for your store.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                aria-label="Report period"
                className="
                  h-11
                  w-full
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
                  sm:w-44
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

            <button
              type="button"
              onClick={handleExport}
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
                transition
                hover:opacity-90
              "
            >
              <Download size={17} />
              Export CSV
            </button>
          </div>
        </div>

        {/* =================================================
            REPORT CARDS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReportStat
            title="Revenue"
            value={formatCurrency(report.totalRevenue)}
            icon={<TrendingUp size={21} />}
            iconClass="bg-primary-container text-primary"
          />

          <ReportStat
            title="Orders"
            value={report.totalOrders.toLocaleString("en-IN")}
            icon={<ShoppingCart size={21} />}
            iconClass="bg-blue-100 text-blue-600"
          />

          <ReportStat
            title="Average Order Value"
            value={formatCurrency(report.averageOrderValue)}
            icon={<BarChart3 size={21} />}
            iconClass="bg-violet-100 text-violet-600"
          />

          <ReportStat
            title="Units / Activity"
            value={report.totalOrders.toLocaleString("en-IN")}
            icon={<Package size={21} />}
            iconClass="bg-orange-100 text-orange-600"
          />
        </section>

        {/* =================================================
            REPORT SUMMARY
        ================================================= */}

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
          {/* Revenue report */}

          <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-primary">
                <FileBarChart2 size={20} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-text sm:text-lg">
                  Sales Report
                </h2>

                <p className="text-xs text-text-secondary">{period}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <ReportRow
                label="Total Revenue"
                value={formatCurrency(report.totalRevenue)}
              />

              <ReportRow
                label="Total Orders"
                value={report.totalOrders.toLocaleString("en-IN")}
              />

              <ReportRow
                label="Average Order Value"
                value={formatCurrency(report.averageOrderValue)}
              />

              <ReportRow
                label="Highest Revenue"
                value={formatCurrency(report.highestRevenue)}
              />

              <ReportRow
                label="Lowest Revenue"
                value={formatCurrency(report.lowestRevenue)}
              />
            </div>
          </div>

          {/* Report types */}

          <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FileBarChart2 size={20} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-text sm:text-lg">
                  Report Types
                </h2>

                <p className="text-xs text-text-secondary">
                  Available reporting views
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <ReportType
                icon={<ShoppingCart size={16} />}
                title="Sales Report"
                description="Revenue and order performance"
              />

              <ReportType
                icon={<Package size={16} />}
                title="Product Report"
                description="Product and inventory performance"
              />

              <ReportType
                icon={<Users size={16} />}
                title="Customer Report"
                description="Customer activity and growth"
              />

              <ReportType
                icon={<BarChart3 size={16} />}
                title="Analytics Report"
                description="Business performance overview"
              />
            </div>
          </div>
        </section>

        {/* =================================================
            DAILY PERFORMANCE
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-text sm:text-lg">
              Daily Performance
            </h2>

            <p className="mt-1 text-xs text-text-secondary">
              Revenue and order activity for the selected period.
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    Period
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    Revenue
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    Orders
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    AOV
                  </th>
                </tr>
              </thead>

              <tbody>
                {report.rows.map((row, index) => (
                  <tr
                    key={`${row.label}-${index}`}
                    className="border-b border-outline-variant last:border-0"
                  >
                    <td className="px-4 py-3 text-sm text-text">{row.label}</td>

                    <td className="px-4 py-3 text-sm font-semibold text-text">
                      {formatCurrency(row.revenue)}
                    </td>

                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {row.orders.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {formatCurrency(row.aov)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   STAT
========================================================= */

function ReportStat({ title, value, icon, iconClass }) {
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

          <p className="mt-1 truncate text-2xl font-semibold text-text">
            {value}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   REPORT ROW
========================================================= */

function ReportRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-text-secondary">{label}</span>

      <span className="text-sm font-semibold text-text">{value}</span>
    </div>
  );
}

/* =========================================================
   REPORT TYPE
========================================================= */

function ReportType({ icon, title, description }) {
  return (
    <button
      type="button"
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        border
        border-outline-variant
        p-3
        text-left
        transition
        hover:bg-surface-container
      "
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-container text-primary">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-text">{title}</p>

        <p className="mt-0.5 truncate text-[11px] text-text-secondary">
          {description}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   BUILD REPORT
========================================================= */

function buildReport(data) {
  const revenue = Array.isArray(data?.revenue)
    ? data.revenue.map((value) => Number(value) || 0)
    : [];

  const orders = Array.isArray(data?.orders)
    ? data.orders.map((value) => Number(value) || 0)
    : [];

  const labels = Array.isArray(data?.labels) ? data.labels : [];

  const totalRevenue = revenue.reduce((sum, value) => sum + value, 0);

  const totalOrders = orders.reduce((sum, value) => sum + value, 0);

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const highestRevenue = Math.max(...revenue, 0);

  const lowestRevenue = revenue.length ? Math.min(...revenue) : 0;

  const rows = labels.map((label, index) => {
    const revenueValue = revenue[index] || 0;

    const orderValue = orders[index] || 0;

    return {
      label,
      revenue: revenueValue,
      orders: orderValue,
      aov: orderValue > 0 ? revenueValue / orderValue : 0,
    };
  });

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    highestRevenue,
    lowestRevenue,
    rows,
  };
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

export default AdminReports;
