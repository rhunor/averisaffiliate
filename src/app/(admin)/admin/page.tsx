"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Wallet, DollarSign, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingWithdrawals: number;
  totalRevenue: number;
  commissionsPaid: number;
}

interface RecentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  referralCode: string;
}

function StatCard({ title, value, icon: Icon, color, sub }: {
  title: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-lg sm:text-2xl font-bold text-foreground mt-1 truncate">{value}</p>
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

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d.stats); setRecentUsers(d.recentUsers || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} sub={`${stats.activeUsers} active`} icon={Users} color="bg-primary/10 text-primary" />
        <StatCard title="Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="bg-success/10 text-success" />
        <StatCard title="Commissions Paid" value={formatCurrency(stats.commissionsPaid)} icon={TrendingUp} color="bg-secondary/10 text-secondary" />
        <StatCard title="Pending Withdrawals" value={stats.pendingWithdrawals} icon={Wallet} color="bg-warning/10 text-warning" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Manage Users", href: "/admin/users", color: "bg-primary/5 hover:bg-primary/10 border-primary/20" },
          { label: "Withdrawal Queue", href: "/admin/withdrawals", color: "bg-warning/5 hover:bg-warning/10 border-warning/20" },
          { label: "Transactions", href: "/admin/transactions", color: "bg-success/5 hover:bg-success/10 border-success/20" },
          { label: "Products", href: "/admin/products", color: "bg-secondary/5 hover:bg-secondary/10 border-secondary/20" },
          { label: "Courses", href: "/admin/courses", color: "bg-info/5 hover:bg-info/10 border-info/20" },
        ].map(({ label, href, color }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${color}`}
          >
            <span className="text-sm font-medium text-foreground">{label}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {/* Recent users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Signups</CardTitle>
          <Link href="/admin/users" className="text-sm text-secondary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</p>
                </div>
                <Badge variant={user.isActive ? "success" : "warning"}>
                  {user.isActive ? "Active" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
