import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createProduct } from "../../../services/productService";

import { getAllCategories } from "../../../services/categoryService";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function AdminNewProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    isActive: true,
  });

  const [images, setImages] = useState([]);

  const [previews, setPreviews] = useState([]);

  // =====================================================
  // LOAD ACTIVE CATEGORIES
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        setError("");

        const response = await getAllCategories();

        const activeCategories = (response?.categories || []).filter(
          (category) => category?.isActive === true,
        );

        if (mounted) {
          setCategories(activeCategories);
        }
      } catch (err) {
        console.error("Load categories error:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load categories.",
          );
        }
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // IMAGE CHANGE
  // =====================================================

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    setError("");

    if (!selectedFiles.length) {
      return;
    }

    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setError(`Maximum ${MAX_IMAGES} images are allowed.`);

      event.target.value = "";
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    const invalidFile = filesToAdd.find((file) => {
      const validType = file.type.startsWith("image/");

      const validSize = file.size <= MAX_FILE_SIZE;

      return !validType || !validSize;
    });

    if (invalidFile) {
      setError("Only image files up to 5MB are allowed.");

      event.target.value = "";
      return;
    }

    const newPreviews = filesToAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((previous) => [...previous, ...filesToAdd]);

    setPreviews((previous) => [...previous, ...newPreviews]);

    event.target.value = "";
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = (index) => {
    setPreviews((previous) => {
      const preview = previous[index];

      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }

      return previous.filter((_, imageIndex) => imageIndex !== index);
    });

    setImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  // =====================================================
  // CLEAN PREVIEWS
  // =====================================================

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview?.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [previews]);

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!categories.length) {
      setError(
        "You cannot add a product because there are no active categories.",
      );

      return;
    }

    if (!form.category) {
      setError("Please select a category.");

      return;
    }

    if (!form.name.trim()) {
      setError("Product name is required.");

      return;
    }

    if (!form.description.trim()) {
      setError("Product description is required.");

      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Enter a valid product price.");

      return;
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0 ||
      !Number.isInteger(Number(form.stock))
    ) {
      setError("Stock must be a whole number.");

      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("name", form.name.trim());

      formData.append("description", form.description.trim());

      formData.append("price", String(form.price));

      formData.append("stock", String(form.stock));

      formData.append("category", form.category);

      formData.append("isActive", String(form.isActive));

      images.forEach((file) => {
        formData.append("images", file);
      });

      await createProduct(formData);

      setSuccess("Product created successfully.");

      setTimeout(() => {
        navigate("/admin/products");
      }, 700);
    } catch (err) {
      console.error("Create product error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create product.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-dvh bg-background px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              Add Product
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Create a new product under an active category.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-muted"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-text-primary">
              Product Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Product Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  maxLength={2000}
                  placeholder="Describe the product"
                  className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Price
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Stock
                </label>

                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={loadingCategories || categories.length === 0}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : categories.length === 0
                        ? "No active categories available"
                        : "Select a category"}
                  </option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {!loadingCategories && categories.length === 0 && (
                  <p className="mt-2 text-xs text-red-600">
                    Create or enable a category before adding a product.
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-border"
                  />

                  <span className="text-sm font-medium text-text-primary">
                    Product is active
                  </span>
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Product Images
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Upload up to 5 images. Maximum 5MB per image.
                </p>
              </div>

              <span className="text-sm text-text-secondary">
                {images.length}/{MAX_IMAGES}
              </span>
            </div>

            <label
              htmlFor="images"
              className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-4 py-6 text-center transition hover:border-primary"
            >
              <span className="text-sm font-medium text-text-primary">
                Click to upload images
              </span>

              <span className="mt-1 text-xs text-text-secondary">
                PNG, JPG, JPEG, WEBP or GIF
              </span>

              <input
                id="images"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                onChange={handleImageChange}
                disabled={images.length >= MAX_IMAGES}
                className="hidden"
              />
            </label>

            {previews.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {previews.map((preview, index) => (
                  <div
                    key={`${preview.url}-${index}`}
                    className="group relative overflow-hidden rounded-lg border border-border bg-background"
                  >
                    <img
                      src={preview.url}
                      alt={`Product preview ${index + 1}`}
                      className="aspect-square w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => navigate("/admin/products")}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting || loadingCategories || categories.length === 0
              }
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminNewProduct;
