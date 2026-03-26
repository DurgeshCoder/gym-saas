"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Dumbbell,
  Clock,
  IndianRupee,
  Users,
  Tag,
} from "lucide-react";
import { DataTable, SearchFilterBar, type Column, type FilterConfig } from "@/components/shared";

interface PlanRecord {
  id: string;
  name: string;
  price: number;
  duration: number;
  createdAt: string;
  _count: { subscriptions: number };
}

export default function OwnerPlansPage() {
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search / Filters
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    sortBy: "",
    sortOrder: "",
  });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<PlanRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Forms
  const emptyCreate = { name: "", price: "", duration: "" };
  const emptyEdit = { id: "", name: "", price: "", duration: "" };
  const [createData, setCreateData] = useState(emptyCreate);
  const [editData, setEditData] = useState(emptyEdit);

  // Fetch
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      if (search) params.set("search", search);
      if (filterValues.sortBy) params.set("sortBy", filterValues.sortBy);
      if (filterValues.sortOrder) params.set("sortOrder", filterValues.sortOrder);

      const res = await fetch(`/api/plans?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setPlans(json.data);
        setTotalItems(json.total);
        setTotalPages(json.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, filterValues]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterValues, pageSize]);

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createData.name,
          price: parseFloat(createData.price),
          duration: parseInt(createData.duration),
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setCreateData(emptyCreate);
        fetchPlans();
      } else {
        const err = await res.json();
        setError(err.message || "Error creating plan");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Edit
  const openEdit = (p: PlanRecord) => {
    setEditData({ id: p.id, name: p.name, price: p.price.toString(), duration: p.duration.toString() });
    setError("");
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/plans/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.name,
          price: editData.price,
          duration: editData.duration,
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchPlans();
      } else {
        const err = await res.json();
        setError(err.message || "Error updating plan");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/plans/${showDeleteConfirm.id}`, { method: "DELETE" });
      if (res.ok) {
        setShowDeleteConfirm(null);
        fetchPlans();
      } else {
        const err = await res.json();
        alert(err.message);
        setShowDeleteConfirm(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  const formatDuration = (days: number): string => {
    if (days === 1) return "1 Day";
    if (days === 7) return "1 Week";
    if (days === 30 || days === 31) return "1 Month";
    if (days === 90) return "3 Months";
    if (days === 180) return "6 Months";
    if (days === 365 || days === 366) return "1 Year";
    return `${days} Days`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
  };

  // Filters config
  const filters: FilterConfig[] = [
    {
      key: "sortBy",
      label: "Sort By",
      options: [
        { label: "Newest First", value: "createdAt" },
        { label: "Name", value: "name" },
        { label: "Price (Low→High)", value: "price" },
        { label: "Duration", value: "duration" },
      ],
    },
    {
      key: "sortOrder",
      label: "Order",
      options: [
        { label: "Ascending", value: "asc" },
        { label: "Descending", value: "desc" },
      ],
    },
  ];

  // Column definitions
  const columns: Column<PlanRecord>[] = [
    {
      key: "plan",
      header: "Plan Name",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 flex items-center justify-center shadow-sm">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-base">{p.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">Created {new Date(p.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (p) => (
        <span className="inline-flex items-center gap-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
          <IndianRupee className="w-4 h-4" />
          {formatPrice(p.price).replace("₹", "")}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
          <Clock className="w-3 h-3" />
          {formatDuration(p.duration)}
        </span>
      ),
    },
    {
      key: "subscribers",
      header: "Active Subs",
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
          <Users className="w-3 h-3" />
          {p._count.subscriptions}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setShowDeleteConfirm(p)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white";

  // Duration presets
  const durationPresets = [
    { label: "1 Day", value: "1" },
    { label: "1 Week", value: "7" },
    { label: "1 Month", value: "30" },
    { label: "3 Months", value: "90" },
    { label: "6 Months", value: "180" },
    { label: "1 Year", value: "365" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Membership Plans</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage subscription plans for your gym</p>
        </div>
        <button
          onClick={() => { setCreateData(emptyCreate); setError(""); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Plan
        </button>
      </div>

      {/* Search + Filters */}
      <SearchFilterBar
        searchPlaceholder="Search plans by name..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(key, value) => setFilterValues((f) => ({ ...f, [key]: value }))}
        onClearFilters={() => setFilterValues({ sortBy: "", sortOrder: "" })}
      />

      {/* DataTable */}
      <DataTable<PlanRecord>
        columns={columns}
        data={plans}
        loading={loading}
        rowKey={(p) => p.id}
        emptyIcon={<Dumbbell className="w-8 h-8 text-slate-400" />}
        emptyTitle="No Plans Yet"
        emptyDescription="Create your first membership plan to start accepting subscriptions."
        emptyAction={
          <button onClick={() => { setCreateData(emptyCreate); setShowAddModal(true); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm">
            Create First Plan
          </button>
        }
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* ── Create Plan Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Plus className="w-5 h-5" /> Create New Plan</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan Name</label>
                <input required type="text" value={createData.name} onChange={(e) => setCreateData({ ...createData, name: e.target.value })} className={inputCls} placeholder="e.g. Gold Monthly" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                <input required type="number" min="1" step="1" value={createData.price} onChange={(e) => setCreateData({ ...createData, price: e.target.value })} className={inputCls} placeholder="e.g. 1999" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (days)</label>
                <input required type="number" min="1" value={createData.duration} onChange={(e) => setCreateData({ ...createData, duration: e.target.value })} className={inputCls} placeholder="e.g. 30" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {durationPresets.map((p) => (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => setCreateData({ ...createData, duration: p.value })}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        createData.duration === p.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50">{submitting ? "Creating..." : "Create Plan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Plan Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Edit2 className="w-5 h-5" /> Edit Plan</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {error && <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan Name</label>
                <input required type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                <input required type="number" min="1" step="1" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (days)</label>
                <input required type="number" min="1" value={editData.duration} onChange={(e) => setEditData({ ...editData, duration: e.target.value })} className={inputCls} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {durationPresets.map((p) => (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => setEditData({ ...editData, duration: p.value })}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        editData.duration === p.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50">{submitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-slate-700 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete "{showDeleteConfirm.name}"?</h3>
            {showDeleteConfirm._count.subscriptions > 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg mb-4">
                ⚠ This plan has <strong>{showDeleteConfirm._count.subscriptions}</strong> active subscription(s). Deletion will be blocked if any are still active.
              </p>
            ) : (
              <p className="text-sm text-slate-500 mb-6">This plan will be permanently removed. This action cannot be undone.</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl">Cancel</button>
              <button onClick={handleDelete} disabled={submitting} className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl disabled:opacity-50">{submitting ? "Deleting..." : "Delete Plan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
