import { BadgeCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getProductReviews } from "../../services/reviewService";

const emptySummary = {
  count: 0,
  averageRating: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

function ProductReviews({ productId, onSummary }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchReviews = async () => {
      setLoading(true);
      setError("");
      setPage(1);
      setReviews([]);
      setSummary(emptySummary);
      onSummary(emptySummary);

      try {
        const response = await getProductReviews(productId, { page: 1, limit: 5 });
        if (!active) return;

        const nextSummary = {
          count: response.count || 0,
          averageRating: response.averageRating || 0,
          distribution: response.distribution || emptySummary.distribution,
        };
        setReviews(response.reviews || []);
        setSummary(nextSummary);
        setTotalPages(response.totalPages || 0);
        onSummary(nextSummary);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError?.response?.data?.message || "Unable to load reviews.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchReviews();
    return () => {
      active = false;
    };
  }, [productId, onSummary]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    setError("");

    try {
      const response = await getProductReviews(productId, {
        page: nextPage,
        limit: 5,
      });
      setReviews((current) => [...current, ...(response.reviews || [])]);
      setPage(nextPage);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to load more reviews.",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const maxRatingCount = Math.max(...Object.values(summary.distribution), 1);

  return (
    <section className="mt-8 rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-text">Customer Reviews</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Reviews from customers who purchased this product.
        </p>
      </div>

      <div className="mt-6 grid gap-6 border-b border-outline-variant pb-6 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div className="flex items-center gap-3 sm:block">
          <div className="flex items-center gap-2">
            <Star size={23} className="fill-amber-400 text-amber-400" />
            <span className="text-3xl font-semibold text-text">
              {Number(summary.averageRating).toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            {summary.count} {summary.count === 1 ? "review" : "reviews"}
          </p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3 text-xs">
              <span className="w-10 text-text-secondary">{rating} stars</span>
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container"
                aria-label={`${summary.distribution[rating]} ${rating}-star reviews`}
              >
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{
                    width: `${(summary.distribution[rating] / maxRatingCount) * 100}%`,
                  }}
                />
              </div>
              <span className="w-6 text-right text-text-secondary">
                {summary.distribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <p className="py-8 text-center text-sm text-text-secondary">
          Loading reviews...
        </p>
      )}

      {!loading && error && (
        <p role="alert" className="py-6 text-center text-sm text-error">
          {error}
        </p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <p className="py-8 text-center text-sm text-text-secondary">
          No approved reviews yet.
        </p>
      )}

      {!loading && reviews.length > 0 && (
        <div className="divide-y divide-outline-variant">
          {reviews.map((review) => (
            <article key={review._id} className="py-5 first:pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-primary">
                    {(review.user?.fullName || "Customer")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {review.user?.fullName || "Customer"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={15}
                      className={
                        star <= review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-outline-variant"
                      }
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                {review.comment}
              </p>
              {review.verifiedPurchase && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-success">
                  <BadgeCheck size={14} />
                  Verified purchase
                </span>
              )}
            </article>
          ))}
        </div>
      )}

      {!loading && page < totalPages && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-4 w-full rounded-xl border border-outline-variant px-4 py-3 text-sm font-semibold text-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingMore ? "Loading..." : "Load more reviews"}
        </button>
      )}
    </section>
  );
}

export default ProductReviews;
