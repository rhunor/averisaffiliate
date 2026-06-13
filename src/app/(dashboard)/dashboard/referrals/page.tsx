"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, UserX, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Sale {
  _id: string;
  referredUserId: { firstName: string; lastName: string; email: string } | null;
  status: string;
  commissionAmount: number;
  createdAt: string;
  product?: { name: string } | null;
}

interface SalesData {
  referralCode: string;
  referralLink: string;
  stats: { total: number; active: number; pending: number; cancelled: number };
  referrals: Sale[];
}

export default function AffiliateSalesPage() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function load() {
    setLoading(true);
    setError(false);
    fetch("/api/dashboard/referrals")
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
          Reload to try again or go back.
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
        <h1 className="text-xl font-bold text-foreground">Affiliate Sales</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All your affiliate sales</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sales", value: data.stats.total, icon: Users, color: "bg-primary/10 text-primary" },
          { label: "Active", value: data.stats.active, icon: UserCheck, color: "bg-success/10 text-success" },
          { label: "Pending", value: data.stats.pending, icon: Users, color: "bg-warning/10 text-warning" },
          { label: "Cancelled", value: data.stats.cancelled, icon: UserX, color: "bg-danger/10 text-danger" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales table */}
      <Card>
        <CardHeader><CardTitle>All Affiliate Sales</CardTitle></CardHeader>
        <CardContent className="p-0">
          {data.referrals.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No affiliate sales yet. Share your link to start making sales!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.referrals.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {sale.referredUserId
                        ? `${sale.referredUserId.firstName} ${sale.referredUserId.lastName}`
                        : "Unknown user"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</p>
                      {sale.product && (
                        <span className="text-xs text-muted-foreground">· {sale.product.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    {sale.commissionAmount > 0 && (
                      <p className="text-sm font-semibold text-success">{formatCurrency(sale.commissionAmount)}</p>
                    )}
                    <Badge variant={
                      sale.status === "active" ? "success" :
                      sale.status === "pending" ? "warning" : "secondary"
                    }>
                      {sale.status}
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
