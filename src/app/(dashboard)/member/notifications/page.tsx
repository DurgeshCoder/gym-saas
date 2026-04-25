"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2, AlertCircle, Info, MessagesSquare, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  title: string | null;
  message: string;
  isRead: boolean;
  sentAt: string;
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [globalUnread, setGlobalUnread] = useState(0);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchNotifications(1, search, filter);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, filter]);

  useEffect(() => {
    fetchNotifications(page, search, filter);
  }, [page]);

  const fetchNotifications = async (p = page, s = search, f = filter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/member/notifications?page=${p}&limit=10&search=${encodeURIComponent(s)}&filter=${f}`);
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
        }
        setGlobalUnread(json.unreadCount || 0);
      }
    } catch {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (ids: string[]) => {
    if (ids.length === 0) return;
    setMarking(true);
    try {
      const res = await fetch("/api/member/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: ids }),
      });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n)
        );
      }
    } catch {
      // Background operation failure, ignore or log
    } finally {
      setMarking(false);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
      toast.success("All caught up!");
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead && !marking) {
      markAsRead([notification.id]);
    }
  };

  const unreadCount = globalUnread;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Bell className="w-8 h-8 text-primary" /> Notifications
          </h1>
          <p className="text-muted-foreground">Stay updated with messages and announcements from your gym.</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            onClick={markAllAsRead} 
            disabled={marking} 
            variant="outline" 
            className="shrink-0 gap-2 font-semibold shadow-sm text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:hover:bg-emerald-900/40"
          >
            {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl shadow-sm h-11"
        />
        <div className="min-w-[160px]">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full rounded-xl shadow-sm h-11 border-input">
              <SelectValue placeholder="All Notifications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value="read">Read Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="font-medium animate-pulse">Loading updates...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="border-dashed shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <div className="p-4 bg-muted rounded-full">
                <MessagesSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">No Notifications</h3>
                <p className="text-sm text-muted-foreground mt-1 text-balance">
                  You're all caught up! When the gym sends an announcement, it will appear right here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {notifications.map(notification => (
              <Card 
                key={notification.id} 
                className={`overflow-hidden transition-all duration-300 relative border cursor-pointer ${
                  !notification.isRead 
                    ? "bg-primary/5 border-primary/30 shadow-md transform hover:-translate-y-0.5" 
                    : "bg-background/50 border-border/60 hover:bg-muted/30 shadow-sm opacity-80"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {!notification.isRead && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                )}
                
                <CardContent className="p-5 flex gap-4">
                  <div className="shrink-0 mt-0.5">
                    <div className={`p-2.5 rounded-full ${!notification.isRead ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
                      {notification.title?.toLowerCase().includes('holiday') || notification.title?.toLowerCase().includes('closed') ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-2">
                      <h4 className={`text-base font-bold ${!notification.isRead ? "text-foreground" : "text-foreground/80"}`}>
                        {notification.title || "Gym Announcement"}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(notification.sentAt).toLocaleDateString("en-US", { 
                          month: "short", day: "numeric", hour: "numeric", minute: "2-digit" 
                        })}
                      </div>
                    </div>
                    
                    <p className={`text-sm leading-relaxed truncate ${!notification.isRead ? "text-foreground/90 font-medium" : "text-muted-foreground"}`}>
                      {notification.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 pb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium text-muted-foreground">Page {page} of {totalPages}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-3 border-b pb-4 mb-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-xl">{selectedNotification?.title || "Notification Details"}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b border-dashed pb-2">
              <Clock className="w-4 h-4" />
              {selectedNotification && new Date(selectedNotification.sentAt).toLocaleDateString("en-US", { 
                 weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </div>
            <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-foreground/90 font-medium bg-muted/30 p-6 rounded-xl border border-border/50 shadow-inner">
              {selectedNotification?.message}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
