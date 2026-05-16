import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Referral from "@/models/Referral";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    const userId = new mongoose.Types.ObjectId(sessionUser.id as string);

    await dbConnect();

    const user = await User.findById(userId).select("referralCode").lean();
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const u = user as Record<string, unknown>;
    const referralCode = u.referralCode as string;
    const appUrl = process.env.NEXTAUTH_URL || "https://averisaffiliate.vercel.app";
    const referralLink = `${appUrl}/register?ref=${referralCode}`;

    const referrals = await Referral.find({ referrerId: userId })
      .sort({ createdAt: -1 })
      .populate("referredUserId", "firstName lastName email")
      .populate("productId", "name")
      .lean();

    const stats = {
      total: referrals.length,
      active: referrals.filter((r) => (r as Record<string, unknown>).status === "active").length,
      pending: referrals.filter((r) => (r as Record<string, unknown>).status === "pending").length,
      cancelled: referrals.filter((r) => (r as Record<string, unknown>).status === "cancelled").length,
    };

    const formatted = referrals.map((ref) => {
      const r = ref as Record<string, unknown>;
      return {
        _id: r._id,
        referredUserId: r.referredUserId,
        status: r.status,
        commissionAmount: r.commissionAmount ?? 0,
        createdAt: r.createdAt,
        product: r.productId ? { name: (r.productId as Record<string, unknown>).name } : null,
      };
    });

    return NextResponse.json({ referralCode, referralLink, stats, referrals: formatted });
  } catch (err) {
    console.error("[referrals]", err);
    return NextResponse.json({ error: "Failed to load referrals." }, { status: 500 });
  }
}
