import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateOTP } from "@/lib/utils";
import { sendOTPEmail } from "@/lib/email";

const DEVICE_COOKIE = "dt";

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

    // Admins skip OTP
    if (user.role === "admin") {
      return NextResponse.json({ success: true, requiresOTP: false });
    }

    // Check trusted device cookie — skip OTP if this browser was previously trusted
    const deviceToken = req.cookies.get(DEVICE_COOKIE)?.value;
    if (deviceToken) {
      const hash = crypto.createHash("sha256").update(deviceToken).digest("hex");
      const now = new Date();
      const trustedDevice = user.trustedDevices?.find(
        (d: { tokenHash: string; expiresAt: Date }) =>
          d.tokenHash === hash && new Date(d.expiresAt) > now
      );
      if (trustedDevice) {
        // Refresh the device record's last-seen implicitly (no save needed for just checking)
        return NextResponse.json({ success: true, requiresOTP: false });
      }
    }

    // Regular users — send OTP
    const otp = generateOTP();
    user.twoFAOTP = otp;
    user.twoFAOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, user.firstName, otp);

    return NextResponse.json({ success: true, requiresOTP: true });
  } catch (err) {
    console.error("[pre-login]", err);
    return NextResponse.json(
      { error: "Could not send verification code. Please try again." },
      { status: 500 }
    );
  }
}
