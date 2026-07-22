"use client";

import { Suspense, useState } from "react";
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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("aff") || searchParams.get("ref") || "";
  const productSlug = searchParams.get("product") || "";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    referralCode: refCode,
    productSlug,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!refCode) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-[#122F38]/8 flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 65 51" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="#122F38"/><path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457"/></svg>
        </div>
        <h2 className="text-lg font-bold text-[#122F38] mb-2">Invitation Required</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
         Averis Academy is sold exclusively through affiliates, you need a valid affiliate link from an existing affiliate to create an account, if you don’t have a valid affiliate link, use this button below to message us to get Access link
        </p>
        <p className="text-gray-400 text-xs mb-6">
          Already received your account credentials?{" "}
          <a href="/login" className="text-[#40D457] font-semibold hover:underline">Sign In here</a>
        </p>
        <a
          href="https://wa.me/2348148048890?text=Hi%2C%20I%20need%20an%20affiliate%20link%20to%20join%20Averis%20Academy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-[#25D366] text-white rounded-xl py-3 px-6 font-semibold text-sm hover:bg-[#1ebe5d] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Message Us on WhatsApp
        </a>
      </div>
    );
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setErrors({ root: data.error || "Registration failed" });
        return;
      }
      router.push(`/register/verify?email=${encodeURIComponent(form.email)}`);
    } catch {
      setErrors({ root: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
          {errors.root}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
            <input
              placeholder="John"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className={`${inputCls} ${errors.firstName ? "border-red-400" : ""}`}
              required
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
            <input
              placeholder="Doe"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className={`${inputCls} ${errors.lastName ? "border-red-400" : ""}`}
              required
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`${inputCls} ${errors.email ? "border-red-400" : ""}`}
            required
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Min. 8 chars with uppercase &amp; number"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`${inputCls} pr-12 ${errors.password ? "border-red-400" : ""}`}
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
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Referral Code{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            placeholder="AVR-XXXXXX"
            value={form.referralCode}
            onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
            className={`${inputCls} ${errors.referralCode ? "border-red-400" : ""}`}
          />
          {errors.referralCode
            ? <p className="mt-1 text-xs text-red-500">{errors.referralCode}</p>
            : <p className="mt-1.5 text-xs text-gray-400">Enter the referral code of the person who invited you</p>
          }
        </div>

        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? "Creating Account…" : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 py-10">
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
        <h1 className="text-3xl font-bold text-[#122F38] mb-1.5">Create Account</h1>
        <p className="text-gray-500 text-sm mb-8">
          Already have an Account?{" "}
          <Link href="/login" className="text-[#40D457] font-semibold hover:underline">
            Sign In
          </Link>
        </p>

        <Suspense fallback={<div className="py-8 text-center text-gray-400 text-sm">Loading…</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
