"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  DollarSign, Users, Wallet, TrendingUp, ArrowRight, CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

interface DashboardData {
  user: {
    firstName: string; lastName: string; email: string; referralCode: string;
    profileImage: string | null; isEmailVerified: boolean; subscriptionExpiresAt: string | null;
    bankDetails: { bankName: string; accountNumber: string } | null;
  };
  stats: {
    totalEarnings: number; availableBalance: number; pendingWithdrawals: number;
    totalWithdrawn: number; totalReferrals: number; activeReferrals: number;
  };
  chartData: { month: string; earnings: number }[];
  recentReferrals: Array<{ referredUserId: { firstName: string; lastName: string; email: string; createdAt: string }; status: string; createdAt: string }>;
}

function StatCard({ title, value, sub, icon: Icon, color }: { title: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const activated = searchParams.get("activated") === "1";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionUser = session?.user as unknown as Record<string, unknown>;
  const referralCode = sessionUser?.referralCode as string;
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = `${appUrl}/register?ref=${referralCode}`;

  useEffect(() => {
    fetch("/api/dashboard")
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
      {activated && (
        <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl px-5 py-4">
          <CheckCircle className="h-5 w-5 text-success shrink-0" />
          <div>
            <p className="font-semibold text-success">Account activated!</p>
            <p className="text-sm text-muted-foreground">Welcome to Averis Academy. Your journey to wealth starts now.</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-foreground">
          Welcome, {data.user.firstName}!
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your affiliate dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Earned" value={formatCurrency(data.stats.totalEarnings)} icon={DollarSign} color="bg-secondary/10 text-secondary" />
        <StatCard title="Available" value={formatCurrency(data.stats.availableBalance)} sub="Ready to withdraw" icon={Wallet} color="bg-success/10 text-success" />
        <StatCard title="Referrals" value={String(data.stats.totalReferrals)} sub={`${data.stats.activeReferrals} active`} icon={Users} color="bg-primary/10 text-primary" />
        <StatCard title="Withdrawn" value={formatCurrency(data.stats.totalWithdrawn)} icon={TrendingUp} color="bg-warning/10 text-warning" />
      </div>

      {/* Chart + Referral Link */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Earnings (6 months)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d7f8f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2d7f8f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), "Earnings"]} />
                <Area type="monotone" dataKey="earnings" stroke="#2d7f8f" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Your Referral Link</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Share this link to earn {siteConfig.commission.rate}% commission</p>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs font-mono text-foreground break-all">{referralLink}</p>
              </div>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(referralLink)}
              className="w-full text-sm font-medium text-secondary hover:text-secondary-dark transition-colors"
            >
              Copy link
            </button>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Commission per referral</p>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-muted-foreground">New sub</span>
                <span className="font-semibold text-success">{formatCurrency(siteConfig.commission.newSubscription)}</span>
              </div>
              <div className="flex justify-between mt-1 text-sm">
                <span className="text-muted-foreground">Renewal</span>
                <span className="font-semibold text-success">{formatCurrency(siteConfig.commission.renewal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent referrals */}
      {data.recentReferrals.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Referrals</CardTitle>
            <Link href="/dashboard/referrals" className="text-sm text-secondary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {data.recentReferrals.slice(0, 5).map((ref, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {ref.referredUserId?.firstName} {ref.referredUserId?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(ref.createdAt)}</p>
                  </div>
                  <Badge variant={ref.status === "active" ? "success" : ref.status === "pending" ? "warning" : "secondary"}>
                    {ref.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
