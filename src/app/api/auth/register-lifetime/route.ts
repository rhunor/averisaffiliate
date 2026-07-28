import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateReferralCode, generateSecureToken } from "@/lib/utils";
import { sendVerificationEmail, sendBotActivationEmail } from "@/lib/email";

function isTokenValid(token: string, batch: number): boolean {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!;
  const slot = Math.floor(Date.now() / (60 * 60 * 1000));
  const prefix =
    batch === 2 ? "lifetime-invite-b2" :
    batch === 3 ? "lifetime-invite-b3" :
    "lifetime-invite";
  for (const s of [slot, slot - 1, slot - 2]) {
    const expected = createHmac("sha256", secret)
      .update(`${prefix}:${s}`)
      .digest("hex")
      .slice(0, 40);
    if (token === expected) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, inviteToken, batch } = await req.json();
    const batchNum = Number(batch) || 1;

    if (!firstName || !lastName || !email || !password || !inviteToken) {
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    }

    if (!isTokenValid(inviteToken, batchNum)) {
      return NextResponse.json({ error: "Invalid or expired invite session. Go back and re-enter your code." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ errors: { password: "Password must be at least 8 characters." } }, { status: 400 });
    }

    await dbConnect();

    // Capacity checks per batch
    if (batchNum === 2) {
      const usedSlots = await User.countDocuments({ isLifetime: true, inviteBatch: 2 });
      if (usedSlots >= 152) {
        return NextResponse.json({ error: "All free access spots have been claimed." }, { status: 400 });
      }
    } else if (batchNum === 3) {
      const usedSlots = await User.countDocuments({ isLifetime: true, inviteBatch: 3 });
      if (usedSlots >= 150) {
        return NextResponse.json({ error: "All free access spots have been claimed." }, { status: 400 });
      }
    } else {
      const usedSlots = await User.countDocuments({ isLifetime: true, inviteBatch: { $nin: [2, 3] } });
      if (usedSlots >= 110) {
        return NextResponse.json({ error: "All free access spots have been claimed." }, { status: 400 });
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ errors: { email: "An account with this email already exists." } }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateUniqueReferralCode();

    if (batchNum === 2 || batchNum === 3) {
      // Email confirmed at invite stage — mark verified immediately, send bot activation email
      await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        referralCode,
        isLifetime: true,
        inviteBatch: batchNum,
        isActive: true,
        hasPaidSignup: true,
        isEmailVerified: true,
      });

      await sendBotActivationEmail(email, firstName.trim(), referralCode);
    } else {
      const verificationToken = generateSecureToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await User.create({
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

      await sendVerificationEmail(email, firstName, verificationToken);
    }

    return NextResponse.json({ success: true }, { status: 201 });
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
