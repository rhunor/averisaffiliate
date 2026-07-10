import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { sendCommissionSettledEmail } from "@/lib/email";

// Runs every 6 hours: 0 */6 * * *
// Marks pending commissions older than 24 hours as completed and notifies affiliates

async function handler(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();

    const settleBefore = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch before updating so we know who to email
    const toSettle = await Transaction.find({
      type: "commission",
      status: "pending",
      createdAt: { $lt: settleBefore },
    }).lean();

    if (toSettle.length === 0) {
      return NextResponse.json({ settled: 0, settledBefore: settleBefore.toISOString() });
    }

    const result = await Transaction.updateMany(
      { type: "commission", status: "pending", createdAt: { $lt: settleBefore } },
      { $set: { status: "completed" } }
    );

    // Group by userId and send one settlement email per affiliate
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
      }).catch((e) => console.error("[cron/settle-commissions] email failed:", e));
    }

    return NextResponse.json({
      settled: result.modifiedCount,
      settledBefore: settleBefore.toISOString(),
    });
  } catch (err) {
    console.error("[cron/settle-commissions]", err);
    return NextResponse.json({ error: "Settlement cron failed." }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
