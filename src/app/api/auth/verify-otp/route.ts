import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

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

    const existingDevice = user.knownDevices.find((d: { ip: string }) => d.ip === ip);
    if (existingDevice) {
      existingDevice.lastSeen = now;
    } else {
      user.knownDevices.push({ ip, lastSeen: now });
    }

    await user.save();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
