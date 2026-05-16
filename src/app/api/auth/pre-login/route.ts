import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateOTP } from "@/lib/utils";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const knownDevice = user.knownDevices.find(
      (d: { ip: string; lastSeen: Date }) => d.ip === ip && d.lastSeen > thirtyDaysAgo
    );

    const otp = generateOTP();
    user.twoFAOTP = otp;
    user.twoFAOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, user.firstName, otp);

    return NextResponse.json({
      success: true,
      requiresOTP: true,
      knownDevice: !!knownDevice,
    });
  } catch (err) {
    console.error("[pre-login]", err);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
