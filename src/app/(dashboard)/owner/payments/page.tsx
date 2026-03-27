"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Plus,
  Coins,
  History,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Calendar,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";
import { DataTable, SearchFilterBar, type Column, type FilterConfig } from "@/components/shared";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface PaymentRecord {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  subscription?: {
    id: string;
    plan: { name: string };
  };
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  subscriptions?: Array<{ id: string; active: boolean; plan: { name: string; price: number } }>;
}

export default function OwnerPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserOption[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search / Filters
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    paymentMethod: "",
    status: "",
    sortBy: "createdAt",
  });
  const [dateFilterType, setDateFilterType] = useState<"all" | "this_month" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const emptyCreate = { userId: "", subscriptionId: "", amount: "", paymentMethod: "CASH" };
  const [createData, setCreateData] = useState(emptyCreate);

  // Stats (simulated for now, could be its own API later)
  const totalRevenue = payments.reduce((sum, p) => p.status === "SUCCESS" ? sum + p.amount : sum, 0);

  // Fetch users with detail (to see their active subs)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users?limit=100"); // Simple user list
        if (res.ok) {
          const json = await res.json();
          // For each user we'd need their subs too.
          // However, to keep it efficient, we fetch subs for the selected user.
          setUsers(json.data);
        }
      } catch { }
    })();
  }, []);

  const fetchUserDetailWithSubs = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const fullUser = await res.json();
        // Update users state with the detail
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, subscriptions: fullUser.subscriptions } : u));
      }
    } catch { }
  };

  useEffect(() => {
    if (createData.userId) {
      fetchUserDetailWithSubs(createData.userId);
    }
  }, [createData.userId]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: filterValues.sortBy,
      });
      if (search) params.set("search", search);
      if (filterValues.paymentMethod) params.set("paymentMethod", filterValues.paymentMethod);
      if (filterValues.status) params.set("status", filterValues.status);

      if (dateFilterType === "this_month") {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        params.set("startDate", firstDay.toISOString());
        params.set("endDate", now.toISOString());
      } else if (dateFilterType === "custom") {
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
      }

      const res = await fetch(`/api/payments?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setPayments(json.data);
        setTotalItems(json.total);
        setTotalPages(json.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, filterValues, dateFilterType, startDate, endDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });
      if (res.ok) {
        toast.success("Payment recorded and subscription extended!");
        setShowAddModal(false);
        setCreateData(emptyCreate);
        fetchPayments();
      } else {
        const err = await res.json();
        setError(err.message);
        toast.error(err.message || "Failed to record payment");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const filters: FilterConfig[] = [
    {
      key: "paymentMethod",
      label: "All Methods",
      options: [
        { label: "Cash", value: "CASH" },
        { label: "Card", value: "CARD" },
        { label: "PayPal / UPI", value: "PAYPAL" },
      ],
    },
    {
      key: "sortBy",
      label: "Sort By",
      options: [
        { label: "Newest first", value: "createdAt" },
        { label: "Amount (Low to High)", value: "amount" },
      ]
    }
  ];

  const columns: Column<PaymentRecord>[] = [
    {
      key: "user",
      header: "Member",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-500">
            {p.user.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{p.user.name}</p>
            <p className="text-[10px] text-slate-500 line-clamp-1">{p.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (p) => <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatPrice(p.amount)}</span>,
    },
    {
      key: "method",
      header: "Method",
      render: (p) => (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
          <CreditCard className="w-3 h-3" /> {p.paymentMethod}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Extended For",
      render: (p) => p.subscription ? (
        <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
          <CheckCircle2 className="w-3 h-3" /> {p.subscription.plan.name}
        </div>
      ) : (
        <span className="text-xs text-slate-400 italic font-normal">Direct Payment</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (p) => <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
          {p.status}
        </span>
      ),
    },
  ];



  // Selected user for dropdown preview
  const selectedUserFull = users.find(u => u.id === createData.userId);

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Payments & Revenue</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage all membership fees and incoming cash flow.</p>
        </div>
        <Button
          size="lg"
          onClick={() => setShowAddModal(true)}
          className="rounded-xl shadow-lg transition-transform active:scale-95 text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 font-bold"
        >
          <Coins className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Simple Stats Grid */}
        <div className="p-6 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Total Revenue (Page)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black">{formatPrice(totalRevenue)}</h3>
            <span className="text-emerald-200 text-xs bg-white/10 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> 12%
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Successful</p>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{totalItems} Payments</h3>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Avg Transaction</p>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
            {totalItems > 0 ? formatPrice(totalRevenue / totalItems) : "₹0"}
          </h3>
        </div>
      </div>

      {/* Main Table */}
      <div className="pt-4 flex flex-col gap-5 ">
        <SearchFilterBar
          searchPlaceholder="Search by member name or email..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={(k, v) => setFilterValues(f => ({ ...f, [k]: v }))}
          onClearFilters={() => {
            setFilterValues({ paymentMethod: "", status: "", sortBy: "createdAt" });
            setDateFilterType("all");
            setStartDate("");
            setEndDate("");
          }}
          showDateFilter
          dateFilterType={dateFilterType}
          onDateFilterTypeChange={setDateFilterType as any}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <DataTable<PaymentRecord>
          columns={columns}
          data={payments}
          loading={loading}
          rowKey={p => p.id}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          emptyIcon={<History className="w-10 h-10 text-slate-300" />}
          emptyTitle="No transactions yet"
          emptyDescription="Record a payment to see your revenue history."
        />
      </div>

      {/* ── Record Payment Modal ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-slate-200 dark:border-slate-800">
          <DialogHeader className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Coins className="text-white w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Record Payment</DialogTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Extend membership status</p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreate} className="p-8 space-y-5 pt-4">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 text-xs font-bold flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4" /> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Member</label>
              <Select required value={createData.userId} onValueChange={(val) => setCreateData({ ...createData, userId: val || "", subscriptionId: "" })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— Select a member —" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {createData.userId && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Active/Recent Subscription to Extend</label>
                <div className="grid gap-2">
                  {selectedUserFull?.subscriptions && selectedUserFull.subscriptions.length > 0 ? (
                    selectedUserFull.subscriptions.map(sub => (
                      <div key={sub.id} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${createData.subscriptionId === sub.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"}`} onClick={() => setCreateData({ ...createData, subscriptionId: sub.id, amount: sub.plan.price.toString() })}>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{sub.plan.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold">{formatPrice(sub.plan.price)} renewal fee</p>
                        </div>
                        {createData.subscriptionId === sub.id && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg font-bold">No subscription found. Create a subscription first to extend it.</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Amount (₹)</label>
                <Input required type="number" placeholder="0.00" value={createData.amount} onChange={(e) => setCreateData({ ...createData, amount: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Method</label>
                <Select value={createData.paymentMethod} onValueChange={(val) => setCreateData({ ...createData, paymentMethod: val || "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Cash" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="PAYPAL">UPI / Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-4">
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1 py-6 font-bold">Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex-[2] py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl border-none">
                {submitting ? "Processing..." : <><CheckCircle2 className="w-5 h-5 mr-2" /> Confirm Payment</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
