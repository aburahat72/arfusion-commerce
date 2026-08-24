import {
  Bell,
  Check,
  Globe,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { useState } from "react";

function AdminSettings() {
  const [activeSection, setActiveSection] = useState("general");

  const [settings, setSettings] = useState({
    storeName: "ARFusion",
    storeEmail: "support@arfusion.com",
    supportPhone: "+91 98765 43210",
    currency: "INR",
    timezone: "Asia/Kolkata",

    emailNotifications: true,
    orderNotifications: true,
    lowStockNotifications: true,
    reviewNotifications: false,

    twoFactorAuth: false,
    loginAlerts: true,
  });

  const [saved, setSaved] = useState(false);

  const sections = [
    {
      id: "general",
      label: "General",
      icon: Store,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "security",
      label: "Security",
      icon: ShieldCheck,
    },
  ];

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    /*
     * Demo-only persistence.
     * Replace with an API request when the backend is connected.
     */
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1200px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-text-secondary">Administration</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Settings
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Configure store, notifications and security preferences.
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
              disabled:cursor-not-allowed
            "
          >
            <Save size={17} />
            Save Changes
          </button>
        </div>

        {/* =================================================
            SAVED MESSAGE
        ================================================= */}

        {saved && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
            <Check size={17} />
            Settings saved successfully.
          </div>
        )}

        {/* =================================================
            SETTINGS LAYOUT
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* =================================================
              NAVIGATION
          ================================================= */}

          <aside className="h-fit rounded-2xl border border-outline-variant bg-surface p-2 shadow-sm">
            <nav
              aria-label="Settings sections"
              className="flex gap-1 overflow-x-auto lg:flex-col"
            >
              {sections.map((section) => {
                const Icon = section.icon;
                const active = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      flex
                      min-w-max
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-left
                      text-sm
                      font-medium
                      transition
                      lg:w-full
                      ${
                        active
                          ? "bg-primary-container text-primary"
                          : "text-text-secondary hover:bg-surface-container hover:text-text"
                      }
                    `}
                  >
                    <Icon size={18} />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* =================================================
              CONTENT
          ================================================= */}

          <section>
            {activeSection === "general" && (
              <GeneralSettings
                settings={settings}
                updateSetting={updateSetting}
              />
            )}

            {activeSection === "notifications" && (
              <NotificationSettings
                settings={settings}
                updateSetting={updateSetting}
              />
            )}

            {activeSection === "security" && (
              <SecuritySettings
                settings={settings}
                updateSetting={updateSetting}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   GENERAL SETTINGS
========================================================= */

function GeneralSettings({ settings, updateSetting }) {
  return (
    <div className="space-y-6">
      <SettingsCard
        icon={<Store size={18} />}
        title="Store Information"
        description="Basic information about your ecommerce store."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Store Name"
            value={settings.storeName}
            onChange={(value) => updateSetting("storeName", value)}
            icon={<Store size={17} />}
          />

          <Field
            label="Support Email"
            type="email"
            value={settings.storeEmail}
            onChange={(value) => updateSetting("storeEmail", value)}
            icon={<Mail size={17} />}
          />

          <Field
            label="Support Phone"
            value={settings.supportPhone}
            onChange={(value) => updateSetting("supportPhone", value)}
            icon={<UserRound size={17} />}
          />

          <SelectField
            label="Currency"
            value={settings.currency}
            onChange={(value) => updateSetting("currency", value)}
            options={[
              {
                value: "INR",
                label: "Indian Rupee (₹)",
              },
              {
                value: "USD",
                label: "US Dollar ($)",
              },
              {
                value: "EUR",
                label: "Euro (€)",
              },
            ]}
          />

          <SelectField
            label="Timezone"
            value={settings.timezone}
            onChange={(value) => updateSetting("timezone", value)}
            options={[
              {
                value: "Asia/Kolkata",
                label: "India Standard Time",
              },
              {
                value: "UTC",
                label: "UTC",
              },
            ]}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        icon={<Globe size={18} />}
        title="Regional Preferences"
        description="Configure the regional behavior of the admin system."
      >
        <ToggleRow
          title="Display Indian number formatting"
          description="Use INR-friendly number formatting throughout the admin panel."
          checked
          disabled
        />

        <ToggleRow
          title="24-hour time format"
          description="Display administration timestamps using a 24-hour clock."
          checked
          disabled
        />
      </SettingsCard>
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationSettings({ settings, updateSetting }) {
  return (
    <SettingsCard
      icon={<Bell size={18} />}
      title="Notification Preferences"
      description="Choose which events should generate admin notifications."
    >
      <div className="divide-y divide-outline-variant">
        <ToggleRow
          title="Email Notifications"
          description="Receive important administrative notifications by email."
          checked={settings.emailNotifications}
          onChange={(value) => updateSetting("emailNotifications", value)}
        />

        <ToggleRow
          title="New Order Notifications"
          description="Get notified whenever a new customer order is placed."
          checked={settings.orderNotifications}
          onChange={(value) => updateSetting("orderNotifications", value)}
        />

        <ToggleRow
          title="Low Stock Alerts"
          description="Receive alerts when products fall below the stock threshold."
          checked={settings.lowStockNotifications}
          onChange={(value) => updateSetting("lowStockNotifications", value)}
        />

        <ToggleRow
          title="Review Notifications"
          description="Notify administrators when new customer reviews are submitted."
          checked={settings.reviewNotifications}
          onChange={(value) => updateSetting("reviewNotifications", value)}
        />
      </div>
    </SettingsCard>
  );
}

/* =========================================================
   SECURITY
========================================================= */

function SecuritySettings({ settings, updateSetting }) {
  return (
    <div className="space-y-6">
      <SettingsCard
        icon={<ShieldCheck size={18} />}
        title="Security"
        description="Protect your administrator account and store management system."
      >
        <div className="divide-y divide-outline-variant">
          <ToggleRow
            title="Two-Factor Authentication"
            description="Require an additional verification step when administrators sign in."
            checked={settings.twoFactorAuth}
            onChange={(value) => updateSetting("twoFactorAuth", value)}
          />

          <ToggleRow
            title="Login Alerts"
            description="Notify administrators when a new login is detected."
            checked={settings.loginAlerts}
            onChange={(value) => updateSetting("loginAlerts", value)}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        icon={<Lock size={18} />}
        title="Password"
        description="Manage your administrator credentials."
      >
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
          <Lock size={16} />
          Change Password
        </button>
      </SettingsCard>
    </div>
  );
}

/* =========================================================
   SETTINGS CARD
========================================================= */

function SettingsCard({ icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text sm:text-lg">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

/* =========================================================
   TEXT FIELD
========================================================= */

function Field({ label, type = "text", value, onChange, icon }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-text">{label}</span>

      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
          {icon}
        </span>

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
    </label>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-text">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-11
          w-full
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
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{title}</p>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-text-secondary">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition
          ${checked ? "bg-primary" : "bg-outline-variant"}
          ${disabled ? "cursor-default opacity-60" : "cursor-pointer"}
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

export default AdminSettings;
