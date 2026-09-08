import { Outlet } from "react-router-dom";

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
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
