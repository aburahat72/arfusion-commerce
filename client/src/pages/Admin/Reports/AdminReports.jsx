import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  Download,
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getAdminAnalytics } from "../../../services/adminApi";

const DAY_MS = 24 * 60 * 60 * 1000;
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (days) =>
  new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);
const initialRange = { from: daysAgo(29), to: today() };

const reportTypes = [
  {
    id: "sales",
    title: "Sales Report",
    description: "Paid revenue, order volume, and daily sales performance",
    icon: ShoppingCart,
  },
  {
    id: "products",
    title: "Product Report",
    description: "Best sellers, stock levels, and inventory health",
    icon: Package,
  },
  {
    id: "customers",
    title: "Customer Report",
    description: "Customer growth and highest-value customers",
    icon: Users,
  },
  {
    id: "overview",
    title: "Business Overview",
    description: "A consolidated view of store performance and operations",
    icon: BarChart3,
  },
];

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function getPresetRange(preset) {
  const end = today();
  if (preset === "7") return { from: daysAgo(6), to: end };
  if (preset === "90") return { from: daysAgo(89), to: end };
  if (preset === "year") return { from: `${end.slice(0, 4)}-01-01`, to: end };
  return { from: daysAgo(29), to: end };
}

function AdminReports() {
  const [range, setRange] = useState(initialRange);
  const [draftRange, setDraftRange] = useState(initialRange);
  const [preset, setPreset] = useState("30");
  const [reportType, setReportType] = useState("sales");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadReportData = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAdminAnalytics(range, {
          signal: controller.signal,
        });
        if (!response?.success) {
          throw new Error(response?.message || "Report data could not be loaded.");
        }
        setAnalytics(response);
      } catch (requestError) {
        if (requestError.name !== "CanceledError") {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Report data could not be loaded.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadReportData();
    return () => controller.abort();
  }, [range, refreshKey]);

  const report = useMemo(
    () => (analytics ? buildReport(reportType, analytics) : null),
    [analytics, reportType],
  );

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

  const exportReport = async (format) => {
    if (!report) return;

    try {
      setExporting(format);
      setError("");
      const fileBaseName = `arfusion-${report.slug}-${range.from}-to-${range.to}`;
      if (format === "csv") {
        downloadCsv(report, range, fileBaseName);
      } else if (format === "excel") {
        await downloadExcel(report, range, fileBaseName);
      } else {
        await downloadPdf(report, range, fileBaseName);
      }
    } catch (exportError) {
      setError(exportError.message || `Unable to export ${format.toUpperCase()}.`);
    } finally {
      setExporting("");
    }
  };

  const selectedType =
    reportTypes.find((item) => item.id === reportType) || reportTypes[0];
  const SelectedIcon = selectedType.icon;

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm text-text-secondary">Analytics</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Reports
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Build date-filtered reports from live store data and export them.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end gap-2">
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
                    aria-label="Report date preset"
                    className="h-10 w-full appearance-none rounded-lg border border-outline-variant bg-surface pl-9 pr-3 text-sm text-text sm:w-40"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="year">Year to date</option>
                    <option value="custom">Custom range</option>
                  </select>
                </span>
              </label>

              <form onSubmit={applyCustomRange} className="flex flex-wrap items-end gap-2">
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
                  className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  Apply
                </button>
              </form>

              <button
                type="button"
                onClick={() => setRefreshKey((key) => key + 1)}
                disabled={loading}
                aria-label="Refresh report data"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-outline-variant bg-surface px-3 text-text transition hover:bg-surface-container disabled:opacity-60"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <ExportButton
                label="PDF"
                icon={FileText}
                onClick={() => exportReport("pdf")}
                disabled={!report || Boolean(exporting)}
                loading={exporting === "pdf"}
              />
              <ExportButton
                label="CSV"
                icon={Download}
                onClick={() => exportReport("csv")}
                disabled={!report || Boolean(exporting)}
                loading={exporting === "csv"}
              />
              <ExportButton
                label="Excel"
                icon={FileSpreadsheet}
                onClick={() => exportReport("excel")}
                disabled={!report || Boolean(exporting)}
                loading={exporting === "excel"}
              />
            </div>
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

        {loading && !analytics ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-surface-container"
              />
            ))}
          </div>
        ) : report ? (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <SelectedIcon size={16} className="text-primary" />
                <span>{selectedType.title}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {formatDate(range.from)} – {formatDate(range.to)}
                </span>
              </div>
              {loading && (
                <span className="text-xs text-text-secondary" role="status">
                  Updating report…
                </span>
              )}
            </div>

            <section
              aria-label={`${selectedType.title} summary`}
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {report.cards.map((card) => (
                <ReportStat
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  icon={cardIcons[card.icon]}
                  iconClass={card.iconClass}
                />
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
              <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-primary">
                    <FileBarChart2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text sm:text-lg">
                      {report.title}
                    </h2>
                    <p className="text-xs text-text-secondary">
                      {formatDate(range.from)} – {formatDate(range.to)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {report.summary.map((item) => (
                    <ReportRow
                      key={item.label}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FileBarChart2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text sm:text-lg">
                      Report views
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Select a report to filter the data below
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {reportTypes.map((type) => (
                    <ReportType
                      key={type.id}
                      {...type}
                      selected={type.id === reportType}
                      onClick={() => setReportType(type.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-text sm:text-lg">
                    {report.tableTitle}
                  </h2>
                  <p className="mt-1 text-xs text-text-secondary">
                    {report.rows.length
                      ? `${formatNumber(report.rows.length)} records in this view`
                      : report.emptyMessage}
                  </p>
                </div>
              </div>
              <div className="mt-5 overflow-x-auto">
                {report.rows.length ? (
                  <table className="w-full min-w-[650px] border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container/60">
                        {report.columns.map((column) => (
                          <th
                            key={column.key}
                            className="px-4 py-3 text-left text-xs font-semibold text-text-secondary"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {report.rows.map((row, index) => (
                        <tr
                          key={row.id || `${reportType}-${index}`}
                          className="border-b border-outline-variant last:border-0"
                        >
                          {report.columns.map((column) => (
                            <td
                              key={column.key}
                              className={`px-4 py-3 text-sm ${
                                column.format === "currency"
                                  ? "font-medium text-text"
                                  : "text-text-secondary"
                              }`}
                            >
                              {formatCell(row[column.key], column.format)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 text-center text-sm text-text-secondary">
                    {report.emptyMessage}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          !loading && (
            <div className="rounded-2xl border border-outline-variant bg-surface p-8 text-center text-sm text-text-secondary">
              No report data is available for this period.
            </div>
          )
        )}
      </div>
    </main>
  );
}

const cardIcons = {
  revenue: <TrendingUp size={21} />,
  orders: <ShoppingCart size={21} />,
  customers: <Users size={21} />,
  products: <Package size={21} />,
  average: <BarChart3 size={21} />,
};

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

function ExportButton({ label, icon: Icon, onClick, disabled, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 text-xs font-semibold text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <RefreshCw size={15} className="animate-spin" />
      ) : (
        <Icon size={15} />
      )}
      {loading ? "Exporting…" : label}
    </button>
  );
}

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
          <p className="mt-1 truncate text-2xl font-semibold text-text">{value}</p>
        </div>
      </div>
    </article>
  );
}

function ReportRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-right text-sm font-semibold text-text">{value}</span>
    </div>
  );
}

function ReportType({ id, title, description, icon: Icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
        selected
          ? "border-primary bg-primary-container/50"
          : "border-outline-variant hover:bg-surface-container"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-container text-primary">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-text">{title}</p>
        <p className="mt-0.5 text-[11px] text-text-secondary">{description}</p>
      </div>
      <span className="sr-only">{id}</span>
    </button>
  );
}

function buildReport(type, data) {
  const overview = data.overview || {};
  const inventory = data.inventory || {};
  const salesTrend = data.salesTrend || [];
  const currency = (value) => formatCurrency(value);
  const count = (value) => formatNumber(value);

  if (type === "products") {
    const rows = (data.topProducts || []).map((product) => ({
      id: product.productId || product.name,
      name: product.name,
      unitsSold: Number(product.quantitySold || 0),
      revenue: Number(product.revenue || 0),
    }));
    return {
      slug: "product-report",
      title: "Product performance",
      tableTitle: "Top products by paid sales",
      emptyMessage: "No paid product sales are available for this period.",
      columns: [
        { key: "name", label: "Product" },
        { key: "unitsSold", label: "Units sold", format: "number" },
        { key: "revenue", label: "Revenue", format: "currency" },
      ],
      rows,
      cards: [
        card("Products", count(inventory.totalProducts), "products", "bg-orange-100 text-orange-600"),
        card("Active products", count(inventory.activeProducts), "products", "bg-green-100 text-green-600"),
        card("Units in stock", count(inventory.unitsInStock), "products", "bg-blue-100 text-blue-600"),
        card("Low stock", count(inventory.lowStockProducts), "products", "bg-red-100 text-red-600"),
      ],
      summary: [
        { label: "Total products", value: count(inventory.totalProducts) },
        { label: "Active products", value: count(inventory.activeProducts) },
        { label: "Units in stock", value: count(inventory.unitsInStock) },
        { label: "Low-stock products", value: count(inventory.lowStockProducts) },
        { label: "Out of stock", value: count(inventory.outOfStockProducts) },
      ],
    };
  }

  if (type === "customers") {
    const rows = (data.topCustomers || []).map((customer) => ({
      id: customer.customerId || customer.email || customer.fullName,
      name: customer.fullName,
      email: customer.email || "",
      orders: Number(customer.totalOrders || 0),
      spend: Number(customer.totalSpent || 0),
    }));
    const highestSpend = rows.reduce(
      (highest, customer) => Math.max(highest, customer.spend),
      0,
    );
    return {
      slug: "customer-report",
      title: "Customer performance",
      tableTitle: "Top customers by paid spend",
      emptyMessage: "No paid customer orders are available for this period.",
      columns: [
        { key: "name", label: "Customer" },
        { key: "email", label: "Email" },
        { key: "orders", label: "Paid orders", format: "number" },
        { key: "spend", label: "Paid spend", format: "currency" },
      ],
      rows,
      cards: [
        card("Customers", count(overview.totalCustomers), "customers", "bg-green-100 text-green-600"),
        card("New in period", count(overview.newCustomers), "customers", "bg-blue-100 text-blue-600"),
        card("Top customers", count(rows.length), "customers", "bg-violet-100 text-violet-600"),
        card("Highest paid spend", currency(highestSpend), "revenue", "bg-primary-container text-primary"),
      ],
      summary: [
        { label: "Customers in store", value: count(overview.totalCustomers) },
        { label: "New customers in period", value: count(overview.newCustomers) },
        { label: "Top customers shown", value: count(rows.length) },
        { label: "Highest paid spend", value: currency(highestSpend) },
      ],
    };
  }

  if (type === "overview") {
    const rows = [
      { metric: "Paid revenue", value: currency(overview.revenue) },
      { metric: "Orders placed", value: count(overview.totalOrders) },
      { metric: "Paid orders", value: count(overview.paidOrders) },
      { metric: "Cancelled orders", value: count(overview.cancelledOrders) },
      { metric: "Average paid order", value: currency(overview.averageOrderValue) },
      { metric: "Customers in store", value: count(overview.totalCustomers) },
      { metric: "New customers", value: count(overview.newCustomers) },
      { metric: "Products", value: count(inventory.totalProducts) },
      { metric: "Low-stock products", value: count(inventory.lowStockProducts) },
      { metric: "Out-of-stock products", value: count(inventory.outOfStockProducts) },
      { metric: "Return requests", value: count(data.returns?.total) },
      { metric: "Completed refunds", value: count(data.refunds?.count) },
      { metric: "Refunded amount", value: currency(data.refunds?.total) },
    ];
    return {
      slug: "business-overview",
      title: "Business overview",
      tableTitle: "Business metrics",
      emptyMessage: "No overview data is available for this period.",
      columns: [
        { key: "metric", label: "Metric" },
        { key: "value", label: "Value" },
      ],
      rows,
      cards: [
        card("Paid revenue", currency(overview.revenue), "revenue", "bg-primary-container text-primary"),
        card("Orders placed", count(overview.totalOrders), "orders", "bg-blue-100 text-blue-600"),
        card("Customers", count(overview.totalCustomers), "customers", "bg-green-100 text-green-600"),
        card("Refunded amount", currency(data.refunds?.total), "average", "bg-orange-100 text-orange-600"),
      ],
      summary: [
        { label: "Revenue / paid orders", value: currency(overview.averageOrderValue) },
        { label: "New customers in period", value: count(overview.newCustomers) },
        { label: "Return requests", value: count(data.returns?.total) },
        { label: "Completed refunds", value: count(data.refunds?.count) },
      ],
    };
  }

  const rows = salesTrend.map((point) => {
    const revenue = Number(point.revenue || 0);
    const paidOrders = Number(point.paidOrders || 0);
    return {
      date: point.date,
      revenue,
      orders: Number(point.orders || 0),
      paidOrders,
      averageOrder: paidOrders ? revenue / paidOrders : 0,
    };
  });
  const totals = rows.reduce(
    (result, row) => ({
      revenue: result.revenue + row.revenue,
      orders: result.orders + row.orders,
      paidOrders: result.paidOrders + row.paidOrders,
    }),
    { revenue: 0, orders: 0, paidOrders: 0 },
  );
  const highestDay = rows.reduce(
    (highest, row) => (row.revenue > highest.revenue ? row : highest),
    { revenue: 0, date: "" },
  );
  const lowestDay = rows.reduce(
    (lowest, row) => (row.revenue < lowest.revenue ? row : lowest),
    rows[0] || { revenue: 0, date: "" },
  );
  return {
    slug: "sales-report",
    title: "Sales performance",
    tableTitle: "Daily sales performance",
    emptyMessage: "No order activity is available for this period.",
    columns: [
      { key: "date", label: "Date", format: "date" },
      { key: "revenue", label: "Paid revenue", format: "currency" },
      { key: "orders", label: "Orders placed", format: "number" },
      { key: "paidOrders", label: "Paid orders", format: "number" },
      { key: "averageOrder", label: "Average paid order", format: "currency" },
    ],
    rows,
    cards: [
      card("Paid revenue", currency(totals.revenue), "revenue", "bg-primary-container text-primary"),
      card("Orders placed", count(totals.orders), "orders", "bg-blue-100 text-blue-600"),
      card("Paid orders", count(totals.paidOrders), "orders", "bg-green-100 text-green-600"),
      card(
        "Average paid order",
        currency(totals.paidOrders ? totals.revenue / totals.paidOrders : 0),
        "average",
        "bg-violet-100 text-violet-600",
      ),
    ],
    summary: [
      { label: "Paid revenue", value: currency(totals.revenue) },
      { label: "Orders placed", value: count(totals.orders) },
      { label: "Paid orders", value: count(totals.paidOrders) },
      {
        label: "Average paid order",
        value: currency(totals.paidOrders ? totals.revenue / totals.paidOrders : 0),
      },
      {
        label: "Highest revenue day",
        value: highestDay.date
          ? `${formatDate(highestDay.date)} · ${currency(highestDay.revenue)}`
          : "No paid sales",
      },
      {
        label: "Lowest revenue day",
        value: lowestDay.date
          ? `${formatDate(lowestDay.date)} · ${currency(lowestDay.revenue)}`
          : "No paid sales",
      },
    ],
  };
}

function card(title, value, icon, iconClass) {
  return { title, value, icon, iconClass };
}

function formatCell(value, format) {
  if (format === "currency") return formatCurrency(value);
  if (format === "number") return formatNumber(value);
  if (format === "date") return formatDate(value);
  return value ?? "—";
}

function formatDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function downloadCsv(report, range, fileBaseName) {
  const rows = [
    ["Report", report.title],
    ["From", range.from],
    ["To", range.to],
    [],
    ["Summary"],
    ["Metric", "Value"],
    ...report.summary.map((item) => [item.label, item.value]),
    [],
    ["Details"],
    report.columns.map((column) => column.label),
    ...report.rows.map((row) =>
      report.columns.map((column) => {
        const value = row[column.key];
        return column.format === "date" && value ? formatDate(value) : value ?? "";
      }),
    ),
  ];
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  downloadBlob(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }),
    `${fileBaseName}.csv`,
  );
}

async function downloadExcel(report, range, fileBaseName) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AR Fusion";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 34 },
    { header: "Value", key: "value", width: 32 },
  ];
  summarySheet.addRows([
    { metric: "Report", value: report.title },
    { metric: "From", value: range.from },
    { metric: "To", value: range.to },
    { metric: "Generated", value: new Date().toLocaleString("en-IN") },
    ...report.summary.map((item) => ({
      metric: item.label,
      value: item.value,
    })),
  ]);
  styleWorksheet(summarySheet);

  const detailSheet = workbook.addWorksheet("Details");
  detailSheet.columns = report.columns.map((column) => ({
    header: column.label,
    key: column.key,
    width: Math.min(Math.max(column.label.length + 8, 18), 38),
  }));
  detailSheet.addRows(report.rows);
  detailSheet.views = [{ state: "frozen", ySplit: 1 }];
  detailSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: report.columns.length },
  };
  styleWorksheet(detailSheet);

  report.columns.forEach((column, index) => {
    if (column.format === "currency") {
      detailSheet.getColumn(index + 1).numFmt = '"₹"#,##0.00;[Red]-"₹"#,##0.00';
    } else if (column.format === "number") {
      detailSheet.getColumn(index + 1).numFmt = "#,##0";
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${fileBaseName}.xlsx`,
  );
}

function styleWorksheet(worksheet) {
  const header = worksheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" },
  };
  header.alignment = { vertical: "middle" };
  header.height = 22;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: "middle" };
      if (rowNumber % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5F5F7" },
        };
      }
    }
  });
}

async function downloadPdf(report, range, fileBaseName) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const pdf = new jsPDF({
    orientation: report.columns.length > 4 ? "landscape" : "portrait",
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFontSize(18);
  pdf.text(report.title, 14, 18);
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(`${formatDate(range.from)} – ${formatDate(range.to)}`, 14, 25);
  pdf.text(`Generated ${new Date().toLocaleString("en-IN")}`, pageWidth - 14, 25, {
    align: "right",
  });

  autoTable(pdf, {
    startY: 32,
    head: [["Summary", "Value"]],
    body: report.summary.map((item) => [item.label, item.value]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  autoTable(pdf, {
    startY: (pdf.lastAutoTable?.finalY || 32) + 10,
    head: [report.columns.map((column) => column.label)],
    body: report.rows.map((row) =>
      report.columns.map((column) => formatCell(row[column.key], column.format)),
    ),
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFontSize(8);
    pdf.setTextColor(120);
    pdf.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - 14,
      pdf.internal.pageSize.getHeight() - 8,
      { align: "right" },
    );
  }
  pdf.save(`${fileBaseName}.pdf`);
}

function escapeCsvCell(value) {
  let text = String(value ?? "");
  const trimmed = text.trimStart();
  const isNumeric = /^[+-]?\d+(?:\.\d+)?$/.test(trimmed);
  if (/^[=+\-@]/.test(trimmed) && !isNumeric) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default AdminReports;
