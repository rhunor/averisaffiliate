"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    referralCode: refCode,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    <div className="glass rounded-2xl p-6">
      {errors.root && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
          {errors.root}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            error={errors.firstName}
            leftIcon={<User className="h-4 w-4" />}
            required
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            error={errors.lastName}
            required
          />
        </div>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />
        <Input
          label="Password"
          type={showPass ? "text" : "password"}
          placeholder="Min. 8 chars with uppercase & number"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          required
        />
        <Input
          label="Referral Code (optional)"
          placeholder="AVR-XXXXXX"
          value={form.referralCode}
          onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
          hint="Enter the referral code of the person who invited you"
        />
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>
      <p className="text-center text-sm text-white/50 mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-secondary-bright hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
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
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/60 text-sm mt-1">Start learning and earning 50% commissions</p>
        </div>
        <Suspense fallback={<div className="glass rounded-2xl p-6 text-white/60 text-center">Loading…</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
