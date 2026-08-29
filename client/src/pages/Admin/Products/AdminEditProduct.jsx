import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminProductById,
  updateProduct,
} from "../../../services/productService";

import { getAllCategories } from "../../../services/categoryService";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function AdminEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

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

  const [existingImages, setExistingImages] = useState([]);

  const [newImages, setNewImages] = useState([]);

  const [previews, setPreviews] = useState([]);

  // =====================================================
  // LOAD PRODUCT + CATEGORIES
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!id) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [productResponse, categoryResponse] = await Promise.all([
          getAdminProductById(id),
          getAllCategories(),
        ]);

        const loadedProduct = productResponse?.product;

        if (!loadedProduct) {
          throw new Error("Product not found.");
        }

        if (!mounted) {
          return;
        }

        setProduct(loadedProduct);

        setForm({
          name: loadedProduct.name || "",

          description: loadedProduct.description || "",

          price: loadedProduct.price ?? "",

          stock: loadedProduct.stock ?? "",

          category:
            typeof loadedProduct.category === "object"
              ? loadedProduct.category?._id || ""
              : loadedProduct.category || "",

          isActive: loadedProduct.isActive !== false,
        });

        setExistingImages(loadedProduct.images || []);

        setCategories(categoryResponse?.categories || []);
      } catch (error) {
        console.error("Load edit product error:", error);

        if (mounted) {
          setError(
            error.response?.data?.message ||
              error.message ||
              "Failed to load product.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [id]);

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
  // ADD NEW IMAGES
  // =====================================================

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    setError("");

    if (!selectedFiles.length) {
      return;
    }

    const totalImages = existingImages.length + newImages.length;

    const availableSlots = MAX_IMAGES - totalImages;

    if (availableSlots <= 0) {
      setError(`Maximum ${MAX_IMAGES} images are allowed.`);

      event.target.value = "";
      return;
    }

    const filesToAdd = selectedFiles.slice(0, availableSlots);

    const invalidFile = filesToAdd.find((file) => {
      return !file.type.startsWith("image/") || file.size > MAX_FILE_SIZE;
    });

    if (invalidFile) {
      setError("Only image files up to 5MB are allowed.");

      event.target.value = "";
      return;
    }

    const generatedPreviews = filesToAdd.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setNewImages((previous) => [...previous, ...filesToAdd]);

    setPreviews((previous) => [...previous, ...generatedPreviews]);

    event.target.value = "";
  };

  // =====================================================
  // REMOVE EXISTING IMAGE
  // =====================================================

  const removeExistingImage = (index) => {
    setExistingImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );

    setError("");
  };

  // =====================================================
  // REMOVE NEW IMAGE
  // =====================================================

  const removeNewImage = (index) => {
    setPreviews((previous) => {
      const preview = previous[index];

      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }

      return previous.filter((_, imageIndex) => imageIndex !== index);
    });

    setNewImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );

    setError("");
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

    const totalImages = existingImages.length + newImages.length;

    if (totalImages > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images are allowed.`);
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

      /*
       * The backend keeps existing images.
       * New files are appended to the product.
       */
      newImages.forEach((file) => {
        formData.append("images", file);
      });

      await updateProduct(id, formData);

      setSuccess("Product updated successfully.");

      setTimeout(() => {
        navigate(`/admin/products/${id}`);
      }, 700);
    } catch (error) {
      console.error("Update product error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update product.",
      );
    } finally {
      setSubmitting(false);
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

          <p className="mt-3 text-sm text-text-secondary">Loading product...</p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (!product) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary"
          >
            <ArrowLeft size={17} />
            Back to Products
          </button>

          <div className="mt-6 rounded-2xl border border-error/20 bg-error/5 p-8 text-center">
            <XCircle size={36} className="mx-auto text-error" />

            <p className="mt-3 text-sm text-error">
              {error || "Product not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(`/admin/products/${id}`)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
            >
              <ArrowLeft size={17} />
              Back to Product
            </button>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Edit Product
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Update product information, category, stock and images.
            </p>
          </div>

          <StatusBadge active={form.isActive} />
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PRODUCT INFORMATION */}

          <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-text">
              Product Information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-text"
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
                  className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={2000}
                  rows={6}
                  className="w-full resize-y rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm leading-6 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium text-text"
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
                  className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="mb-2 block text-sm font-medium text-text"
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
                  className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  <option value="">Select category</option>

                  {categories
                    .filter(
                      (item) => item.isActive || item._id === form.category,
                    )
                    .map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                        {!item.isActive ? " (Inactive)" : ""}
                      </option>
                    ))}
                </select>

                <p className="mt-2 text-xs text-text-secondary">
                  Products can only be assigned to an active category.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-outline-variant"
                  />

                  <span className="text-sm font-medium text-text">
                    Product is active
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* IMAGES */}

          <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-text">
                  Product Images
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Maximum {MAX_IMAGES} images, 5MB each.
                </p>
              </div>

              <span className="text-sm font-semibold text-text-secondary">
                {existingImages.length + newImages.length}/{MAX_IMAGES}
              </span>
            </div>

            {/* EXISTING */}

            {existingImages.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Existing Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {existingImages.map((image, index) => (
                    <div
                      key={image.publicId || image.url || index}
                      className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container"
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} existing image ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEW */}

            {previews.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  New Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {previews.map((preview, index) => (
                    <div
                      key={preview.url}
                      className="group relative overflow-hidden rounded-xl border border-primary/30 bg-surface-container"
                    >
                      <img
                        src={preview.url}
                        alt={`New product image ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                        aria-label="Remove new image"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UPLOAD */}

            {existingImages.length + newImages.length < MAX_IMAGES && (
              <label
                htmlFor="images"
                className="mt-5 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant px-4 py-6 text-center transition hover:border-primary"
              >
                <ImagePlus size={25} className="text-text-secondary" />

                <span className="mt-2 text-sm font-semibold text-text">
                  Add Images
                </span>

                <span className="mt-1 text-xs text-text-secondary">
                  PNG, JPG, JPEG, WEBP or GIF
                </span>

                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </section>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={() => navigate(`/admin/products/${id}`)}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant px-5 text-sm font-semibold text-text transition hover:bg-surface-container disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  Update Product
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
// STATUS BADGE
// =====================================================

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
      <CheckCircle2 size={14} />
      Active
    </span>
  ) : (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-error/10 px-3 py-1.5 text-xs font-semibold text-error">
      <XCircle size={14} />
      Inactive
    </span>
  );
}

export default AdminEditProduct;
