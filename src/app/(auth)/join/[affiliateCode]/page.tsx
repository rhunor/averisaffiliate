"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#122F38]/20 focus:border-[#122F38] transition-colors";

export default function JoinPage() {
  const { affiliateCode } = useParams<{ affiliateCode: string }>();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/pre-register/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, affiliateCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Payment initialization failed.");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f5f2] flex flex-col">
      {/* Header */}
      <div className="bg-[#0d1f1a] px-5 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <svg width="32" height="25" viewBox="0 0 65 51" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="#40D457"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457"/>
          </svg>
          <span className="font-black text-white text-base tracking-widest">AVERIS ACADEMY</span>
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center p-5 py-10">
        <div className="w-full max-w-[440px]">
          {/* Hero card */}
          <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "linear-gradient(135deg, #0d2b20 0%, #1a4d35 100%)" }}>
            <div className="px-7 py-8">
              <div className="inline-block bg-[#2ec97a]/20 text-[#2ec97a] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">Limited Access</div>
              <h1 className="text-2xl font-black text-white mb-2 leading-tight">
                Join Averis Academy
              </h1>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Learn affiliate marketing, build a digital business, and earn commissions every 6 months — all in one place.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[["Video Courses", "Learn at your pace"], ["Earn Commissions", "50% per referral"], ["6-Month Access", "₦35,000 one-time"]].map(([title, sub]) => (
                  <div key={title} className="bg-white/8 rounded-xl p-3 text-center">
                    <p className="text-white text-xs font-bold mb-0.5">{title}</p>
                    <p className="text-white/50 text-[10px]">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#122F38] mb-1">Get Access Now</h2>
            <p className="text-gray-500 text-sm mb-5">
              Enter your details and pay to get your personal signup link sent to your email.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handlePay} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name</label>
                  <input placeholder="John" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name</label>
                  <input placeholder="Doe" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} required />
                <p className="mt-1.5 text-[11px] text-gray-400">Your signup link will be sent to this email. Make sure it is correct.</p>
              </div>

              <div className="bg-[#f0f5f2] rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">6-Month Access</span>
                <span className="text-lg font-black text-[#122F38]">₦35,000</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-sm text-[#0d1f1a] transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(138deg, #2ec97a 0%, #40D457 100%)" }}
              >
                {loading ? "Redirecting to Payment…" : "Pay ₦35,000 & Get Access →"}
              </button>
            </form>

            <p className="text-center text-[11px] text-gray-400 mt-4">
              Secure payment via Korapay. After payment, check your email for your personal signup link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
