import { ArrowLeft, ImagePlus, Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminBannerById,
  updateBanner,
} from "../../../services/bannerService";

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
// EMPTY IMAGE STATE
// =====================================================

const EMPTY_IMAGES = {
  mainProduct: null,
  topLeft: null,
  topRight: null,
  bottomLeft: null,
  bottomRight: null,
};

const EMPTY_PREVIEWS = {
  mainProduct: "",
  topLeft: "",
  topRight: "",
  bottomLeft: "",
  bottomRight: "",
};

// =====================================================
// COMPONENT
// =====================================================

function AdminBannerEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ===================================================
  // FORM
  // ===================================================

  const [form, setForm] = useState({
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

    primaryButtonText: "",
    primaryButtonLink: "",

    secondaryButtonText: "",
    secondaryButtonLink: "",

    isActive: true,
    sortOrder: 0,

    colors: {
      ...DEFAULT_COLORS,
    },
  });

  // ===================================================
  // EXISTING IMAGES
  // ===================================================

  const [existingImages, setExistingImages] = useState({
    ...EMPTY_IMAGES,
  });

  // ===================================================
  // NEW IMAGES
  // ===================================================

  const [images, setImages] = useState({
    ...EMPTY_IMAGES,
  });

  // ===================================================
  // PREVIEWS
  // ===================================================

  const [previews, setPreviews] = useState({
    ...EMPTY_PREVIEWS,
  });

  // ===================================================
  // STATS
  // ===================================================

  const [stats, setStats] = useState([]);

  // ===================================================
  // UI STATE
  // ===================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===================================================
  // LOAD BANNER
  // ===================================================

  useEffect(() => {
    let mounted = true;

    const loadBanner = async () => {
      try {
        setLoading(true);
        setError("");

        const banner = await getAdminBannerById(id);

        if (!mounted) {
          return;
        }

        if (!banner) {
          throw new Error("Banner not found.");
        }

        // ---------------------------------------------
        // FORM
        // ---------------------------------------------

        setForm({
          slug: banner.slug || "",
          badge: banner.badge || "",

          titleStart: banner.titleStart || "",

          titleHighlight: banner.titleHighlight || "",

          titleEnd: banner.titleEnd || "",

          description: banner.description || "",

          mainProductAlt: banner.mainProduct?.alt || "",

          topLeftAlt: banner.topLeft?.alt || "",

          topRightAlt: banner.topRight?.alt || "",

          bottomLeftAlt: banner.bottomLeft?.alt || "",

          bottomRightAlt: banner.bottomRight?.alt || "",

          primaryButtonText: banner.primaryButton?.text || "",

          primaryButtonLink: banner.primaryButton?.link || "",

          secondaryButtonText: banner.secondaryButton?.text || "",

          secondaryButtonLink: banner.secondaryButton?.link || "",

          isActive: banner.isActive !== false,

          sortOrder: banner.sortOrder ?? 0,

          colors: {
            ...DEFAULT_COLORS,
            ...(banner.colors || {}),
          },
        });

        // ---------------------------------------------
        // EXISTING IMAGES
        // ---------------------------------------------

        setExistingImages({
          mainProduct: banner.mainProduct || null,

          topLeft: banner.topLeft || null,

          topRight: banner.topRight || null,

          bottomLeft: banner.bottomLeft || null,

          bottomRight: banner.bottomRight || null,
        });

        // ---------------------------------------------
        // STATS
        // ---------------------------------------------

        setStats(
          Array.isArray(banner.stats)
            ? banner.stats.map((stat) => ({
                value: stat?.value || "",
                label: stat?.label || "",
              }))
            : [],
        );
      } catch (error) {
        console.error("Load banner error:", error);

        if (mounted) {
          setError(
            error.response?.data?.message ||
              error.message ||
              "Failed to load banner.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (!id) {
      setError("Banner ID is missing.");
      setLoading(false);

      return undefined;
    }

    loadBanner();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ===================================================
  // CLEANUP PREVIEWS
  // ===================================================

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [previews]);

  // ===================================================
  // INPUT CHANGE
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
  // COLOR CHANGE
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

    if (!file.type.startsWith("image/")) {
      setError(`${field} must be an image file.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(`${field} image must be smaller than 10 MB.`);
      return;
    }

    if (previews[field]) {
      URL.revokeObjectURL(previews[field]);
    }

    const previewUrl = URL.createObjectURL(file);

    setImages((previous) => ({
      ...previous,
      [field]: file,
    }));

    setPreviews((previous) => ({
      ...previous,
      [field]: previewUrl,
    }));

    setError("");
    setSuccess("");

    // Allow selecting the same file again.
    event.target.value = "";
  };

  // ===================================================
  // REMOVE NEW IMAGE
  // ===================================================

  const removeNewImage = (field) => {
    if (previews[field]) {
      URL.revokeObjectURL(previews[field]);
    }

    setImages((previous) => ({
      ...previous,
      [field]: null,
    }));

    setPreviews((previous) => ({
      ...previous,
      [field]: "",
    }));

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
  // VALIDATION
  // ===================================================

  const validateForm = () => {
    const slug = form.slug.trim();

    if (!slug) {
      return "Banner slug is required.";
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return "Slug must contain only lowercase letters, numbers and hyphens.";
    }

    if (!form.badge.trim()) {
      return "Banner badge is required.";
    }

    if (!form.titleStart.trim()) {
      return "Title start is required.";
    }

    if (!form.titleHighlight.trim()) {
      return "Highlighted title is required.";
    }

    if (!form.titleEnd.trim()) {
      return "Title end is required.";
    }

    if (!form.description.trim()) {
      return "Banner description is required.";
    }

    if (!form.primaryButtonText.trim()) {
      return "Primary button text is required.";
    }

    if (!form.primaryButtonLink.trim()) {
      return "Primary button link is required.";
    }

    if (!form.secondaryButtonText.trim()) {
      return "Secondary button text is required.";
    }

    if (!form.secondaryButtonLink.trim()) {
      return "Secondary button link is required.";
    }

    const sortOrder = Number(form.sortOrder);

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return "Sort order must be a whole number greater than or equal to 0.";
    }

    if (stats.length > 3) {
      return "Maximum 3 statistics are allowed.";
    }

    for (let index = 0; index < stats.length; index += 1) {
      if (!stats[index].value.trim()) {
        return `Statistic ${index + 1} value is required.`;
      }

      if (!stats[index].label.trim()) {
        return `Statistic ${index + 1} label is required.`;
      }
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
      setSaving(true);

      const formData = new FormData();

      // -----------------------------------------------
      // CONTENT
      // -----------------------------------------------

      formData.append("slug", form.slug.trim().toLowerCase());

      formData.append("badge", form.badge.trim());

      formData.append("titleStart", form.titleStart.trim());

      formData.append("titleHighlight", form.titleHighlight.trim());

      formData.append("titleEnd", form.titleEnd.trim());

      formData.append("description", form.description.trim());

      // -----------------------------------------------
      // ALT TEXT
      // -----------------------------------------------

      formData.append("mainProductAlt", form.mainProductAlt.trim());

      formData.append("topLeftAlt", form.topLeftAlt.trim());

      formData.append("topRightAlt", form.topRightAlt.trim());

      formData.append("bottomLeftAlt", form.bottomLeftAlt.trim());

      formData.append("bottomRightAlt", form.bottomRightAlt.trim());

      // -----------------------------------------------
      // ONLY SEND NEW IMAGES
      // -----------------------------------------------

      IMAGE_FIELDS.forEach(({ name }) => {
        if (images[name]) {
          formData.append(name, images[name]);
        }
      });

      // -----------------------------------------------
      // PRIMARY BUTTON
      // -----------------------------------------------

      formData.append(
        "primaryButton",
        JSON.stringify({
          text: form.primaryButtonText.trim(),

          link: form.primaryButtonLink.trim(),
        }),
      );

      // -----------------------------------------------
      // SECONDARY BUTTON
      // -----------------------------------------------

      formData.append(
        "secondaryButton",
        JSON.stringify({
          text: form.secondaryButtonText.trim(),

          link: form.secondaryButtonLink.trim(),
        }),
      );

      // -----------------------------------------------
      // STATS
      // -----------------------------------------------

      formData.append(
        "stats",
        JSON.stringify(
          stats.map((stat) => ({
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
      // API
      // -----------------------------------------------

      await updateBanner(id, formData);

      setSuccess("Banner updated successfully.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        navigate("/admin/banners");
      }, 800);
    } catch (error) {
      console.error("Update banner error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update banner.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

              <p className="text-sm text-text-secondary">Loading banner...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ===================================================
  // LOAD ERROR
  // ===================================================

  if (error && !form.slug) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1200px]">
          <button
            type="button"
            onClick={() => navigate("/admin/banners")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
          >
            <ArrowLeft size={17} />
            Back to Banners
          </button>

          <div className="rounded-2xl border border-error/20 bg-error/5 p-8 text-center">
            <h2 className="text-lg font-semibold text-text">
              Unable to load banner
            </h2>

            <p className="mt-2 text-sm text-text-secondary">{error}</p>

            <button
              type="button"
              onClick={() => navigate("/admin/banners")}
              className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Back to Banners
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ===================================================
  // MAIN
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
            disabled={saving}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={17} />
            Back to Banners
          </button>

          <p className="text-sm text-text-secondary">Catalog / Banners</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Edit Banner
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Update your homepage promotional banner.
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
              CONTENT
          ================================================= */}

          <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <SectionHeader
              title="Banner Content"
              description="Edit the text displayed on your homepage banner."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="summer-sale"
                required
                disabled={saving}
              />

              <Field
                label="Badge"
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder="🔥 Summer Sale"
                required
                disabled={saving}
              />

              <Field
                label="Title Start"
                name="titleStart"
                value={form.titleStart}
                onChange={handleChange}
                placeholder="Upgrade Your"
                required
                disabled={saving}
              />

              <Field
                label="Title Highlight"
                name="titleHighlight"
                value={form.titleHighlight}
                onChange={handleChange}
                placeholder="Style"
                required
                disabled={saving}
              />

              <Field
                label="Title End"
                name="titleEnd"
                value={form.titleEnd}
                onChange={handleChange}
                placeholder="Today"
                required
                disabled={saving}
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
                  disabled={saving}
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
              description="Replace any image individually. Existing images remain unchanged when no replacement is selected."
            />

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {IMAGE_FIELDS.map((imageField) => (
                <EditImageUploader
                  key={imageField.name}
                  field={imageField}
                  existingImage={existingImages[imageField.name]}
                  newFile={images[imageField.name]}
                  preview={previews[imageField.name]}
                  alt={form[`${imageField.name}Alt`]}
                  onImageChange={handleImageChange}
                  onRemove={removeNewImage}
                  onAltChange={handleChange}
                  disabled={saving}
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
              description="Edit the two banner buttons."
            />

            <div className="grid gap-6 lg:grid-cols-2">
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
                    disabled={saving}
                  />

                  <Field
                    label="Button Link"
                    name="primaryButtonLink"
                    value={form.primaryButtonLink}
                    onChange={handleChange}
                    placeholder="/products"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

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
                    disabled={saving}
                  />

                  <Field
                    label="Button Link"
                    name="secondaryButtonLink"
                    value={form.secondaryButtonLink}
                    onChange={handleChange}
                    placeholder="/products"
                    required
                    disabled={saving}
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
                description="Manage up to three statistics."
              />

              <button
                type="button"
                onClick={addStat}
                disabled={saving || stats.length >= 3}
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
                      disabled={saving}
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
                      disabled={saving}
                    />

                    <Field
                      label="Label"
                      value={stat.label}
                      onChange={(event) =>
                        updateStat(index, "label", event.target.value)
                      }
                      placeholder="Happy Customers"
                      required
                      disabled={saving}
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
              description="Control the colors of the animated hero artwork."
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Object.entries(form.colors).map(([name, value]) => (
                <ColorField
                  key={name}
                  label={name}
                  value={value}
                  onChange={(nextValue) => handleColorChange(name, nextValue)}
                  disabled={saving}
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
              description="Control visibility and display order."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-text">
                  Sort Order
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  name="sortOrder"
                  value={form.sortOrder}
                  onChange={handleChange}
                  disabled={saving}
                  className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-1 text-[10px] text-text-secondary">
                  Lower numbers appear first.
                </p>
              </div>

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
                  disabled={saving}
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
              disabled={saving}
              onClick={() => navigate("/admin/banners")}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-outline-variant px-6 text-sm font-semibold text-text transition hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
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
// EDIT IMAGE UPLOADER
// =====================================================

function EditImageUploader({
  field,
  existingImage,
  newFile,
  preview,
  alt,
  onImageChange,
  onRemove,
  onAltChange,
  disabled = false,
}) {
  const imageSource = preview || existingImage?.url || "";

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant">
      {/* IMAGE */}

      <div className="relative aspect-[4/3] bg-surface-container">
        {imageSource ? (
          <>
            <img
              src={imageSource}
              alt={alt || field.label}
              className="h-full w-full object-cover"
            />

            {/* REMOVE NEW IMAGE */}

            {preview && (
              <button
                type="button"
                onClick={() => onRemove(field.name)}
                disabled={disabled}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-error shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Remove new ${field.label} image`}
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* REPLACE EXISTING IMAGE */}

            {!preview && (
              <label
                className={`absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-black/80"
                }`}
              >
                <Upload size={14} />
                Replace Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={disabled}
                  onChange={(event) => onImageChange(field.name, event)}
                />
              </label>
            )}
          </>
        ) : (
          <label
            className={`flex h-full flex-col items-center justify-center p-5 text-center ${
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
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

      {/* DETAILS */}

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-text">{field.label}</p>

          {newFile && (
            <span className="rounded-full bg-success/10 px-2 py-1 text-[9px] font-semibold text-success">
              New image
            </span>
          )}
        </div>

        <label className="mb-2 mt-4 block text-xs font-semibold text-text">
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

        {newFile && (
          <p className="mt-2 truncate text-[10px] text-text-secondary">
            {newFile.name}
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
  const validColor = /^#[0-9a-fA-F]{6}$/.test(value || "");

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold capitalize text-text">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={validColor ? value : "#ffffff"}
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

export default AdminBannerEdit;
