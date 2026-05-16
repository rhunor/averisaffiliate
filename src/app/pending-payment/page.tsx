"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { CreditCard, CheckCircle, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const features = [
  "Access to all 4 learning modules",
  "Weekly live coaching calls",
  "Private community access (WhatsApp/Telegram)",
  "Accountability Trio system",
  "Done-for-you templates & scripts",
  "Your unique affiliate link + QR code",
  "50% commission on every referral",
  "Direct bank withdrawals",
];

export default function PendingPaymentPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/initialize", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Payment initialization failed."); return; }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const user = session?.user as unknown as Record<string, unknown>;
  const name = (user?.name as string)?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <span className="text-secondary-bright font-bold text-xl">Averis</span>
              <span className="text-white font-semibold text-xl"> Academy</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">One step away, {name}!</h1>
          <p className="text-white/60 text-sm mt-1">
            Complete your subscription to access the full platform
          </p>
        </div>

        <div className="glass rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-bold text-lg">Averis Academy — 6 Months</h2>
              <p className="text-white/60 text-sm">Full platform access + affiliate dashboard</p>
            </div>
            <div className="text-right">
              <span className="text-secondary-bright font-bold text-2xl">
                {formatCurrency(siteConfig.signupFee)}
              </span>
              <p className="text-white/40 text-xs">one-time</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mb-5">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
              Everything included:
            </p>
            <ul className="space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle className="h-4 w-4 text-secondary-bright shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <Button size="lg" onClick={handlePay} loading={loading} className="w-full gap-2">
            <CreditCard className="h-5 w-5" />
            Pay {formatCurrency(siteConfig.signupFee)} Now
          </Button>

          <p className="text-center text-white/40 text-xs mt-3">
            Secured by Korapay · Card & Bank Transfer accepted
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
