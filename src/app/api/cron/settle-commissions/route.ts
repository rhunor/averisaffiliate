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
    // Settle all pending commissions older than 24 hours
    const settleBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const result = await Transaction.updateMany(
      {
        type: "commission",
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
