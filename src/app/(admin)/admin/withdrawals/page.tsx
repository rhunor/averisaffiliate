"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Withdrawal {
  _id: string;
  amount: number;
  status: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  createdAt: string;
  processedAt: string | null;
  rejectionReason: string | null;
  userId: { firstName: string; lastName: string; email: string } | null;
}

type StatusFilter = "pending" | "processing" | "completed" | "rejected" | "all";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchWithdrawals = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/withdrawals?status=${status}&page=${page}`)
      .then((r) => r.json())
      .then((d) => { setWithdrawals(d.withdrawals || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);
  useEffect(() => { setPage(1); }, [status]);

  async function handleAction(id: string, action: "approve" | "reject", rejectionReason?: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason }),
      });
      if (res.ok) {
        fetchWithdrawals();
        setRejectId(null);
        setRejectReason("");
      }
    } finally {
      setActionLoading(null);
    }
  }

  const statusTabs: StatusFilter[] = ["pending", "processing", "completed", "rejected", "all"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Withdrawals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{total} {status} withdrawal{total !== 1 ? "s" : ""}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-2 flex-wrap">
            {statusTabs.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  status === s
                    ? "bg-secondary text-white"
                    : "bg-muted text-muted-foreground hover:bg-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-secondary border-t-transparent" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="py-16 text-center">
              <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No {status} withdrawals</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {withdrawals.map((w) => (
                <div key={w._id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{formatCurrency(w.amount)}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : "Unknown"} ·{" "}
                        {w.userId?.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {w.bankName} · {w.accountNumber} · {w.accountName}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(w.createdAt)}</p>
                      {w.rejectionReason && (
                        <p className="text-xs text-danger mt-1">Reason: {w.rejectionReason}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={
                        w.status === "completed" ? "success" :
                        w.status === "processing" ? "info" :
                        w.status === "pending" ? "warning" : "danger"
                      }>
                        {w.status}
                      </Badge>
                      {w.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(w._id, "approve")}
                            disabled={actionLoading === w._id}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors disabled:opacity-60"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => { setRejectId(w._id); setRejectReason(""); }}
                            disabled={actionLoading === w._id}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-danger/10 text-danger hover:bg-danger/20 rounded-lg transition-colors disabled:opacity-60"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejection reason form */}
                  {rejectId === w._id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection (optional)"
                        className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-danger/30"
                      />
                      <button
                        onClick={() => handleAction(w._id, "reject", rejectReason)}
                        className="px-4 py-2 bg-danger text-white text-sm font-semibold rounded-xl hover:bg-danger/90 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setRejectId(null)}
                        className="px-4 py-2 bg-muted text-muted-foreground text-sm rounded-xl hover:bg-border transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted disabled:opacity-40">Previous</button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
