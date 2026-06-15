"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

function AverisLogoMark({ size = 44 }: { size?: number }) {
  const h = Math.round(size * (51 / 65));
  return (
    <svg width={size} height={h} viewBox="0 0 65 51" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="#122F38"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457"/>
    </svg>
  );
}


const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#122F38]/20 focus:border-[#122F38] transition-colors";

const btnCls =
  "w-full bg-[#122F38] text-white rounded-xl py-3.5 font-semibold text-sm tracking-wide hover:bg-[#1a4050] active:bg-[#0d2028] transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const justVerified = searchParams.get("verified") === "1";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) { setError("Invalid email or password."); return; }
      router.push(callbackUrl);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {justVerified && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
          ✓ Email verified! Log in below to complete your payment and activate your account.
        </div>
      )}

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
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`${inputCls} pr-12`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? "Signing in…" : "Log In"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Forgot Password?{" "}
          <Link href="/forgot-password" className="text-[#40D457] font-semibold hover:underline">
            Click to Reset Password
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <AverisLogoMark size={44} />
            <div className="text-left">
              <div className="font-black text-[22px] text-[#122F38] leading-none tracking-[0.18em]">AVERIS</div>
              <div className="font-black text-[22px] text-[#122F38] leading-none tracking-[0.18em] mt-0.5">ACADEMY</div>
            </div>
          </a>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#122F38] mb-1.5">Welcome Back!</h1>
        <p className="text-gray-500 text-sm mb-8">
          Don&apos;t have an Account?{" "}
          <Link href="/register" className="text-[#40D457] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>

        <Suspense fallback={<div className="py-8 text-center text-gray-400 text-sm">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>

    </div>
  );
}
