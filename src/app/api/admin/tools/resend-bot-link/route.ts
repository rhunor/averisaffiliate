import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendBotActivationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.isLifetime) {
      return NextResponse.json({ error: "This is only for lifetime access users." }, { status: 400 });
    }

    await sendBotActivationEmail(user.email, user.firstName, user.referralCode);

    return NextResponse.json({
      success: true,
      message: `Bot link email sent to ${user.firstName} (${user.email})`,
    });
  } catch (err) {
    console.error("[admin/tools/resend-bot-link]", err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
