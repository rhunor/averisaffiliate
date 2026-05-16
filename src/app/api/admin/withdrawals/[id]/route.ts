import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Withdrawal from "@/models/Withdrawal";
import Transaction from "@/models/Transaction";
import { initiatePayout, generatePayoutRef } from "@/lib/korapay";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await params;
    const { action, rejectionReason } = await req.json();
    const sessionUser = session.user as unknown as Record<string, unknown>;

    await dbConnect();
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) return NextResponse.json({ error: "Withdrawal not found." }, { status: 404 });

    if (action === "approve") {
      if (withdrawal.status !== "pending") {
        return NextResponse.json({ error: "Can only approve pending withdrawals." }, { status: 400 });
      }

      const payoutRef = generatePayoutRef(id);
      const payout = await initiatePayout({
        reference: payoutRef,
        accountBank: withdrawal.bankCode,
        accountNumber: withdrawal.accountNumber,
        amount: withdrawal.amount,
        narration: `Averis Academy Withdrawal — ${id}`,
        beneficiaryName: withdrawal.accountName,
      });

      withdrawal.status = "processing";
      withdrawal.transferReference = payout.data?.reference || payoutRef;
      withdrawal.processedAt = new Date();
      withdrawal.processedBy = sessionUser.id as unknown as typeof withdrawal.processedBy;
      await withdrawal.save();

      await Transaction.create({
        userId: withdrawal.userId,
        type: "withdrawal",
        amount: withdrawal.amount,
        status: "processing",
        description: `Withdrawal to ${withdrawal.bankName} — ${withdrawal.accountNumber}`,
        metadata: { withdrawalId: id, transferReference: withdrawal.transferReference },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      withdrawal.status = "rejected";
      withdrawal.rejectionReason = rejectionReason || "Rejected by admin";
      withdrawal.processedAt = new Date();
      withdrawal.processedBy = sessionUser.id as unknown as typeof withdrawal.processedBy;
      await withdrawal.save();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("[admin/withdrawals/id]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
