"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
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
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <span className="text-secondary-bright font-bold text-xl">Averis</span>
              <span className="text-white font-semibold text-xl"> Academy</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot your password?</h1>
          <p className="text-white/60 text-sm mt-1">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-success" />
              </div>
              <h2 className="text-white font-semibold mb-2">Check your email</h2>
              <p className="text-white/60 text-sm">
                If an account exists for <strong className="text-white">{email}</strong>, you&apos;ll receive a reset link shortly.
              </p>
              <Link href="/login" className="block mt-6 text-sm text-secondary-bright hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                  required
                />
                <Button type="submit" size="lg" loading={loading} className="w-full">
                  Send Reset Link
                </Button>
              </form>
              <Link href="/login" className="block text-center mt-4 text-sm text-white/60 hover:text-white">
                ← Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
