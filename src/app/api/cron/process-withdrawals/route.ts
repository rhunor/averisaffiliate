import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Withdrawal from "@/models/Withdrawal";
import Transaction from "@/models/Transaction";
import { initiatePayout, generatePayoutRef } from "@/lib/korapay";

async function handler(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();
    const pendingWithdrawals = await Withdrawal.find({ status: "pending" }).limit(50);
    const results = [];

    for (const withdrawal of pendingWithdrawals) {
      try {
        const payoutRef = generatePayoutRef(withdrawal._id.toString());
        const payout = await initiatePayout({
          reference: payoutRef,
          accountBank: withdrawal.bankCode,
          accountNumber: withdrawal.accountNumber,
          amount: withdrawal.amount,
          narration: `Averis Academy Withdrawal — ${withdrawal._id}`,
          beneficiaryName: withdrawal.accountName,
        });

        withdrawal.status = "processing";
        withdrawal.transferReference = payout.data?.reference || payoutRef;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        await Transaction.create({
          userId: withdrawal.userId,
          type: "withdrawal",
          amount: withdrawal.amount,
          status: "processing",
          description: `Withdrawal to ${withdrawal.bankName} — ${withdrawal.accountNumber}`,
          metadata: { withdrawalId: withdrawal._id.toString(), transferReference: withdrawal.transferReference },
        });

        results.push({ id: withdrawal._id, status: "processed" });
      } catch (err) {
        results.push({ id: withdrawal._id, status: "failed", error: String(err) });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (err) {
    console.error("[cron/process-withdrawals]", err);
    return NextResponse.json({ error: "Cron failed." }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
