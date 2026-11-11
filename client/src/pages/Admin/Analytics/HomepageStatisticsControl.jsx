import { useEffect, useState } from "react";
import { AlertCircle, BarChart3, Check, Save } from "lucide-react";
import {
  getAdminHomepageStatistics,
  updateAdminHomepageStatistics,
} from "../../../services/homepageStatisticsService";

const fields = [
  { key: "customers", label: "Happy Customers", max: 1_000_000_000 },
  { key: "products", label: "Products", max: 1_000_000_000 },
  { key: "satisfaction", label: "Customer Satisfaction", max: 100 },
];

function HomepageStatisticsControl() {
  const [settings, setSettings] = useState(null);
  const [automaticValues, setAutomaticValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    const loadStatistics = async () => {
      try {
        const data = await getAdminHomepageStatistics();
        if (active) {
          setSettings(data.settings);
          setAutomaticValues(data.automaticValues);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load homepage statistics settings.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStatistics();

    return () => {
      active = false;
    };
  }, []);

  const updateManualValue = (key, value) => {
    setSettings((current) => ({
      ...current,
      manualValues: {
        ...current.manualValues,
        [key]: value === "" ? "" : Number(value),
      },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const data = await updateAdminHomepageStatistics(settings);
      setSettings(data.settings);
      setAutomaticValues(data.automaticValues);
      setSaved(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to save homepage statistics.",
      );
    } finally {
      setSaving(false);
    }
  };

  const manualValuesAreValid =
    settings &&
    fields.every(({ key, max }) => {
      const value = settings.manualValues[key];
      return Number.isInteger(value) && value >= 0 && value <= max;
    });

  return (
    <section className="mb-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
          <BarChart3 size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text sm:text-lg">
            Homepage Statistics
          </h2>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Choose live database statistics or set custom values for the homepage.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">
          Loading homepage statistics...
        </p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                value: "automatic",
                title: "Automatic",
                description:
                  "Use registered customers, active products, and real review ratings.",
              },
              {
                value: "manual",
                title: "Manual",
                description:
                  "Set independent custom values for each homepage statistic.",
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  settings?.mode === option.value
                    ? "border-primary bg-primary-container/40"
                    : "border-outline-variant hover:bg-surface-container"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-text">
                  <input
                    type="radio"
                    name="homepage-statistics-mode"
                    value={option.value}
                    checked={settings?.mode === option.value}
                    disabled={!settings}
                    onChange={() => {
                      setSettings((current) => ({
                        ...current,
                        mode: option.value,
                      }));
                      setSaved(false);
                    }}
                    className="accent-primary"
                  />
                  {option.title}
                </span>
                <span className="mt-2 block text-xs leading-5 text-text-secondary">
                  {option.description}
                </span>
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container/50 p-4">
            <p className="text-sm font-semibold text-text">
              Current database values
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {fields.map(({ key, label }) => (
                <div key={key}>
                  <p className="text-xs text-text-secondary">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-text">
                    {automaticValues
                      ? `${new Intl.NumberFormat("en-US").format(
                          automaticValues[key],
                        )}${key === "satisfaction" ? "%" : ""}`
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-text">Manual values</p>
            <div className="grid gap-5 sm:grid-cols-3">
              {fields.map(({ key, label, max }) => (
                <label key={key} className="block">
                  <span className="mb-2 block text-xs font-medium text-text">
                    {label}
                  </span>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={max}
                      step="1"
                      value={settings?.manualValues[key] ?? ""}
                      disabled={settings?.mode !== "manual"}
                      onChange={(event) =>
                        updateManualValue(key, event.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 pr-10 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    {key === "satisfaction" && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                        %
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-error/5 px-4 py-3 text-sm text-error"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
              <Check size={17} />
              Homepage statistics saved successfully.
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !manualValuesAreValid}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Homepage Statistics"}
          </button>
        </div>
      )}
    </section>
  );
}

export default HomepageStatisticsControl;
