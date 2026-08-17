import { Outlet } from "react-router-dom";

import Navbar from "../components/navigation/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-outline-variant bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm text-text-secondary">
            © 2026 ARFusion Commerce. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
