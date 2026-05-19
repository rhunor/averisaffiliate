"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCredentials(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/pre-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid email or password"); return; }

      if (!data.requiresOTP) {
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        if (result?.error) { setError("Login failed. Please try again."); return; }
        router.push(callbackUrl);
        return;
      }

      setStep("otp");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOTP(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: form.otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid or expired code"); return; }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) { setError("Login failed. Please try again."); return; }
      router.push(callbackUrl);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {step === "credentials" ? (
        <form onSubmit={handleCredentials} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />
          <Input
            label="Password"
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-secondary-bright hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Continue
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOTP} className="space-y-4">
          <Input
            label="Verification Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "") })}
            className="text-center tracking-[0.5em] text-lg font-mono"
            required
          />
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Verify & Sign In
          </Button>
          <button
            type="button"
            onClick={() => setStep("credentials")}
            className="w-full text-sm text-white/60 hover:text-white text-center"
          >
            ← Back
          </button>
        </form>
      )}

      <p className="text-center text-sm text-white/50 mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-secondary-bright hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
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
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/60 text-sm mt-1">Sign in to your affiliate dashboard</p>
        </div>
        <Suspense fallback={<div className="glass rounded-2xl p-6 text-white/60 text-center">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
