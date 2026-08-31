import { ArrowLeft, ImagePlus, Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createBanner } from "../../../services/bannerService";

// =====================================================
// DEFAULT COLORS
// =====================================================

const DEFAULT_COLORS = {
  blue: "#dbeafe",
  lavender: "#ede9fe",
  pink: "#fce7f3",
  body: "#e0e7ff",
  inner: "#ede9fe",
  innerPink: "#fbcfe8",
  platform: "#ddd6fe",
};

// =====================================================
// INITIAL FORM
// =====================================================

const initialForm = {
  slug: "",
  badge: "",
  titleStart: "",
  titleHighlight: "",
  titleEnd: "",
  description: "",

  mainProductAlt: "",
  topLeftAlt: "",
  topRightAlt: "",
  bottomLeftAlt: "",
  bottomRightAlt: "",

  primaryButtonText: "Shop Now",
  primaryButtonLink: "/products",

  secondaryButtonText: "Explore Deals",
  secondaryButtonLink: "/products",

  isActive: true,
  sortOrder: 0,

  colors: { ...DEFAULT_COLORS },
};

// =====================================================
// IMAGE FIELDS
// =====================================================

const IMAGE_FIELDS = [
  {
    name: "mainProduct",
    label: "Main Product",
    description: "Main product displayed in the center.",
  },
  {
    name: "topLeft",
    label: "Top Left",
    description: "Product image positioned at top left.",
  },
  {
    name: "topRight",
    label: "Top Right",
    description: "Product image positioned at top right.",
  },
  {
    name: "bottomLeft",
    label: "Bottom Left",
    description: "Product image positioned at bottom left.",
  },
  {
    name: "bottomRight",
    label: "Bottom Right",
    description: "Product image positioned at bottom right.",
  },
];

// =====================================================
// INITIAL IMAGES
// =====================================================

const INITIAL_IMAGES = {
  mainProduct: null,
  topLeft: null,
  topRight: null,
  bottomLeft: null,
  bottomRight: null,
};

// =====================================================
// INITIAL PREVIEWS
// =====================================================

const INITIAL_PREVIEWS = {
  mainProduct: "",
  topLeft: "",
  topRight: "",
  bottomLeft: "",
  bottomRight: "",
};

// =====================================================
// COMPONENT
// =====================================================

