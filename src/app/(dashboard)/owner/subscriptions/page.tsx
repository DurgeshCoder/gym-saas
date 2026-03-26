"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  XCircle,
  CreditCard,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { DataTable, SearchFilterBar, type Column, type FilterConfig } from "@/components/shared";
import toast from "react-hot-toast";

interface SubRecord {
  id: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  active: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
  plan: { id: string; name: string; price: number; duration: number };
}

interface MemberOption {
  id: string;
  name: string;
  email: string;
}

interface PlanOption {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export default function OwnerSubscriptionsPage() {
  const [subs, setSubs] = useState<SubRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search / Filters
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: "active",
    planId: "",
    sortBy: "",
  });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<SubRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Forms
  const emptyCreate = { userId: "", planId: "", startDate: new Date().toISOString().slice(0, 10), autoRenew: false, paymentMethod: "CASH" };
  const [createData, setCreateData] = useState(emptyCreate);
  const [editData, setEditData] = useState({ id: "", planId: "", startDate: "", autoRenew: false, active: true });

  // Load members & plans for dropdowns
  useEffect(() => {
    (async () => {
      try {
        const [mRes, pRes] = await Promise.all([
          fetch("/api/users?limit=100"),
          fetch("/api/plans?limit=100"),
        ]);
        if (mRes.ok) {
          const mJson = await mRes.json();
          setMembers(mJson.data || []);
        }
        if (pRes.ok) {
          const pJson = await pRes.json();
          setPlans(pJson.data || []);
        }
      } catch {}
    })();
  }, []);

  // Fetch subscriptions
  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      if (search) params.set("search", search);
      if (filterValues.status) params.set("status", filterValues.status);
      if (filterValues.planId) params.set("planId", filterValues.planId);
      if (filterValues.sortBy) params.set("sortBy", filterValues.sortBy);

      const res = await fetch(`/api/subscriptions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setSubs(json.data);
        setTotalItems(json.total);
        setTotalPages(json.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, filterValues]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterValues, pageSize]);

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });
      if (res.ok) {
        toast.success("Subscription assigned successfully!");
        setShowAddModal(false);
        setCreateData(emptyCreate);
        fetchSubs();
      } else {
        const err = await res.json();
        setError(err.message);
        toast.error(err.message || "Failed to assign subscription");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Edit
  const openEdit = (s: SubRecord) => {
    setEditData({
      id: s.id,
      planId: s.plan.id,
      startDate: s.startDate.slice(0, 10),
      autoRenew: s.autoRenew,
      active: s.active,
    });
    setError("");
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/subscriptions/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        toast.success("Subscription updated!");
        setShowEditModal(false);
        fetchSubs();
      } else {
        const err = await res.json();
        setError(err.message);
        toast.error(err.message || "Failed to update subscription");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel
  const handleCancel = async () => {
    if (!showCancelConfirm) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/subscriptions/${showCancelConfirm.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Subscription cancelled.");
        setShowCancelConfirm(null);
        fetchSubs();
      } else {
        const err = await res.json();
        alert(err.message);
        toast.error(err.message || "Failed to cancel subscription");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  const getStatusBadge = (s: SubRecord) => {
    if (!s.active)
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600">
          <XCircle className="w-3 h-3" /> Cancelled
        </span>
      );
    if (isExpired(s.endDate))
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
          <AlertTriangle className="w-3 h-3" /> Expired
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
        <CheckCircle2 className="w-3 h-3" /> Active
      </span>
    );
  };

  const daysRemaining = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // Selected plan preview for create modal
  const selectedPlan = plans.find((p) => p.id === createData.planId);

  // Filters
  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "All Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Expired / Cancelled", value: "expired" },
      ],
    },
    {
      key: "planId",
      label: "All Plans",
      options: plans.map((p) => ({ label: p.name, value: p.id })),
    },
    {
      key: "sortBy",
      label: "Sort By",
      options: [
        { label: "Newest", value: "createdAt" },
        { label: "Start Date", value: "startDate" },
        { label: "End Date", value: "endDate" },
      ],
    },
  ];

  // Columns
  const columns: Column<SubRecord>[] = [
    {
      key: "member",
      header: "Member",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm">
            {s.user.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{s.user.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200">{s.plan.name}</p>
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-0.5">{formatPrice(s.plan.price)}</p>
        </div>
      ),
    },
    {
      key: "period",
      header: "Period",
      render: (s) => (
        <div className="text-sm">
          <p className="text-slate-700 dark:text-slate-300">
            {new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()}
          </p>
          {s.active && !isExpired(s.endDate) && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
              {daysRemaining(s.endDate)} days left
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => getStatusBadge(s),
    },
    {
      key: "autoRenew",
      header: "Auto-Renew",
      render: (s) => (
        <span className={`text-xs font-semibold ${s.autoRenew ? "text-blue-600" : "text-slate-400"}`}>
          {s.autoRenew ? <RefreshCw className="w-4 h-4 inline mr-1" /> : null}
          {s.autoRenew ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => openEdit(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          {s.active && (
            <button onClick={() => setShowCancelConfirm(s)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Cancel">
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-1">Assign plans to members and manage active subscriptions</p>
        </div>
        <button
          onClick={() => { setCreateData(emptyCreate); setError(""); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Assign Subscription
        </button>
      </div>

      {/* Search + Filters */}
      <SearchFilterBar
        searchPlaceholder="Search by member name or email..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(key, value) => setFilterValues((f) => ({ ...f, [key]: value }))}
        onClearFilters={() => setFilterValues({ status: "", planId: "", sortBy: "" })}
      />

      {/* DataTable */}
      <DataTable<SubRecord>
        columns={columns}
        data={subs}
        loading={loading}
        rowKey={(s) => s.id}
        emptyIcon={<CreditCard className="w-8 h-8 text-slate-400" />}
        emptyTitle="No Subscriptions"
        emptyDescription="Assign a membership plan to a member to create the first subscription."
        emptyAction={
          <button onClick={() => { setCreateData(emptyCreate); setShowAddModal(true); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm">
            Assign First Subscription
          </button>
        }
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* ── Assign Subscription Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Plus className="w-5 h-5" /> Assign Subscription</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-lg">{error}</p>}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Member</label>
                <select required value={createData.userId} onChange={(e) => setCreateData({ ...createData, userId: e.target.value })} className={inputCls}>
                  <option value="">— Choose a member —</option>
                  {members.filter((m) => m.id).map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Plan</label>
                <select required value={createData.planId} onChange={(e) => setCreateData({ ...createData, planId: e.target.value })} className={inputCls}>
                  <option value="">— Choose a plan —</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)} / {p.duration} days</option>
                  ))}
                </select>
              </div>

              {/* Plan preview card */}
              {selectedPlan && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-blue-800 dark:text-blue-300">{selectedPlan.name}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{selectedPlan.duration} days duration</p>
                    </div>
                    <p className="text-xl font-extrabold text-blue-700 dark:text-blue-300">{formatPrice(selectedPlan.price)}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input required type="date" value={createData.startDate} onChange={(e) => setCreateData({ ...createData, startDate: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select value={createData.paymentMethod} onChange={(e) => setCreateData({ ...createData, paymentMethod: e.target.value })} className={inputCls}>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="PAYPAL">PayPal / UPI</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={createData.autoRenew} onChange={(e) => setCreateData({ ...createData, autoRenew: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Auto-Renewal</span>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50">{submitting ? "Assigning..." : "Assign Subscription"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Subscription Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Edit2 className="w-5 h-5" /> Edit Subscription</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {error && <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-lg">{error}</p>}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Change Plan</label>
                <select value={editData.planId} onChange={(e) => setEditData({ ...editData, planId: e.target.value })} className={inputCls}>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                <input type="date" value={editData.startDate} onChange={(e) => setEditData({ ...editData, startDate: e.target.value })} className={inputCls} />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editData.autoRenew} onChange={(e) => setEditData({ ...editData, autoRenew: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-Renew</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editData.active} onChange={(e) => setEditData({ ...editData, active: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                </label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50">{submitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Cancel Confirmation ── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-slate-700 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cancel Subscription?</h3>
            <p className="text-sm text-slate-500 mb-1"><strong>{showCancelConfirm.user.name}</strong>'s subscription to <strong>{showCancelConfirm.plan.name}</strong> will be cancelled.</p>
            <p className="text-xs text-slate-400 mb-6">The member will lose access after the end date.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(null)} className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl">Keep Active</button>
              <button onClick={handleCancel} disabled={submitting} className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl disabled:opacity-50">{submitting ? "Cancelling..." : "Cancel Subscription"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
