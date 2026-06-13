import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import "@/models/Product"; // register Product model so populate("productId") works
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    const userId = new mongoose.Types.ObjectId(sessionUser.id as string);

    await dbConnect();

    const transactions = await Transaction.find({ userId, type: { $in: ["commission", "renewal_commission"] } })
      .sort({ createdAt: -1 })
      .populate("productId", "name")
      .lean();

    const totalEarnings = transactions.reduce((sum, tx) => sum + ((tx as Record<string, unknown>).amount as number), 0);
    const totalReferrals = transactions.filter((tx) => (tx as Record<string, unknown>).type === "commission").length;
    const totalRenewals = transactions.filter((tx) => (tx as Record<string, unknown>).type === "renewal_commission").length;

    const formatted = transactions.map((tx) => {
      const t = tx as Record<string, unknown>;
      return {
        _id: t._id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
        product: t.productId ? { name: (t.productId as Record<string, unknown>).name } : null,
      };
    });

    return NextResponse.json({
      stats: { totalEarnings, totalReferrals, totalRenewals },
      transactions: formatted,
    });
  } catch (err) {
    console.error("[earnings]", err);
    return NextResponse.json({ error: "Failed to load earnings." }, { status: 500 });
  }
}
