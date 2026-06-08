import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PendingSignup from "@/models/PendingSignup";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ valid: false, error: "Missing token." });
  }

  try {
    await dbConnect();
    const pending = await PendingSignup.findOne({
      signupToken: token,
      paid: true,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!pending) {
      return NextResponse.json({ valid: false, error: "This link is invalid, has already been used, or has expired." });
    }

    return NextResponse.json({
      valid: true,
      email: pending.email,
      firstName: pending.firstName,
    });
  } catch (err) {
    console.error("[signup-token-info]", err);
    return NextResponse.json({ valid: false, error: "Failed to verify link." });
  }
}
