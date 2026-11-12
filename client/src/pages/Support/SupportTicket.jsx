import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  getMySupportTicket,
  sendCustomerSupportMessage,
} from "../../services/supportService";
import { getSupportLabel, supportCategories, supportStatuses } from "./supportOptions";

function SupportTicket() {
  const { ticketId } = useParams();
  const loadedTicketId = useRef("");
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const loadTicket = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");
      const response = await getMySupportTicket(ticketId);
      setTicket(response.data.ticket);
      const sameTicket = loadedTicketId.current === ticketId;
      loadedTicketId.current = ticketId;
      setMessages((current) =>
        mergeMessages(sameTicket ? current : [], response.data.messages || []),
      );
      setHasMore(Boolean(response.data.hasMore));
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load this support conversation.",
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => loadTicket(), 0);
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
    setMessageError("");
    try {
      const response = await getMySupportTicket(ticketId, {
        before: messages[0]._id,
      });
      setMessages((current) =>
        mergeMessages(current, response.data.messages || []),
      );
      setHasMore(Boolean(response.data.hasMore));
    } catch (requestError) {
      setMessageError(
        requestError?.response?.data?.message ||
          "Unable to load earlier messages.",
      );
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!body.trim() || ticket?.status === "closed") return;
    setSending(true);
    setMessageError("");
    try {
      await sendCustomerSupportMessage(ticketId, body.trim());
      setBody("");
      await loadTicket(true);
    } catch (requestError) {
      setMessageError(
        requestError?.response?.data?.message || "Unable to send your reply.",
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <SupportPageMessage>Loading support conversation...</SupportPageMessage>;
  }

  if (error || !ticket) {
    return (
      <SupportPageMessage error={error || "Support ticket not found."}>
        <Link
          to="/support"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft size={16} /> Back to support
        </Link>
      </SupportPageMessage>
    );
  }

  return (
    <main className="min-h-screen bg-background py-6 sm:py-9">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/support"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"
        >
          <ArrowLeft size={16} /> All support tickets
        </Link>

        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
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
              <span>{getSupportLabel(supportCategories, ticket.category)}</span>
              {ticket.order && <span>Order #{ticket.order._id}</span>}
              <span>
                {ticket.assignedTo
                  ? `Assigned to ${ticket.assignedTo.fullName}`
                  : "Waiting for a support agent"}
              </span>
            </div>
          </header>

          <div className="bg-background/70 p-4 sm:p-6">
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
            {messageError && (
              <p role="alert" className="mb-3 text-sm text-error">
                {messageError}
              </p>
            )}
            <div className="space-y-4">
              {messages.map((message) => {
                const ownMessage = message.senderRole === "customer";
                return (
                  <article
                    key={message._id}
                    className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
                        ownMessage
                          ? "rounded-br-md bg-primary text-white"
                          : "rounded-bl-md border border-outline-variant bg-surface text-text"
                      }`}
                    >
                      <p
                        className={`mb-1 text-[11px] font-semibold ${
                          ownMessage ? "text-white/75" : "text-text-secondary"
                        }`}
                      >
                        {ownMessage ? "You" : message.sender?.fullName || "Support team"}
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {message.body}
                      </p>
                      <time
                        dateTime={message.createdAt}
                        className={`mt-2 block text-right text-[10px] ${
                          ownMessage ? "text-white/70" : "text-text-secondary"
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

          {ticket.status === "closed" ? (
            <div className="border-t border-outline-variant p-5 text-center">
              <MessageCircle className="mx-auto text-text-secondary" size={22} />
              <p className="mt-2 text-sm font-medium text-text">
                This ticket is closed.
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                If you need more help, open a new support ticket.
              </p>
              <Link
                to="/support"
                className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-white"
              >
                Open a new ticket
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSend}
              className="border-t border-outline-variant p-4 sm:p-5"
            >
              <label className="sr-only" htmlFor="support-reply">
                Write a reply
              </label>
              <textarea
                id="support-reply"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                maxLength={5000}
                rows={3}
                placeholder="Write a reply to the support team..."
                className="w-full resize-y rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-text-secondary">
                  Replies reopen resolved tickets. Closed tickets cannot receive replies.
                </p>
                <button
                  type="submit"
                  disabled={sending || !body.trim()}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={15} />
                  {sending ? "Sending..." : "Send reply"}
                </button>
              </div>
            </form>
          )}
        </section>
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

function SupportPageMessage({ children, error }) {
  return (
    <main className="flex min-h-[65vh] flex-col items-center justify-center bg-background px-4 text-center">
      {error ? (
        <p role="alert" className="text-sm text-error">{error}</p>
      ) : (
        <p className="text-sm text-text-secondary">{children}</p>
      )}
      {error && children}
    </main>
  );
}

export default SupportTicket;
