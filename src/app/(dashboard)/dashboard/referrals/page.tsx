"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, UserX, Copy, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Referral {
  _id: string;
  referredUserId: { firstName: string; lastName: string; email: string } | null;
  status: string;
  commissionAmount: number;
  createdAt: string;
  product?: { name: string } | null;
}

interface ReferralsData {
  referralCode: string;
  referralLink: string;
  stats: { total: number; active: number; pending: number; cancelled: number };
  referrals: Referral[];
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/referrals")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  function copyLink() {
    if (!data) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <h1 className="text-xl font-bold text-foreground">Referrals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Everyone you've referred to Averis Academy</p>
      </div>

      {/* Referral link card */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Your referral code</p>
            <span className="inline-block font-mono font-bold text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg text-sm">
              {data.referralCode}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Your referral link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-xl px-3 py-2 overflow-hidden">
                <p className="text-xs font-mono text-foreground truncate">{data.referralLink}</p>
              </div>
              <button
                onClick={copyLink}
                className="shrink-0 w-9 h-9 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary flex items-center justify-center transition-colors"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: data.stats.total, icon: Users, color: "bg-primary/10 text-primary" },
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

      {/* Referrals table */}
      <Card>
        <CardHeader><CardTitle>All Referrals</CardTitle></CardHeader>
        <CardContent className="p-0">
          {data.referrals.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No referrals yet. Share your link to start earning!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.referrals.map((ref) => (
                <div key={ref._id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {ref.referredUserId
                        ? `${ref.referredUserId.firstName} ${ref.referredUserId.lastName}`
                        : "Unknown user"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{formatDate(ref.createdAt)}</p>
                      {ref.product && (
                        <span className="text-xs text-muted-foreground">· {ref.product.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    {ref.commissionAmount > 0 && (
                      <p className="text-sm font-semibold text-success">{formatCurrency(ref.commissionAmount)}</p>
                    )}
                    <Badge variant={
                      ref.status === "active" ? "success" :
                      ref.status === "pending" ? "warning" : "secondary"
                    }>
                      {ref.status}
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
