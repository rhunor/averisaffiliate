import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 404 });
    }

    await sendWelcomeEmail(user.email, user.firstName, user.referralCode);

    return NextResponse.json({
      success: true,
      results: [`✓ Welcome email sent to ${user.firstName} (${user.email})`],
    });
  } catch (err) {
    console.error("[admin/tools/resend-welcome]", err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
