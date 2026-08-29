import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { createCategory } from "../../../services/categoryService";

function AdminNewCategory() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [name, setName] = useState("");

  const [slug, setSlug] = useState("");

  const [description, setDescription] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // IMAGE PREVIEW
  // =====================================================

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(image);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  // =====================================================
  // AUTO GENERATE SLUG
  // =====================================================

  const handleNameChange = (event) => {
    const value = event.target.value;

    setName(value);

    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
    );
  };

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // -------------------------------------------------
    // Allowed extensions
    // -------------------------------------------------

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    // -------------------------------------------------
    // Allowed MIME types
    //
    // application/octet-stream is accepted because
    // some browsers/Windows file selections report
    // image files using this MIME type.
    // The extension is checked separately.
    // -------------------------------------------------

    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/octet-stream",
    ];

    const validMimeType = allowedMimeTypes.includes(file.type);

    const validExtension = allowedExtensions.includes(extension);

    if (!validMimeType || !validExtension) {
      setError("Please select a valid JPG, JPEG, PNG, WEBP or GIF image.");

      event.target.value = "";

      return;
    }

    // -------------------------------------------------
    // File size
    // -------------------------------------------------

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size cannot exceed 5MB.");

      event.target.value = "";

      return;
    }

    // -------------------------------------------------
    // Accept image
    // -------------------------------------------------

    setError("");

    setImage(file);

    // -------------------------------------------------
    // Debug
    // -------------------------------------------------

    console.log("Selected category image:", file);

    console.log("Image name:", file.name);

    console.log("Image type:", file.type);

    console.log("Image size:", file.size);
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = () => {
    setImage(null);

    setPreview("");

    const input = document.getElementById("category-image");

    if (input) {
      input.value = "";
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // -------------------------------------------------
    // NAME
    // -------------------------------------------------

    if (!name.trim()) {
      setError("Category name is required.");

      return;
    }

    // -------------------------------------------------
    // SLUG
    // -------------------------------------------------

    if (!slug.trim()) {
      setError("Category slug is required.");

      return;
    }

    // -------------------------------------------------
    // IMAGE REQUIRED
    // -------------------------------------------------

    if (!image) {
      setError("Category image is required.");

      return;
    }

    // -------------------------------------------------
    // IMAGE EXTENSION
    // -------------------------------------------------

    const extension = image.name
      .substring(image.name.lastIndexOf("."))
      .toLowerCase();

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    if (!allowedExtensions.includes(extension)) {
      setError("Please select a valid JPG, JPEG, PNG, WEBP or GIF image.");

      return;
    }

    // -------------------------------------------------
    // IMAGE SIZE
    // -------------------------------------------------

    if (image.size > 5 * 1024 * 1024) {
      setError("Image size cannot exceed 5MB.");

      return;
    }

    try {
      setLoading(true);

      // =================================================
      // FORM DATA
      // =================================================

      const formData = new FormData();

      formData.append("name", name.trim());

      formData.append("slug", slug.trim().toLowerCase());

      formData.append("description", description.trim());

      formData.append("isActive", String(isActive));

      // -------------------------------------------------
      // IMPORTANT
      // -------------------------------------------------

      formData.append("image", image);

      // =================================================
      // DEBUG FOR FORM DATA
      // =================================================

      console.log("========== CATEGORY CREATE ==========");

      console.log("Name:", name.trim());

      console.log("Slug:", slug.trim().toLowerCase());

      console.log("Image:", image);

      console.log("Image name:", image.name);

      console.log("Image MIME:", image.type);

      console.log("Image size:", image.size);

      console.log("FormData image:", formData.get("image"));

      // =================================================
      // CREATE CATEGORY
      // =================================================

      const response = await createCategory(formData);

      // =================================================
      // VERIFY BACKEND RESPONSE
      // =================================================

      if (!response?.success) {
        throw new Error(response?.message || "Category creation failed.");
      }

      // =================================================
      // SUCCESS
      // =================================================

      navigate("/admin/categories", {
        replace: true,
      });
    } catch (error) {
      console.error("Create category error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create category.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
          >
            <ArrowLeft size={17} />
            Back to Categories
          </button>

          <p className="text-sm text-text-secondary">Catalog</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Add Category
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Create a new product category.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-outline-variant bg-surface shadow-sm"
        >
          <div className="space-y-6 p-5 sm:p-6">
            {/* =================================================
                NAME
            ================================================= */}

            <div>
              <label
                htmlFor="category-name"
                className="mb-2 block text-sm font-semibold text-text"
              >
                Category Name
              </label>

              <input
                id="category-name"
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Electronics"
                maxLength={50}
                disabled={loading}
                className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              />

              <p className="mt-1.5 text-xs text-text-secondary">
                {name.length}/50 characters
              </p>
            </div>

            {/* =================================================
                SLUG
            ================================================= */}

            <div>
              <label
                htmlFor="category-slug"
                className="mb-2 block text-sm font-semibold text-text"
              >
                Slug
              </label>

              <input
                id="category-slug"
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(
                    event.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .replace(/\s+/g, "-")
                      .replace(/-+/g, "-"),
                  )
                }
                placeholder="electronics"
                disabled={loading}
                className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              />

              <p className="mt-1.5 text-xs text-text-secondary">
                Used in the category URL.
              </p>
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div>
              <label
                htmlFor="category-description"
                className="mb-2 block text-sm font-semibold text-text"
              >
                Description
              </label>

              <textarea
                id="category-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe this category..."
                maxLength={500}
                rows={5}
                disabled={loading}
                className="w-full resize-none rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              />

              <p className="mt-1.5 text-xs text-text-secondary">
                {description.length}
                /500 characters
              </p>
            </div>

            {/* =================================================
                IMAGE
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-text">
                Category Image
                <span className="ml-1 text-error">*</span>
              </label>

              <input
                id="category-image"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif"
                onChange={handleImageChange}
                disabled={loading}
                className="hidden"
              />

              {!preview ? (
                <label
                  htmlFor="category-image"
                  className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container/40 p-6 text-center transition hover:border-primary hover:bg-primary-container/30"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-primary">
                    <ImagePlus size={22} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-text">
                    Upload category image
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    PNG, JPG, JPEG, WEBP or GIF
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    Maximum 5MB
                  </p>
                </label>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-outline-variant">
                  <img
                    src={preview}
                    alt="Category preview"
                    className="h-64 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={loading}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 disabled:opacity-50"
                    title="Remove image"
                  >
                    <X size={17} />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 text-xs text-white backdrop-blur">
                    <div className="font-semibold">{image?.name}</div>

                    <div className="mt-1 opacity-80">
                      {(image?.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="rounded-xl border border-outline-variant bg-surface-container/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-text">
                    Category Status
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    Disabled categories won't appear on the customer website.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsActive((current) => !current)}
                  disabled={loading}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    isActive ? "bg-primary" : "bg-outline"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      isActive ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <p className="mt-3 text-xs font-semibold">
                Status:{" "}
                <span className={isActive ? "text-success" : "text-error"}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-outline-variant p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              disabled={loading}
              className="h-11 rounded-xl border border-outline-variant px-5 text-sm font-semibold text-text transition hover:bg-surface-container disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Create Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminNewCategory;
