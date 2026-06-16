"use client";

import { useEffect, useState, useMemo } from "react";
import { DollarSign, TrendingUp, Package, AlertCircle, RefreshCw, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  referredUser?: { firstName: string; lastName: string };
  product?: { name: string };
}

interface EarningsData {
  stats: {
    totalEarnings: number;
    totalReferrals: number;
    totalRenewals: number;
  };
  transactions: Transaction[];
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function load() {
    setLoading(true);
    setError(false);
    fetch("/api/dashboard/earnings")
      .then((r) => {
        if (!r.ok) throw new Error("not ok");
        return r.json();
      })
      .then((d) => {
        if (d?.error) throw new Error(d.error);
        setData(d);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.transactions.filter((tx) => {
      const d = new Date(tx.createdAt);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [data, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-danger" />
        </div>
        <p className="font-semibold text-foreground">This page couldn&apos;t load</p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Check your connection and try again.
        </p>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-secondary hover:underline mt-1"
        >
          <RefreshCw className="h-4 w-4" /> Reload to try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Earnings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your complete affiliate sales history</p>
      </div>

      {/* Settlement notice */}
      <div className="flex items-start gap-3 bg-warning/10 border border-warning/20 rounded-xl px-5 py-3">
        <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          Commissions are credited to your available balance the <strong>day after</strong> a confirmed sale. Pending commissions are shown immediately under &ldquo;Total Earned&rdquo; but cannot be withdrawn until settled.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Earned</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{formatCurrency(data.stats.totalEarnings)}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">New Sales</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{data.stats.totalReferrals}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Renewals</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{data.stats.totalRenewals}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date filter */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Filter by date:</span>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-xs text-secondary hover:underline"
              >
                Clear
              </button>
            )}
            {(dateFrom || dateTo) && (
              <span className="text-xs text-muted-foreground ml-auto">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction list */}
      <Card>
        <CardHeader><CardTitle>Sales History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {data.transactions.length === 0
                  ? "No earnings yet. Share your affiliate link to start making sales!"
                  : "No transactions match the selected date range."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                      {tx.product && (
                        <span className="text-xs text-muted-foreground">· {tx.product.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-success">+{formatCurrency(tx.amount)}</p>
                    <Badge
                      variant={tx.status === "completed" ? "success" : tx.status === "pending" ? "warning" : "secondary"}
                      className="text-xs mt-0.5"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
