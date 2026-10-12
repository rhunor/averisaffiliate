import { createHmac, timingSafeEqual } from "crypto";

// One-time 100% signup coupon: covers the first 12-month Averis Academy
// payment only. Accounts are normal (non-lifetime) subscriptions, so the
// expiry cron and the regular renewal flow bill them when the cycle ends.
export const SIGNUP_COUPON_CAPACITY = 100;

// How long the emailed registration link stays valid.
const LINK_TTL_MS = 48 * 60 * 60 * 1000;

export function getSignupCouponCode(): string | null {
  const code = process.env.SIGNUP_COUPON_CODE?.trim().toUpperCase();
  return code || null;
}

export function isValidSignupCoupon(code: unknown): boolean {
  const expected = getSignupCouponCode();
  return !!expected && typeof code === "string" && code.trim().toUpperCase() === expected;
}

// Token is bound to the coupon code, the email and an expiry, so a link can't
// be reused for a different email, and rotating SIGNUP_COUPON_CODE voids all
// outstanding links.
function sign(code: string, email: string, exp: number): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!;
  return createHmac("sha256", secret)
    .update(`signup-coupon:${code}:${email}:${exp}`)
    .digest("hex")
    .slice(0, 40);
}

export function createCouponToken(email: string): { token: string; exp: number } {
  const code = getSignupCouponCode()!;
  const exp = Date.now() + LINK_TTL_MS;
  return { token: sign(code, email, exp), exp };
}

export function verifyCouponToken(email: string, exp: number, token: string): boolean {
  const code = getSignupCouponCode();
  if (!code || !Number.isFinite(exp) || exp < Date.now() || typeof token !== "string") return false;
  const expected = Buffer.from(sign(code, email, exp));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
