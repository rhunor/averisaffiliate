"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#122F38]/20 focus:border-[#122F38] transition-colors";
const btnCls = "w-full bg-[#122F38] text-white rounded-xl py-3.5 font-semibold text-sm tracking-wide hover:bg-[#1a4050] active:bg-[#0d2028] transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

interface TokenInfo {
  valid: boolean;
  email?: string;
  firstName?: string;
  error?: string;
}

export default function CompleteRegistrationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/auth/signup-token-info?token=${token}`)
      .then((r) => r.json())
      .then(setTokenInfo)
      .catch(() => setTokenInfo({ valid: false, error: "Failed to load signup info." }));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/auth/register-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setErrors({ root: data.error || "Registration failed." });
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login?registered=1"), 2000);
    } catch {
      setErrors({ root: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (!tokenInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#122F38] border-t-transparent" />
      </div>
    );
  }

  if (!tokenInfo.valid) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[380px] text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Link Invalid or Expired</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            {tokenInfo.error || "This signup link is no longer valid. It may have already been used or expired after 7 days."}
          </p>
          <p className="text-gray-400 text-sm">
            Need help?{" "}
            <a href="mailto:hello@averisacademy.com" className="text-[#40D457] font-semibold hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[380px] text-center">
          <div className="w-16 h-16 rounded-full bg-[#40D457]/15 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#40D457" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#122F38] mb-2">Account Created!</h2>
          <p className="text-gray-500 text-sm">Redirecting you to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 py-10">
      <div className="w-full max-w-[400px]">
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

        <div className="bg-[#40D457]/10 border border-[#40D457]/30 rounded-xl px-4 py-3 mb-7 flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <p className="text-sm font-semibold text-[#122F38]">Payment Confirmed</p>
            <p className="text-xs text-gray-500">Welcome, {tokenInfo.firstName}! Set your password to complete registration.</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#122F38] mb-1.5">Complete Registration</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your email: <span className="font-semibold text-[#122F38]">{tokenInfo.email}</span>
        </p>

        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
            {errors.root}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Choose a Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} pr-12 ${errors.password ? "border-red-400" : ""}`}
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className={btnCls}>
            {loading ? "Creating Account…" : "Activate My Account →"}
          </button>
        </form>
      </div>
    </div>
  );
}
