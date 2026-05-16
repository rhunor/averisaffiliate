import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateSecureToken } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    let email: string | undefined;

    if (session?.user?.email) {
      email = session.user.email;
    } else {
      const body = await req.json().catch(() => ({}));
      email = body.email;
    }

    if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });

    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ success: true }); // silent for security

    if (user.isEmailVerified) {
      return NextResponse.json({ error: "Email already verified." }, { status: 400 });
    }

    const token = generateSecureToken();
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, user.firstName, token);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[resend-verification]", err);
    return NextResponse.json({ error: "Failed to resend." }, { status: 500 });
  }
}
