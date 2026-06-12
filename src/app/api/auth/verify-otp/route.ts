import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateSecureToken } from "@/lib/utils";

const DEVICE_COOKIE = "dt";
const TRUST_DAYS = 30;
const MAX_TRUSTED_DEVICES = 10;

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid code." }, { status: 400 });
    }

    if (
      !user.twoFAOTP ||
      user.twoFAOTP !== otp ||
      !user.twoFAOTPExpires ||
      user.twoFAOTPExpires < new Date()
    ) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const now = new Date();

    user.twoFAOTP = null;
    user.twoFAOTPExpires = null;

    // Update known IPs
    const existingDevice = user.knownDevices.find((d: { ip: string }) => d.ip === ip);
    if (existingDevice) {
      existingDevice.lastSeen = now;
    } else {
      user.knownDevices.push({ ip, lastSeen: now });
    }

    // Issue trusted device token — stored as a hash in DB, raw token in HttpOnly cookie
    const rawToken = generateSecureToken();
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(now.getTime() + TRUST_DAYS * 24 * 60 * 60 * 1000);

    // Prune expired trusted devices and enforce max count
    const validDevices = (user.trustedDevices || []).filter(
      (d: { tokenHash: string; expiresAt: Date }) => new Date(d.expiresAt) > now
    );
    if (validDevices.length >= MAX_TRUSTED_DEVICES) {
      validDevices.shift(); // remove oldest
    }
    validDevices.push({ tokenHash, createdAt: now, expiresAt });
    user.trustedDevices = validDevices;

    await user.save();

    const res = NextResponse.json({ success: true });
    res.cookies.set(DEVICE_COOKIE, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: TRUST_DAYS * 24 * 60 * 60,
    });
    return res;
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
