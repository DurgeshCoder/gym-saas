"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Mail,
  Activity,
  Dumbbell,
  Eye,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Utensils,
} from "lucide-react";
import {
  DataTable,
  SearchFilterBar,
  ConfirmModal,
  type Column,
  type FilterConfig,
} from "@/components/shared";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
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
  assignedDietPlans?: any[];
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [confirmRemoveWorkoutId, setConfirmRemoveWorkoutId] = useState<
    string | null
  >(null);
  const [confirmRemoveDietId, setConfirmRemoveDietId] = useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const emptyCreate = { name: "", email: "", password: "", role: "MEMBER" };
  const emptyEdit = {
    id: "",
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
    active: true,
  };
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
        toast.error(err.message || "Failed to add user");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Edit
  const openEdit = (u: UserRecord) => {
    setEditData({
      id: u.id,
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      active: u.active,
    });
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

  const handleRemoveWorkout = async (assignmentId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/workouts/assign/${assignmentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Workout plan removed");
        if (viewUserData) fetchUserDetail(viewUserData.id);
        setConfirmRemoveWorkoutId(null);
      } else {
        throw new Error("Failed");
      }
    } catch {
      toast.error("Failed to remove workout plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveDiet = async (assignmentId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/diets/assign/${assignmentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Diet plan removed");
        if (viewUserData) fetchUserDetail(viewUserData.id);
        setConfirmRemoveDietId(null);
      } else {
        throw new Error("Failed");
      }
    } catch {
      toast.error("Failed to remove diet plan");
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
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm overflow-hidden shrink-0">
            {u.profilePhoto ? (
              <img
                src={u.profilePhoto}
                alt={u.name}
                className="w-full h-full object-cover"
              />
            ) : (
              u.name.charAt(0)
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {u.name}
            </p>
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
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
            u.role === "TRAINER"
              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800"
              : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
          }`}
        >
          {u.role === "TRAINER" ? (
            <Activity className="w-3 h-3" />
          ) : (
            <Dumbbell className="w-3 h-3" />
          )}
          {u.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
            u.active
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${u.active ? "bg-emerald-500" : "bg-rose-500"}`}
          />
          {u.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined On",
      render: (u) => (
        <span className="text-slate-500 dark:text-slate-400">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (u) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setShowViewModal(u.id)}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
            title="View Detail"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEdit(u)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {u.active && (
            <button
              onClick={() => setShowDeleteConfirm(u.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
              title="Deactivate"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const daysRemaining = (endDate: string) => {
    const diff = Math.ceil(
      (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 0;
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Users & Staff
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage trainers and members in your gym
          </p>
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
        onFilterChange={(key, value) =>
          setFilterValues((f) => ({ ...f, [key]: value }))
        }
        onClearFilters={() =>
          setFilterValues({ role: "", status: "", sortBy: "" })
        }
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
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm"
          >
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
      <Dialog
        open={!!showViewModal}
        onOpenChange={(open) => !open && setShowViewModal(null)}
      >
        <DialogContent className="sm:max-w-2xl overflow-hidden flex flex-col max-h-[90vh] p-0 border-border bg-card">
          <DialogHeader className="px-6 py-4 border-b border-border bg-muted">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> User Detail
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto space-y-8">
            {viewLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-medium">Loading user details...</p>
              </div>
            ) : viewUserData ? (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                  {/* Subtle Gradient Header */}
                  <div className="h-32 w-full bg-gradient-to-r from-emerald-500/10 via-primary/5 to-blue-500/10 border-b border-border relative z-0"></div>

                  <div className="px-6 pb-6 relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5">
                    <div className="w-24 h-24 -mt-12 rounded-full border-4 border-card bg-primary/10 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg bg-card">
                      {viewUserData.profilePhoto ? (
                        <img
                          src={viewUserData.profilePhoto}
                          alt={viewUserData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-primary">
                          {viewUserData.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 mb-1">
                      <h4 className="text-2xl font-bold text-foreground">
                        {viewUserData.name}
                      </h4>
                      <p className="text-sm font-medium text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5" />
                        {viewUserData.email}
                      </p>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-foreground shadow-sm border border-border/50">
                        {viewUserData.role}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${viewUserData.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}
                      >
                        {viewUserData.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start border-b border-border rounded-none h-12 bg-transparent p-0 mb-6 gap-6">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-1 pb-3 pt-3 rounded-none"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="plans"
                      className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-1 pb-3 pt-3 rounded-none"
                    >
                      Assigned Plans
                    </TabsTrigger>
                    <TabsTrigger
                      value="billing"
                      className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-1 pb-3 pt-3 rounded-none"
                    >
                      Billing
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-0">
                    <div className="space-y-6">
                      {/* Subscriptions */}
                      <div>
                        <h5 className="font-bold text-foreground flex items-center gap-2 mb-4">
                          <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />{" "}
                          Membership History
                        </h5>
                        {viewUserData.subscriptions.length > 0 ? (
                          <div className="grid gap-3">
                            {viewUserData.subscriptions.map((sub) => (
                              <div
                                key={sub.id}
                                className="p-4 rounded-xl border border-border bg-card/50 shadow-sm flex items-center justify-between hover:bg-card transition-colors"
                              >
                                <div>
                                  <p className="font-bold text-foreground">
                                    {sub.plan.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />{" "}
                                    {new Date(
                                      sub.startDate,
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(sub.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {sub.active && !isExpired(sub.endDate) ? (
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                                        <CheckCircle2 className="w-3 h-3" />{" "}
                                        Active
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
                                      <AlertTriangle className="w-3 h-3" />{" "}
                                      Expired
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center">
                            <CreditCard className="w-8 h-8 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground font-medium">
                              No subscription history.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="plans" className="mt-0 space-y-8">
                    {/* Workout Plans */}
                    <div>
                      <h5 className="font-bold text-foreground flex items-center gap-2 mb-4">
                        <Dumbbell className="w-4 h-4 text-emerald-600" />{" "}
                        Workout Plans
                      </h5>
                      {viewUserData.assignedWorkoutPlans &&
                      viewUserData.assignedWorkoutPlans.length > 0 ? (
                        <div className="grid gap-3">
                          {viewUserData.assignedWorkoutPlans.map(
                            (assignment) => (
                              <div
                                key={assignment.id}
                                className="p-4 rounded-xl border border-border bg-card/50 shadow-sm flex items-center justify-between hover:bg-card transition-colors"
                              >
                                <div>
                                  <p className="font-bold text-foreground flex items-center gap-2">
                                    {assignment.workoutPlan.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Started:{" "}
                                    {new Date(
                                      assignment.startDate,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1.5 rounded-full ${assignment.status === "ACTIVE" ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400" : "text-muted-foreground bg-muted"}`}
                                  >
                                    {assignment.status}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setConfirmRemoveWorkoutId(assignment.id)
                                    }
                                    className="text-slate-400 hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                                    title="Remove Assignment"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center">
                          <Dumbbell className="w-8 h-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground font-medium">
                            No workout plans assigned yet.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Diet Plans */}
                    <div>
                      <h5 className="font-bold text-foreground flex items-center gap-2 mb-4">
                        <Utensils className="w-4 h-4 text-emerald-600" /> Diet
                        Plans
                      </h5>
                      {viewUserData.assignedDietPlans &&
                      viewUserData.assignedDietPlans.length > 0 ? (
                        <div className="grid gap-3">
                          {viewUserData.assignedDietPlans.map(
                            (assignment: any) => (
                              <div
                                key={assignment.id}
                                className="p-4 rounded-xl border border-border bg-card/50 shadow-sm flex items-center justify-between hover:bg-card transition-colors"
                              >
                                <div>
                                  <p className="font-bold text-foreground">
                                    {assignment.dietPlan.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />{" "}
                                    {new Date(
                                      assignment.startDate,
                                    ).toLocaleDateString()}
                                    <span className="mx-1.5 opacity-50">•</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                      {assignment.dietPlan.totalCalories} kcal
                                    </span>
                                    <span className="mx-1.5 opacity-50">•</span>
                                    {assignment.dietPlan.goal.replace("_", " ")}
                                  </p>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1.5 rounded-full ${assignment.status === "ACTIVE" ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400" : "text-muted-foreground bg-muted"}`}
                                  >
                                    {assignment.status}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setConfirmRemoveDietId(assignment.id)
                                    }
                                    className="text-slate-400 hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                                    title="Remove Assignment"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center">
                          <Utensils className="w-8 h-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground font-medium">
                            No diet plans assigned yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="billing" className="mt-0">
                    <div className="space-y-4">
                      <h5 className="font-bold text-foreground flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />{" "}
                        Recent Transactions
                      </h5>
                      {viewUserData.payments.length > 0 ? (
                        <div className="overflow-hidden border border-border rounded-xl shadow-sm">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                              <tr>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Method</th>
                                <th className="px-5 py-3">Amount</th>
                                <th className="px-5 py-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                              {viewUserData.payments.map((p) => (
                                <tr
                                  key={p.id}
                                  className="hover:bg-muted/30 transition-colors"
                                >
                                  <td className="px-5 py-3 text-muted-foreground">
                                    {new Date(p.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-5 py-3 font-medium text-foreground">
                                    {p.paymentMethod}
                                  </td>
                                  <td className="px-5 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                                    ₹{p.amount}
                                  </td>
                                  <td className="px-5 py-3 text-right">
                                    <span
                                      className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${p.status === "SUCCESS" ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" : "text-muted-foreground bg-muted"}`}
                                    >
                                      {p.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center">
                          <Clock className="w-8 h-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground font-medium">
                            No payment history on record.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <p className="text-center text-destructive py-8">
                Failed to load user information.
              </p>
            )}
          </div>
          <DialogFooter className="p-4 border-t border-border bg-muted flex justify-end">
            <Button variant="outline" onClick={() => setShowViewModal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create User Modal ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add New User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <Input
                required
                type="text"
                value={createData.name}
                onChange={(e) =>
                  setCreateData({ ...createData, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <Input
                required
                type="email"
                value={createData.email}
                onChange={(e) =>
                  setCreateData({ ...createData, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <Input
                required
                type="password"
                value={createData.password}
                onChange={(e) =>
                  setCreateData({ ...createData, password: e.target.value })
                }
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Role
              </label>
              <Select
                value={createData.role}
                onValueChange={(val) =>
                  setCreateData({ ...createData, role: val || "" })
                }
              >
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
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit User Modal ── */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" /> Edit User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <Input
                required
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <Input
                required
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                New Password{" "}
                <span className="text-muted-foreground font-normal">
                  (leave empty to keep current)
                </span>
              </label>
              <Input
                type="password"
                value={editData.password}
                onChange={(e) =>
                  setEditData({ ...editData, password: e.target.value })
                }
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Role
              </label>
              <Select
                value={editData.role}
                onValueChange={(val) =>
                  setEditData({ ...editData, role: val || "" })
                }
              >
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
              <input
                type="checkbox"
                checked={editData.active}
                onChange={(e) =>
                  setEditData({ ...editData, active: e.target.checked })
                }
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">
                Account Active
              </span>
            </div>
            <DialogFooter className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Deactivate Confirmation ── */}
      <ConfirmModal
        open={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        title="Deactivate User?"
        description="This user will be deactivated and will no longer have access to the gym."
        confirmText="Deactivate"
        icon={<Trash2 className="w-7 h-7 text-destructive" />}
        onConfirm={() => handleDeactivate(showDeleteConfirm as string)}
        isLoading={submitting}
      />

      {/* ── Remove Workout Confirmation ── */}
      <ConfirmModal
        open={!!confirmRemoveWorkoutId}
        onOpenChange={(open) => !open && setConfirmRemoveWorkoutId(null)}
        title="Remove Workout Plan"
        description="Are you sure you want to remove this assigned workout? The user will no longer see this plan."
        confirmText="Remove"
        icon={<Trash2 className="w-7 h-7 text-destructive" />}
        onConfirm={() => handleRemoveWorkout(confirmRemoveWorkoutId as string)}
        isLoading={submitting}
      />

      {/* ── Remove Diet Confirmation ── */}
      <ConfirmModal
        open={!!confirmRemoveDietId}
        onOpenChange={(open) => !open && setConfirmRemoveDietId(null)}
        title="Remove Diet Plan"
        description="Are you sure you want to remove this assigned diet? The user will no longer see this plan."
        confirmText="Remove"
        icon={<Trash2 className="w-7 h-7 text-destructive" />}
        onConfirm={() => handleRemoveDiet(confirmRemoveDietId as string)}
        isLoading={submitting}
      />
    </div>
  );
}
