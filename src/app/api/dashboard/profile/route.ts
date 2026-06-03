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
      .select("firstName lastName email referralCode bankDetails isEmailVerified profileImage")
      .lean();

    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    return NextResponse.json(user);
  } catch (err) {
    console.error("[profile]", err);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}
