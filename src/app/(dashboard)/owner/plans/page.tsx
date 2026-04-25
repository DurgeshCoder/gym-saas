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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlanRecord {
  id: string;
  name: string;
  price: number;
  duration: number;
  discount: number;
  discountType: string;
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
  const emptyCreate = { name: "", price: "", duration: "", discount: "0", discountType: "PERCENTAGE" };
  const emptyEdit = { id: "", name: "", price: "", duration: "", discount: "0", discountType: "PERCENTAGE" };
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
          discount: parseFloat(createData.discount) || 0,
          discountType: createData.discountType,
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
    setEditData({ 
      id: p.id, 
      name: p.name, 
      price: p.price.toString(), 
      duration: p.duration.toString(),
      discount: (p.discount || 0).toString(),
      discountType: p.discountType || "PERCENTAGE",
    });
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
          price: parseFloat(editData.price),
          duration: parseInt(editData.duration),
          discount: parseFloat(editData.discount) || 0,
          discountType: editData.discountType,
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
          <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center shadow-sm">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-base">{p.name}</p>
            <p className="text-muted-foreground text-xs mt-0.5">Created {new Date(p.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price & Discount",
      render: (p) => (
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
            <IndianRupee className="w-4 h-4" />
            {formatPrice(p.price).replace("₹", "")}
          </span>
          {p.discount > 0 && (
            <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {p.discountType === "PERCENTAGE" ? `${p.discount}% OFF` : `₹${p.discount} OFF`}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-primary/10 text-primary border-primary/20">
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
          <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Edit">
            <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(p)} title="Delete">
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </Button>
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
          <h1 className="text-2xl font-extrabold text-foreground">Membership Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage subscription plans for your gym</p>
        </div>
        <Button
          onClick={() => { setCreateData(emptyCreate); setError(""); setShowAddModal(true); }}
          className="shadow-sm items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Plan
        </Button>
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
          <Button onClick={() => { setCreateData(emptyCreate); setShowAddModal(true); }}>
            Create First Plan
          </Button>
        }
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* ── Create Plan Modal ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Create New Plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Plan Name</label>
              <Input required type="text" value={createData.name} onChange={(e) => setCreateData({ ...createData, name: e.target.value })} placeholder="e.g. Gold Monthly" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price (₹)</label>
              <Input required type="number" min="1" step="1" value={createData.price} onChange={(e) => setCreateData({ ...createData, price: e.target.value })} placeholder="e.g. 1999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Duration (days)</label>
              <Input required type="number" min="1" value={createData.duration} onChange={(e) => setCreateData({ ...createData, duration: e.target.value })} placeholder="e.g. 30" />
              <div className="flex flex-wrap gap-2 mt-2">
                {durationPresets.map((p) => (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => setCreateData({ ...createData, duration: p.value })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${createData.duration === p.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:bg-muted"
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Discount Config</label>
              <div className="flex gap-2">
                <Input type="number" min="0" step="1" value={createData.discount} onChange={(e) => setCreateData({ ...createData, discount: e.target.value })} placeholder="0" className="w-2/3" />
                <Select value={createData.discountType} onValueChange={(val) => val && setCreateData({ ...createData, discountType: val })}>
                  <SelectTrigger className="w-1/3">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">%</SelectItem>
                    <SelectItem value="FIXED">Flat (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Plan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Plan Modal ── */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit2 className="w-5 h-5" /> Edit Plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Plan Name</label>
              <Input required type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price (₹)</label>
              <Input required type="number" min="1" step="1" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Duration (days)</label>
              <Input required type="number" min="1" value={editData.duration} onChange={(e) => setEditData({ ...editData, duration: e.target.value })} />
              <div className="flex flex-wrap gap-2 mt-2">
                {durationPresets.map((p) => (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => setEditData({ ...editData, duration: p.value })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${editData.duration === p.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:bg-muted"
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Discount Config</label>
              <div className="flex gap-2">
                <Input type="number" min="0" step="1" value={editData.discount} onChange={(e) => setEditData({ ...editData, discount: e.target.value })} placeholder="0" className="w-2/3" />
                <Select value={editData.discountType} onValueChange={(val) => val && setEditData({ ...editData!, discountType: val })}>
                  <SelectTrigger className="w-1/3">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">%</SelectItem>
                    <SelectItem value="FIXED">Flat (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-destructive" />
            </div>
            <DialogTitle className="text-center">Delete "{showDeleteConfirm?.name}"?</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {showDeleteConfirm?._count.subscriptions && showDeleteConfirm._count.subscriptions > 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg mb-4">
                ⚠ This plan has <strong>{showDeleteConfirm._count.subscriptions}</strong> active subscription(s). Deletion will be blocked if any are still active.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mb-2">This plan will be permanently removed. This action cannot be undone.</p>
            )}
          </div>
          <DialogFooter className="flex gap-3 sm:justify-center">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting} className="flex-1">
              {submitting ? "Deleting..." : "Delete Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
