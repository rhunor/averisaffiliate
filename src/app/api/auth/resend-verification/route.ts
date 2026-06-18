import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateSecureToken } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const sessionUser = session?.user as unknown as Record<string, unknown> | undefined;

    await dbConnect();

    let user;

    // Primary: look up by session user ID — always present in the JWT as token.sub,
    // regardless of when the user last logged in.
    if (sessionUser?.id) {
      user = await User.findById(sessionUser.id as string);
    }

    // Fallback: email from session or request body (covers unauthenticated edge cases)
    if (!user) {
      let email: string | undefined = sessionUser?.email as string | undefined;
      if (!email) {
        const body = await req.json().catch(() => ({}));
        email = (body as Record<string, unknown>).email as string | undefined;
      }
      if (email) user = await User.findOne({ email });
    }

    if (!user) return NextResponse.json({ success: true }); // silent — don't leak existence

    if (user.isEmailVerified) {
      return NextResponse.json({ error: "Email already verified." }, { status: 400 });
    }

    const token = generateSecureToken();
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.firstName, token);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[resend-verification]", err);
    return NextResponse.json({ error: "Failed to resend." }, { status: 500 });
  }
}
