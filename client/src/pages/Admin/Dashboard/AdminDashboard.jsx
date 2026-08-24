import AdminStatCard from "../../../components/admin/AdminStatCard";
import SalesOverview from "../../../components/admin/SalesOverview";
import RecentOrders from "../../../components/admin/RecentOrders";
import TopProducts from "../../../components/admin/TopProducts";
import LowStockProducts from "../../../components/admin/LowStockProducts";
import ActivityFeed from "../../../components/admin/ActivityFeed";

import { dashboardStats } from "../../../data/adminDashboard";

function AdminDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <header className="mb-6 sm:mb-7">
        <p className="text-sm text-text-secondary">Overview</p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
          Dashboard
        </h1>
      </header>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section
        aria-label="Dashboard statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {dashboardStats.map((stat) => (
          <AdminStatCard key={stat.id} {...stat} />
        ))}
      </section>

      {/* =================================================
          SALES + RECENT ORDERS
      ================================================= */}

      <section
        aria-label="Sales and recent orders"
        className="
          mt-6
          grid
          gap-6
          xl:grid-cols-[minmax(0,1.75fr)_minmax(340px,0.85fr)]
        "
      >
        <SalesOverview />

        <RecentOrders />
      </section>

      {/* =================================================
          SECONDARY PANELS
      ================================================= */}

      <section
        aria-label="Product and activity overview"
        className="
          mt-6
          grid
          gap-6
          lg:grid-cols-2
          xl:grid-cols-3
        "
      >
        <TopProducts />

        <LowStockProducts />

        <ActivityFeed />
      </section>
    </div>
  );
}

export default AdminDashboard;
