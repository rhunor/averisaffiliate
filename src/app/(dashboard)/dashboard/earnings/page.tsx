"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Package } from "lucide-react";
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

  useEffect(() => {
    fetch("/api/dashboard/earnings")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-xl font-bold text-foreground">Earnings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All your commission history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Earned</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{formatCurrency(data.stats.totalEarnings)}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">New Referrals</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{data.stats.totalReferrals}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Renewals</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{data.stats.totalRenewals}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction list */}
      <Card>
        <CardHeader><CardTitle>Commission History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {data.transactions.length === 0 ? (
            <div className="py-16 text-center">
              <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No earnings yet. Start sharing your referral link!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.transactions.map((tx) => (
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
