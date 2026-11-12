import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Send,
  ShieldAlert,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  getAdminSupportAgents,
  getAdminSupportTicket,
  sendAdminSupportMessage,
  updateAdminSupportTicket,
} from "../../../services/supportService";
import {
  getSupportLabel,
  supportPriorities,
  supportStatuses,
} from "../../Support/supportOptions";

function AdminSupportTicket() {
  const { ticketId } = useParams();
  const loadedTicketId = useRef("");
  const controlsDirty = useRef(false);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [form, setForm] = useState({
    status: "open",
    priority: "normal",
    assignedTo: "",
  });

  const loadTicket = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");
      const response = await getAdminSupportTicket(ticketId);
      const nextTicket = response.data.ticket;
      setTicket(nextTicket);
      const sameTicket = loadedTicketId.current === ticketId;
      loadedTicketId.current = ticketId;
      setMessages((current) =>
        mergeMessages(sameTicket ? current : [], response.data.messages || []),
      );
      setHasMore(Boolean(response.data.hasMore));
      if (!controlsDirty.current) {
        setForm({
          status: nextTicket.status,
          priority: nextTicket.priority,
          assignedTo: nextTicket.assignedTo?._id || "",
        });
      }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load this support ticket.",
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => loadTicket(), 0);
    getAdminSupportAgents()
      .then((response) => setAgents(response.data.agents || []))
      .catch((requestError) => {
        setActionError(
          requestError?.response?.data?.message ||
            "Unable to load support agents.",
        );
      });

    const handleSupportUpdate = (event) => {
      if (event.detail?.ticketId === ticketId) loadTicket(true);
    };
    window.addEventListener("arfusion:support:update", handleSupportUpdate);
    const poll = window.setInterval(() => loadTicket(true), 20000);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("arfusion:support:update", handleSupportUpdate);
      window.clearInterval(poll);
    };
  }, [loadTicket, ticketId]);

  const loadOlderMessages = async () => {
    if (!messages.length) return;
    setLoadingOlder(true);
    setActionError("");
    try {
      const response = await getAdminSupportTicket(ticketId, {
        before: messages[0]._id,
      });
      setMessages((current) =>
        mergeMessages(current, response.data.messages || []),
      );
      setHasMore(Boolean(response.data.hasMore));
    } catch (requestError) {
      setActionError(
        requestError?.response?.data?.message ||
          "Unable to load earlier messages.",
      );
    } finally {
      setLoadingOlder(false);
    }
  };

  const saveTicket = async (event) => {
    event.preventDefault();
    setSaving(true);
    setActionError("");
    setNotice("");
    try {
      const response = await updateAdminSupportTicket(ticketId, {
        ...form,
        assignedTo: form.assignedTo || null,
      });
      controlsDirty.current = false;
      setTicket((current) => ({ ...current, ...response.data.ticket }));
      setForm({
        status: response.data.ticket.status,
        priority: response.data.ticket.priority,
        assignedTo: response.data.ticket.assignedTo?._id || "",
      });
      setNotice("Ticket details saved.");
    } catch (requestError) {
      setActionError(
        requestError?.response?.data?.message ||
          "Unable to update ticket details.",
      );
    } finally {
      setSaving(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setActionError("");
    setNotice("");
    try {
      await sendAdminSupportMessage(ticketId, body.trim(), isInternal);
      setBody("");
      setIsInternal(false);
      await loadTicket(true);
      setNotice(isInternal ? "Internal note added." : "Reply sent to customer.");
    } catch (requestError) {
      setActionError(
        requestError?.response?.data?.message ||
          "Unable to send the support message.",
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <PageState>Loading support ticket...</PageState>;
  }
  if (error || !ticket) {
    return (
      <PageState error={error || "Support ticket not found."}>
        <Link
          to="/admin/support"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft size={16} /> Back to support tickets
        </Link>
      </PageState>
    );
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/admin/support"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"
        >
          <ArrowLeft size={16} /> Support tickets
        </Link>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <header className="border-b border-outline-variant p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold tracking-wide text-primary">
                  {ticket.ticketNumber}
                </span>
                <TicketStatus status={ticket.status} />
              </div>
              <h1 className="mt-2 text-xl font-semibold text-text sm:text-2xl">
                {ticket.subject}
              </h1>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text-secondary">
                <span>{getSupportLabel(supportStatuses, ticket.status)}</span>
                <span>{getSupportLabel(supportPriorities, ticket.priority)} priority</span>
                {ticket.order && (
                  <Link
                    to={`/admin/orders/${ticket.order._id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Order #{ticket.order._id} · {ticket.order.orderStatus}
                  </Link>
                )}
              </div>
            </header>

            <div className="max-h-[65vh] min-h-[360px] overflow-y-auto bg-background/70 p-4 sm:p-6">
              {hasMore && (
                <button
                  type="button"
                  onClick={loadOlderMessages}
                  disabled={loadingOlder}
                  className="mx-auto mb-4 flex h-9 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 text-xs font-semibold text-text-secondary disabled:opacity-50"
                >
                  <RefreshCw size={13} />
                  {loadingOlder ? "Loading..." : "Load earlier messages"}
                </button>
              )}
              <div className="space-y-4">
                {messages.map((message) => {
                  const internal = message.isInternal;
                  const ownMessage = message.senderRole === "admin";
                  return (
                    <article
                      key={message._id}
                      className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
                          internal
                            ? "border border-warning/30 bg-warning/10 text-text"
                            : ownMessage
                              ? "rounded-br-md bg-primary text-white"
                              : "rounded-bl-md border border-outline-variant bg-surface text-text"
                        }`}
                      >
                        <p
                          className={`mb-1 flex items-center gap-1 text-[11px] font-semibold ${
                            internal
                              ? "text-warning"
                              : ownMessage
                                ? "text-white/75"
                                : "text-text-secondary"
                          }`}
                        >
                          {internal && <ShieldAlert size={13} />}
                          {internal
                            ? `Internal note · ${message.sender?.fullName || "Agent"}`
                            : ownMessage
                              ? "Support team"
                              : message.sender?.fullName || "Customer"}
                        </p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {message.body}
                        </p>
                        <time
                          dateTime={message.createdAt}
                          className={`mt-2 block text-right text-[10px] ${
                            ownMessage && !internal
                              ? "text-white/70"
                              : "text-text-secondary"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleString()}
                        </time>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <form onSubmit={sendMessage} className="border-t border-outline-variant p-4 sm:p-5">
              <label className="sr-only" htmlFor="admin-support-reply">
                Reply to support ticket
              </label>
              <textarea
                id="admin-support-reply"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                maxLength={5000}
                rows={3}
                placeholder={
                  isInternal
                    ? "Write a private note for support staff..."
                    : "Write a reply visible to the customer..."
                }
                className="w-full resize-y rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(event) => setIsInternal(event.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  Add as an internal note (customer cannot see it)
                </label>
                <button
                  type="submit"
                  disabled={sending || !body.trim()}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                    isInternal ? "bg-warning" : "bg-primary"
                  }`}
                >
                  <Send size={15} />
                  {sending ? "Sending..." : isInternal ? "Add note" : "Send reply"}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-text">Customer</h2>
              <p className="mt-3 text-sm font-medium text-text">
                {ticket.customer?.fullName || "Customer"}
              </p>
              <a
                href={`mailto:${ticket.customer?.email || ""}`}
                className="mt-1 block break-all text-xs text-primary hover:underline"
              >
                {ticket.customer?.email || "No email address"}
              </a>
              <p className="mt-3 text-xs text-text-secondary">
                Topic: {ticket.category.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Opened {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </section>

            <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-text">Ticket controls</h2>
              <form onSubmit={saveTicket} className="mt-4 grid gap-3">
                <label className="grid gap-1 text-xs font-medium text-text-secondary">
                  Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      {
                        controlsDirty.current = true;
                        setForm((current) => ({
                          ...current,
                          status: event.target.value,
                        }));
                      }
                    }
                    className="h-10 rounded-lg border border-outline-variant bg-surface px-2 text-sm text-text"
                  >
                    {supportStatuses.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-medium text-text-secondary">
                  Priority
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      {
                        controlsDirty.current = true;
                        setForm((current) => ({
                          ...current,
                          priority: event.target.value,
                        }));
                      }
                    }
                    className="h-10 rounded-lg border border-outline-variant bg-surface px-2 text-sm text-text"
                  >
                    {supportPriorities.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-medium text-text-secondary">
                  Assigned agent
                  <select
                    value={form.assignedTo}
                    onChange={(event) =>
                      {
                        controlsDirty.current = true;
                        setForm((current) => ({
                          ...current,
                          assignedTo: event.target.value,
                        }));
                      }
                    }
                    className="h-10 rounded-lg border border-outline-variant bg-surface px-2 text-sm text-text"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.fullName} · {agent.email}
                      </option>
                    ))}
                  </select>
                </label>
                {actionError && (
                  <p role="alert" className="text-xs text-error">
                    {actionError}
                  </p>
                )}
                {notice && (
                  <p role="status" className="text-xs text-success">
                    {notice}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="mt-1 h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save ticket"}
                </button>
              </form>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function TicketStatus({ status }) {
  const style =
    status === "resolved" || status === "closed"
      ? "bg-success/10 text-success"
      : status === "awaiting_customer"
        ? "bg-warning/10 text-warning"
        : "bg-primary-container text-primary";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {getSupportLabel(supportStatuses, status)}
    </span>
  );
}

function mergeMessages(current, incoming) {
  const messagesById = new Map(
    [...current, ...incoming].map((message) => [message._id, message]),
  );
  return [...messagesById.values()].sort(
    (left, right) =>
      new Date(left.createdAt) - new Date(right.createdAt) ||
      left._id.localeCompare(right._id),
  );
}

function PageState({ children, error }) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
      {error ? (
        <p role="alert" className="text-sm text-error">{error}</p>
      ) : (
        <p className="text-sm text-text-secondary">{children}</p>
      )}
      {error && children}
    </main>
  );
}

export default AdminSupportTicket;
