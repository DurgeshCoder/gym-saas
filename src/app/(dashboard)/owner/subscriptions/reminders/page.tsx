"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Clock,
  ArrowLeft,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { DataTable, type Column } from "@/components/shared";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface ExpiringSub {
  id: string;
  startDate: string;
  endDate: string;
  active: boolean;
  user: { id: string; name: string; email: string; profilePhoto?: string | null };
  plan: { id: string; name: string };
}

interface LogEntry {
  id: string;
  user: { name: string; email: string; profilePhoto?: string | null };
  channel: string;
  message: string;
  sentAt: string;
}

export default function RemindersPage() {
  const [subs, setSubs] = useState<ExpiringSub[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Modals
  const [showReminderModal, setShowReminderModal] = useState<ExpiringSub | null>(null);
  const [viewMessageLog, setViewMessageLog] = useState<LogEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [channel, setChannel] = useState("WHATSAPP");
  const [message, setMessage] = useState("");

  const fetchExpiring = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/reminders?days=7`);
      if (res.ok) {
        const json = await res.json();
        setSubs(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/subscriptions/reminders/history`);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchExpiring();
    fetchLogs();
  }, [fetchExpiring, fetchLogs]);

  // Open modal and pre-fill message
  const openReminder = (s: ExpiringSub) => {
    const daysLeft = Math.ceil((new Date(s.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    let defaultMessage = `Hi ${s.user.name}, this is a reminder from your gym. Your subscription for the ${s.plan.name} plan `;
    if (daysLeft < 0) {
      defaultMessage += `expired ${Math.abs(daysLeft)} days ago on ${new Date(s.endDate).toLocaleDateString()}. Please renew to continue your fitness journey!`;
    } else if (daysLeft === 0) {
      defaultMessage += `expires TODAY. Please renew to avoid any interruption.`;
    } else {
      defaultMessage += `is expiring in ${daysLeft} days on ${new Date(s.endDate).toLocaleDateString()}. Please renew soon!`;
    }

    setMessage(defaultMessage);
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
          channel,
          message,
        }),
      });
      if (res.ok) {
        toast.success("Reminder sent and logged successfully!");
        setShowReminderModal(null);
        fetchLogs();
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
  const daysRemaining = (endDate: string) => {
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const columns: Column<ExpiringSub>[] = [
    {
      key: "member",
      header: "Member",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 flex items-center justify-center font-bold shadow-sm overflow-hidden shrink-0">
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
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => {
        const days = daysRemaining(s.endDate);
        if (days < 0) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800">
              <AlertTriangle className="w-3 h-3" /> Expired {Math.abs(days)}d ago
            </span>
          );
        }
        if (days === 0) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
              <Clock className="w-3 h-3" /> Expires Today
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
            <Clock className="w-3 h-3" /> {days} days left
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) => (
        <Button onClick={() => openReminder(s)} size="sm" variant="outline" className="gap-2">
          <Bell className="w-4 h-4" />
          Send Reminder
        </Button>
      ),
    },
  ];

  const logColumns: Column<LogEntry>[] = [
    {
      key: "time",
      header: "Sent At",
      render: (s) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground">{new Date(s.sentAt).toLocaleDateString()}</span>
          <span className="text-xs text-muted-foreground">{new Date(s.sentAt).toLocaleTimeString()}</span>
        </div>
      ),
    },
    {
      key: "member",
      header: "Member",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold shadow-sm overflow-hidden shrink-0 text-xs">
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
      key: "channel",
      header: "Channel",
      render: (s) => (
        <span className="inline-flex py-1 px-3 border rounded-full text-xs font-semibold bg-muted text-muted-foreground">
          {s.channel}
        </span>
      ),
    },
    {
      key: "message",
      header: "Message Snippet",
      render: (s) => (
        <button 
          onClick={() => setViewMessageLog(s)}
          className="text-left group focus:outline-none w-full"
        >
          <p className="text-xs text-muted-foreground line-clamp-2 max-w-sm group-hover:text-primary transition-colors cursor-pointer" title="Click to view full message">
            {s.message}
          </p>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/owner/subscriptions" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-extrabold text-foreground">Reminders</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Manual follow-ups for subscriptions expiring soon (next 7 days).</p>
        </div>
      </div>

      {/* DataTable Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="pending">Expiring Soon</TabsTrigger>
          <TabsTrigger value="history">Sent History</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-0">
          <DataTable<ExpiringSub>
            columns={columns}
            data={subs}
            loading={loading}
            rowKey={(s) => s.id}
            emptyIcon={<CheckCircle2 className="w-8 h-8 text-slate-400" />}
            emptyTitle="No expiring subscriptions"
            emptyDescription="All active subscriptions are well within their periods!"
            currentPage={1}
            totalPages={1}
            totalItems={subs.length}
            pageSize={100}
            onPageChange={() => {}}
          />
        </TabsContent>
        <TabsContent value="history" className="mt-0">
          <DataTable<LogEntry>
            columns={logColumns}
            data={logs}
            loading={loadingLogs}
            rowKey={(s) => s.id}
            emptyIcon={<MessageSquare className="w-8 h-8 text-slate-400" />}
            emptyTitle="No Reminders Sent"
            emptyDescription="You haven't sent any manual reminders yet."
            currentPage={1}
            totalPages={1}
            totalItems={logs.length}
            pageSize={100}
            onPageChange={() => {}}
          />
        </TabsContent>
      </Tabs>

      {/* ── Send Reminder Modal ── */}
      <Dialog open={!!showReminderModal} onOpenChange={(open) => !open && setShowReminderModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Send Reminder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendReminder} className="space-y-4 pt-4">
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Notification Channel</label>
              <Select value={channel} onValueChange={(val) => setChannel(val || "WHATSAPP")}>
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
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
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
      {/* ── View Message Modal ── */}
      <Dialog open={!!viewMessageLog} onOpenChange={(open) => !open && setViewMessageLog(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Full Message Text</DialogTitle>
          </DialogHeader>
          <div className="pt-4 space-y-4">
            <div className="bg-muted/30 p-4 rounded-xl border border-border text-sm whitespace-pre-wrap text-foreground font-medium max-h-[60vh] overflow-y-auto">
              {viewMessageLog?.message}
            </div>
            <div className="flex gap-4 text-xs font-semibold text-muted-foreground px-1">
              <span>Channel: <span className="text-foreground">{viewMessageLog?.channel}</span></span>
              <span>•</span>
              <span>Sent: <span className="text-foreground">{viewMessageLog ? new Date(viewMessageLog.sentAt).toLocaleString() : ""}</span></span>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setViewMessageLog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
