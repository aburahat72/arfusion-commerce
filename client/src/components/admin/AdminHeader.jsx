import { Bell, ChevronDown, Menu, Search, UserCircle } from "lucide-react";
import { useState } from "react";

function AdminHeader({ onMenuClick }) {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/95 backdrop-blur">
      <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open admin navigation"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-text-secondary
            transition
            hover:bg-surface-container
            hover:text-text
            lg:hidden
          "
        >
          <Menu size={21} />
        </button>

        {/* Page title */}

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-text sm:text-2xl">
            Dashboard
          </h1>
        </div>

        {/* Right actions */}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Search */}

          <div className="relative hidden sm:block">
            <Search
              size={17}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-text-secondary
              "
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="
                h-11
                w-44
                rounded-xl
                border
                border-outline-variant
                bg-surface-container
                pl-10
                pr-3
                text-sm
                text-text
                outline-none
                transition
                placeholder:text-text-secondary
                focus:border-primary
                focus:ring-2
                focus:ring-primary/15
                lg:w-52
                xl:w-60
              "
            />
          </div>

          {/* Mobile search */}

          <button
            type="button"
            aria-label="Search"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-text-secondary
              transition
              hover:bg-surface-container
              hover:text-text
              sm:hidden
            "
          >
            <Search size={20} />
          </button>

          {/* Notifications */}

          <button
            type="button"
            aria-label="Notifications"
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-text-secondary
              transition
              hover:bg-surface-container
              hover:text-text
            "
          >
            <Bell size={20} />

            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-semibold text-white">
              8
            </span>
          </button>

          {/* Admin profile */}

          <button
            type="button"
            className="
              flex
              items-center
              gap-2
              rounded-xl
              p-1.5
              transition
              hover:bg-surface-container
            "
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary">
              <UserCircle size={22} />
            </div>

            <div className="hidden text-left xl:block">
              <p className="text-sm font-semibold text-text">Admin User</p>

              <p className="text-xs text-text-secondary">Super Admin</p>
            </div>

            <ChevronDown
              size={16}
              className="hidden text-text-secondary xl:block"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
