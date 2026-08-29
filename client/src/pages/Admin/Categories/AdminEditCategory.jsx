import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  getAllCategories,
  updateCategory,
} from "../../../services/categoryService";

function AdminEditCategory() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [category, setCategory] = useState(null);

  const [name, setName] = useState("");

  const [slug, setSlug] = useState("");

  const [description, setDescription] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD CATEGORY
  // =====================================================

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllCategories();

        const foundCategory = data.categories?.find((item) => item._id === id);

        if (!foundCategory) {
          setError("Category not found.");

          return;
        }

        setCategory(foundCategory);

        setName(foundCategory.name || "");

        setSlug(foundCategory.slug || "");

        setDescription(foundCategory.description || "");

        setIsActive(foundCategory.isActive === true);

        setPreview(foundCategory.image?.url || "");
      } catch (error) {
        console.error("Load category error:", error);

        setError(error.message || "Failed to load category.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCategory();
    }
  }, [id]);

  // =====================================================
  // IMAGE PREVIEW
  // =====================================================

  useEffect(() => {
    if (!image) {
      return;
    }

    const objectUrl = URL.createObjectURL(image);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  // =====================================================
  // NAME
  // =====================================================

  const handleNameChange = (event) => {
    const value = event.target.value;

    setName(value);

    // Only automatically update
    // slug if the user is editing
    // the category name.
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
  // IMAGE
  // =====================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size cannot exceed 5MB.");

      return;
    }

    setError("");
    setImage(file);
  };

  // =====================================================
  // REMOVE SELECTED IMAGE
  // =====================================================

  const removeImage = () => {
    setImage(null);

    // Restore original image
    setPreview(category?.image?.url || "");

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

    if (!name.trim()) {
      setError("Category name is required.");

      return;
    }

    if (!slug.trim()) {
      setError("Category slug is required.");

      return;
    }

    if (!id) {
      setError("Category ID is missing.");

      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", name.trim());

      formData.append("slug", slug.trim().toLowerCase().replace(/\s+/g, "-"));

      formData.append("description", description.trim());

      formData.append("isActive", String(isActive));

      // Only send image if
      // admin selected a new one.
      if (image) {
        formData.append("image", image);
      }

      await updateCategory(id, formData);

      navigate("/admin/categories", {
        replace: true,
      });
    } catch (error) {
      console.error("Update category error:", error);

      setError(error.message || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-background p-6">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-primary" />

          <p className="mt-3 text-sm text-text-secondary">
            Loading category...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (!category) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary"
          >
            <ArrowLeft size={17} />
            Back to Categories
          </button>

          <div className="mt-6 rounded-2xl border border-error/20 bg-error/5 p-8 text-center">
            <p className="text-sm font-semibold text-error">
              {error || "Category not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}

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
            Edit Category
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Update category information and image.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm"
        >
          <div className="space-y-6 p-5 sm:p-6">
            {/* NAME */}

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
                maxLength={50}
                disabled={saving}
                className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              />

              <p className="mt-1.5 text-xs text-text-secondary">
                {name.length}/50 characters
              </p>
            </div>

            {/* SLUG */}

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
                      .replace(/\s+/g, "-"),
                  )
                }
                disabled={saving}
                className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              />
            </div>

            {/* DESCRIPTION */}

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
                maxLength={500}
                rows={5}
                disabled={saving}
                className="w-full resize-none rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              />

              <p className="mt-1.5 text-xs text-text-secondary">
                {description.length}/500 characters
              </p>
            </div>

            {/* IMAGE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-text">
                Category Image
              </label>

              <input
                id="category-image"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleImageChange}
                disabled={saving}
                className="hidden"
              />

              {preview ? (
                <div className="relative overflow-hidden rounded-2xl border border-outline-variant">
                  <img
                    src={preview}
                    alt={category.name}
                    className="h-64 w-full object-cover"
                  />

                  <div className="absolute left-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                    {image ? "New image" : "Current image"}
                  </div>

                  <div className="absolute right-3 top-3 flex gap-2">
                    {image && (
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={saving}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 disabled:opacity-50"
                        title="Cancel new image"
                      >
                        <X size={17} />
                      </button>
                    )}
                  </div>

                  <label
                    htmlFor="category-image"
                    className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-text shadow-lg transition hover:bg-surface-container"
                  >
                    <ImagePlus size={15} />
                    Replace Image
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="category-image"
                  className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container/40 p-6 text-center transition hover:border-primary"
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
                </label>
              )}

              <p className="mt-2 text-xs text-text-secondary">
                Select a new image only if you want to replace the existing
                Cloudinary image.
              </p>
            </div>

            {/* STATUS */}

            <div className="rounded-xl border border-outline-variant bg-surface-container/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-text">
                    Category Status
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    Inactive categories are hidden from customers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsActive((current) => !current)}
                  disabled={saving}
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

          {/* FOOTER */}

          <div className="flex flex-col-reverse gap-3 border-t border-outline-variant p-5 sm:flex-row sm:justify-end sm:p-6">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              disabled={saving}
              className="h-11 rounded-xl border border-outline-variant px-5 text-sm font-semibold text-text transition hover:bg-surface-container disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
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

export default AdminEditCategory;
