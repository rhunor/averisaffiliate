"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Invalid verification link."); return; }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const d = await res.json();
        if (res.ok) { setStatus("success"); setMessage(d.message || "Email verified!"); }
        else { setStatus("error"); setMessage(d.error || "Verification failed."); }
      })
      .catch(() => { setStatus("error"); setMessage("Something went wrong."); });
  }, [token]);

  return (
    <>
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 text-secondary-bright animate-spin mx-auto mb-4" />
          <h2 className="text-white font-semibold">Verifying your email…</h2>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Email Verified!</h2>
          <p className="text-white/60 text-sm mb-6">Your email is confirmed. Log in to complete your payment and activate your account.</p>
          <Link
            href="/login?callbackUrl=%2Fpending-payment&verified=1"
            className="inline-block bg-secondary text-white px-6 py-3 rounded-xl font-semibold hover:bg-secondary-dark transition-colors"
          >
            Log In &amp; Complete Payment →
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="h-12 w-12 text-danger mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Verification Failed</h2>
          <p className="text-white/60 text-sm mb-6">{message}</p>
          <Link href="/login" className="text-secondary-bright hover:underline text-sm">
            Back to login
          </Link>
        </>
      )}
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
        <Suspense
          fallback={
            <>
              <Loader2 className="h-12 w-12 text-secondary-bright animate-spin mx-auto mb-4" />
              <h2 className="text-white font-semibold">Loading…</h2>
            </>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
