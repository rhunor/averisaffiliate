"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { Mail, CheckCircle, X } from "lucide-react";

function EmailBanner() {
  const { data: session, update } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const searchParams = useSearchParams();
  const hasRefreshed = useRef(false);

  const sessionUser = session?.user as unknown as Record<string, unknown>;
  const isEmailVerified = sessionUser?.isEmailVerified as boolean;
  const emailSent = searchParams.get("emailSent") === "1";

  useEffect(() => {
    if (!session || isEmailVerified) return;
    if (!hasRefreshed.current) { hasRefreshed.current = true; update(); }
    function onVisibility() { if (document.visibilityState === "visible") update(); }
    document.addEventListener("visibilitychange", onVisibility);
    const interval = setInterval(() => update(), 15_000);
    return () => { document.removeEventListener("visibilitychange", onVisibility); clearInterval(interval); };
  }, [session, isEmailVerified, update]);

  if (isEmailVerified || dismissed || !session) return null;

  async function handleResend() {
    if (resendState !== "idle") return;
    setResendState("sending");
    try {
      const email = session?.user?.email;
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setResendState("sent");
      else setResendState("idle");
    } catch { setResendState("idle"); }
  }

  if (emailSent || resendState === "sent") {
    return (
      <div className="flex items-center justify-between gap-3 bg-success/10 border-b border-success/20 px-6 py-3">
        <div className="flex items-center gap-2.5 text-sm">
          <CheckCircle className="h-4 w-4 text-success shrink-0" />
          <span>Verification email sent! Check your inbox and click the link.</span>
        </div>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-warning/10 border-b border-warning/20 px-6 py-3">
      <div className="flex items-center gap-2.5 text-sm">
        <Mail className="h-4 w-4 text-warning shrink-0" />
        <span>
          Please verify your email.{" "}
          <button onClick={handleResend} disabled={resendState !== "idle"} className="font-semibold text-warning hover:underline disabled:opacity-60">
            {resendState === "sending" ? "Sending…" : "Resend email"}
          </button>
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-muted">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <Suspense>
          <EmailBanner />
        </Suspense>
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>
      </div>
      <BottomNav />
      <ScrollToTop />
    </div>
  );
}
