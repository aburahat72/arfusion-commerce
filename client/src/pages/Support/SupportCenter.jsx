import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  LifeBuoy,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyOrders } from "../../services/orderService";
import {
  createSupportTicket,
  getMySupportTickets,
} from "../../services/supportService";
import {
  getSupportLabel,
  supportCategories,
  supportStatuses,
} from "./supportOptions";

function SupportCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    category: "other",
    orderId: "",
    message: "",
  });

  const loadTickets = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");
      const response = await getMySupportTickets({ page, limit: 20 });
      setTickets(response.data.tickets || []);
      setTotal(response.data.pagination?.total || 0);
      setTotalPages(response.data.pagination?.totalPages || 0);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load your support tickets.",
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => loadTickets(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadTickets]);

  useEffect(() => {
    let active = true;
    getMyOrders({ page: 1, limit: 30 })
      .then((response) => {
        if (active) setOrders(response.orders || []);
      })
      .catch((requestError) => {
        if (active) {
          setOrdersError(
            requestError?.response?.data?.message ||
              "Your orders could not be loaded.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleSupportUpdate = (event) => {
      if (event.detail?.customerId === String(user?._id)) {
        loadTickets(true);
      }
    };
    window.addEventListener("arfusion:support:update", handleSupportUpdate);
    const poll = window.setInterval(() => loadTickets(true), 30000);

    return () => {
      window.removeEventListener("arfusion:support:update", handleSupportUpdate);
      window.clearInterval(poll);
    };
  }, [loadTickets, user?._id]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await createSupportTicket({
        ...form,
        orderId: form.orderId || null,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      navigate(`/support/${response.data.ticket._id}`);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to open a support ticket.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateForm = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-text-secondary">Customer care</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text">
              Help & Support
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Create a support ticket and continue the conversation with our
              support team. Your order details stay private to your account.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={17} />
            {formOpen ? "Close form" : "Create a ticket"}
          </button>
        </header>

        {formOpen && (
          <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-primary">
                <MessageCircle size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-text">Tell us how we can help</h2>
                <p className="text-xs text-text-secondary">
                  A support ticket opens a private conversation with our team.
                </p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-text">
                Topic
                <select
                  required
                  value={form.category}
                  onChange={(event) => updateForm("category", event.target.value)}
                  className="h-11 rounded-xl border border-outline-variant bg-surface px-3"
                >
                  {supportCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-text">
                Related order (optional)
                <select
                  value={form.orderId}
                  onChange={(event) => updateForm("orderId", event.target.value)}
                  className="h-11 rounded-xl border border-outline-variant bg-surface px-3"
                >
                  <option value="">No order selected</option>
                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>
                      Order #{order.orderNumber || order._id} · {order.orderStatus}
                    </option>
                  ))}
                </select>
                {ordersError && (
                  <span className="text-xs text-warning">{ordersError}</span>
                )}
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-text sm:col-span-2">
                Subject
                <input
                  required
                  minLength={5}
                  maxLength={120}
                  value={form.subject}
                  onChange={(event) => updateForm("subject", event.target.value)}
                  placeholder="Briefly describe the issue"
                  className="h-11 rounded-xl border border-outline-variant bg-surface px-3"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-text sm:col-span-2">
                Message
                <textarea
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={5}
                  value={form.message}
                  onChange={(event) => updateForm("message", event.target.value)}
                  placeholder="Include any details that will help us resolve this."
                  className="rounded-xl border border-outline-variant bg-surface px-3 py-2.5"
                />
                <span className="text-right text-xs font-normal text-text-secondary">
                  {form.message.length}/5000
                </span>
              </label>
              {error && (
                <p role="alert" className="text-sm text-error sm:col-span-2">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    form.subject.trim().length < 5 ||
                    form.message.trim().length < 10
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={16} />
                  {submitting ? "Opening ticket..." : "Submit ticket"}
                </button>
                <p className="text-xs text-text-secondary">
                  Ticket messages are visible only to you and authorized support staff.
                </p>
              </div>
            </form>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-text">Your tickets</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Track replies and updates from support.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadTickets()}
              aria-label="Refresh support tickets"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant bg-surface text-text-secondary hover:text-primary"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          {error && !formOpen && (
            <div className="mb-4 rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error">
              <p role="alert">{error}</p>
              <button
                type="button"
                onClick={loadTickets}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-outline-variant bg-surface p-10 text-center text-sm text-text-secondary">
              Loading your support tickets...
            </div>
          ) : total === 0 ? (
            <div className="rounded-2xl border border-outline-variant bg-surface px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container text-primary">
                <LifeBuoy size={26} />
              </div>
              <h3 className="mt-4 font-semibold text-text">No support tickets yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-text-secondary">
                If you need help with a product, order, delivery, payment, or
                account, create a ticket and our team will reply here.
              </p>
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
              >
                Contact support
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Link
                  key={ticket._id}
                  to={`/support/${ticket._id}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm transition hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-primary">
                        {ticket.ticketNumber}
                      </span>
                      <TicketStatus status={ticket.status} />
                      {ticket.customerUnread > 0 && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                          {ticket.customerUnread} new
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 truncate text-sm font-semibold text-text">
                      {ticket.subject}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                      {ticket.lastPublicMessagePreview}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <span className="text-xs text-text-secondary">
                      {getSupportLabel(supportCategories, ticket.category)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Open conversation <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {!loading && total > 0 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-text-secondary">
                Page {page} of {totalPages} · {total} tickets
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous support tickets"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface text-text disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  aria-label="Next support tickets"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface text-text disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function TicketStatus({ status }) {
  const statusClass =
    status === "resolved" || status === "closed"
      ? "bg-success/10 text-success"
      : status === "awaiting_customer"
        ? "bg-warning/10 text-warning"
        : "bg-primary-container text-primary";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass}`}>
      {getSupportLabel(supportStatuses, status)}
    </span>
  );
}

export default SupportCenter;
