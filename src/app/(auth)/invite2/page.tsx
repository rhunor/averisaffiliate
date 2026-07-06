"use client";

import { useState } from "react";

function AverisLogo() {
  return (
    <div className="flex justify-center mb-10">
      <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <svg width="44" height="34" viewBox="0 0 65 51" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="#122F38"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457"/>
        </svg>
        <div className="text-left">
          <div className="font-black text-[22px] text-[#122F38] leading-none tracking-[0.18em]">AVERIS</div>
          <div className="font-black text-[22px] text-[#122F38] leading-none tracking-[0.18em] mt-0.5">ACADEMY</div>
        </div>
      </a>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#122F38]/20 focus:border-[#122F38] transition-colors";
const codeCls = `${inputCls} text-center tracking-widest text-lg font-mono uppercase`;
const btnCls = "w-full bg-[#122F38] text-white rounded-xl py-3.5 font-semibold text-sm tracking-wide hover:bg-[#1a4050] active:bg-[#0d2028] transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

export default function Invite2Page() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/validate-invite2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code.");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 py-10">
        <div className="w-full max-w-[380px] text-center">
          <AverisLogo />
          <div className="w-16 h-16 rounded-full bg-[#40D457]/20 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#40D457" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#122F38] mb-3">Check your email</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            We've sent instructions and a setup video to <strong className="text-gray-700">{email}</strong>. Follow the steps in the email to create your account.
          </p>
          <p className="text-gray-400 text-xs mt-5">Didn't receive it? Check your spam folder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 py-10">
      <div className="w-full max-w-[380px]">
        <AverisLogo />

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#122F38] flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#122F38] mb-2">Special Access</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Enter your invite code and email address. We'll send you a setup video and your personal registration link.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Invite Code</label>
            <input
              placeholder="ENTER CODE HERE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={codeCls}
              required
              autoComplete="off"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              required
              autoComplete="email"
            />
          </div>
          <button type="submit" disabled={loading || !code.trim() || !email.trim()} className={btnCls}>
            {loading ? "Verifying…" : "Send My Registration Link"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-[#40D457] font-semibold hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  );
}
