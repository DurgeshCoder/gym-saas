"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Plus, Edit2, Dumbbell, MapPin } from "lucide-react";
import { DataTable, SearchFilterBar, type Column, type FilterConfig } from "@/components/shared";

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
        <button
          onClick={() => openEditModal(gym)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Gym Master Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Super Admin global view of all onboarded gyms.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Building2 className="w-5 h-5" />
          Onboard New Gym
        </button>
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
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5" /> Setup New Gym & Owner
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateGym} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gym Name</label>
                <input required type="text" value={createData.name} onChange={(e) => setCreateData({ ...createData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" placeholder="Titan Fitness Center" />
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Owner Account Details</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner Name</label>
                    <input required type="text" value={createData.ownerName} onChange={(e) => setCreateData({ ...createData, ownerName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" placeholder="Sarah Connor" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Owner Email</label>
                    <input required type="email" value={createData.ownerEmail} onChange={(e) => setCreateData({ ...createData, ownerEmail: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" placeholder="sarah@titanfitness.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                    <input required type="text" value={createData.ownerPassword} onChange={(e) => setCreateData({ ...createData, ownerPassword: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" placeholder="Secure temp password" />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50">
                  {submitting ? "Processing..." : "Create Gym & Owner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Gym Modal (All Fields) ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5" /> Update Gym Details
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                &times;
              </button>
            </div>
            <form onSubmit={handleEditGym} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gym Name</label>
                <input required type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input type="text" value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" placeholder="123 Gym Street" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo URL</label>
                <input type="text" value={editData.logo} onChange={(e) => setEditData({ ...editData, logo: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" placeholder="https://logo-url.com/logo.png" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50">
                  {submitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
