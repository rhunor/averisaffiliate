"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#122F38]/20 focus:border-[#122F38] transition-colors";
const btnCls = "w-full bg-[#122F38] text-white rounded-xl py-3.5 font-semibold text-sm tracking-wide hover:bg-[#1a4050] active:bg-[#0d2028] transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

function RegisterLifetimeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") || "";
  const prefillEmail = searchParams.get("email") || "";
  const batch = searchParams.get("batch") || "";
  const batchNum = Number(batch) || 1;
  const isBatch2 = batchNum === 2;
  const isBatch3 = batchNum === 3;

  const [form, setForm] = useState({ firstName: "", lastName: "", email: prefillEmail, password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!inviteToken) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500 text-sm mb-4">Invalid or missing invite session.</p>
        <a href={isBatch3 ? "/invite3" : isBatch2 ? "/invite2" : "/invite"} className="text-[#40D457] font-semibold text-sm hover:underline">Go back and enter your code</a>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/auth/register-lifetime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, inviteToken, batch: batchNum > 1 ? batchNum : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setErrors({ root: data.error || "Registration failed." });
        return;
      }
      if (isBatch2 || isBatch3) {
        router.push(`/register/verify?email=${encodeURIComponent(form.email)}&batch=${batchNum}`);
      } else {
        router.push(`/register/verify?email=${encodeURIComponent(form.email)}&lifetime=1`);
      }
    } catch {
      setErrors({ root: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="bg-[#40D457]/10 border border-[#40D457]/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
        <span className="text-xl">🎁</span>
        <div>
          <p className="text-sm font-semibold text-[#122F38]">Lifetime Free Access</p>
          <p className="text-xs text-gray-500">Your account will never expire. No payment needed.</p>
        </div>
      </div>

      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
          {errors.root}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
            <input placeholder="John" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={`${inputCls} ${errors.firstName ? "border-red-400" : ""}`} required />
            {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
            <input placeholder="Doe" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={`${inputCls} ${errors.lastName ? "border-red-400" : ""}`} required />
            {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => !prefillEmail && setForm({ ...form, email: e.target.value })}
            readOnly={!!prefillEmail}
            className={`${inputCls} ${errors.email ? "border-red-400" : ""} ${prefillEmail ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
            required
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputCls} pr-12 ${errors.password ? "border-red-400" : ""}`} required />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? "Creating Account…" : "Create Free Account"}
        </button>
      </form>
    </div>
  );
}

export default function RegisterLifetimePage() {
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

        <h1 className="text-3xl font-bold text-[#122F38] mb-1.5">Create Account</h1>
        <p className="text-gray-500 text-sm mb-8">
          Already have an account?{" "}
          <Link href="/login" className="text-[#40D457] font-semibold hover:underline">Sign In</Link>
        </p>

        <Suspense fallback={<div className="py-8 text-center text-gray-400 text-sm">Loading…</div>}>
          <RegisterLifetimeForm />
        </Suspense>
      </div>
    </div>
  );
}
