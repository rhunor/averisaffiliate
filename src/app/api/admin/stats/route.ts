import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Withdrawal from "@/models/Withdrawal";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    await dbConnect();

    const [totalUsers, activeUsers, pendingWithdrawals, totalRevenue] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Withdrawal.countDocuments({ status: "pending" }),
      Transaction.aggregate([
        { $match: { type: "subscription", status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const commissionsPaid = await Transaction.aggregate([
      { $match: { type: "commission", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const recentUsers = await User.find()
      .select("firstName lastName email isActive createdAt referralCode")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        pendingWithdrawals,
        totalRevenue: totalRevenue[0]?.total || 0,
        commissionsPaid: commissionsPaid[0]?.total || 0,
      },
      recentUsers,
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    return NextResponse.json({ error: "Failed to load stats." }, { status: 500 });
  }
}
