"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, CheckCircle, XCircle, Copy, Check, Info } from "lucide-react";
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
  transferReference: string | null;
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
  const [approveId, setApproveId] = useState<string | null>(null);
  const [transferRef, setTransferRef] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/withdrawals?status=${status}&page=${page}`)
      .then((r) => r.json())
      .then((d) => { setWithdrawals(d.withdrawals || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);
  useEffect(() => { setPage(1); }, [status]);

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleAction(id: string, action: "approve" | "reject", extra?: { rejectionReason?: string; transferReference?: string }) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (res.ok) {
        fetchWithdrawals();
        setRejectId(null);
        setRejectReason("");
        setApproveId(null);
        setTransferRef("");
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

      {/* Instructions banner */}
      <div className="flex items-start gap-3 bg-warning/10 border border-warning/20 rounded-xl px-4 py-3">
        <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-semibold">Manual payout process</p>
          <p className="text-muted-foreground mt-0.5">For each pending withdrawal: copy the account details, send the money via your bank app or Korapay dashboard, then click <strong>Mark as Paid</strong>. The affiliate will be notified by email automatically.</p>
        </div>
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
                <div key={w._id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-foreground text-lg">{formatCurrency(w.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : "Unknown"} · {w.userId?.email}
                      </p>

                      {/* Bank details with copy buttons */}
                      <div className="mt-2 bg-muted rounded-xl px-4 py-3 space-y-2 inline-block w-full max-w-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground w-24 shrink-0">Bank</span>
                          <span className="text-xs font-medium text-foreground">{w.bankName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground w-24 shrink-0">Account No.</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold font-mono text-foreground tracking-widest">{w.accountNumber}</span>
                            <button
                              onClick={() => copyText(w.accountNumber, `acct-${w._id}`)}
                              className="text-muted-foreground hover:text-secondary transition-colors"
                              title="Copy account number"
                            >
                              {copiedId === `acct-${w._id}` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground w-24 shrink-0">Account Name</span>
                          <span className="text-xs font-medium text-foreground">{w.accountName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground w-24 shrink-0">Amount</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-success">{formatCurrency(w.amount)}</span>
                            <button
                              onClick={() => copyText(w.amount.toString(), `amt-${w._id}`)}
                              className="text-muted-foreground hover:text-secondary transition-colors"
                              title="Copy amount"
                            >
                              {copiedId === `amt-${w._id}` ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">{formatDate(w.createdAt)}</p>
                      {w.rejectionReason && (
                        <p className="text-xs text-danger mt-1">Reason: {w.rejectionReason}</p>
                      )}
                      {w.transferReference && (
                        <p className="text-xs text-muted-foreground">Ref: {w.transferReference}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant={
                        w.status === "completed" ? "success" :
                        w.status === "processing" ? "info" :
                        w.status === "pending" ? "warning" : "danger"
                      }>
                        {w.status}
                      </Badge>
                      {w.status === "pending" && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => { setApproveId(w._id); setTransferRef(""); setRejectId(null); }}
                            disabled={actionLoading === w._id}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors disabled:opacity-60 font-semibold"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Mark as Paid
                          </button>
                          <button
                            onClick={() => { setRejectId(w._id); setRejectReason(""); setApproveId(null); }}
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

                  {/* Mark as Paid confirmation */}
                  {approveId === w._id && (
                    <div className="mt-3 bg-success/5 border border-success/20 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-semibold text-foreground">Confirm you have already sent ₦{w.amount.toLocaleString()} to {w.accountName}</p>
                      <input
                        type="text"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder="Transfer / transaction reference (optional)"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-success/30"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(w._id, "approve", { transferReference: transferRef || undefined })}
                          disabled={actionLoading === w._id}
                          className="px-4 py-2 bg-success text-white text-sm font-semibold rounded-xl hover:bg-success/90 transition-colors disabled:opacity-60"
                        >
                          {actionLoading === w._id ? "Saving…" : "Yes, mark as paid"}
                        </button>
                        <button
                          onClick={() => setApproveId(null)}
                          className="px-4 py-2 bg-muted text-muted-foreground text-sm rounded-xl hover:bg-border transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

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
                        onClick={() => handleAction(w._id, "reject", { rejectionReason: rejectReason })}
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
