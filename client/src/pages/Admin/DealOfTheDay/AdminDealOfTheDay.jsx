// =====================================================
// ADMIN — DEAL OF THE DAY LIST PAGE
// =====================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Clock, Package } from "lucide-react";

import {
  getAllDeals,
  deleteDeal,
  toggleDealStatus,
} from "../../../services/dealAdminService";

// =====================================================
// HELPERS
// =====================================================

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isExpired(expiresAt) {
  return new Date(expiresAt) <= new Date();
}

function StatusBadge({ deal }) {
  if (!deal.isActive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        Inactive
      </span>
    );
  }
  if (isExpired(deal.expiresAt)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
        Expired
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
      Active
    </span>
  );
}

// =====================================================
// COMPONENT
// =====================================================

function AdminDealOfTheDay() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["admin-deals"],
    queryFn: getAllDeals,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      setSuccessMsg("Deal deleted successfully.");
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
    },
    onError: (err) => {
      setError(err.message || "Failed to delete deal");
      setDeletingId(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleDealStatus,
    onSuccess: () => {
      setTogglingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
    },
    onError: (err) => {
      setError(err.message || "Failed to toggle status");
      setTogglingId(null);
    },
  });

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    setDeletingId(id);
    setError("");
    setSuccessMsg("");
    deleteMutation.mutate(id);
  };

  const handleToggle = (id) => {
    setTogglingId(id);
    setError("");
    setSuccessMsg("");
    toggleMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Deal of the Day</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage featured deals displayed on the homepage
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/deals/new")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={16} />
          New Deal
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && deals.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface py-20 text-center">
          <Package size={40} className="mx-auto text-text-secondary/40" />
          <p className="mt-3 text-sm font-medium text-text">No deals yet</p>
          <p className="mt-1 text-xs text-text-secondary">
            Create your first Deal of the Day
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/deals/new")}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={15} />
            Create Deal
          </button>
        </div>
      )}

      {/* Deals Table */}
      {!isLoading && deals.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-3 text-left font-semibold text-text">Product</th>
                  <th className="px-4 py-3 text-left font-semibold text-text">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-text">Discount</th>
                  <th className="px-4 py-3 text-left font-semibold text-text">
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      Expires At
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-text">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-text">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deals.map((deal) => {
                  const product = deal.product;
                  const img =
                    product?.images?.[0]?.url ||
                    (typeof product?.images?.[0] === "string"
                      ? product.images[0]
                      : "");

                  return (
                    <tr key={deal._id} className="hover:bg-background/50">
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img
                              src={img}
                              alt={product?.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Package size={16} className="text-primary" />
                            </div>
                          )}
                          <span className="font-medium text-text line-clamp-1 max-w-[150px]">
                            {product?.name || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3 text-text-secondary max-w-[180px]">
                        <span className="line-clamp-1">{deal.title}</span>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3">
                        {deal.discountLabel ? (
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {deal.discountLabel}
                          </span>
                        ) : (
                          <span className="text-text-secondary">—</span>
                        )}
                      </td>

                      {/* Expires At */}
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        {formatDate(deal.expiresAt)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge deal={deal} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggle(deal._id)}
                            disabled={togglingId === deal._id}
                            title={deal.isActive ? "Deactivate" : "Activate"}
                            className="rounded-lg p-1.5 text-text-secondary transition hover:bg-background hover:text-text disabled:opacity-50"
                          >
                            {deal.isActive ? (
                              <ToggleRight size={18} className="text-green-600" />
                            ) : (
                              <ToggleLeft size={18} />
                            )}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/deals/${deal._id}/edit`)}
                            title="Edit"
                            className="rounded-lg p-1.5 text-text-secondary transition hover:bg-background hover:text-text"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(deal._id)}
                            disabled={deletingId === deal._id}
                            title="Delete"
                            className="rounded-lg p-1.5 text-text-secondary transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDealOfTheDay;
