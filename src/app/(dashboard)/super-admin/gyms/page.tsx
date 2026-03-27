"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Plus, Edit2, Dumbbell, MapPin } from "lucide-react";
import { DataTable, SearchFilterBar, type Column, type FilterConfig } from "@/components/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
interface Gym {
  id: string;
  name: string;
  address: string | null;
  logo: string | null;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  _count: { users: number };
}

export default function SuperAdminGymsPage() {
  // Data state
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search and filter state
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({ sortBy: "", sortOrder: "" });

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Create Form
  const [createData, setCreateData] = useState({ name: "", ownerName: "", ownerEmail: "", ownerPassword: "" });

  // Edit Form (full fields)
  const [editData, setEditData] = useState({ id: "", name: "", address: "", logo: "" });

  // Filters config for the SearchFilterBar
  const filters: FilterConfig[] = [
    {
      key: "sortBy",
      label: "Sort By",
      options: [
        { label: "Created At", value: "createdAt" },
        { label: "Name", value: "name" },
        { label: "Last Updated", value: "updatedAt" },
      ],
    },
    {
      key: "sortOrder",
      label: "Order",
      options: [
        { label: "Newest First", value: "desc" },
        { label: "Oldest First", value: "asc" },
      ],
    },
  ];

  // Data Fetching
  const fetchGyms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      if (search) params.set("search", search);
      if (filterValues.sortBy) params.set("sortBy", filterValues.sortBy);
      if (filterValues.sortOrder) params.set("sortOrder", filterValues.sortOrder);

      const res = await fetch(`/api/admin/gyms?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setGyms(json.data);
        setTotalItems(json.total);
        setTotalPages(json.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, filterValues]);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  // Reset to page 1 on search/filter
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterValues, pageSize]);

  // Create Gym
  const handleCreateGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/gyms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });
      if (res.ok) {
        setShowAddModal(false);
        setCreateData({ name: "", ownerName: "", ownerEmail: "", ownerPassword: "" });
        fetchGyms();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Gym
  const openEditModal = (gym: Gym) => {
    setEditData({ id: gym.id, name: gym.name, address: gym.address || "", logo: gym.logo || "" });
    setShowEditModal(true);
  };

  const handleEditGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/gyms/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editData.name, address: editData.address, logo: editData.logo }),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchGyms();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Column definitions using the universal DataTable
  const columns: Column<Gym>[] = [
    {
      key: "gym",
      header: "Gym Tenant",
      render: (gym) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm">
            {gym.logo ? (
              <img src={gym.logo} alt={gym.name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <Dumbbell className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-base">{gym.name}</p>
            <p className="text-slate-500 flex items-center gap-1 text-xs mt-0.5 max-w-xs truncate">
              <MapPin className="w-3 h-3" /> {gym.address || "No address"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Primary Owner",
      render: (gym) => (
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200">{gym.owner?.name}</p>
          <p className="text-slate-500 text-xs mt-0.5">{gym.owner?.email}</p>
        </div>
      ),
    },
    {
      key: "users",
      header: "Users",
      render: (gym) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
          {gym._count?.users} Active
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: (gym) => (
        <span className="text-slate-500 dark:text-slate-400">{new Date(gym.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (gym) => (
        <Button variant="ghost" size="icon" onClick={() => openEditModal(gym)} title="Edit">
          <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Gym Master Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Super Admin global view of all onboarded gyms.</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="shadow-sm items-center gap-2"
        >
          <Building2 className="w-5 h-5" />
          Onboard New Gym
        </Button>
      </div>

      {/* Universal Search + Filters */}
      <SearchFilterBar
        searchPlaceholder="Search gyms by name, address, or owner..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(key, value) => setFilterValues((f) => ({ ...f, [key]: value }))}
        onClearFilters={() => setFilterValues({ sortBy: "", sortOrder: "" })}
      />

      {/* Universal DataTable with Pagination */}
      <DataTable<Gym>
        columns={columns}
        data={gyms}
        loading={loading}
        rowKey={(gym) => gym.id}
        emptyIcon={<Building2 className="w-8 h-8 text-slate-400" />}
        emptyTitle="No Gyms Onboarded"
        emptyDescription="The SaaS platform has 0 active tenants."
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* ── Add Gym Modal ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Setup New Gym & Owner
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGym} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Gym Name</label>
              <Input required type="text" value={createData.name} onChange={(e) => setCreateData({ ...createData, name: e.target.value })} placeholder="Titan Fitness Center" />
            </div>
            <div className="pt-2 border-t border-border mt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 mt-4">Owner Account Details</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Owner Name</label>
                  <Input required type="text" value={createData.ownerName} onChange={(e) => setCreateData({ ...createData, ownerName: e.target.value })} placeholder="Sarah Connor" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Owner Email</label>
                  <Input required type="email" value={createData.ownerEmail} onChange={(e) => setCreateData({ ...createData, ownerEmail: e.target.value })} placeholder="sarah@titanfitness.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Initial Password</label>
                  <Input required type="text" value={createData.ownerPassword} onChange={(e) => setCreateData({ ...createData, ownerPassword: e.target.value })} placeholder="Secure temp password" />
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Processing..." : "Create Gym & Owner"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Gym Modal (All Fields) ── */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5" /> Update Gym Details
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditGym} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Gym Name</label>
              <Input required type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Address</label>
              <Input type="text" value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} placeholder="123 Gym Street" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Logo URL</label>
              <Input type="text" value={editData.logo} onChange={(e) => setEditData({ ...editData, logo: e.target.value })} placeholder="https://logo-url.com/logo.png" />
            </div>
            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Updating..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
