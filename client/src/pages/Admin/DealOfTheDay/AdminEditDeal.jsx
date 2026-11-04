// =====================================================
// ADMIN — EDIT DEAL
// =====================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";

import {
  getDealById,
  updateDeal,
} from "../../../services/dealAdminService";
import adminApi from "../../../services/adminApi";

async function fetchProducts() {
  try {
    const response = await adminApi.get("/products/admin/all?limit=200");
    return response.data?.products || [];
  } catch {
    const response = await adminApi.get("/products?limit=200");
    return response.data?.products || [];
  }
}

function AdminEditDeal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    product: "",
    title: "",
    description: "",
    badge: "Deal of the Day",
    discountLabel: "",
    expiresAt: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const { data: deal, isLoading: dealLoading } = useQuery({
    queryKey: ["admin-deal", id],
    queryFn: () => getDealById(id),
    enabled: Boolean(id),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products-picker"],
    queryFn: fetchProducts,
  });

  // Populate form when deal loads
  useEffect(() => {
    if (!deal) return;

    // Convert ISO date to datetime-local format
    const expiresAtLocal = deal.expiresAt
      ? new Date(new Date(deal.expiresAt).getTime() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : "";

    setForm({
      product: deal.product?._id || deal.product || "",
      title: deal.title || "",
      description: deal.description || "",
      badge: deal.badge || "Deal of the Day",
      discountLabel: deal.discountLabel || "",
      expiresAt: expiresAtLocal,
    });
  }, [deal]);

  const updateMutation = useMutation({
    mutationFn: (data) => updateDeal(id, data),
    onSuccess: () => {
      setSuccessMsg("Deal updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-deal", id] });
      setTimeout(() => navigate("/admin/deals"), 1200);
    },
    onError: (err) => {
      setErrors({ general: err.message || "Failed to update deal" });
    },
  });

  const validate = () => {
    const newErrors = {};

    if (!form.product) newErrors.product = "Please select a product";
    if (!form.title.trim() || form.title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters";
    if (!form.description.trim() || form.description.trim().length < 5)
      newErrors.description = "Description must be at least 5 characters";
    if (!form.expiresAt) newErrors.expiresAt = "Expiry date is required";
    else if (new Date(form.expiresAt) <= new Date())
      newErrors.expiresAt = "Expiry date must be in the future";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    updateMutation.mutate({
      product: form.product,
      title: form.title.trim(),
      description: form.description.trim(),
      badge: form.badge.trim() || "Deal of the Day",
      discountLabel: form.discountLabel.trim(),
      expiresAt: new Date(form.expiresAt).toISOString(),
    });
  };

  if (dealLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-text-secondary">Deal not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/deals")}
          className="rounded-lg p-2 text-text-secondary transition hover:bg-surface hover:text-text"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-text">Edit Deal</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Update the Deal of the Day
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
        >
          {/* General error */}
          {errors.general && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMsg}
            </div>
          )}

          {/* Product picker */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-semibold text-text">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              name="product"
              value={form.product}
              onChange={handleChange}
              disabled={productsLoading}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.product ? "border-red-400" : "border-border"}`}
            >
              <option value="">
                {productsLoading ? "Loading products..." : "Select a product"}
              </option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.product && (
              <p className="mt-1 text-xs text-red-500">{errors.product}</p>
            )}
          </div>

          {/* Title */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-semibold text-text">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Premium audio at a special price"
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.title ? "border-red-400" : "border-border"}`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-semibold text-text">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Short description shown below the title"
              className={`w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.description ? "border-red-400" : "border-border"}`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Badge */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-semibold text-text">
              Badge Label
            </label>
            <input
              type="text"
              name="badge"
              value={form.badge}
              onChange={handleChange}
              placeholder="Deal of the Day"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <p className="mt-1 text-xs text-text-secondary">
              Shown as the chip above the title
            </p>
          </div>

          {/* Discount Label */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-semibold text-text">
              Discount Label
            </label>
            <input
              type="text"
              name="discountLabel"
              value={form.discountLabel}
              onChange={handleChange}
              placeholder="-35%"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <p className="mt-1 text-xs text-text-secondary">
              Shown as the discount badge on the product image (e.g. &quot;-35%&quot;)
            </p>
          </div>

          {/* Expiry Date */}
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-semibold text-text">
              Expiry Date &amp; Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={form.expiresAt}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 ${errors.expiresAt ? "border-red-400" : "border-border"}`}
            />
            {errors.expiresAt && (
              <p className="mt-1 text-xs text-red-500">{errors.expiresAt}</p>
            )}
            <p className="mt-1 text-xs text-text-secondary">
              The countdown timer on the homepage counts down to this time
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/deals")}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text transition hover:bg-background"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {updateMutation.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Save size={15} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminEditDeal;
