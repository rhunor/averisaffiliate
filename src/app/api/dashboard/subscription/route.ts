import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    const userId = new mongoose.Types.ObjectId(sessionUser.id as string);

    await dbConnect();

    const user = await User.findById(userId)
      .select("firstName lastName email isActive subscriptionExpiresAt createdAt")
      .lean();

    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const u = user as Record<string, unknown>;
    const now = new Date();
    const expiresAt = u.subscriptionExpiresAt as Date | null;
    const daysLeft = expiresAt
      ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return NextResponse.json({
      isActive: u.isActive,
      subscriptionExpiresAt: expiresAt,
      daysLeft,
      isExpiringSoon: daysLeft > 0 && daysLeft <= 14,
    });
  } catch (err) {
    console.error("[subscription]", err);
    return NextResponse.json({ error: "Failed to load subscription." }, { status: 500 });
  }
}
