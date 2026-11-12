import { Link, Outlet } from "react-router-dom";

import Navbar from "../components/navigation/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      <footer className="border-t border-outline-variant bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-text-secondary">
            © 2026 ARFusion Commerce. All rights reserved By Abu Rahat.
          </p>
          <Link
            to="/support"
            className="mt-3 inline-flex items-center justify-center text-sm font-medium text-primary hover:underline"
          >
            Contact Support
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
