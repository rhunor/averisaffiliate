"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Reset failed"); return; }
      router.push("/login?reset=1");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md w-full">
          <p className="text-danger mb-4">Invalid or missing reset token.</p>
          <Link href="/forgot-password" className="text-secondary-bright hover:underline text-sm">
            Request a new link
          </Link>
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-white">Set new password</h1>
          <p className="text-white/60 text-sm mt-1">Choose a strong password for your account</p>
        </div>

        <div className="glass rounded-2xl p-6">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type={showPass ? "text" : "password"}
              placeholder="Min. 8 chars with uppercase & number"
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
            <Input
              label="Confirm Password"
              type={showPass ? "text" : "password"}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />
            <Button type="submit" size="lg" loading={loading} className="w-full">
              Reset Password
            </Button>
          </form>
          <Link href="/login" className="block text-center mt-4 text-sm text-white/60 hover:text-white">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
