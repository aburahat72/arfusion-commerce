import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createBanner } from "../../../services/bannerService";

// =====================================================
// CONSTANTS
// =====================================================

const IMAGE_FIELDS = [
  {
    name: "mainProduct",
    label: "Main Product",
    required: true,
  },
  {
    name: "topLeft",
    label: "Top Left",
    required: true,
  },
  {
    name: "topRight",
    label: "Top Right",
    required: true,
  },
  {
    name: "bottomLeft",
    label: "Bottom Left",
    required: true,
  },
  {
    name: "bottomRight",
    label: "Bottom Right",
    required: true,
  },
];

const DEFAULT_COLORS = {
  blue: "#dbeafe",
  lavender: "#ede9fe",
  pink: "#fce7f3",
  body: "#e0e7ff",
  inner: "#ede9fe",
  innerPink: "#fbcfe8",
  platform: "#ddd6fe",
};

const EMPTY_FORM = {
  slug: "",
  badge: "",
  titleStart: "",
  titleHighlight: "",
  titleEnd: "",
  description: "",

  primaryButton: {
    text: "",
    link: "",
  },

  secondaryButton: {
    text: "",
    link: "",
  },

  stats: [
    {
      value: "",
      label: "",
    },
  ],

  colors: {
    ...DEFAULT_COLORS,
  },

  isActive: true,
  sortOrder: 0,
};

// =====================================================
// COMPONENT
// =====================================================

