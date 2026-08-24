import {
  CheckCircle2,
  Eye,
  MessageSquare,
  Search,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const reviews = [
  {
    id: "REV-1001",
    customer: "John Doe",
    product: "Wireless Headphones",
    rating: 5,
    title: "Excellent product",
    comment:
      "The sound quality is excellent and the battery lasts a long time.",
    status: "Published",
    date: "24 Aug 2026",
  },
  {
    id: "REV-1002",
    customer: "Emily Johnson",
    product: "Smart Watch",
    rating: 4,
    title: "Very useful",
    comment: "Good watch with a clean interface and useful health features.",
    status: "Published",
    date: "23 Aug 2026",
  },
  {
    id: "REV-1003",
    customer: "Michael Smith",
    product: "Running Shoes",
    rating: 5,
    title: "Very comfortable",
    comment:
      "Comfortable for long walks and running. Good quality for the price.",
    status: "Pending",
    date: "22 Aug 2026",
  },
  {
    id: "REV-1004",
    customer: "Sarah Williams",
    product: "Travel Backpack",
    rating: 3,
    title: "Average",
    comment: "The design is good but I expected slightly better material.",
    status: "Pending",
    date: "21 Aug 2026",
  },
  {
    id: "REV-1005",
    customer: "David Brown",
    product: "Bluetooth Speaker",
    rating: 1,
    title: "Not satisfied",
    comment: "The speaker stopped working after a few days.",
    status: "Rejected",
    date: "20 Aug 2026",
  },
];

function AdminReviews() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [rating, setRating] = useState("All");

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !query ||
        review.customer.toLowerCase().includes(query) ||
        review.product.toLowerCase().includes(query) ||
        review.title.toLowerCase().includes(query) ||
        review.id.toLowerCase().includes(query);

      const matchesStatus = status === "All" || review.status === status;

      const matchesRating =
        rating === "All" || review.rating === Number(rating);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [search, status, rating]);

  const publishedCount = reviews.filter(
    (review) => review.status === "Published",
  ).length;

  const pendingCount = reviews.filter(
    (review) => review.status === "Pending",
  ).length;

  const rejectedCount = reviews.filter(
    (review) => review.status === "Rejected",
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const handleView = (review) => {
    navigate(`/admin/reviews/${review.id}`);
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <p className="text-sm text-text-secondary">Sales</p>

          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                Reviews
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Moderate customer reviews and manage product feedback.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReviewStat
            title="Total Reviews"
            value={reviews.length}
            icon={<MessageSquare size={20} />}
            iconClass="bg-primary-container text-primary"
          />

          <ReviewStat
            title="Published"
            value={publishedCount}
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-success/10 text-success"
          />

          <ReviewStat
            title="Pending"
            value={pendingCount}
            icon={<MessageSquare size={20} />}
            iconClass="bg-warning/10 text-warning"
          />

          <ReviewStat
            title="Average Rating"
            value={`${averageRating}/5`}
            icon={<Star size={20} />}
            iconClass="bg-orange-100 text-orange-600"
          />
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            {/* Search */}

            <div className="relative">
              <Search
                size={17}
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-text-secondary
                "
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, product, title or review ID..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-outline-variant
                  bg-surface
                  pl-10
                  pr-4
                  text-sm
                  text-text
                  outline-none
                  transition
                  placeholder:text-text-secondary
                  hover:border-outline
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/15
                "
              />
            </div>

            {/* Status */}

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="
                h-11
                rounded-xl
                border
                border-outline-variant
                bg-surface
                px-3
                text-sm
                text-text
                outline-none
                transition
                focus:border-primary
                focus:ring-2
                focus:ring-primary/15
              "
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Rating */}

            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              className="
                h-11
                rounded-xl
                border
                border-outline-variant
                bg-surface
                px-3
                text-sm
                text-text
                outline-none
                transition
                focus:border-primary
                focus:ring-2
                focus:ring-primary/15
              "
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </section>

        {/* =================================================
            RESULT COUNT
        ================================================= */}

        <div className="mt-5">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-semibold text-text">
              {filteredReviews.length}
            </span>{" "}
            reviews
          </p>
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <section className="mt-4 hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/60">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Rating
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Review
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold text-text-secondary">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    onView={handleView}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredReviews.length === 0 && <EmptyReviews />}
        </section>

        {/* =================================================
            MOBILE
        ================================================= */}

        <section className="mt-4 space-y-3 md:hidden">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} onView={handleView} />
          ))}

          {filteredReviews.length === 0 && (
            <div className="rounded-2xl border border-outline-variant bg-surface p-8">
              <EmptyReviews />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   STAT
========================================================= */

function ReviewStat({ title, value, icon, iconClass }) {
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

          <p className="mt-1 truncate text-xl font-semibold text-text sm:text-2xl">
            {value}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   DESKTOP ROW
========================================================= */

function ReviewRow({ review, onView }) {
  return (
    <tr className="border-b border-outline-variant last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={review.customer} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {review.customer}
            </p>

            <p className="mt-0.5 text-xs text-text-secondary">{review.id}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-text">{review.product}</td>

      <td className="px-5 py-4">
        <RatingStars rating={review.rating} />
      </td>

      <td className="max-w-[320px] px-5 py-4">
        <p className="truncate text-sm font-medium text-text">{review.title}</p>

        <p className="mt-1 truncate text-xs text-text-secondary">
          {review.comment}
        </p>
      </td>

      <td className="px-5 py-4">
        <ReviewStatus status={review.status} />
      </td>

      <td className="px-5 py-4 text-sm text-text-secondary">{review.date}</td>

      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => onView(review)}
          aria-label={`View ${review.id}`}
          className="
            inline-flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            text-text-secondary
            transition
            hover:bg-surface-container
            hover:text-primary
          "
        >
          <Eye size={17} />
        </button>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function ReviewCard({ review, onView }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar name={review.customer} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">
                {review.customer}
              </p>

              <p className="mt-1 text-xs text-text-secondary">{review.id}</p>
            </div>

            <ReviewStatus status={review.status} />
          </div>

          <p className="mt-3 text-xs font-medium text-text">{review.product}</p>

          <div className="mt-2">
            <RatingStars rating={review.rating} />
          </div>

          <h3 className="mt-3 text-sm font-semibold text-text">
            {review.title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {review.comment}
          </p>

          <p className="mt-3 text-[11px] text-text-secondary">{review.date}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onView(review)}
        className="
          mt-4
          flex
          h-10
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-outline-variant
          text-xs
          font-semibold
          text-text
          transition
          hover:bg-surface-container
          hover:text-primary
        "
      >
        <Eye size={15} />
        View Review
      </button>
    </article>
  );
}

/* =========================================================
   RATING
========================================================= */

function RatingStars({ rating }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          fill={star <= rating ? "currentColor" : "none"}
          className={
            star <= rating ? "text-orange-500" : "text-outline-variant"
          }
        />
      ))}
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function ReviewStatus({ status }) {
  if (status === "Published") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1.5 text-[10px] font-semibold text-success">
        <CheckCircle2 size={12} />
        Published
      </span>
    );
  }

  if (status === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-1.5 text-[10px] font-semibold text-error">
        <XCircle size={12} />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1.5 text-[10px] font-semibold text-warning">
      <MessageSquare size={12} />
      Pending
    </span>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-xs font-semibold text-primary">
      {initials}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyReviews() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
        <Star size={21} className="text-text-secondary" />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-text">No reviews found</h2>

      <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
        Try changing your search, rating, or status filter.
      </p>
    </div>
  );
}

export default AdminReviews;
