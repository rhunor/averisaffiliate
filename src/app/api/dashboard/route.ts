import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Referral from "@/models/Referral";
import Withdrawal from "@/models/Withdrawal";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    await dbConnect();

    const userId = sessionUser.id as string;
    const user = await User.findById(userId).lean();
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    // Earnings stats
    const [completedTransactions, pendingTransactions, referrals, withdrawals] = await Promise.all([
      Transaction.find({ userId, type: { $in: ["commission", "renewal_commission"] }, status: "completed" }).lean(),
      Transaction.find({ userId, type: { $in: ["commission", "renewal_commission"] }, status: "pending" }).lean(),
      Referral.find({ referrerId: userId })
        .populate("referredUserId", "firstName lastName email createdAt")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Withdrawal.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    const completedEarnings = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const pendingEarnings = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
    // Total earned shows all commissions immediately (pending + completed)
    const totalEarnings = completedEarnings + pendingEarnings;
    const pendingWithdrawals = withdrawals
      .filter((w) => w.status === "pending" || w.status === "processing")
      .reduce((sum, w) => sum + w.amount, 0);
    const totalWithdrawn = withdrawals
      .filter((w) => w.status === "completed")
      .reduce((sum, w) => sum + w.amount, 0);
    // Available balance only uses settled (completed) commissions
    const availableBalance = completedEarnings - totalWithdrawn - pendingWithdrawals;

    // 6-month earnings chart
    const now = new Date();
    const chartData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = month.toLocaleDateString("en-NG", { month: "short" });
      const earnings = completedTransactions
        .filter((t) => {
          const d = new Date(t.createdAt);
          return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
        })
        .reduce((sum, t) => sum + t.amount, 0);
      return { month: label, earnings };
    });

    return NextResponse.json({
      user: {
        firstName: (user as Record<string, unknown>).firstName,
        lastName: (user as Record<string, unknown>).lastName,
        email: (user as Record<string, unknown>).email,
        referralCode: (user as Record<string, unknown>).referralCode,
        profileImage: (user as Record<string, unknown>).profileImage,
        isEmailVerified: (user as Record<string, unknown>).isEmailVerified,
        subscriptionExpiresAt: (user as Record<string, unknown>).subscriptionExpiresAt,
        bankDetails: (user as Record<string, unknown>).bankDetails,
        telegramLinked: (user as Record<string, unknown>).telegramLinked,
      },
      stats: {
        totalEarnings,
        availableBalance: Math.max(0, availableBalance),
        pendingWithdrawals,
        totalWithdrawn,
        totalReferrals: referrals.length,
        activeReferrals: referrals.filter((r: Record<string, unknown>) => r.status === "active").length,
        pendingEarnings,
      },
      chartData,
      recentReferrals: referrals.slice(0, 10),
      recentWithdrawals: withdrawals.slice(0, 5),
    });
  } catch (err) {
    console.error("[dashboard]", err);
    return NextResponse.json({ error: "Failed to load dashboard." }, { status: 500 });
  }
}
