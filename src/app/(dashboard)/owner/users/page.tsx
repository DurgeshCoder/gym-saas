"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Users, Mail, Activity, Dumbbell, Eye, Calendar, CreditCard, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { DataTable, SearchFilterBar, type Column, type FilterConfig } from "@/components/shared";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface UserDetail extends UserRecord {
  trainer?: { name: string; email: string };
  subscriptions: Array<{
    id: string;
    startDate: string;
    endDate: string;
    active: boolean;
    plan: { name: string; price: number };
  }>;
  payments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
  }>;
  attendances: Array<{ id: string; date: string }>;
  assignedWorkoutPlans: Array<{
    id: string;
    startDate: string;
    endDate: string | null;
    status: string;
    progress: number;
    workoutPlan: { id: string; name: string };
  }>;
}

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search / Filters
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    role: "",
    status: "",
    sortBy: "",
  });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<string | null>(null);
  const [viewUserData, setViewUserData] = useState<UserDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const emptyCreate = { name: "", email: "", password: "", role: "MEMBER" };
  const emptyEdit = { id: "", name: "", email: "", password: "", role: "MEMBER", active: true };
  const [createData, setCreateData] = useState(emptyCreate);
  const [editData, setEditData] = useState(emptyEdit);

  // Fetch
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      if (search) params.set("search", search);
      if (filterValues.role) params.set("role", filterValues.role);
      if (filterValues.status) params.set("status", filterValues.status);
      if (filterValues.sortBy) params.set("sortBy", filterValues.sortBy);

      const res = await fetch(`/api/users?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data);
        setTotalItems(json.total);
        setTotalPages(json.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, filterValues]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterValues, pageSize]);

  // Fetch single user detail
  const fetchUserDetail = async (id: string) => {
    setViewLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        setViewUserData(await res.json());
      }
    } finally {
      setViewLoading(false);
    }
  };

  useEffect(() => {
    if (showViewModal) {
      fetchUserDetail(showViewModal);
    } else {
      setViewUserData(null);
    }
  }, [showViewModal]);

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });
      if (res.ok) {
        toast.success("User added successfully!");
        setShowAddModal(false);
        setCreateData(emptyCreate);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.message);
        toast.error(err.message || "Failed to add user");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Edit
  const openEdit = (u: UserRecord) => {
    setEditData({ id: u.id, name: u.name, email: u.email, password: "", role: u.role, active: u.active });
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        toast.success("User updated!");
        setShowEditModal(false);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.message);
        toast.error(err.message || "Failed to update user");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Deactivate / Delete
  const handleDeactivate = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User deactivated.");
        setShowDeleteConfirm(null);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.message);
        toast.error(err.message || "Failed to deactivate user");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filters
  const filters: FilterConfig[] = [
    {
      key: "role",
      label: "All Roles",
      options: [
        { label: "Trainer", value: "TRAINER" },
        { label: "Member", value: "MEMBER" },
      ],
    },
    {
      key: "status",
      label: "All Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      key: "sortBy",
      label: "Sort By",
      options: [
        { label: "Newest First", value: "createdAt" },
        { label: "Name", value: "name" },
        { label: "Email", value: "email" },
      ],
    },
  ];

  // Columns
  const columns: Column<UserRecord>[] = [
    {
      key: "user",
      header: "User Details",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm">
            {u.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
            <p className="text-slate-500 flex items-center gap-1 text-xs mt-0.5">
              <Mail className="w-3 h-3" /> {u.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${u.role === "TRAINER"
            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800"
            : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
            }`}
        >
          {u.role === "TRAINER" ? <Activity className="w-3 h-3" /> : <Dumbbell className="w-3 h-3" />}
          {u.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${u.active
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"
            }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${u.active ? "bg-emerald-500" : "bg-rose-500"}`} />
          {u.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined On",
      render: (u) => <span className="text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (u) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setShowViewModal(u.id)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="View Detail">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => openEdit(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          {u.active && (
            <button onClick={() => setShowDeleteConfirm(u.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Deactivate">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const daysRemaining = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Users & Staff</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage trainers and members in your gym</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="shadow-sm items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add User
        </Button>
      </div>

      {/* Search + Filters */}
      <SearchFilterBar
        searchPlaceholder="Search by name or email..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(key, value) => setFilterValues((f) => ({ ...f, [key]: value }))}
        onClearFilters={() => setFilterValues({ role: "", status: "", sortBy: "" })}
      />

      {/* DataTable */}
      <DataTable<UserRecord>
        columns={columns}
        data={users}
        loading={loading}
        rowKey={(u) => u.id}
        emptyIcon={<Users className="w-8 h-8 text-slate-400" />}
        emptyTitle="No users found"
        emptyDescription="Add trainers and members to get started."
        emptyAction={
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm">
            Add First User
          </button>
        }
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* ── View User Detail Modal ── */}
      <Dialog open={!!showViewModal} onOpenChange={(open) => !open && setShowViewModal(null)}>
        <DialogContent className="sm:max-w-2xl overflow-hidden flex flex-col max-h-[90vh] p-0 border-border bg-card">
          <DialogHeader className="px-6 py-4 border-b border-border bg-muted">
            <DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-primary" /> User Detail</DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto space-y-8">
            {viewLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-medium">Loading user details...</p>
              </div>
            ) : viewUserData ? (
              <>
                {/* Basic Info */}
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold shadow-sm">
                    {viewUserData.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground">{viewUserData.name}</h4>
                    <p className="text-muted-foreground font-medium">{viewUserData.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary text-secondary-foreground">{viewUserData.role}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${viewUserData.active ? "bg-emerald-100 text-emerald-700" : "bg-destructive/10 text-destructive"}`}>
                        {viewUserData.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subscriptions */}
                <div className="space-y-4">
                  <h5 className="font-bold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" /> Membership History
                  </h5>
                  {viewUserData.subscriptions.length > 0 ? (
                    <div className="grid gap-3">
                      {viewUserData.subscriptions.map((sub) => (
                        <div key={sub.id} className="p-4 rounded-xl border border-border bg-background shadow-sm flex items-center justify-between">
                          <div>
                            <p className="font-bold text-foreground">{sub.plan.name}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {sub.active && !isExpired(sub.endDate) ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                                  <CheckCircle2 className="w-3 h-3" /> Active
                                </span>
                                <p className="text-[10px] font-bold text-primary">
                                  {daysRemaining(sub.endDate)} days left
                                </p>
                              </div>
                            ) : !sub.active ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                                <XCircle className="w-3 h-3" /> Cancelled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                <AlertTriangle className="w-3 h-3" /> Expired
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                      <p className="text-sm text-muted-foreground italic">No subscription history found.</p>
                    </div>
                  )}
                </div>

                {/* Workout Plans */}
                <div className="space-y-4">
                  <h5 className="font-bold text-foreground flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-emerald-600" /> Assigned Workout Plans
                  </h5>
                  {viewUserData.assignedWorkoutPlans && viewUserData.assignedWorkoutPlans.length > 0 ? (
                    <div className="grid gap-3">
                      {viewUserData.assignedWorkoutPlans.map((assignment) => (
                        <div key={assignment.id} className="p-4 rounded-xl border border-border bg-background shadow-sm flex items-center justify-between">
                          <div>
                            <p className="font-bold text-foreground">{assignment.workoutPlan.name}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Started: {new Date(assignment.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${assignment.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-muted-foreground bg-muted'}`}>
                              {assignment.status}
                            </span>
                            <button onClick={async () => {
                              if (!confirm('Are you sure you want to remove this assigned workout?')) return;
                              try {
                                const res = await fetch(`/api/workouts/assign/${assignment.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  toast.success('Workout plan removed');
                                  fetchUserDetail(viewUserData.id);
                                } else {
                                  throw new Error('Failed to remove');
                                }
                              } catch {
                                toast.error('Failed to remove workout plan');
                              }
                            }} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors" title="Remove Assignment">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                      <p className="text-sm text-muted-foreground italic">No assigned workout plans found.</p>
                    </div>
                  )}
                </div>

                {/* Payments */}
                <div className="space-y-4">
                  <h5 className="font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" /> Recent Transactions
                  </h5>
                  {viewUserData.payments.length > 0 ? (
                    <div className="overflow-hidden border border-border rounded-xl">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground font-bold">
                          <tr>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Method</th>
                            <th className="px-4 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {viewUserData.payments.map((p) => (
                            <tr key={p.id}>
                              <td className="px-4 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-2 font-bold text-emerald-600">₹{p.amount}</td>
                              <td className="px-4 py-2 text-muted-foreground text-xs">{p.paymentMethod}</td>
                              <td className="px-4 py-2">
                                <span className={`text-[10px] font-bold uppercase ${p.status === 'SUCCESS' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="p-4 text-center text-sm text-muted-foreground italic">No payment history.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-destructive py-8">Failed to load user information.</p>
            )}
          </div>
          <DialogFooter className="p-4 border-t border-border bg-muted flex justify-end">
            <Button variant="outline" onClick={() => setShowViewModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create User Modal ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <Input required type="text" value={createData.name} onChange={(e) => setCreateData({ ...createData, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <Input required type="email" value={createData.email} onChange={(e) => setCreateData({ ...createData, email: e.target.value })} placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <Input required type="password" value={createData.password} onChange={(e) => setCreateData({ ...createData, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Role</label>
              <Select value={createData.role} onValueChange={(val) => setCreateData({ ...createData, role: val || "" })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="TRAINER">Trainer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit User Modal ── */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit2 className="w-5 h-5" /> Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <Input required type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <Input required type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">New Password <span className="text-muted-foreground font-normal">(leave empty to keep current)</span></label>
              <Input type="password" value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Role</label>
              <Select value={editData.role} onValueChange={(val) => setEditData({ ...editData, role: val || "" })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="TRAINER">Trainer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" checked={editData.active} onChange={(e) => setEditData({ ...editData, active: e.target.checked })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm font-medium text-foreground">Account Active</span>
            </div>
            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Deactivate Confirmation ── */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-destructive" />
            </div>
            <DialogTitle className="text-center">Deactivate User?</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-2">This user will be deactivated and will no longer have access to the gym.</p>
          </div>
          <DialogFooter className="flex gap-3 sm:justify-center">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={() => handleDeactivate(showDeleteConfirm as string)} disabled={submitting} className="flex-1">
              {submitting ? "Processing..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
