import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
  Trash,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  deleteAdminReview,
  getAdminReviews,
  updateAdminReviewStatus,
} from "../../../services/adminApi";

const initialSummary = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  removed: 0,
  averageRating: 0,
};

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(initialSummary);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [rating, setRating] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAdminReviews({
          page: pagination.page,
          limit: 15,
          search,
          status,
          rating,
        });
        if (!active) return;
        const data = response.data;
        setReviews(data.reviews || []);
        setSummary(data.summary || initialSummary);
        setPagination((current) => ({
          ...current,
          ...data.pagination,
        }));
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError?.response?.data?.message || "Unable to load reviews.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }, search ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [pagination.page, search, status, rating, refresh]);

  const changeFilter = (setter, value) => {
    setPagination((current) => ({ ...current, page: 1 }));
    setter(value);
  };

  const moderateReview = async (reviewId, nextStatus) => {
    setUpdatingId(reviewId);
    setError("");
    setNotice("");

    try {
      const response = await updateAdminReviewStatus(reviewId, nextStatus);
      setNotice(response.data.message || "Review moderation updated.");
      setRefresh((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to update this review.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  const permanentlyDeleteReview = async (review) => {
    const confirmed = window.confirm(
      "Permanently delete this review? Its rating and comment will be erased and cannot be recovered. The customer will not be able to submit another review for this order item.",
    );
    if (!confirmed) return;

    setUpdatingId(review._id);
    setError("");
    setNotice("");

    try {
      const response = await deleteAdminReview(review._id);
      setNotice(response.data.message || "Review permanently deleted.");
      setRefresh((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to permanently delete this review.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6">
          <p className="text-sm text-text-secondary">Sales</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Reviews
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Moderate verified customer feedback before it is shown publicly.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="All reviews" value={summary.total} />
          <SummaryCard label="Awaiting moderation" value={summary.pending} />
          <SummaryCard label="Published" value={summary.approved} />
          <SummaryCard
            label="Published average"
            value={`${Number(summary.averageRating).toFixed(1)} / 5`}
          />
        </section>

        <section className="mt-6 grid gap-3 rounded-2xl border border-outline-variant bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_180px_150px]">
          <label className="relative">
            <span className="sr-only">Search reviews</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => changeFilter(setSearch, event.target.value)}
              placeholder="Search customer, product, or review..."
              className="h-11 w-full rounded-xl border border-outline-variant bg-surface pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label>
            <span className="sr-only">Filter by moderation status</span>
            <select
              value={status}
              onChange={(event) => changeFilter(setStatus, event.target.value)}
              className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm text-text outline-none focus:border-primary"
            >
              <option value="all">All statuses</option>
              <option value="pending">Awaiting moderation</option>
              <option value="approved">Published</option>
              <option value="rejected">Rejected</option>
              <option value="removed">Removed</option>
            </select>
          </label>

          <label>
            <span className="sr-only">Filter by rating</span>
            <select
              value={rating}
              onChange={(event) => changeFilter(setRating, event.target.value)}
              className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm text-text outline-none focus:border-primary"
            >
              <option value="all">All ratings</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} {value === 1 ? "star" : "stars"}
                </option>
              ))}
            </select>
          </label>
        </section>

        {notice && (
          <p role="status" className="mt-4 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">
            {loading ? "Loading reviews..." : `${pagination.total} reviews`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={pagination.page <= 1 || loading}
              onClick={() =>
                setPagination((current) => ({ ...current, page: current.page - 1 }))
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-text disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="text-xs text-text-secondary">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={
                pagination.page >= pagination.totalPages || loading
              }
              onClick={() =>
                setPagination((current) => ({ ...current, page: current.page + 1 }))
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-text disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <section className="mt-3 overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
          {loading && reviews.length === 0 ? (
            <p className="p-10 text-center text-sm text-text-secondary">
              Loading reviews...
            </p>
          ) : reviews.length === 0 ? (
            <p className="p-10 text-center text-sm text-text-secondary">
              {error ? "Reviews could not be loaded." : "No reviews match these filters."}
            </p>
          ) : (
            <div className="divide-y divide-outline-variant">
              {reviews.map((review) => (
                <article
                  key={review._id}
                  className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h2 className="text-sm font-semibold text-text">
                        {review.user?.fullName || "Deleted customer"}
                      </h2>
                      <ReviewStatus status={review.status} />
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-xs text-success">
                          <BadgeCheck size={14} /> Verified purchase
                        </span>
                      )}
                      {!review.verifiedPurchase && (
                        <span className="text-xs text-warning">
                          Legacy review without order verification
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">
                      {review.product?.name || "Deleted product"} ·{" "}
                      {formatDate(review.createdAt)} · Order{" "}
                      {review.order?._id || "unavailable"}
                    </p>
                    <div
                      className="mt-3 flex items-center gap-0.5"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={15}
                          className={
                            value <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-outline-variant"
                          }
                        />
                      ))}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                      {review.comment}
                    </p>
                  </div>
                  <ReviewActions
                    review={review}
                    disabled={updatingId === review._id}
                    onModerate={moderateReview}
                    onDelete={permanentlyDeleteReview}
                  />
                </article>
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
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text">{value}</p>
    </article>
  );
}

function ReviewStatus({ status }) {
  const labels = {
    pending: "Awaiting moderation",
    approved: "Published",
    rejected: "Rejected",
    removed: "Removed",
  };

  return (
    <span className="rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium capitalize text-text-secondary">
      {labels[status] || status}
    </span>
  );
}

function ReviewActions({ review, disabled, onModerate, onDelete }) {
  const canPublish = Boolean(review.verifiedPurchase && review.order);

  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      {canPublish && review.status !== "approved" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onModerate(review._id, "approved")}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-success/10 px-3 text-xs font-semibold text-success disabled:opacity-50"
        >
          <Check size={14} /> Approve
        </button>
      )}
      {review.status !== "rejected" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onModerate(review._id, "rejected")}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-warning/10 px-3 text-xs font-semibold text-warning disabled:opacity-50"
        >
          <X size={14} /> Reject
        </button>
      )}
      {review.status !== "removed" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onModerate(review._id, "removed")}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-error/10 px-3 text-xs font-semibold text-error disabled:opacity-50"
        >
          <Trash2 size={14} /> Remove
        </button>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onDelete(review)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-error/30 px-3 text-xs font-semibold text-error disabled:opacity-50"
      >
        <Trash size={14} /> Delete permanently
      </button>
      {review.status === "removed" && canPublish && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onModerate(review._id, "pending")}
          className="h-9 rounded-lg border border-outline-variant px-3 text-xs font-semibold text-text disabled:opacity-50"
        >
          Restore to pending
        </button>
      )}
    </div>
  );
}

export default AdminReviews;
