import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateReferralCode(prefix: string = "AVR"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${code}`;
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `AVR-${timestamp}-${random}`;
}

export function isFriday(): boolean {
  const now = new Date();
  const watOffset = 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const watMinutes = (utcMinutes + watOffset) % (24 * 60);
  const watHour = Math.floor(watMinutes / 60);
  const watDay = new Date(now.getTime() + watOffset * 60 * 1000).getUTCDay();
  return watDay === 5 && watHour >= 8;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/**
 * Compares two names using Jaccard token similarity.
 * Handles: different word order, middle names, extra initials.
 * Returns a score between 0 (no overlap) and 1 (identical).
 * Threshold ≥ 0.5 means the same person.
 */
export function compareNames(nameA: string, nameB: string): number {
  const tokenize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 1); // drop single-letter initials

  const a = new Set(tokenize(nameA));
  const b = new Set(tokenize(nameB));
  if (a.size === 0 || b.size === 0) return 0;

  const intersection = [...a].filter((t) => b.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return intersection / union;
}
