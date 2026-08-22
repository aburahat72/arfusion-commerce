import { ArrowLeft, Bell, Mail, Package, Tag } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getSettings, saveSettings } from "../../utils/profileStorage";

function Settings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(getSettings());

  const updateSetting = (name, value) => {
    const updated = {
      ...settings,
      [name]: value,
    };

    setSettings(updated);
    saveSettings(updated);
  };

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="mb-6 flex items-center gap-2 text-sm text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to Profile
        </button>

        <section className="rounded-3xl border border-outline-variant bg-surface p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-text">Settings</h1>

            <p className="mt-2 text-sm text-text-secondary">
              Manage your notification preferences.
            </p>
          </div>

          <div className="space-y-3">
            <SettingRow
              icon={<Mail size={19} />}
              title="Email Notifications"
              description="Receive important account updates by email."
              checked={settings.emailNotifications}
              onChange={(value) => updateSetting("emailNotifications", value)}
            />

            <SettingRow
              icon={<Package size={19} />}
              title="Order Notifications"
              description="Get updates about your orders and deliveries."
              checked={settings.orderNotifications}
              onChange={(value) => updateSetting("orderNotifications", value)}
            />

            <SettingRow
              icon={<Tag size={19} />}
              title="Promotional Notifications"
              description="Receive offers, deals and promotional updates."
              checked={settings.promotionalNotifications}
              onChange={(value) =>
                updateSetting("promotionalNotifications", value)
              }
            />
          </div>

          <div className="mt-6 rounded-2xl bg-surface-container p-4">
            <div className="flex gap-3">
              <Bell size={18} className="mt-0.5 shrink-0 text-primary" />

              <p className="text-xs leading-5 text-text-secondary">
                Your notification preferences are saved automatically on this
                device.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SettingRow({ icon, title, description, checked, onChange }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-outline-variant p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{title}</p>

        <p className="mt-1 text-xs text-text-secondary">{description}</p>
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
            top-1
            h-4
            w-4
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

export default Settings;
