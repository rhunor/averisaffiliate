import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";

function makeToken(secret: string): string {
  const slot = Math.floor(Date.now() / (60 * 60 * 1000));
  return createHmac("sha256", secret).update(`lifetime-invite:${slot}`).digest("hex").slice(0, 40);
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const expected = process.env.SPECIAL_INVITE_CODE;

    if (!expected || !code || code.trim().toUpperCase() !== expected.trim().toUpperCase()) {
      return NextResponse.json({ error: "Invalid invite code." }, { status: 400 });
    }

    // Check capacity
    await dbConnect();
    const usedSlots = await User.countDocuments({ isLifetime: true });
    if (usedSlots >= 110) {
      return NextResponse.json({ error: "All free access spots have been claimed." }, { status: 400 });
    }

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!;
    const token = makeToken(secret);

    return NextResponse.json({ success: true, token, remaining: 110 - usedSlots });
  } catch (err) {
    console.error("[validate-invite]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
