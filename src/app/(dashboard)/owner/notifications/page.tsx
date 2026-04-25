"use client";

import { useState, useEffect } from "react";
import { Send, Users, MessageSquare, AlertTriangle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/shared";

export default function OwnerBroadcastPage() {
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  const [searchHistory, setSearchHistory] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState("compose");

  const fetchHistory = async (p = page, search = searchHistory, size = pageSize) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/notifications/broadcast?page=${p}&limit=${size}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const json = await res.json();
        setHistory(json.data || []);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalItems(json.pagination.totalCount || 0);
        }
      }
    } finally {
      setLoadingHistory(false);
    }
  };
  
  useEffect(() => {
    if (activeTab !== "history") return;
    const delayDebounce = setTimeout(() => {
      fetchHistory(1, searchHistory);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchHistory, activeTab]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory(page, searchHistory, pageSize);
    }
  }, [page, pageSize, activeTab]);

  const templates = [
    {
      id: "gym_closure",
      name: "Gym Closure / Holiday",
      title: "Notice: Upcoming Gym Closure",
      message: "Dear Members, please note that the gym will be closed on [Date] due to [Reason/Holiday]. We will resume regular operating hours the following day. Stay active and see you soon!"
    },
    {
      id: "renew_subscription",
      name: "Subscription Renewal Reminder",
      title: "Action Required: Renew Your Subscription",
      message: "Hi! This is a friendly reminder that your gym membership is expiring soon. Please renew your subscription at the front desk or via the app to avoid any interruption in your fitness journey!"
    },
    {
      id: "new_equipment",
      name: "New Equipment / Facility Upgrade",
      title: "Exciting News: Facility Upgrades!",
      message: "Great news! We've just installed new equipment on the gym floor for you to enjoy. Ask our trainers if you need help getting familiar with the new machines. Happy lifting!"
    },
    {
      id: "class_announcement",
      name: "New Class Announcement",
      title: "New Fitness Class Available!",
      message: "We are thrilled to announce our new [Class Name]! Join us every [Day of week] at [Time] for an amazing workout. Spots are limited, so book yours today."
    },
    {
      id: "maintenance",
      name: "Scheduled Maintenance",
      title: "Notice: Scheduled Maintenance",
      message: "We will be conducting scheduled maintenance on some of our equipment on [Date]. A few machines may be temporarily unavailable. We apologize for the inconvenience and appreciate your patience!"
    }
  ];

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "none") {
      setTitle("");
      setMessage("");
      return;
    }
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setTitle(template.title);
      setMessage(template.message);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please provide both a title and message.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filter, title, message }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Message broadcasted successfully!");
        setTitle("");
        setMessage("");
        setActiveTab("history");
      } else {
        toast.error(data.message || "Failed to broadcast message.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-primary" /> Broadcast Notifications
        </h1>
        <p className="text-muted-foreground">Send real-time in-app announcements directly to your gym members.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="compose" className="font-bold">Compose Message</TabsTrigger>
          <TabsTrigger value="history" className="font-bold">Broadcast History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6 animate-in fade-in-50 zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="shadow-md border-border">
                <CardHeader className="bg-muted/30 border-b pb-6">
                  <CardTitle>Compose Message</CardTitle>
                  <CardDescription>Target specific member segments or everyone.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleBroadcast} className="space-y-6">
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Target Audience</label>
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-full font-medium">
                          <SelectValue placeholder="Select Audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span>All Members</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="active">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                              <span>Members with Active Subscriptions</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="inactive">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-rose-500" />
                              <span>Members without Active Subscriptions</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="expiring_soon">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span>Expiring in Next 7 Days</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-foreground">Message Template (Optional)</label>
                      </div>
                      <Select onValueChange={handleTemplateSelect}>
                        <SelectTrigger className="w-full font-medium text-muted-foreground bg-muted/20 border-border/80">
                          <SelectValue placeholder="Choose a template to quick-fill..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="font-semibold text-foreground/80">None (Custom Message)</SelectItem>
                          {templates.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Notification Title</label>
                      <Input 
                        placeholder="e.g. Action Required: Holiday Schedule" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        maxLength={100}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Message Content</label>
                      <Textarea 
                        placeholder="Type your message here..." 
                        className="min-h-[150px] resize-y" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        required
                      />
                      <div className="text-xs text-muted-foreground text-right mt-1">
                        {message.length} characters
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                      <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto font-bold gap-2">
                        {loading ? "Broadcasting..." : (
                          <>
                            <Send className="w-4 h-4" /> Send Broadcast
                          </>
                        )}
                      </Button>
                    </div>

                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-primary/5 border-primary/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-foreground/80">
                  <p>
                    <strong>Be specific:</strong> Use filters to only notify members who actually need the information.
                  </p>
                  <p>
                    <strong>Keep it concise:</strong> Long messages are less likely to be read on mobile devices.
                  </p>
                  <p>
                    <strong>Engaging Titles:</strong> Use clear and action-oriented titles like "Gym Closed Tomorrow" rather than just "Notice".
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="animate-in fade-in-50 zoom-in-95 duration-200 pt-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
               History Logs
            </h2>
            <Input 
              placeholder="Search history..." 
              className="max-w-xs" 
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
            />
          </div>
          <Card>
            <CardContent className="p-0">
              {loadingHistory ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No broadcast history found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto border-b border-border">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium border-b">
                        <tr>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4 w-1/3">Title</th>
                          <th className="px-6 py-4 w-1/3">Message</th>
                          <th className="px-6 py-4">Recipients</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {history.map((h, i) => (
                          <tr key={i} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                              {new Date(h._max.sentAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 font-semibold text-foreground">
                              {h.title}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]" title={h.message}>
                              {h.message}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800">
                                <Users className="w-3 h-3" />
                                {h._count.userId}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={(p) => setPage(p)}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
