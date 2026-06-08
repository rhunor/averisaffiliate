import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateReferralCode, generateSecureToken } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";

function isTokenValid(token: string): boolean {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!;
  const slot = Math.floor(Date.now() / (60 * 60 * 1000));
  for (const s of [slot, slot - 1, slot - 2]) {
    const expected = createHmac("sha256", secret)
      .update(`lifetime-invite:${s}`)
      .digest("hex")
      .slice(0, 40);
    if (token === expected) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, inviteToken } = await req.json();

    if (!firstName || !lastName || !email || !password || !inviteToken) {
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    }

    if (!isTokenValid(inviteToken)) {
      return NextResponse.json({ error: "Invalid or expired invite session. Go back and re-enter your code." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ errors: { password: "Password must be at least 8 characters." } }, { status: 400 });
    }

    await dbConnect();

    // Check capacity again
    const usedSlots = await User.countDocuments({ isLifetime: true });
    if (usedSlots >= 110) {
      return NextResponse.json({ error: "All free access spots have been claimed." }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ errors: { email: "An account with this email already exists." } }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateUniqueReferralCode();
    const verificationToken = generateSecureToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      referralCode,
      isLifetime: true,
      isActive: true,
      hasPaidSignup: true,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Still send verification email so the user confirms ownership, but account is already active
    await sendVerificationEmail(email, firstName, verificationToken);

    return NextResponse.json({ success: true, userId: user._id.toString() }, { status: 201 });
  } catch (err) {
    console.error("[register-lifetime]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}

async function generateUniqueReferralCode(): Promise<string> {
  let code: string;
  let exists = true;
  do {
    code = generateReferralCode("AVR");
    exists = !!(await User.findOne({ referralCode: code }));
  } while (exists);
  return code;
}
