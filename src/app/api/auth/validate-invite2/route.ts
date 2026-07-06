import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendSpecialAccessInstructionsEmail } from "@/lib/email";

const BATCH = 2;
const CAPACITY = 152;

function makeToken(secret: string): string {
  const slot = Math.floor(Date.now() / (60 * 60 * 1000));
  return createHmac("sha256", secret).update(`lifetime-invite-b2:${slot}`).digest("hex").slice(0, 40);
}

export async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      return NextResponse.json({ error: "Invite code and email are required." }, { status: 400 });
    }

    const expected = process.env.SPECIAL_INVITE_CODE_2;
    if (!expected || code.trim().toUpperCase() !== expected.trim().toUpperCase()) {
      return NextResponse.json({ error: "Invalid invite code." }, { status: 400 });
    }

    await dbConnect();

    const usedSlots = await User.countDocuments({ isLifetime: true, inviteBatch: BATCH });
    if (usedSlots >= CAPACITY) {
      return NextResponse.json({ error: "All free access spots have been claimed." }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!;
    const token = makeToken(secret);
    const registrationLink = `${appUrl}/register-lifetime?token=${token}&email=${encodeURIComponent(email.toLowerCase().trim())}&batch=2`;

    await sendSpecialAccessInstructionsEmail(email.toLowerCase().trim(), registrationLink);

    return NextResponse.json({ success: true, remaining: CAPACITY - usedSlots });
  } catch (err) {
    console.error("[validate-invite2]", err);
    return NextResponse.json({ error: "Failed. Please try again." }, { status: 500 });
  }
}
