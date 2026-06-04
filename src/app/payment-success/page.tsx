"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const attempts = useRef(0);

  useEffect(() => {
    const sessionUser = session?.user as unknown as Record<string, unknown> | undefined;
    const isActive = sessionUser?.isActive as boolean | undefined;

    if (isActive) {
      router.replace("/dashboard?activated=1");
      return;
    }

    // Refresh JWT so the middleware sees the updated isActive flag
    const timer = setTimeout(async () => {
      attempts.current += 1;
      await update();
      // After 8 attempts (~8s) just push anyway — DB is updated regardless
      if (attempts.current >= 8) {
        router.replace("/dashboard?activated=1");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [session, update, router]);

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-10 max-w-md w-full text-center">
        <CheckCircle className="h-14 w-14 text-[#40D457] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-white/60 text-sm mb-6">
          Your Averis Academy account is now active. Taking you to your dashboard…
        </p>
        <Loader2 className="h-6 w-6 text-white/40 animate-spin mx-auto" />
      </div>
    </div>
  );
}
