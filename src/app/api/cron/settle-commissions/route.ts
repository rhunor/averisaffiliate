import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";

// Runs daily at 00:05 WAT (23:05 UTC previous day): 5 23 * * *
// Marks pending commissions from previous day as completed (D+1 settlement)

async function handler(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();

    const now = new Date();
    // Settle all pending commissions created before the start of today (midnight WAT = UTC-1 = 23:00 UTC previous day)
    const settleBefore = new Date(now);
    settleBefore.setUTCHours(0, 0, 0, 0); // midnight UTC today — anything older than today

    const result = await Transaction.updateMany(
      {
        type: { $in: ["commission", "renewal_commission"] },
        status: "pending",
        createdAt: { $lt: settleBefore },
      },
      { $set: { status: "completed" } }
    );

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
