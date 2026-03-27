"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Mail,
  Activity,
  Dumbbell,
  Shield,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { DataTable, SearchFilterBar, type Column, type FilterConfig } from "@/components/shared";
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
  gymId: string | null;
  gym: { name: string } | null;
}

interface GymOption {
  id: string;
  name: string;
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [gymOptions, setGymOptions] = useState<GymOption[]>([]);

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
    sortOrder: "",
  });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const emptyCreate = { name: "", email: "", password: "", role: "MEMBER", gymId: "no_gym" };
  const emptyEdit = { id: "", name: "", email: "", password: "", role: "MEMBER", active: true, gymId: "no_gym" };
  const [createData, setCreateData] = useState(emptyCreate);
  const [editData, setEditData] = useState(emptyEdit);

  // Fetch gyms for dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/gyms?limit=100");
        if (res.ok) {
          const json = await res.json();
          setGymOptions(json.data.map((g: any) => ({ id: g.id, name: g.name })));
        }
      } catch { }
    })();
  }, []);

  // Fetch users
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
      if (filterValues.sortOrder) params.set("sortOrder", filterValues.sortOrder);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
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

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const requestData = { ...createData, gymId: createData.gymId === "no_gym" ? null : createData.gymId };
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (res.ok) {
        setShowAddModal(false);
        setCreateData(emptyCreate);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.message);
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
      gymId: u.gymId || "no_gym",
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const requestData = { ...editData, gymId: editData.gymId === "no_gym" ? null : editData.gymId };
      const res = await fetch(`/api/admin/users/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setShowDeleteConfirm(null);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Role icon helper
  const roleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <ShieldCheck className="w-3 h-3" />;
      case "GYM_OWNER":
        return <Building2 className="w-3 h-3" />;
      case "TRAINER":
        return <Activity className="w-3 h-3" />;
      default:
        return <Dumbbell className="w-3 h-3" />;
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      case "GYM_OWNER":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "TRAINER":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    }
  };

  // Filters config
  const filters: FilterConfig[] = [
    {
      key: "role",
      label: "All Roles",
      options: [
        { label: "Super Admin", value: "SUPER_ADMIN" },
        { label: "Gym Owner", value: "GYM_OWNER" },
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
        { label: "Created At", value: "createdAt" },
        { label: "Name", value: "name" },
        { label: "Email", value: "email" },
        { label: "Role", value: "role" },
      ],
    },
  ];

  // Column definitions
  const columns: Column<UserRecord>[] = [
    {
      key: "user",
      header: "User",
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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${roleColor(u.role)}`}>
          {roleIcon(u.role)}
          {u.role.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "gym",
      header: "Gym",
      render: (u) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {u.gym?.name || <span className="text-slate-400 italic">Unassigned</span>}
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
      header: "Joined",
      render: (u) => <span className="text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(u)} title="Edit">
            <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(u.id)} title="Delete">
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      ),
    },
  ];



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Global User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage every user across all gym tenants.</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="shadow-sm items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create User
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
        onClearFilters={() => setFilterValues({ role: "", status: "", sortBy: "", sortOrder: "" })}
      />

      {/* DataTable */}
      <DataTable<UserRecord>
        columns={columns}
        data={users}
        loading={loading}
        rowKey={(u) => u.id}
        emptyIcon={<Users className="w-8 h-8 text-slate-400" />}
        emptyTitle="No users found"
        emptyDescription="There are no users matching your filters."
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* ── Create User Modal ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Create New User
            </DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                <Select value={createData.role} onValueChange={(val) => setCreateData({ ...createData, role: val || "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="TRAINER">Trainer</SelectItem>
                    <SelectItem value="GYM_OWNER">Gym Owner</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Assign Gym</label>
                <Select value={createData.gymId} onValueChange={(val) => setCreateData({ ...createData, gymId: val || "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No Gym" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_gym">No Gym</SelectItem>
                    {gymOptions.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit User Modal ── */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" /> Update User
            </DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                <Select value={editData.role} onValueChange={(val) => setEditData({ ...editData, role: val || "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="TRAINER">Trainer</SelectItem>
                    <SelectItem value="GYM_OWNER">Gym Owner</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Assign Gym</label>
                <Select value={editData.gymId} onValueChange={(val) => setEditData({ ...editData, gymId: val || "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No Gym" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_gym">No Gym</SelectItem>
                    {gymOptions.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.active}
                  onChange={(e) => setEditData({ ...editData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-foreground">Account Active</span>
              </label>
            </div>
            <DialogFooter className="pt-4 flex gap-3">
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
            <DialogTitle className="text-center">Delete User?</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone. The user will be permanently removed from the system.</p>
          </div>
          <DialogFooter className="flex gap-3 sm:justify-center">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(showDeleteConfirm as string)} disabled={submitting} className="flex-1">
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
