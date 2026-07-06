"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  payment_failed: "Your payment could not be verified. Please try again or email Averislimited@gmail.com.",
  missing_reference: "The payment reference is missing. Please start the process again.",
  not_found: "We could not find a registration record for this payment. Please email Averislimited@gmail.com.",
  server_error: "Something went wrong on our end. Please email Averislimited@gmail.com.",
};

function JoinContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMsg = error ? (ERROR_MESSAGES[error] || "An unexpected error occurred.") : null;

  return (
    <div className="w-full max-w-[400px] text-center">
      <a href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity mb-10">
        <svg width="44" height="34" viewBox="0 0 65 51" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="#122F38"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457"/>
        </svg>
        <div className="text-left">
          <div className="font-black text-[22px] text-[#122F38] leading-none tracking-[0.18em]">AVERIS</div>
          <div className="font-black text-[22px] text-[#122F38] leading-none tracking-[0.18em] mt-0.5">ACADEMY</div>
        </div>
      </a>

      {errorMsg ? (
        <>
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Payment Issue</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{errorMsg}</p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-[#122F38] mb-3">Join Averis Academy</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            To join, you need a referral link from an existing affiliate. Contact us if you need help getting started.
          </p>
        </>
      )}

      <a
        href="mailto:Averislimited@gmail.com"
        className="inline-block bg-[#122F38] text-white rounded-xl py-3 px-6 font-semibold text-sm hover:bg-[#1a4050] transition-colors"
      >
        Email Averislimited@gmail.com
      </a>

      <p className="mt-5 text-gray-400 text-xs">
        Already have an account?{" "}
        <a href="/login" className="text-[#40D457] font-semibold hover:underline">Sign In</a>
      </p>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 py-10">
      <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-2 border-[#122F38] border-t-transparent" />}>
        <JoinContent />
      </Suspense>
    </div>
  );
}
