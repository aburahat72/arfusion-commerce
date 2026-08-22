import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#1F1F23]">
      <div className="flex min-h-screen">
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="hidden w-64 shrink-0 border-r border-[#E3E5EA] bg-white lg:flex lg:flex-col">
          <div className="flex h-16 items-center border-b border-[#E3E5EA] px-6">
            <span className="text-xl font-semibold text-[#6750A4]">
              ARFusion
            </span>
          </div>

          <nav className="flex-1 p-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Administration
            </p>
          </nav>

          <div className="border-t border-[#E3E5EA] p-4">
            <p className="px-3 text-sm text-[#6B7280]">ARFusion Commerce</p>
          </div>
        </aside>

        {/* =================================================
            MAIN
        ================================================= */}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 h-16 border-b border-[#E3E5EA] bg-white">
            <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
              <h1 className="text-lg font-semibold">Admin Panel</h1>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EADDFF] text-sm font-semibold text-[#6750A4]">
                A
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
