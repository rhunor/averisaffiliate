"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Clock, CreditCard, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface SubscriptionData {
  isActive: boolean;
  subscriptionExpiresAt: string | null;
  daysLeft: number;
  isExpiringSoon: boolean;
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/subscription")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  async function handleRenew() {
    setRenewing(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "renewal" }),
      });
      const json = await res.json();
      if (json.checkoutUrl) window.location.href = json.checkoutUrl;
    } finally {
      setRenewing(false);
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

  const statusColor = data.isActive
    ? data.isExpiringSoon ? "warning" : "success"
    : "danger";

  const statusLabel = data.isActive
    ? data.isExpiringSoon ? "Expiring soon" : "Active"
    : "Expired";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Subscription</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your Averis Academy membership</p>
      </div>

      {/* Status card */}
      <Card className={`border-2 ${data.isActive ? (data.isExpiringSoon ? "border-warning/30" : "border-success/30") : "border-danger/30"}`}>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Membership status</p>
              <div className="flex items-center gap-2 mt-1">
                {data.isActive ? (
                  data.isExpiringSoon
                    ? <AlertCircle className="h-5 w-5 text-warning" />
                    : <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-danger" />
                )}
                <p className="text-xl font-bold text-foreground">{statusLabel}</p>
              </div>
              {data.subscriptionExpiresAt && (
                <p className="text-sm text-muted-foreground mt-1.5">
                  {data.isActive ? "Expires" : "Expired"}: {formatDate(data.subscriptionExpiresAt)}
                </p>
              )}
              {data.isActive && data.daysLeft > 0 && (
                <p className={`text-sm font-semibold mt-1 ${data.isExpiringSoon ? "text-warning" : "text-success"}`}>
                  {data.daysLeft} day{data.daysLeft !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>
            <Badge variant={statusColor} className="text-sm">{statusLabel}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Renewal CTA */}
      {(!data.isActive || data.isExpiringSoon) && (
        <Card className="bg-linear-to-br from-primary to-primary-light text-white">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-white" />
              <div>
                <p className="font-bold text-white">
                  {data.isActive ? "Renew your subscription" : "Reactivate your account"}
                </p>
                <p className="text-white/70 text-sm">
                  {data.isActive
                    ? "Keep access to all courses and your affiliate earnings"
                    : "Regain full access to the platform and start earning again"}
                </p>
              </div>
            </div>
            <button
              onClick={handleRenew}
              disabled={renewing}
              className="w-full bg-white text-primary font-bold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              {renewing ? "Redirecting…" : `Renew for ${formatCurrency(siteConfig.renewalFee)}`}
            </button>
          </CardContent>
        </Card>
      )}

      {/* What's included */}
      <Card>
        <CardHeader><CardTitle>What's included</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            "Full access to all Academy video courses",
            "Multi-product affiliate dashboard",
            "QR code & shareable referral links",
            `${siteConfig.commission.rate}% commission on every referral (₦${siteConfig.commission.newSubscription.toLocaleString()})`,
            `${siteConfig.commission.rate}% commission on renewals (₦${siteConfig.commission.renewal.toLocaleString()})`,
            "Weekly Friday withdrawals",
            "Real-time earnings tracking",
            "6-month membership validity",
          ].map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{feature}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Plan details */}
      <Card>
        <CardHeader><CardTitle>Plan details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium text-foreground">Averis Academy Affiliate</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium text-foreground">6 months</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">New subscription</span>
            <span className="font-medium text-foreground">{formatCurrency(siteConfig.signupFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Renewal</span>
            <span className="font-medium text-foreground">{formatCurrency(siteConfig.renewalFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Commission rate</span>
            <span className="font-medium text-success">{siteConfig.commission.rate}% flat</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
