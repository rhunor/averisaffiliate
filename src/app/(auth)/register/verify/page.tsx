"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const isBatch2 = searchParams.get("batch") === "2";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  async function handleResend() {
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (res.ok) setResent(true);
      else setError("Could not resend email. Try again later.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setResending(false);
    }
  }

  if (isBatch2) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-secondary-bright" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Account created!</h1>
        <p className="text-white/60 text-sm mb-6">
          Check your email at <strong className="text-white">{email}</strong> for instructions on how to complete your access via Telegram.
        </p>
        <p className="text-white/40 text-xs mb-4">
          You&apos;ll be able to log in and join the Averis Academy community once you&apos;ve completed the Telegram step in your email.
        </p>
        <Link href="/login" className="block mt-2 text-sm text-secondary-bright hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8">
      <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
        <Mail className="h-8 w-8 text-secondary-bright" />
      </div>
      <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
      <p className="text-white/60 text-sm mb-6">
        We sent a verification link to <strong className="text-white">{email}</strong>. Click the link to verify your account.
      </p>

      {resent ? (
        <div className="flex items-center gap-2 justify-center text-success text-sm mb-4">
          <CheckCircle className="h-4 w-4" />
          Email resent successfully!
        </div>
      ) : (
        <>
          {error && <p className="text-danger text-sm mb-3">{error}</p>}
          <Button variant="outline" onClick={handleResend} loading={resending} className="w-full mb-3 text-white border-white/20 hover:bg-white/10">
            Resend email
          </Button>
        </>
      )}

      <p className="text-white/40 text-xs">
        After verifying, you&apos;ll be directed to complete payment and activate your account.
      </p>

      <Link href="/login" className="block mt-4 text-sm text-secondary-bright hover:underline">
        Back to login
      </Link>
    </div>
  );
}

export default function RegisterVerifyPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <span className="text-secondary-bright font-bold text-xl">Averis</span>
            <span className="text-white font-semibold text-xl"> Academy</span>
          </div>
        </div>
        <Suspense fallback={<div className="glass rounded-2xl p-8 text-white/60">Loading…</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
