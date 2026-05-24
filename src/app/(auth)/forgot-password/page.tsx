"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

function AverisLogoMark({ size = 44 }: { size?: number }) {
  const h = Math.round(size * 0.85);
  return (
    <svg width={size} height={h} viewBox="0 0 52 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M44 2H20L4 22L20 42H44V33H26L16 22L26 11H44V2Z" fill="#122F38" />
      <polygon points="29,2 45,2 37,18" fill="#40D457" />
    </svg>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#122F38]/20 focus:border-[#122F38] transition-colors";

const btnCls =
  "w-full bg-[#122F38] text-white rounded-xl py-3.5 font-semibold text-sm tracking-wide hover:bg-[#1a4050] active:bg-[#0d2028] transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
      else {
        const d = await res.json();
        setError(d.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <AverisLogoMark size={44} />
            <div className="text-left">
              <div className="font-black text-[22px] text-[#122F38] leading-none tracking-[0.18em]">AVERIS</div>
              <div className="font-black text-[22px] text-[#122F38] leading-none tracking-[0.18em] mt-0.5">ACADEMY</div>
            </div>
          </div>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#40D457]/15 flex items-center justify-center mx-auto mb-5">
              <Mail className="h-7 w-7 text-[#2eb847]" />
            </div>
            <h1 className="text-2xl font-bold text-[#122F38] mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm">
              If an account exists for{" "}
              <strong className="text-[#122F38]">{email}</strong>
              , you&apos;ll receive a reset link shortly.
            </p>
            <Link
              href="/login"
              className="block mt-8 text-sm text-[#40D457] font-semibold hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-[#122F38] mb-1.5">Forgot Password?</h1>
            <p className="text-gray-500 text-sm mb-8">
              Enter your email and we&apos;ll send a reset link.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className={btnCls}>
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-500">
              Remember your password?{" "}
              <Link href="/login" className="text-[#40D457] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
