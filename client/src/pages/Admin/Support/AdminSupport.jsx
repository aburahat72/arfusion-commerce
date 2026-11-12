import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Headset,
  RefreshCw,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminSupportTickets } from "../../../services/supportService";
import {
  getSupportLabel,
  supportCategories,
  supportPriorities,
  supportStatuses,
} from "../../Support/supportOptions";

const emptySummary = {
  total: 0,
  open: 0,
  inProgress: 0,
  awaitingCustomer: 0,
  resolved: 0,
  closed: 0,
};

function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");
      const response = await getAdminSupportTickets({
        page,
        limit: 20,
        search,
        status,
        priority,
        category,
        assignee,
      });
      setTickets(response.data.tickets || []);
      setSummary(response.data.summary || emptySummary);
      setTotal(response.data.pagination?.total || 0);
      setTotalPages(response.data.pagination?.totalPages || 0);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load support tickets.",
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, search, status, priority, category, assignee]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadTickets(), search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadTickets, search]);

  useEffect(() => {
    const refreshTickets = () => loadTickets(true);
    window.addEventListener("arfusion:support:update", refreshTickets);
    const poll = window.setInterval(refreshTickets, 30000);
    return () => {
      window.removeEventListener("arfusion:support:update", refreshTickets);
      window.clearInterval(poll);
    };
  }, [loadTickets]);

  const updateFilter = (setter, value) => {
    setPage(1);
    setter(value);
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-text-secondary">Customer Support</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Support tickets
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Triage customer conversations, assign agents, and track resolutions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadTickets()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 text-sm font-medium text-text"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="All tickets" value={summary.total} />
          <SummaryCard label="Open" value={summary.open} />
          <SummaryCard label="In progress" value={summary.inProgress} />
          <SummaryCard label="Awaiting customer" value={summary.awaitingCustomer} />
          <SummaryCard label="Resolved" value={summary.resolved} />
        </section>

        <section className="mt-6 grid gap-3 rounded-2xl border border-outline-variant bg-surface p-4 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_repeat(4,minmax(140px,180px))]">
          <label className="relative md:col-span-2 xl:col-span-1">
            <span className="sr-only">Search support tickets</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => updateFilter(setSearch, event.target.value)}
              placeholder="Search ticket, subject, customer..."
              className="h-10 w-full rounded-xl border border-outline-variant bg-surface pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <FilterSelect
            label="Status"
            value={status}
            onChange={(value) => updateFilter(setStatus, value)}
            options={[{ value: "all", label: "All statuses" }, ...supportStatuses]}
          />
          <FilterSelect
            label="Priority"
            value={priority}
            onChange={(value) => updateFilter(setPriority, value)}
            options={[
              { value: "all", label: "All priorities" },
              ...supportPriorities,
            ]}
          />
          <FilterSelect
            label="Topic"
            value={category}
            onChange={(value) => updateFilter(setCategory, value)}
            options={[
              { value: "all", label: "All topics" },
              ...supportCategories,
            ]}
          />
          <FilterSelect
            label="Assignment"
            value={assignee}
            onChange={(value) => updateFilter(setAssignee, value)}
            options={[
              { value: "all", label: "All assignments" },
              { value: "unassigned", label: "Unassigned" },
              { value: "me", label: "Assigned to me" },
            ]}
          />
        </section>

        {error && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            <p role="alert">{error}</p>
            <button type="button" onClick={loadTickets} className="font-semibold underline">
              Retry
            </button>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {loading ? "Loading tickets..." : `${total} tickets`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface text-text disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="text-xs text-text-secondary">
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface text-text disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <section className="mt-3 overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
          {loading && tickets.length === 0 ? (
            <p className="p-10 text-center text-sm text-text-secondary">
              Loading tickets...
            </p>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <Headset className="mx-auto text-text-secondary" size={27} />
              <p className="mt-3 text-sm font-medium text-text">
                No tickets match these filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {tickets.map((ticket) => (
                <Link
                  key={ticket._id}
                  to={`/admin/support/${ticket._id}`}
                  className="flex flex-col gap-3 p-4 transition hover:bg-surface-container/50 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-primary">
                        {ticket.ticketNumber}
                      </span>
                      <TicketBadge value={ticket.status} options={supportStatuses} />
                      <PriorityBadge priority={ticket.priority} />
                      {ticket.adminUnread > 0 && (
                        <span className="rounded-full bg-error px-2 py-0.5 text-[10px] font-semibold text-white">
                          {ticket.adminUnread} unread
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 truncate text-sm font-semibold text-text">
                      {ticket.subject}
                    </h2>
                    <p className="mt-1 text-xs text-text-secondary">
                      {ticket.customer?.fullName || "Customer"} ·{" "}
                      {ticket.customer?.email || "No email"} ·{" "}
                      {getSupportLabel(supportCategories, ticket.category)}
                    </p>
                    <p className="mt-1 truncate text-xs text-text-secondary">
                      {ticket.lastPublicMessagePreview}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-4 text-xs text-text-secondary sm:flex-col sm:items-end">
                    <span>
                      {ticket.assignedTo
                        ? `Assigned: ${ticket.assignedTo.fullName}`
                        : "Unassigned"}
                    </span>
                    <span>{new Date(ticket.lastMessageAt).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text">{value}</p>
    </article>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="grid gap-1 text-[11px] font-medium text-text-secondary">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-outline-variant bg-surface px-3 text-sm text-text"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TicketBadge({ value, options }) {
  const style =
    value === "resolved" || value === "closed"
      ? "bg-success/10 text-success"
      : value === "awaiting_customer"
        ? "bg-warning/10 text-warning"
        : "bg-primary-container text-primary";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${style}`}>
      {getSupportLabel(options, value)}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const style =
    priority === "urgent" || priority === "high"
      ? "bg-error/10 text-error"
      : "bg-surface-container text-text-secondary";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${style}`}>
      {priority}
    </span>
  );
}

export default AdminSupport;