function AdminBannerCreate() {
  const navigate = useNavigate();

  // ===================================================
  // FORM
  // ===================================================

  const [form, setForm] = useState(() => ({
    ...initialForm,
    colors: { ...DEFAULT_COLORS },
  }));

  // ===================================================
  // IMAGES
  // ===================================================

  const [images, setImages] = useState({
    ...INITIAL_IMAGES,
  });

  // ===================================================
  // PREVIEWS
  // ===================================================

  const [previews, setPreviews] = useState({
    ...INITIAL_PREVIEWS,
  });

  // ===================================================
  // STATS
  // ===================================================

  const [stats, setStats] = useState([]);

  // ===================================================
  // UI STATE
  // ===================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===================================================
  // CLEANUP PREVIEW URLS
  // ===================================================

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);

  // ===================================================
  // NORMAL INPUT
  // ===================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ===================================================
  // COLOR INPUT
  // ===================================================

  const handleColorChange = (name, value) => {
    setForm((previous) => ({
      ...previous,
      colors: {
        ...previous.colors,
        [name]: value,
      },
    }));

    setError("");
    setSuccess("");
  };

  // ===================================================
  // IMAGE CHANGE
  // ===================================================

  const handleImageChange = (field, event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file.type.startsWith("image/")) {
      setError(`${field} must be an image file.`);
      return;
    }

    // Client-side 10 MB limit.
    if (file.size > 10 * 1024 * 1024) {
      setError(`${field} image must be smaller than 10 MB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setImages((previous) => ({
      ...previous,
      [field]: file,
    }));

    setPreviews((previous) => {
      if (previous[field]) {
        URL.revokeObjectURL(previous[field]);
      }

      return {
        ...previous,
        [field]: previewUrl,
      };
    });

    setError("");
    setSuccess("");
  };

  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  const removeImage = (field) => {
    setImages((previous) => ({
      ...previous,
      [field]: null,
    }));

    setPreviews((previous) => {
      if (previous[field]) {
        URL.revokeObjectURL(previous[field]);
      }

      return {
        ...previous,
        [field]: "",
      };
    });

    setError("");
    setSuccess("");
  };

  // ===================================================
  // STATS
  // ===================================================

  const addStat = () => {
    if (stats.length >= 3) {
      return;
    }

    setStats((previous) => [
      ...previous,
      {
        value: "",
        label: "",
      },
    ]);

    setError("");
    setSuccess("");
  };

  const updateStat = (index, field, value) => {
    setStats((previous) =>
      previous.map((stat, statIndex) =>
        statIndex === index
          ? {
              ...stat,
              [field]: value,
            }
          : stat,
      ),
    );

    setError("");
    setSuccess("");
  };

  const removeStat = (index) => {
    setStats((previous) =>
      previous.filter((_, statIndex) => statIndex !== index),
    );

    setError("");
    setSuccess("");
  };

  // ===================================================
  // VALIDATE COLORS
  // ===================================================

  const validateColors = () => {
    for (const [name, value] of Object.entries(form.colors)) {
      const trimmedValue = String(value || "").trim();

      if (!trimmedValue) {
        return `${formatLabel(name)} color is required.`;
      }

      if (trimmedValue.length > 30) {
        return `${formatLabel(name)} color cannot exceed 30 characters.`;
      }
    }

    return null;
  };

  // ===================================================
  // VALIDATE FORM
  // ===================================================

  const validateForm = () => {
    const slug = form.slug.trim().toLowerCase();

    // -------------------------------------------------
    // SLUG
    // -------------------------------------------------

    if (!slug) {
      return "Banner slug is required.";
    }

    if (slug.length < 2) {
      return "Banner slug must be at least 2 characters.";
    }

    if (slug.length > 100) {
      return "Banner slug cannot exceed 100 characters.";
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return "Slug must contain only lowercase letters, numbers and hyphens.";
    }

    // -------------------------------------------------
    // BADGE
    // -------------------------------------------------

    if (!form.badge.trim()) {
      return "Banner badge is required.";
    }

    if (form.badge.trim().length > 100) {
      return "Banner badge cannot exceed 100 characters.";
    }

    // -------------------------------------------------
    // TITLE
    // -------------------------------------------------

    if (!form.titleStart.trim()) {
      return "Title start is required.";
    }

    if (form.titleStart.trim().length > 100) {
      return "Title start cannot exceed 100 characters.";
    }

    if (!form.titleHighlight.trim()) {
      return "Highlighted title is required.";
    }

    if (form.titleHighlight.trim().length > 100) {
      return "Highlighted title cannot exceed 100 characters.";
    }

    if (!form.titleEnd.trim()) {
      return "Title end is required.";
    }

    if (form.titleEnd.trim().length > 100) {
      return "Title end cannot exceed 100 characters.";
    }

    // -------------------------------------------------
    // DESCRIPTION
    // -------------------------------------------------

    if (!form.description.trim()) {
      return "Banner description is required.";
    }

    if (form.description.trim().length > 2000) {
      return "Banner description cannot exceed 2000 characters.";
    }

    // -------------------------------------------------
    // IMAGES
    // -------------------------------------------------

    for (const image of IMAGE_FIELDS) {
      if (!images[image.name]) {
        return `${image.label} image is required.`;
      }
    }

    // -------------------------------------------------
    // ALT TEXT
    // -------------------------------------------------

    const altFields = [
      ["mainProductAlt", "Main product alt text"],
      ["topLeftAlt", "Top-left alt text"],
      ["topRightAlt", "Top-right alt text"],
      ["bottomLeftAlt", "Bottom-left alt text"],
      ["bottomRightAlt", "Bottom-right alt text"],
    ];

    for (const [field, label] of altFields) {
      if (form[field].trim().length > 200) {
        return `${label} cannot exceed 200 characters.`;
      }
    }

    // -------------------------------------------------
    // PRIMARY BUTTON
    // -------------------------------------------------

    if (!form.primaryButtonText.trim()) {
      return "Primary button text is required.";
    }

    if (form.primaryButtonText.trim().length > 50) {
      return "Primary button text cannot exceed 50 characters.";
    }

    if (!form.primaryButtonLink.trim()) {
      return "Primary button link is required.";
    }

    if (form.primaryButtonLink.trim().length > 500) {
      return "Primary button link cannot exceed 500 characters.";
    }

    // -------------------------------------------------
    // SECONDARY BUTTON
    // -------------------------------------------------

    if (!form.secondaryButtonText.trim()) {
      return "Secondary button text is required.";
    }

    if (form.secondaryButtonText.trim().length > 50) {
      return "Secondary button text cannot exceed 50 characters.";
    }

    if (!form.secondaryButtonLink.trim()) {
      return "Secondary button link is required.";
    }

    if (form.secondaryButtonLink.trim().length > 500) {
      return "Secondary button link cannot exceed 500 characters.";
    }

    // -------------------------------------------------
    // STATS
    // -------------------------------------------------

    if (stats.length > 3) {
      return "Maximum 3 statistics are allowed.";
    }

    for (let index = 0; index < stats.length; index += 1) {
      if (!stats[index].value.trim()) {
        return `Statistic ${index + 1} value is required.`;
      }

      if (stats[index].value.trim().length > 50) {
        return `Statistic ${index + 1} value cannot exceed 50 characters.`;
      }

      if (!stats[index].label.trim()) {
        return `Statistic ${index + 1} label is required.`;
      }

      if (stats[index].label.trim().length > 100) {
        return `Statistic ${index + 1} label cannot exceed 100 characters.`;
      }
    }

    // -------------------------------------------------
    // COLORS
    // -------------------------------------------------

    const colorError = validateColors();

    if (colorError) {
      return colorError;
    }

    // -------------------------------------------------
    // SORT ORDER
    // -------------------------------------------------

    const sortOrder = Number(form.sortOrder);

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return "Sort order must be a whole number greater than or equal to 0.";
    }

    return null;
  };

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // -------------------------------------------------
      // TEXT
      // -------------------------------------------------

      formData.append("slug", form.slug.trim().toLowerCase());

      formData.append("badge", form.badge.trim());

      formData.append("titleStart", form.titleStart.trim());

      formData.append("titleHighlight", form.titleHighlight.trim());

      formData.append("titleEnd", form.titleEnd.trim());

      formData.append("description", form.description.trim());

      // -------------------------------------------------
      // IMAGE ALT TEXT
      // -------------------------------------------------

      formData.append("mainProductAlt", form.mainProductAlt.trim());

      formData.append("topLeftAlt", form.topLeftAlt.trim());

      formData.append("topRightAlt", form.topRightAlt.trim());

      formData.append("bottomLeftAlt", form.bottomLeftAlt.trim());

      formData.append("bottomRightAlt", form.bottomRightAlt.trim());

      // -------------------------------------------------
      // IMAGES
      // -------------------------------------------------

      IMAGE_FIELDS.forEach(({ name }) => {
        formData.append(name, images[name]);
      });

      // -------------------------------------------------
      // PRIMARY BUTTON
      // -------------------------------------------------

      formData.append(
        "primaryButton",
        JSON.stringify({
          text: form.primaryButtonText.trim(),
          link: form.primaryButtonLink.trim(),
        }),
      );

      // -------------------------------------------------
      // SECONDARY BUTTON
      // -------------------------------------------------

      formData.append(
        "secondaryButton",
        JSON.stringify({
          text: form.secondaryButtonText.trim(),
          link: form.secondaryButtonLink.trim(),
        }),
      );

      // -------------------------------------------------
      // STATS
      // -------------------------------------------------

      formData.append(
        "stats",
        JSON.stringify(
          stats.map((stat) => ({
            value: stat.value.trim(),
            label: stat.label.trim(),
          })),
        ),
      );

      // -------------------------------------------------
      // COLORS
      // -------------------------------------------------

      formData.append("colors", JSON.stringify(form.colors));

      // -------------------------------------------------
      // ADMIN
      // -------------------------------------------------

      formData.append("isActive", String(Boolean(form.isActive)));

      formData.append("sortOrder", String(Number(form.sortOrder)));

      // -------------------------------------------------
      // API
      // -------------------------------------------------

      await createBanner(formData);

      setSuccess("Banner created successfully.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        navigate("/admin/banners");
      }, 800);
    } catch (error) {
      console.error("Create banner error:", error);

      const backendMessage =
        error.response?.data?.message || error.response?.data?.error;

      let message =
        backendMessage || error.message || "Failed to create banner.";

      // -------------------------------------------------
      // ZOD VALIDATION ERRORS
      // -------------------------------------------------

      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        if (Array.isArray(validationErrors)) {
          message = validationErrors
            .map((item) => {
              if (typeof item === "string") {
                return item;
              }

              return item?.message || item?.msg || "Validation error";
            })
            .join(" ");
        } else if (typeof validationErrors === "object") {
          const messages = Object.values(validationErrors).flat();

          if (messages.length > 0) {
            message = messages.join(" ");
          }
        }
      }

      setError(message);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1200px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/admin/banners")}
            disabled={loading}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={17} />
            Back to Banners
          </button>

          <p className="text-sm text-text-secondary">Catalog / Banners</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Create Banner
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Create a homepage promotional banner.
          </p>
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* =================================================
              BASIC CONTENT
          ================================================= */}

          <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <SectionHeader
              title="Banner Content"
              description="Configure the text displayed on the homepage banner."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="summer-sale"
                required
                disabled={loading}
              />

              <Field
                label="Badge"
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder="🔥 Summer Sale"
                required
                disabled={loading}
              />

              <Field
                label="Title Start"
                name="titleStart"
                value={form.titleStart}
                onChange={handleChange}
                placeholder="Upgrade Your"
                required
                disabled={loading}
              />

              <Field
                label="Title Highlight"
                name="titleHighlight"
                value={form.titleHighlight}
                onChange={handleChange}
                placeholder="Style"
                required
                disabled={loading}
              />

              <Field
                label="Title End"
                name="titleEnd"
                value={form.titleEnd}
                onChange={handleChange}
                placeholder="Today"
                required
                disabled={loading}
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-text">
                  Description
                  <span className="ml-1 text-error">*</span>
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  maxLength={2000}
                  disabled={loading}
                  placeholder="Write the banner description..."
                  className="w-full resize-none rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-1 text-right text-[10px] text-text-secondary">
                  {form.description.length}/2000
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              IMAGES
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <SectionHeader
              title="Banner Images"
              description="Upload all five product images used by the hero banner."
            />

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {IMAGE_FIELDS.map((imageField) => (
                <ImageUploader
                  key={imageField.name}
                  field={imageField}
                  file={images[imageField.name]}
                  preview={previews[imageField.name]}
                  alt={form[`${imageField.name}Alt`]}
                  onImageChange={handleImageChange}
                  onRemove={removeImage}
                  onAltChange={handleChange}
                  disabled={loading}
                />
              ))}
            </div>
          </section>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <SectionHeader
              title="Call To Action"
              description="Configure the two buttons displayed on the banner."
            />

            <div className="grid gap-6 lg:grid-cols-2">
              {/* PRIMARY */}

              <div className="rounded-xl border border-outline-variant p-4">
                <h3 className="text-sm font-semibold text-text">
                  Primary Button
                </h3>

                <div className="mt-4 space-y-4">
                  <Field
                    label="Button Text"
                    name="primaryButtonText"
                    value={form.primaryButtonText}
                    onChange={handleChange}
                    placeholder="Shop Now"
                    required
                    disabled={loading}
                  />

                  <Field
                    label="Button Link"
                    name="primaryButtonLink"
                    value={form.primaryButtonLink}
                    onChange={handleChange}
                    placeholder="/products"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* SECONDARY */}

              <div className="rounded-xl border border-outline-variant p-4">
                <h3 className="text-sm font-semibold text-text">
                  Secondary Button
                </h3>

                <div className="mt-4 space-y-4">
                  <Field
                    label="Button Text"
                    name="secondaryButtonText"
                    value={form.secondaryButtonText}
                    onChange={handleChange}
                    placeholder="Explore Deals"
                    required
                    disabled={loading}
                  />

                  <Field
                    label="Button Link"
                    name="secondaryButtonLink"
                    value={form.secondaryButtonLink}
                    onChange={handleChange}
                    placeholder="/products"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              STATS
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeader
                title="Statistics"
                description="Add up to three statistics shown below the CTA buttons."
              />

              <button
                type="button"
                onClick={addStat}
                disabled={loading || stats.length >= 3}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant px-4 text-xs font-semibold text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={16} />
                Add Statistic
              </button>
            </div>

            {stats.length === 0 && (
              <div className="mt-5 rounded-xl bg-surface-container p-5 text-center text-sm text-text-secondary">
                No statistics added.
              </div>
            )}

            <div className="mt-5 space-y-4">
              {stats.map((stat, index) => (
                <div
                  key={`stat-${index}`}
                  className="rounded-xl border border-outline-variant p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-text">
                      Statistic {index + 1}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeStat(index)}
                      disabled={loading}
                      className="text-text-secondary transition hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Remove statistic ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Value"
                      value={stat.value}
                      onChange={(event) =>
                        updateStat(index, "value", event.target.value)
                      }
                      placeholder="20K+"
                      required
                      disabled={loading}
                    />

                    <Field
                      label="Label"
                      value={stat.label}
                      onChange={(event) =>
                        updateStat(index, "label", event.target.value)
                      }
                      placeholder="Happy Customers"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* =================================================
              COLORS
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <SectionHeader
              title="Banner Colors"
              description="Control the colors used by the animated hero artwork."
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Object.entries(form.colors).map(([name, value]) => (
                <ColorField
                  key={name}
                  label={name}
                  value={value}
                  onChange={(nextValue) => handleColorChange(name, nextValue)}
                  disabled={loading}
                />
              ))}
            </div>
          </section>

          {/* =================================================
              ADMIN SETTINGS
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <SectionHeader
              title="Admin Settings"
              description="Control banner visibility and display order."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              {/* SORT ORDER */}

              <div>
                <label
                  htmlFor="banner-sort-order"
                  className="mb-2 block text-sm font-semibold text-text"
                >
                  Sort Order
                </label>

                <input
                  id="banner-sort-order"
                  type="number"
                  min="0"
                  step="1"
                  name="sortOrder"
                  value={form.sortOrder}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-1 text-[10px] text-text-secondary">
                  Lower numbers appear first.
                </p>
              </div>

              {/* ACTIVE */}

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-outline-variant p-4">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      isActive: event.target.checked,
                    }))
                  }
                  disabled={loading}
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary disabled:cursor-not-allowed"
                />

                <div>
                  <p className="text-sm font-semibold text-text">
                    Active Banner
                  </p>

                  <p className="mt-0.5 text-xs text-text-secondary">
                    Show this banner on the public website.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={() => navigate("/admin/banners")}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-outline-variant px-6 text-sm font-semibold text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Banner
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

// =====================================================
// SECTION HEADER
// =====================================================

function SectionHeader({ title, description }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-text">{title}</h2>

      <p className="mt-1 text-xs leading-5 text-text-secondary">
        {description}
      </p>
    </div>
  );
}

// =====================================================
// FIELD
// =====================================================

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text">
        {label}

        {required && <span className="ml-1 text-error">*</span>}
      </label>

      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

// =====================================================
// IMAGE UPLOADER
// =====================================================

function ImageUploader({
  field,
  file,
  preview,
  alt,
  onImageChange,
  onRemove,
  onAltChange,
  disabled = false,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant">
      <div className="relative aspect-[4/3] bg-surface-container">
        {preview ? (
          <>
            <img
              src={preview}
              alt={alt || field.label}
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={() => onRemove(field.name)}
              disabled={disabled}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-error shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Remove ${field.label} image`}
            >
              <Trash2 size={16} />
            </button>
          </>
        ) : (
          <label
            className={`flex h-full flex-col items-center justify-center p-5 text-center ${
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-primary">
              <ImagePlus size={22} />
            </div>

            <p className="mt-3 text-sm font-semibold text-text">
              Upload {field.label}
            </p>

            <p className="mt-1 text-xs text-text-secondary">
              {field.description}
            </p>

            <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white">
              <Upload size={14} />
              Choose Image
            </span>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled}
              onChange={(event) => onImageChange(field.name, event)}
            />
          </label>
        )}
      </div>

      <div className="p-4">
        <label className="mb-2 block text-xs font-semibold text-text">
          Alt Text
        </label>

        <input
          name={`${field.name}Alt`}
          value={alt ?? ""}
          onChange={onAltChange}
          placeholder={`${field.label} image`}
          maxLength={200}
          disabled={disabled}
          className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-xs text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-1 text-right text-[9px] text-text-secondary">
          {(alt || "").length}/200
        </p>

        {file && (
          <p className="mt-2 truncate text-[10px] text-text-secondary">
            {file.name}
          </p>
        )}
      </div>
    </div>
  );
}

// =====================================================
// COLOR FIELD
// =====================================================

function ColorField({ label, value, onChange, disabled = false }) {
  const colorValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff";

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold capitalize text-text">
        {formatLabel(label)}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={colorValue}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-11 w-11 cursor-pointer rounded-lg border border-outline-variant bg-surface p-1 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <input
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          maxLength={30}
          disabled={disabled}
          className="h-11 min-w-0 flex-1 rounded-xl border border-outline-variant bg-surface px-3 text-xs text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}

// =====================================================
// FORMAT LABEL
// =====================================================

function formatLabel(value) {
  return String(value || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());
}

export default AdminBannerCreate;
