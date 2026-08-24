import {
  AlertTriangle,
  ArrowRight,
  Box,
  Package,
  ShoppingCart,
  UserPlus,
} from "lucide-react";

import { activityFeed } from "../../data/adminDashboard";

function ActivityFeed() {
  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-text sm:text-lg">
          Activity Feed
        </h3>

        <button
          type="button"
          className="
            inline-flex
            shrink-0
            items-center
            gap-1
            text-xs
            font-semibold
            text-primary
            transition
            hover:underline
          "
        >
          View all
          <ArrowRight size={14} />
        </button>
      </div>

      {/* =================================================
          ACTIVITIES
      ================================================= */}

      <div className="mt-4 space-y-1">
        {activityFeed.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   ACTIVITY ITEM
========================================================= */

function ActivityItem({ activity }) {
  const config = getActivityConfig(activity.type);

  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-surface-container">
      {/* Icon */}

      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          ${config.containerClass}
        `}
      >
        <Icon size={17} strokeWidth={2} />
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium leading-5 text-text">
          {activity.title}
        </p>

        <p className="mt-0.5 text-[11px] text-text-secondary">
          {activity.time}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ACTIVITY CONFIG
========================================================= */

function getActivityConfig(type) {
  const config = {
    order: {
      icon: ShoppingCart,
      containerClass: "bg-primary-container text-primary",
    },

    product: {
      icon: Box,
      containerClass: "bg-blue-100 text-blue-600",
    },

    customer: {
      icon: UserPlus,
      containerClass: "bg-green-100 text-green-600",
    },

    shipping: {
      icon: Package,
      containerClass: "bg-violet-100 text-violet-600",
    },

    warning: {
      icon: AlertTriangle,
      containerClass: "bg-orange-100 text-orange-600",
    },
  };

  return (
    config[type] || {
      icon: Box,
      containerClass: "bg-surface-container text-text-secondary",
    }
  );
}

export default ActivityFeed;
