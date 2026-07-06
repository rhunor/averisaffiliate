"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  const domain = email.includes("@") ? "@" + email.split("@")[1] : "";
  const masked = email.includes("@")
    ? email[0] + "***" + domain
    : email;

  return (
    <div className="w-full max-w-[400px] text-center">
      <div className="flex justify-center mb-8">
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

      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #0d2b20, #1a4d35)" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2ec97a" strokeWidth="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-[#122F38] mb-3">Check Your Email</h1>
      <p className="text-gray-600 text-sm leading-relaxed mb-2">
        Payment confirmed! We sent your personal signup link to:
      </p>
      <p className="font-semibold text-[#122F38] text-base mb-6">{masked}</p>

      <div className="bg-[#f0f5f2] rounded-xl p-4 text-left mb-6 space-y-2">
        {["Open the email from Averis Academy", "Click the signup link (valid for 7 days)", "Set your password and activate your account"].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "#122F38" }}>
              {i + 1}
            </div>
            <p className="text-sm text-gray-600">{step}</p>
          </div>
        ))}
      </div>

      <p className="text-gray-400 text-xs leading-relaxed mb-5">
        Not seeing it? Check your spam folder. The link is unique to your email and cannot be shared.
      </p>

      <p className="text-gray-400 text-xs">
        Need help?{" "}
        <a href="mailto:Averislimited@gmail.com" className="text-[#40D457] font-semibold hover:underline">
          Averislimited@gmail.com
        </a>
      </p>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 py-10">
      <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-2 border-[#122F38] border-t-transparent" />}>
        <CheckEmailContent />
      </Suspense>
    </div>
  );
}
