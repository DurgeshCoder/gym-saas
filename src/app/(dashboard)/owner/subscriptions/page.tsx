"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  XCircle,
  CreditCard,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Bell,
  MessageSquare,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { DataTable, SearchFilterBar, type Column, type FilterConfig, SearchableSelect } from "@/components/shared";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface SubRecord {
  id: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  active: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string; profilePhoto?: string | null };
  plan: { id: string; name: string; price: number; duration: number };
}

interface MemberOption {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
}

interface PlanOption {
  id: string;
  name: string;
  price: number;
  duration: number;
  discount?: number;
  discountType?: string;
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
  const [showReminderModal, setShowReminderModal] = useState<SubRecord | null>(null);
  const [reminderChannel, setReminderChannel] = useState("WHATSAPP");
  const [reminderMessage, setReminderMessage] = useState("");
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
      } catch { }
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

  // Reminder
  const openReminder = (s: SubRecord) => {
    const daysLeft = Math.ceil((new Date(s.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    let defaultMessage = `Hi ${s.user.name}, this is a reminder from your gym. Your subscription for the ${s.plan.name} plan `;
    if (daysLeft < 0) {
      defaultMessage += `expired ${Math.abs(daysLeft)} days ago on ${new Date(s.endDate).toLocaleDateString()}. Please renew to continue your fitness journey!`;
    } else if (daysLeft === 0) {
      defaultMessage += `expires TODAY. Please renew to avoid any interruption.`;
    } else {
      defaultMessage += `is expiring in ${daysLeft} days on ${new Date(s.endDate).toLocaleDateString()}. Please renew soon!`;
    }

    setReminderMessage(defaultMessage);
    setShowReminderModal(s);
  };

  const handleSendReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReminderModal) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscriptions/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: showReminderModal.id,
          userId: showReminderModal.user.id,
          channel: reminderChannel,
          message: reminderMessage,
        }),
      });
      if (res.ok) {
        toast.success("Reminder sent and logged successfully!");
        setShowReminderModal(null);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to send reminder");
      }
    } catch {
      toast.error("Internal Server Error");
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const getDiscountedPrice = (plan: PlanOption) => {
    let finalAmount = plan.price;
    if (plan.discount && plan.discount > 0) {
      if (plan.discountType === "FIXED") {
        finalAmount = Math.max(0, plan.price - plan.discount);
      } else if (plan.discountType === "PERCENTAGE") {
        finalAmount = Math.max(0, plan.price - (plan.price * plan.discount) / 100);
      }
    }
    return finalAmount;
  };

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
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm overflow-hidden shrink-0">
            {s.user.profilePhoto ? (
              <img src={s.user.profilePhoto} alt={s.user.name} className="w-full h-full object-cover" />
            ) : (
              s.user.name.charAt(0)
            )}
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
          {s.active && (
            <button onClick={() => openReminder(s)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors" title="Send Reminder">
              <Bell className="w-4 h-4" />
            </button>
          )}
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



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">Assign plans to members and manage active subscriptions</p>
        </div>
        <div className="flex gap-3">
          <Link href="/owner/subscriptions/reminders">
            <Button variant="outline" className="shadow-sm items-center gap-2">
              <Clock className="w-5 h-5 mr-1" />
              Reminders
            </Button>
          </Link>
          <Button
            onClick={() => { setCreateData(emptyCreate); setError(""); setShowAddModal(true); }}
            className="shadow-sm items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Assign Subscription
          </Button>
        </div>
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
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Assign Subscription</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Select Member</label>
              <SearchableSelect
                options={members.map((m) => ({
                  value: m.id,
                  label: m.name,
                  sublabel: m.email,
                  photo: m.profilePhoto,
                }))}
                value={createData.userId}
                onChange={(val) => setCreateData({ ...createData, userId: val || "" })}
                placeholder="— Search and select a member —"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Select Plan</label>
              <Select required value={createData.planId} onValueChange={(val) => setCreateData({ ...createData, planId: val || "" })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— Choose a plan —" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)} / {p.duration} days</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan preview card */}
            {selectedPlan && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-primary">{selectedPlan.name}</p>
                    <p className="text-xs text-primary/80 mt-0.5">{selectedPlan.duration} days duration</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-primary">{formatPrice(getDiscountedPrice(selectedPlan))}</p>
                    {getDiscountedPrice(selectedPlan) < selectedPlan.price && (
                      <p className="text-xs text-primary/70 line-through">{formatPrice(selectedPlan.price)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                <Input required type="date" value={createData.startDate} onChange={(e) => setCreateData({ ...createData, startDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Payment Method</label>
                <Select value={createData.paymentMethod} onValueChange={(val) => setCreateData({ ...createData, paymentMethod: val || "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Cash" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="PAYPAL">PayPal / UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={createData.autoRenew} onChange={(e) => setCreateData({ ...createData, autoRenew: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm font-medium text-foreground">Enable Auto-Renewal</span>
            </div>

            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Assigning..." : "Assign Subscription"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Subscription Modal ── */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit2 className="w-5 h-5" /> Edit Subscription</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Change Plan</label>
              <Select value={editData.planId} onValueChange={(val) => setEditData({ ...editData, planId: val || "" })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Change Plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
              <Input type="date" value={editData.startDate} onChange={(e) => setEditData({ ...editData, startDate: e.target.value })} />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editData.autoRenew} onChange={(e) => setEditData({ ...editData, autoRenew: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-foreground">Auto-Renew</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editData.active} onChange={(e) => setEditData({ ...editData, active: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-foreground">Active</span>
              </label>
            </div>
            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Confirmation ── */}
      <Dialog open={!!showCancelConfirm} onOpenChange={(open) => !open && setShowCancelConfirm(null)}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-destructive" />
            </div>
            <DialogTitle className="text-center">Cancel Subscription?</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-1"><strong>{showCancelConfirm?.user.name}</strong>'s subscription to <strong>{showCancelConfirm?.plan.name}</strong> will be cancelled.</p>
            <p className="text-xs text-muted-foreground mb-6">The member will lose access after the end date.</p>
          </div>
          <DialogFooter className="flex gap-3 sm:justify-center">
            <Button variant="ghost" onClick={() => setShowCancelConfirm(null)} className="flex-1">Keep Active</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={submitting} className="flex-1">
              {submitting ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Send Reminder Modal ── */}
      <Dialog open={!!showReminderModal} onOpenChange={(open) => !open && setShowReminderModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Send Reminder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendReminder} className="space-y-4 pt-4">
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Notification Channel</label>
              <Select value={reminderChannel} onValueChange={(val) => setReminderChannel(val || "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WHATSAPP">
                    <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-emerald-500" /> WhatsApp</span>
                  </SelectItem>
                  <SelectItem value="SMS">
                    <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /> SMS</span>
                  </SelectItem>
                  <SelectItem value="EMAIL">
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-rose-500" /> Email</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Message Preview</label>
              <Textarea 
                value={reminderMessage} 
                onChange={(e) => setReminderMessage(e.target.value)} 
                className="min-h-[120px] text-sm"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                This is a manual system. Clicking send will simulate sending and log the notification in the system.
              </p>
            </div>
            
            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowReminderModal(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground">
                {submitting ? "Sending..." : "Send Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
