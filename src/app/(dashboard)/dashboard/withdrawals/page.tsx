"use client";

import { useEffect, useRef, useState } from "react";
import { Wallet, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface WithdrawalsData {
  availableBalance: number;
  pendingWithdrawals: number;
  withdrawals: Array<{
    _id: string;
    amount: number;
    status: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    createdAt: string;
  }>;
}

interface Bank { name: string; code: string; }

export default function WithdrawalsPage() {
  const [data, setData] = useState<WithdrawalsData | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const resolveAbort = useRef<AbortController | null>(null);

  async function loadData() {
    const [dash, bankList] = await Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/banks").then((r) => r.json()),
    ]);
    if (dash) {
      setData({
        availableBalance: dash.stats?.availableBalance || 0,
        pendingWithdrawals: dash.stats?.pendingWithdrawals || 0,
        withdrawals: dash.recentWithdrawals || [],
      });
    }
    if (bankList?.banks) setBanks(bankList.banks);
  }

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  // Auto-detect account name when 10-digit account + bank are both set
  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) {
      setResolvedName(null);
      setResolveError("");
      return;
    }
    resolveAbort.current?.abort();
    const ctrl = new AbortController();
    resolveAbort.current = ctrl;
    setResolving(true);
    setResolvedName(null);
    setResolveError("");
    const timer = setTimeout(() => {
      fetch("/api/banks/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankCode, accountNumber }),
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((d) => {
          if (ctrl.signal.aborted) return;
          if (d.accountName) setResolvedName(d.accountName);
          else setResolveError(d.error || "Could not verify account.");
        })
        .catch((e) => { if (e?.name !== "AbortError") setResolveError("Network error — check your connection."); })
        .finally(() => { if (!ctrl.signal.aborted) setResolving(false); });
    }, 600);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [accountNumber, bankCode]);

  function handleBankChange(code: string) {
    setBankCode(code);
    setBankName(banks.find((b) => b.code === code)?.name || "");
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amt = parseFloat(amount);
    if (!amt || amt < siteConfig.minWithdrawal) {
      setError(`Minimum withdrawal is ${formatCurrency(siteConfig.minWithdrawal)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, bankCode, bankName, accountNumber }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Withdrawal failed."); return; }

      setSuccess(`₦${amt.toLocaleString()} is being sent to your account. It should arrive within minutes.`);
      setAmount(""); setBankCode(""); setBankName(""); setAccountNumber("");
      setShowForm(false);
      loadData();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Withdrawals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Withdraw your earnings directly to your bank account</p>
      </div>

      {/* Balance card */}
      <Card className="bg-linear-to-br from-primary to-primary-light text-white">
        <CardContent className="pt-6 pb-6">
          <p className="text-white/70 text-sm">Available balance</p>
          <p className="text-4xl font-bold mt-1">{formatCurrency(data.availableBalance)}</p>
          {data.pendingWithdrawals > 0 && (
            <p className="text-white/70 text-xs mt-2">
              {formatCurrency(data.pendingWithdrawals)} currently processing
            </p>
          )}
        </CardContent>
      </Card>

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl px-4 py-3">
          <CheckCircle className="h-4 w-4 text-success shrink-0" />
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      {/* Withdrawal form */}
      <Card>
        <CardHeader>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => { setShowForm((v) => !v); setError(""); }}
          >
            <CardTitle>Withdraw funds</CardTitle>
            {showForm ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-danger shrink-0" />
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₦</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min. ${formatCurrency(siteConfig.minWithdrawal)}`}
                    required
                    min={siteConfig.minWithdrawal}
                    max={data.availableBalance}
                    className="w-full bg-muted border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Bank</label>
                <select
                  value={bankCode}
                  onChange={(e) => handleBankChange(e.target.value)}
                  required
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
                >
                  <option value="">Select bank…</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Account number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="0123456789"
                  required
                  maxLength={10}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>

              {/* Account resolution feedback */}
              {resolving && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                  Verifying account…
                </div>
              )}
              {resolvedName && !resolving && (
                <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl px-3 py-2.5 text-sm">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span className="text-success font-semibold">{resolvedName}</span>
                </div>
              )}
              {resolveError && !resolving && (
                <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-3 py-2.5 text-sm">
                  <AlertCircle className="h-4 w-4 text-danger shrink-0" />
                  <span className="text-danger">{resolveError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || data.availableBalance < siteConfig.minWithdrawal || resolving || (accountNumber.length === 10 && !!bankCode && !resolvedName)}
                className="w-full bg-secondary hover:bg-secondary-dark text-primary font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
              >
                {submitting ? "Sending to your bank…" : "Withdraw now"}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Account name is verified automatically before funds are sent
              </p>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Withdrawal history */}
      <Card>
        <CardHeader><CardTitle>Withdrawal History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {data.withdrawals.length === 0 ? (
            <div className="py-16 text-center">
              <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No withdrawals yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.withdrawals.map((w) => (
                <div key={w._id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatCurrency(w.amount)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {w.bankName} · {w.accountNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(w.createdAt)}</p>
                  </div>
                  <Badge variant={
                    w.status === "completed" ? "success" :
                    w.status === "processing" ? "info" :
                    w.status === "pending" ? "warning" : "danger"
                  }>
                    {w.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
