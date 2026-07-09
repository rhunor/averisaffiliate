"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Users, CheckCircle, XCircle, Shield, ShieldOff, Send, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: string;
  referralCode: string;
  createdAt: string;
  subscriptionExpiresAt: string | null;
  isLifetime: boolean;
  inviteBatch: number | null;
  telegramLinked: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [botLinkResult, setBotLinkResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);
  const [welcomeResult, setWelcomeResult] = useState<{ id: string; ok: boolean } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d.users || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function toggleActive(userId: string) {
    setActionLoading(userId + "_active");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_active" }),
      });
      if (res.ok) {
        const { user } = await res.json();
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: user.isActive } : u));
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function resendWelcome(userId: string, email: string) {
    setActionLoading(userId + "_welcome");
    setWelcomeResult(null);
    try {
      const res = await fetch("/api/admin/tools/resend-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setWelcomeResult({ id: userId, ok: res.ok });
    } finally {
      setActionLoading(null);
    }
  }

  async function sendBotLink(userId: string) {
    setActionLoading(userId + "_bot");
    setBotLinkResult(null);
    try {
      const res = await fetch("/api/admin/tools/resend-bot-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setBotLinkResult({ id: userId, ok: res.ok, msg: data.message || data.error || "Done" });
    } finally {
      setActionLoading(null);
    }
  }

  async function setAdmin(userId: string, makeAdmin: boolean) {
    setActionLoading(userId + "_role");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_role", role: makeAdmin ? "admin" : "user" }),
      });
      if (res.ok) {
        const { user } = await res.json();
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: user.role } : u));
      }
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total members</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or referral code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-secondary border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {["Name", "Email", "Code", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {user.role === "admin" && <Badge variant="info" className="text-xs">Admin</Badge>}
                          {user.isLifetime && <Badge variant="success" className="text-xs">Lifetime</Badge>}
                          {user.isLifetime && !user.telegramLinked && <Badge variant="warning" className="text-xs">No Telegram</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3 font-mono text-xs text-secondary">{user.referralCode}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? "success" : "warning"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => toggleActive(user._id)}
                            disabled={actionLoading === user._id + "_active"}
                            title={user.isActive ? "Deactivate" : "Activate"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.isActive
                                ? "bg-danger/10 text-danger hover:bg-danger/20"
                                : "bg-success/10 text-success hover:bg-success/20"
                            }`}
                          >
                            {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setAdmin(user._id, user.role !== "admin")}
                            disabled={actionLoading === user._id + "_role"}
                            title={user.role === "admin" ? "Remove admin" : "Make admin"}
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            {user.role === "admin" ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => resendWelcome(user._id, user.email)}
                            disabled={actionLoading === user._id + "_welcome"}
                            title="Resend welcome email"
                            className="p-1.5 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user._id + "_welcome"
                              ? <div className="h-4 w-4 rounded-full border-2 border-warning border-t-transparent animate-spin" />
                              : <Mail className="h-4 w-4" />}
                          </button>
                          {welcomeResult?.id === user._id && (
                            <span className={`text-xs font-medium ${welcomeResult.ok ? "text-success" : "text-danger"}`}>
                              {welcomeResult.ok ? "✓ Sent" : "✗ Failed"}
                            </span>
                          )}
                          {user.isLifetime && (
                            <button
                              onClick={() => sendBotLink(user._id)}
                              disabled={actionLoading === user._id + "_bot"}
                              title="Resend bot deep link email"
                              className="p-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === user._id + "_bot"
                                ? <div className="h-4 w-4 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
                                : <Send className="h-4 w-4" />}
                            </button>
                          )}
                          {botLinkResult?.id === user._id && (
                            <span className={`text-xs font-medium ${botLinkResult.ok ? "text-success" : "text-danger"}`}>
                              {botLinkResult.ok ? "✓ Sent" : "✗ Failed"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