function AdminNewBanner() {
  const navigate = useNavigate();

  const fileInputRefs = useRef({});

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    primaryButton: {
      ...EMPTY_FORM.primaryButton,
    },
    secondaryButton: {
      ...EMPTY_FORM.secondaryButton,
    },
    stats: EMPTY_FORM.stats.map((stat) => ({
      ...stat,
    })),
    colors: {
      ...DEFAULT_COLORS,
    },
  });

  const [images, setImages] = useState({
    mainProduct: null,
    topLeft: null,
    topRight: null,
    bottomLeft: null,
    bottomRight: null,
  });

  const [previews, setPreviews] = useState({
    mainProduct: "",
    topLeft: "",
    topRight: "",
    bottomLeft: "",
    bottomRight: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===================================================
  // BASIC FIELD CHANGE
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
  // BUTTON CHANGE
  // ===================================================

  const handleButtonChange = (buttonName, field, value) => {
    setForm((previous) => ({
      ...previous,
      [buttonName]: {
        ...previous[buttonName],
        [field]: value,
      },
    }));

    setError("");
    setSuccess("");
  };

  // ===================================================
  // COLOR CHANGE
  // ===================================================

  const handleColorChange = (colorName, value) => {
    setForm((previous) => ({
      ...previous,
      colors: {
        ...previous.colors,
        [colorName]: value,
      },
    }));

    setError("");
    setSuccess("");
  };

  // ===================================================
  // STAT CHANGE
  // ===================================================

  const handleStatChange = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      stats: previous.stats.map((stat, statIndex) =>
        statIndex === index
          ? {
              ...stat,
              [field]: value,
            }
          : stat,
      ),
    }));

    setError("");
    setSuccess("");
  };

  // ===================================================
  // ADD STAT
  // ===================================================

  const addStat = () => {
    if (form.stats.length >= 3) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      stats: [
        ...previous.stats,
        {
          value: "",
          label: "",
        },
      ],
    }));

    setError("");
    setSuccess("");
  };

  // ===================================================
  // REMOVE STAT
  // ===================================================

  const removeStat = (index) => {
    setForm((previous) => ({
      ...previous,
      stats: previous.stats.filter((_, statIndex) => statIndex !== index),
    }));

    setError("");
    setSuccess("");
  };

  // ===================================================
  // IMAGE SELECT
  // ===================================================

  const handleImageChange = (fieldName, event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(`${fieldName} must be an image file.`);

      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(`${fieldName} image cannot exceed 10MB.`);

      event.target.value = "";
      return;
    }

    // Revoke old preview
    if (previews[fieldName]) {
      URL.revokeObjectURL(previews[fieldName]);
    }

    const previewUrl = URL.createObjectURL(file);

    setImages((previous) => ({
      ...previous,
      [fieldName]: file,
    }));

    setPreviews((previous) => ({
      ...previous,
      [fieldName]: previewUrl,
    }));

    setError("");
    setSuccess("");
  };

  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  const removeImage = (fieldName) => {
    if (previews[fieldName]) {
      URL.revokeObjectURL(previews[fieldName]);
    }

    setImages((previous) => ({
      ...previous,
      [fieldName]: null,
    }));

    setPreviews((previous) => ({
      ...previous,
      [fieldName]: "",
    }));

    if (fileInputRefs.current[fieldName]) {
      fileInputRefs.current[fieldName].value = "";
    }

    setError("");
    setSuccess("");
  };

  // ===================================================
  // OPEN FILE SELECTOR
  // ===================================================

  const openImageSelector = (fieldName) => {
    fileInputRefs.current[fieldName]?.click();
  };

  // ===================================================
  // VALIDATE
  // ===================================================

  const validateForm = () => {
    if (!form.slug.trim()) {
      return "Banner slug is required.";
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      return "Slug must contain only lowercase letters, numbers and hyphens.";
    }

    if (!form.badge.trim()) {
      return "Banner badge is required.";
    }

    if (!form.titleStart.trim()) {
      return "Banner title start is required.";
    }

    if (!form.titleHighlight.trim()) {
      return "Banner highlighted title is required.";
    }

    if (!form.titleEnd.trim()) {
      return "Banner title end is required.";
    }

    if (!form.description.trim()) {
      return "Banner description is required.";
    }

    for (const imageField of IMAGE_FIELDS) {
      if (!images[imageField.name]) {
        return `${imageField.label} image is required.`;
      }
    }

    if (!form.primaryButton.text.trim()) {
      return "Primary button text is required.";
    }

    if (!form.primaryButton.link.trim()) {
      return "Primary button link is required.";
    }

    if (!form.secondaryButton.text.trim()) {
      return "Secondary button text is required.";
    }

    if (!form.secondaryButton.link.trim()) {
      return "Secondary button link is required.";
    }

    for (let index = 0; index < form.stats.length; index += 1) {
      const stat = form.stats[index];

      if (!stat.value.trim()) {
        return `Statistic ${index + 1} value is required.`;
      }

      if (!stat.label.trim()) {
        return `Statistic ${index + 1} label is required.`;
      }
    }

    return "";
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

      // -----------------------------------------------
      // BASIC CONTENT
      // -----------------------------------------------

      formData.append("slug", form.slug.trim().toLowerCase());

      formData.append("badge", form.badge.trim());

      formData.append("titleStart", form.titleStart.trim());

      formData.append("titleHighlight", form.titleHighlight.trim());

      formData.append("titleEnd", form.titleEnd.trim());

      formData.append("description", form.description.trim());

      // -----------------------------------------------
      // BUTTONS
      // -----------------------------------------------

      formData.append(
        "primaryButton",
        JSON.stringify({
          text: form.primaryButton.text.trim(),
          link: form.primaryButton.link.trim(),
        }),
      );

      formData.append(
        "secondaryButton",
        JSON.stringify({
          text: form.secondaryButton.text.trim(),
          link: form.secondaryButton.link.trim(),
        }),
      );

      // -----------------------------------------------
      // STATS
      // -----------------------------------------------

      formData.append(
        "stats",
        JSON.stringify(
          form.stats.map((stat) => ({
            value: stat.value.trim(),
            label: stat.label.trim(),
          })),
        ),
      );

      // -----------------------------------------------
      // COLORS
      // -----------------------------------------------

      formData.append("colors", JSON.stringify(form.colors));

      // -----------------------------------------------
      // ADMIN SETTINGS
      // -----------------------------------------------

      formData.append("isActive", String(Boolean(form.isActive)));

      formData.append("sortOrder", String(Number(form.sortOrder) || 0));

      // -----------------------------------------------
      // IMAGES + ALT TEXT
      // -----------------------------------------------

      IMAGE_FIELDS.forEach((field) => {
        const file = images[field.name];

        if (file) {
          formData.append(field.name, file);

          formData.append(`${field.name}Alt`, file.name);
        }
      });

      // -----------------------------------------------
      // API
      // -----------------------------------------------

      await createBanner(formData);

      setSuccess("Banner created successfully.");

      // -----------------------------------------------
      // REDIRECT
      // -----------------------------------------------

      setTimeout(() => {
        navigate("/admin/banners");
      }, 700);
    } catch (error) {
      console.error("Create banner error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create banner.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // CANCEL
  // ===================================================

  const handleCancel = () => {
    if (loading) {
      return;
    }

    navigate("/admin/banners");
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary disabled:opacity-50"
          >
            <ArrowLeft size={17} />
            Back to Banners
          </button>

          <div className="mt-5">
            <p className="text-sm text-text-secondary">Catalog / Banners</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Create Banner
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Create a new homepage promotional banner.
            </p>
          </div>
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* =================================================
                LEFT
            ================================================= */}

            <div className="space-y-6">
              {/* =================================================
                  CONTENT
              ================================================= */}

              <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
                <SectionHeader
                  title="Banner Content"
                  description="Configure the text displayed in the hero banner."
                />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Slug"
                    required
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="summer-sale"
                    disabled={loading}
                  />

                  <Field
                    label="Badge"
                    required
                    name="badge"
                    value={form.badge}
                    onChange={handleChange}
                    placeholder="🔥 Summer Sale"
                    disabled={loading}
                  />

                  <Field
                    label="Title Start"
                    required
                    name="titleStart"
                    value={form.titleStart}
                    onChange={handleChange}
                    placeholder="Upgrade Your"
                    disabled={loading}
                  />

                  <Field
                    label="Title Highlight"
                    required
                    name="titleHighlight"
                    value={form.titleHighlight}
                    onChange={handleChange}
                    placeholder="Lifestyle"
                    disabled={loading}
                  />

                  <Field
                    label="Title End"
                    required
                    name="titleEnd"
                    value={form.titleEnd}
                    onChange={handleChange}
                    placeholder="Today"
                    disabled={loading}
                  />
                </div>

                <div className="mt-5">
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
                    placeholder="Describe the promotion shown in this banner..."
                    className="w-full resize-y rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-1 text-right text-xs text-text-secondary">
                    {form.description.length}
                    /2000
                  </p>
                </div>
              </section>

              {/* =================================================
                  IMAGES
              ================================================= */}

              <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
                <SectionHeader
                  title="Banner Images"
                  description="Upload the five product images used by the hero design."
                />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {IMAGE_FIELDS.map((field) => (
                    <ImageUploader
                      key={field.name}
                      field={field}
                      file={images[field.name]}
                      preview={previews[field.name]}
                      inputRef={(element) => {
                        fileInputRefs.current[field.name] = element;
                      }}
                      onChange={handleImageChange}
                      onRemove={removeImage}
                      onSelect={openImageSelector}
                      disabled={loading}
                    />
                  ))}
                </div>
              </section>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
                <SectionHeader
                  title="Call To Action"
                  description="Configure the two buttons displayed on the banner."
                />

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <ButtonEditor
                    title="Primary Button"
                    button={form.primaryButton}
                    buttonName="primaryButton"
                    onChange={handleButtonChange}
                    disabled={loading}
                  />

                  <ButtonEditor
                    title="Secondary Button"
                    button={form.secondaryButton}
                    buttonName="secondaryButton"
                    onChange={handleButtonChange}
                    disabled={loading}
                  />
                </div>
              </section>

              {/* =================================================
                  STATS
              ================================================= */}

              <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <SectionHeader
                    title="Statistics"
                    description="Add up to three statistics displayed below the banner buttons."
                  />

                  <button
                    type="button"
                    onClick={addStat}
                    disabled={loading || form.stats.length >= 3}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant px-3 text-xs font-semibold text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={15} />
                    Add Stat
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  {form.stats.map((stat, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-xl border border-outline-variant bg-surface-container/40 p-4 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <Field
                        label={`Value ${index + 1}`}
                        value={stat.value}
                        onChange={(event) =>
                          handleStatChange(index, "value", event.target.value)
                        }
                        placeholder="20K+"
                        disabled={loading}
                      />

                      <Field
                        label={`Label ${index + 1}`}
                        value={stat.label}
                        onChange={(event) =>
                          handleStatChange(index, "label", event.target.value)
                        }
                        placeholder="Happy Customers"
                        disabled={loading}
                      />

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeStat(index)}
                          disabled={loading || form.stats.length === 1}
                          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-error/20 text-error transition hover:bg-error/5 disabled:cursor-not-allowed disabled:opacity-40 sm:w-11"
                          aria-label={`Remove statistic ${index + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs text-text-secondary">
                  {form.stats.length}
                  /3 statistics
                </p>
              </section>

              {/* =================================================
                  COLORS
              ================================================= */}

              <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
                <SectionHeader
                  title="Banner Colors"
                  description="Customize the visual colors used by the hero artwork."
                />

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(form.colors).map(([colorName, value]) => (
                    <ColorField
                      key={colorName}
                      label={formatLabel(colorName)}
                      value={value}
                      onChange={(newValue) =>
                        handleColorChange(colorName, newValue)
                      }
                      disabled={loading}
                    />
                  ))}
                </div>
              </section>
            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

            <aside className="space-y-6">
              {/* =================================================
                  STATUS
              ================================================= */}

              <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
                <SectionHeader
                  title="Publishing"
                  description="Control banner visibility and display order."
                />

                <div className="mt-6">
                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container/40 p-4">
                    <div>
                      <p className="text-sm font-semibold text-text">Active</p>

                      <p className="mt-1 text-xs text-text-secondary">
                        Show this banner on the customer website.
                      </p>
                    </div>

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
                      className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                  </label>
                </div>

                <div className="mt-5">
                  <Field
                    label="Sort Order"
                    type="number"
                    min="0"
                    name="sortOrder"
                    value={form.sortOrder}
                    onChange={handleChange}
                    placeholder="0"
                    disabled={loading}
                  />

                  <p className="mt-1 text-xs text-text-secondary">
                    Lower numbers appear first.
                  </p>
                </div>
              </section>

              {/* =================================================
                  PREVIEW
              ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
                <div className="border-b border-outline-variant p-5">
                  <SectionHeader
                    title="Quick Preview"
                    description="Preview the uploaded images."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 bg-surface-container p-3">
                  <PreviewImage src={previews.topLeft} alt="Top left" />

                  <PreviewImage src={previews.topRight} alt="Top right" />

                  <div className="col-span-2">
                    <PreviewImage
                      src={previews.mainProduct}
                      alt="Main product"
                      large
                    />
                  </div>

                  <PreviewImage src={previews.bottomLeft} alt="Bottom left" />

                  <PreviewImage src={previews.bottomRight} alt="Bottom right" />
                </div>
              </section>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating Banner...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Create Banner
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-outline-variant text-sm font-semibold text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </section>
            </aside>
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
    <div>
      <h2 className="text-base font-semibold text-text">{title}</h2>

      {description && (
        <p className="mt-1 text-xs leading-5 text-text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}

// =====================================================
// FIELD
// =====================================================

function Field({
  label,
  required = false,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  min,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-text">
        {label}

        {required && <span className="ml-1 text-error">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-3.5 text-sm text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-container disabled:opacity-60"
      />
    </div>
  );
}

// =====================================================
// BUTTON EDITOR
// =====================================================

function ButtonEditor({ title, button, buttonName, onChange, disabled }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container/40 p-4">
      <h3 className="text-sm font-semibold text-text">{title}</h3>

      <div className="mt-4 space-y-4">
        <Field
          label="Text"
          required
          value={button.text}
          onChange={(event) => onChange(buttonName, "text", event.target.value)}
          placeholder="Shop Now"
          disabled={disabled}
        />

        <Field
          label="Link"
          required
          value={button.link}
          onChange={(event) => onChange(buttonName, "link", event.target.value)}
          placeholder="/products"
          disabled={disabled}
        />
      </div>
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
  inputRef,
  onChange,
  onRemove,
  onSelect,
  disabled,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container/40">
      <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-text">{field.label}</p>

          <p className="text-[11px] text-text-secondary">Required</p>
        </div>

        {file && (
          <button
            type="button"
            onClick={() => onRemove(field.name)}
            disabled={disabled}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-error transition hover:bg-error/5 disabled:opacity-50"
            aria-label={`Remove ${field.label}`}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => onChange(field.name, event)}
          disabled={disabled}
          className="hidden"
        />

        {preview ? (
          <button
            type="button"
            onClick={() => onSelect(field.name)}
            disabled={disabled}
            className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-white"
          >
            <img
              src={preview}
              alt={`${field.label} preview`}
              className="h-full w-full object-contain transition group-hover:scale-[1.02]"
            />

            <span className="absolute inset-x-3 bottom-3 rounded-lg bg-black/65 px-3 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
              Change image
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(field.name)}
            disabled={disabled}
            className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-primary">
              <ImagePlus size={23} />
            </div>

            <p className="mt-3 text-sm font-semibold text-text">Upload image</p>

            <p className="mt-1 text-xs text-text-secondary">
              PNG, JPG, WEBP up to 10MB
            </p>
          </button>
        )}

        {file && (
          <p className="mt-3 truncate text-xs text-text-secondary">
            {file.name}
          </p>
        )}
      </div>
    </div>
  );
}

// =====================================================
// PREVIEW IMAGE
// =====================================================

function PreviewImage({ src, alt, large = false }) {
  if (!src) {
    return (
      <div
        className={`flex ${
          large ? "h-44" : "h-28"
        } items-center justify-center rounded-xl bg-surface text-text-secondary`}
      >
        <ImagePlus size={20} />
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl bg-white ${
        large ? "h-44" : "h-28"
      }`}
    >
      <img src={src} alt={alt} className="h-full w-full object-contain" />
    </div>
  );
}

// =====================================================
// COLOR FIELD
// =====================================================

function ColorField({ label, value, onChange, disabled }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container/40 p-3">
      <label className="mb-2 block text-xs font-semibold text-text">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={isValidColor(value) ? value : "#ffffff"}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-10 w-12 cursor-pointer rounded-lg border border-outline-variant bg-transparent p-1 disabled:cursor-not-allowed"
        />

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-10 min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface px-3 text-xs text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
        />
      </div>
    </div>
  );
}

// =====================================================
// HELPERS
// =====================================================

function formatLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());
}

function isValidColor(value) {
  return (
    typeof value === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
  );
}

export default AdminNewBanner;
