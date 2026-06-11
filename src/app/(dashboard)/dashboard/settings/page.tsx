"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { User, Lock, CreditCard, CheckCircle, AlertCircle, Eye, EyeOff, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

interface Bank { name: string; code: string; }

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  profileImage: string | null;
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
  const { update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarMsg, setAvatarMsg] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Bank state
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
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
        setPreviewUrl(p.profileImage || null);
        if (p.bankDetails) {
          setBankCode(p.bankDetails.bankCode || "");
          setAccountNumber(p.bankDetails.accountNumber || "");
        }
      }
      if (b?.banks) setBanks(b.banks);
    }).finally(() => setLoading(false));
  }, []);

  // Auto-detect account name when 10-digit account + bank are both set
  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) {
      setResolvedName(null);
      setResolveError("");
      return;
    }
    let cancelled = false;
    setResolving(true);
    setResolvedName(null);
    setResolveError("");
    const timer = setTimeout(() => {
      fetch("/api/banks/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankCode, accountNumber }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          if (d.accountName) setResolvedName(d.accountName);
          else setResolveError(d.error || "Could not verify account.");
        })
        .catch(() => { if (!cancelled) setResolveError("Network error — check your connection."); })
        .finally(() => { if (!cancelled) setResolving(false); });
    }, 600);
    return () => { cancelled = true; clearTimeout(timer); setResolving(false); };
  }, [accountNumber, bankCode]);

  function handleBankChange(code: string) {
    setBankCode(code);
    setBankName(banks.find((b) => b.code === code)?.name || "");
  }

  function compressImage(file: File, maxPx = 900, quality = 0.82): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
          else { width = Math.round((width * maxPx) / height); height = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
      img.src = url;
    });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setAvatarMsg({ msg: "Only JPG, PNG, WebP or GIF files are supported.", type: "error" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarMsg({ msg: "Photo must be under 10MB.", type: "error" });
      return;
    }

    setUploadingAvatar(true);
    setAvatarMsg(null);

    try {
      // Compress + resize before encoding so the payload stays well under 1MB
      const compressed = await compressImage(file);
      setPreviewUrl(compressed);

      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upload_avatar", imageBase64: compressed }),
      });
      const json = await res.json();

      if (res.ok) {
        setPreviewUrl(json.profileImage);
        setProfile((prev) => prev ? { ...prev, profileImage: json.profileImage } : prev);
        setAvatarMsg({ msg: "Profile photo updated successfully.", type: "success" });
        await update({ profileImage: json.profileImage });
      } else {
        setAvatarMsg({ msg: json.error || "Upload failed. Please try again.", type: "error" });
        setPreviewUrl(profile?.profileImage || null);
      }
    } catch {
      setAvatarMsg({ msg: "Something went wrong. Please try again.", type: "error" });
      setPreviewUrl(profile?.profileImage || null);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
          <div className="relative shrink-0">
            <div
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center overflow-hidden cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change photo"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-lg font-bold">{getInitials(`${profile.firstName} ${profile.lastName}`)}</span>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera className="h-4 w-4 text-white" />
                }
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-semibold text-foreground">{profile.firstName} {profile.lastName}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-xs font-mono text-secondary mt-0.5">{profile.referralCode}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {uploadingAvatar ? "Uploading…" : "Tap photo to change"}
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">JPG · PNG · WebP · max 10MB</p>
          </div>
        </CardContent>
        {avatarMsg && (
          <CardContent className="pt-0 pb-4">
            <Toast {...avatarMsg} />
          </CardContent>
        )}
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
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="0123456789"
                required
                maxLength={10}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>

            {/* Account resolution feedback */}
            {resolving && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                Verifying account…
              </div>
            )}
            {resolvedName && !resolving && (
              <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl px-3 py-2.5 text-sm">
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
                <span className="text-success font-semibold">{resolvedName}</span>
              </div>
            )}
            {resolveError && !resolving && (
              <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-3 py-2.5 text-sm">
                <AlertCircle className="h-4 w-4 text-danger shrink-0" />
                <span className="text-danger">{resolveError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={savingBank || resolving || (accountNumber.length === 10 && !!bankCode && !resolvedName)}
              className="bg-secondary hover:bg-secondary-dark text-white font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-60 text-sm"
            >
              {savingBank ? "Saving…" : "Update bank details"}
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
