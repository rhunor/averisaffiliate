import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { sendCommissionSettledEmail } from "@/lib/email";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    await dbConnect();

    const settleBefore = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch before updating so we know who to email
    const toSettle = await Transaction.find({
      type: "commission",
      status: "pending",
      createdAt: { $lt: settleBefore },
    }).lean();

    const result = await Transaction.updateMany(
      { type: "commission", status: "pending", createdAt: { $lt: settleBefore } },
      { $set: { status: "completed" } }
    );

    // Group by userId and send one settlement email per affiliate
    if (toSettle.length > 0) {
      const userTotals = new Map<string, number>();
      for (const tx of toSettle) {
        const uid = tx.userId.toString();
        userTotals.set(uid, (userTotals.get(uid) ?? 0) + tx.amount);
      }
      const userIds = Array.from(userTotals.keys());
      const users = await User.find({ _id: { $in: userIds } }, "firstName email").lean();
      for (const u of users) {
        const uid = u._id.toString();
        sendCommissionSettledEmail({
          email: u.email,
          firstName: u.firstName,
          amount: userTotals.get(uid) ?? 0,
        }).catch((e) => console.error("[settle-commissions] email failed:", e));
      }
    }

    const results = [
      result.modifiedCount > 0
        ? `✓ Settled ${result.modifiedCount} pending commission${result.modifiedCount === 1 ? "" : "s"} (older than 24 hours)`
        : "– No pending commissions older than 24 hours found",
      `  Cutoff: ${settleBefore.toLocaleString("en-NG", { timeZone: "Africa/Lagos" })} WAT`,
    ];

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("[admin/settle-commissions]", err);
    return NextResponse.json({ error: "Settlement failed." }, { status: 500 });
  }
}
