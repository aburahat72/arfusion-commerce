import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-text">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-h-dvh lg:pl-60">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
