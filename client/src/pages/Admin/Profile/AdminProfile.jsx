import {
  Bell,
  Camera,
  Check,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";

function AdminProfile() {
  const [profile, setProfile] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@arfusion.com",
    phone: "+91 98765 43210",
    role: "Super Administrator",
    notifications: true,
  });

  const [saved, setSaved] = useState(false);

  const updateProfile = (key, value) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    /*
     * Frontend-only for now.
     * Replace with an API request when authentication/backend
     * integration is connected.
     */
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1100px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-text-secondary">Administration</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Admin Profile
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Manage your administrator account information and security.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-primary
              px-4
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:opacity-90
            "
          >
            <Save size={17} />
            Save Changes
          </button>
        </div>

        {/* =================================================
            SAVE MESSAGE
        ================================================= */}

        {saved && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
            <Check size={17} />
            Profile updated successfully.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* =================================================
              PROFILE SUMMARY
          ================================================= */}

          <section className="h-fit rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-container text-2xl font-semibold text-primary">
                  AU
                </div>

                <button
                  type="button"
                  aria-label="Change profile photo"
                  className="
                    absolute
                    bottom-0
                    right-0
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-surface
                    bg-primary
                    text-white
                    shadow-sm
                    transition
                    hover:opacity-90
                  "
                >
                  <Camera size={15} />
                </button>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-text">
                {profile.firstName} {profile.lastName}
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                {profile.email}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5 text-[10px] font-semibold text-primary">
                <ShieldCheck size={12} />
                {profile.role}
              </span>
            </div>

            <div className="mt-6 border-t border-outline-variant pt-5">
              <ProfileInfo
                icon={<Mail size={15} />}
                label="Email"
                value={profile.email}
              />

              <ProfileInfo
                icon={<Phone size={15} />}
                label="Phone"
                value={profile.phone}
              />

              <ProfileInfo
                icon={<ShieldCheck size={15} />}
                label="Access"
                value="Full Admin Access"
              />
            </div>
          </section>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="space-y-6">
            {/* Personal information */}

            <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <SectionHeader
                icon={<User size={18} />}
                title="Personal Information"
                description="Update your administrator account details."
              />

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  label="First Name"
                  value={profile.firstName}
                  onChange={(value) => updateProfile("firstName", value)}
                />

                <Field
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(value) => updateProfile("lastName", value)}
                />

                <Field
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  onChange={(value) => updateProfile("email", value)}
                />

                <Field
                  label="Phone Number"
                  value={profile.phone}
                  onChange={(value) => updateProfile("phone", value)}
                />
              </div>
            </section>

            {/* Account security */}

            <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <SectionHeader
                icon={<KeyRound size={18} />}
                title="Account Security"
                description="Manage your administrator account security."
              />

              <div className="mt-5">
                <button
                  type="button"
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-outline-variant
                    px-4
                    text-sm
                    font-semibold
                    text-text
                    transition
                    hover:bg-surface-container
                  "
                >
                  <KeyRound size={16} />
                  Change Password
                </button>
              </div>

              <div className="mt-5 border-t border-outline-variant pt-5">
                <ToggleRow
                  title="Login Notifications"
                  description="Receive an alert when your administrator account is accessed."
                  checked={profile.notifications}
                  onChange={(value) => updateProfile("notifications", value)}
                />
              </div>
            </section>

            {/* Access information */}

            <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
              <SectionHeader
                icon={<ShieldCheck size={18} />}
                title="Access & Permissions"
                description="Your current administrator role and access level."
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <PermissionCard
                  title="Store Management"
                  description="Products, inventory and categories"
                  active
                />

                <PermissionCard
                  title="Order Management"
                  description="Orders, customers and fulfillment"
                  active
                />

                <PermissionCard
                  title="Analytics"
                  description="Reports and store performance"
                  active
                />

                <PermissionCard
                  title="System Settings"
                  description="Application configuration"
                  active
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
        {icon}
      </div>

      <div>
        <h2 className="text-base font-semibold text-text sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-text">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-11
          w-full
          rounded-xl
          border
          border-outline-variant
          bg-surface
          px-3.5
          text-sm
          text-text
          outline-none
          transition
          hover:border-outline
          focus:border-primary
          focus:ring-2
          focus:ring-primary/15
        "
      />
    </label>
  );
}

/* =========================================================
   PROFILE INFO
========================================================= */

function ProfileInfo({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="mt-0.5 text-text-secondary">{icon}</div>

      <div className="min-w-0">
        <p className="text-[10px] text-text-secondary">{label}</p>

        <p className="mt-0.5 truncate text-xs font-medium text-text">{value}</p>
      </div>
    </div>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{title}</p>

        <p className="mt-1 text-xs leading-5 text-text-secondary">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition
          ${checked ? "bg-primary" : "bg-outline-variant"}
        `}
      >
        <span
          className={`
            absolute
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            rounded-full
            bg-white
            shadow-sm
            transition
            ${checked ? "left-6" : "left-1"}
          `}
        />
      </button>
    </div>
  );
}

/* =========================================================
   PERMISSION CARD
========================================================= */

function PermissionCard({ title, description, active }) {
  return (
    <div className="rounded-xl border border-outline-variant p-4">
      <div className="flex items-start gap-3">
        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${
              active
                ? "bg-success/10 text-success"
                : "bg-surface-container text-text-secondary"
            }
          `}
        >
          <ShieldCheck size={16} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-text">{title}</p>

          <p className="mt-1 text-[11px] leading-5 text-text-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <span className="text-[10px] font-semibold text-success">Enabled</span>
      </div>
    </div>
  );
}

export default AdminProfile;
