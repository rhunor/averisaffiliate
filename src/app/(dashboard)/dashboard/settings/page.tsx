"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, Lock, CreditCard, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

interface Bank { name: string; code: string; }

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  bankDetails: { bankName: string; bankCode: string; accountNumber: string; accountName: string } | null;
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
      type === "success" ? "bg-success/10 border border-success/20 text-success" : "bg-danger/10 border border-danger/20 text-danger"
    }`}>
      {type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      {msg}
    </div>
  );
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const sessionUser = session?.user as unknown as Record<string, unknown>;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Bank state
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankMsg, setBankMsg] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [savingBank, setSavingBank] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/profile").then((r) => r.json()),
      fetch("/api/banks").then((r) => r.json()),
    ]).then(([p, b]) => {
      if (p) {
        setProfile(p);
        setFirstName(p.firstName);
        setLastName(p.lastName);
        if (p.bankDetails) {
          setBankCode(p.bankDetails.bankCode || "");
          setAccountNumber(p.bankDetails.accountNumber || "");
        }
      }
      if (b?.banks) setBanks(b.banks);
    }).finally(() => setLoading(false));
  }, []);

  function handleBankChange(code: string) {
    setBankCode(code);
    setBankName(banks.find((b) => b.code === code)?.name || "");
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", firstName, lastName }),
      });
      const json = await res.json();
      if (res.ok) {
        setProfileMsg({ msg: "Profile updated successfully.", type: "success" });
        await update();
      } else {
        setProfileMsg({ msg: json.error || "Update failed.", type: "error" });
      }
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveBank(e: React.FormEvent) {
    e.preventDefault();
    setSavingBank(true);
    setBankMsg(null);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_bank", bankCode, bankName, accountNumber }),
      });
      const json = await res.json();
      if (res.ok) {
        setBankMsg({ msg: "Bank details updated. A security alert has been sent to your email.", type: "success" });
        setProfile((prev) => prev ? { ...prev, bankDetails: json.bankDetails } : prev);
      } else {
        setBankMsg({ msg: json.error || "Update failed.", type: "error" });
      }
    } finally {
      setSavingBank(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 8) {
      setPwMsg({ msg: "New password must be at least 8 characters.", type: "error" });
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", currentPassword, newPassword }),
      });
      const json = await res.json();
      if (res.ok) {
        setPwMsg({ msg: "Password changed. All devices have been logged out.", type: "success" });
        setCurrentPassword(""); setNewPassword("");
      } else {
        setPwMsg({ msg: json.error || "Password change failed.", type: "error" });
      }
    } finally {
      setSavingPw(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account details</p>
      </div>

      {/* Avatar + code */}
      <Card>
        <CardContent className="pt-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-white text-lg font-bold">{getInitials(`${profile.firstName} ${profile.lastName}`)}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{profile.firstName} {profile.lastName}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-xs font-mono text-secondary mt-0.5">{profile.referralCode}</p>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            {profileMsg && <Toast {...profileMsg} />}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">First name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Last name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
              <input
                value={profile.email}
                disabled
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-secondary hover:bg-secondary-dark text-white font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-60 text-sm"
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Bank details form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <CardTitle>Bank Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveBank} className="space-y-4">
            {bankMsg && <Toast {...bankMsg} />}
            {profile.bankDetails && (
              <div className="bg-muted rounded-xl px-4 py-3 text-sm">
                <p className="text-muted-foreground text-xs mb-1">Current bank</p>
                <p className="font-medium text-foreground">{profile.bankDetails.accountName}</p>
                <p className="text-muted-foreground">{profile.bankDetails.bankName} · {profile.bankDetails.accountNumber}</p>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Bank</label>
              <select
                value={bankCode}
                onChange={(e) => handleBankChange(e.target.value)}
                required
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                <option value="">Select bank…</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Account number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="0123456789"
                required
                maxLength={10}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <button
              type="submit"
              disabled={savingBank}
              className="bg-secondary hover:bg-secondary-dark text-white font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-60 text-sm"
            >
              {savingBank ? "Verifying & saving…" : "Update bank details"}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Password form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <CardTitle>Change Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePassword} className="space-y-4">
            {pwMsg && <Toast {...pwMsg} />}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Current password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={savingPw}
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-60 text-sm"
            >
              {savingPw ? "Changing…" : "Change password"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
