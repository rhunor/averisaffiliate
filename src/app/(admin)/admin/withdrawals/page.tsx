"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, Copy, Check, Zap } from "lucide-react";
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
  transferCode: string | null;
  userId: { firstName: string; lastName: string; email: string } | null;
}

type StatusFilter = "processing" | "completed" | "failed" | "all";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("processing");
  const [loading, setLoading] = useState(true);
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

  const statusTabs: StatusFilter[] = ["processing", "completed", "failed", "all"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Withdrawals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{total} {status} withdrawal{total !== 1 ? "s" : ""}</p>
      </div>

      {/* Automated payout info */}
      <div className="flex items-start gap-3 bg-success/10 border border-success/20 rounded-xl px-4 py-3">
        <Zap className="h-4 w-4 text-success shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-semibold">Withdrawals are processed automatically via Paystack</p>
          <p className="text-muted-foreground mt-0.5">When an affiliate requests a withdrawal, the transfer is initiated instantly. No action is required here — this page is a read-only audit log. Status updates automatically when Paystack confirms the transfer.</p>
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

                      {/* Bank details */}
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
                          <span className="text-sm font-bold text-success">{formatCurrency(w.amount)}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">{formatDate(w.createdAt)}</p>
                      {w.processedAt && (
                        <p className="text-xs text-muted-foreground">Processed: {formatDate(w.processedAt)}</p>
                      )}
                      {w.rejectionReason && (
                        <p className="text-xs text-danger mt-1">Reason: {w.rejectionReason}</p>
                      )}
                      {w.transferReference && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <p className="text-xs text-muted-foreground font-mono">Ref: {w.transferReference}</p>
                          <button
                            onClick={() => copyText(w.transferReference!, `ref-${w._id}`)}
                            className="text-muted-foreground hover:text-secondary transition-colors"
                            title="Copy transfer reference"
                          >
                            {copiedId === `ref-${w._id}` ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant={
                        w.status === "completed" ? "success" :
                        w.status === "processing" ? "info" :
                        w.status === "failed" || w.status === "rejected" ? "danger" : "warning"
                      }>
                        {w.status}
                      </Badge>
                    </div>
                  </div>
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
