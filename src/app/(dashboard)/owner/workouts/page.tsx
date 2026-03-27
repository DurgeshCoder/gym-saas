"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Dumbbell, UserPlus } from "lucide-react";
import { DataTable, type Column, SearchFilterBar } from "@/components/shared";
import toast from "react-hot-toast";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface WorkoutPlan {
    id: string;
    name: string;
    difficulty: string;
    goal: string;
    duration: number;
    createdAt: string;
    creator: { name: string };
    _count: { days: number; assignments: number };
}

export default function OwnerWorkoutsPage() {
    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState("");

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/workouts");
            if (res.ok) {
                const json = await res.json();
                setPlans(json.data || []);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const columns: Column<WorkoutPlan>[] = [
        {
            key: "name",
            header: "Plan Name",
            render: (p) => (
                <div>
                    <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{p.duration} Days • {p._count.days} Workouts</p>
                </div>
            ),
        },
        {
            key: "difficulty",
            header: "Difficulty",
            render: (p) => (
                <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {p.difficulty}
                </span>
            ),
        },
        {
            key: "goal",
            header: "Goal",
            render: (p) => (
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {p.goal.replace("_", " ")}
                </span>
            ),
        },
        {
            key: "creator",
            header: "Created By",
            render: (p) => <span className="text-xs text-slate-500">{p.creator?.name || "Unknown"}</span>,
        },
        {
            key: "assignments",
            header: "Active Users",
            render: (p) => <span className="font-bold text-slate-900 dark:text-white">{p._count.assignments}</span>,
        },
        {
            key: "actions",
            header: "Actions",
            render: (p) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline" size="sm"
                        onClick={() => { setSelectedPlanId(p.id); setShowAssignModal(true); }}
                        className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 border-0 flex items-center gap-1.5"
                    >
                        <UserPlus className="w-3.5 h-3.5" /> Assign
                    </Button>
                    <Link
                        href={`/owner/workouts/${p.id}/edit`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border-0 flex items-center gap-1.5")}
                    >
                        <Plus className="w-3.5 h-3.5 rotate-45" /> Edit
                    </Link>
                </div>
            ),
        },
    ];

    const filteredPlans = plans.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const totalItems = filteredPlans.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paginatedPlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Workout Plans</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Design and assign professional routines to your members.</p>
                </div>
                <Link
                    href="/owner/workouts/create"
                    className={cn(buttonVariants({ size: "lg" }), "rounded-xl font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 shadow-lg transition-transform active:scale-95 flex items-center gap-2")}
                >
                    <Plus className="w-4 h-4" /> Create Plan
                </Link>
            </div>

            <div className="pt-4 flex flex-col gap-5">
                <SearchFilterBar
                    searchPlaceholder="Search by plan name..."
                    searchValue={search}
                    onSearchChange={setSearch}
                />

                <DataTable<WorkoutPlan>
                    columns={columns}
                    data={paginatedPlans}
                    loading={loading}
                    rowKey={p => p.id}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    emptyIcon={<Dumbbell className="w-10 h-10 text-slate-300" />}
                    emptyTitle="No workout plans yet"
                    emptyDescription="Create your first systematic workout plan to assign to members."
                />
            </div>

            {showAssignModal && (
                <AssignModal
                    planId={selectedPlanId}
                    onClose={() => setShowAssignModal(false)}
                    onSuccess={() => { setShowAssignModal(false); fetchPlans(); }}
                />
            )}
        </div>
    );
}

function AssignModal({ planId, onClose, onSuccess }: { planId: string, onClose: () => void, onSuccess: () => void }) {
    const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [userId, setUserId] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

    useEffect(() => {
        fetch("/api/users?limit=100").then(res => res.json()).then(json => setUsers(json.data || []));
    }, []);

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/workouts/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workoutPlanId: planId,
                    userId,
                    startDate: new Date(startDate).toISOString(),
                })
            });
            if (res.ok) {
                toast.success("Plan assigned effectively!");
                onSuccess();
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to assign plan");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-slate-200 dark:border-slate-800">
                <DialogHeader className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Assign Plan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAssign} className="p-8 space-y-5 pt-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Member</label>
                        <Select required value={userId} onValueChange={(val) => setUserId(val || "")}>
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
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                        <Input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <DialogFooter className="pt-4 flex gap-4">
                        <Button type="button" variant="ghost" className="flex-1 py-6 font-bold" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={submitting} className="flex-[2] py-6 font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                            {submitting ? "Assigning..." : "Assign"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
