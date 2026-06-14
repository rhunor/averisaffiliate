import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Withdrawal from "@/models/Withdrawal";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { sendWithdrawalCompletedEmail } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await params;
    const { action, rejectionReason, transferReference } = await req.json();
    const sessionUser = session.user as unknown as Record<string, unknown>;

    await dbConnect();
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) return NextResponse.json({ error: "Withdrawal not found." }, { status: 404 });

    if (action === "approve") {
      if (withdrawal.status !== "pending") {
        return NextResponse.json({ error: "Can only approve pending withdrawals." }, { status: 400 });
      }

      // Mark as completed — admin has already sent the money manually
      withdrawal.status = "completed";
      withdrawal.transferReference = transferReference || null;
      withdrawal.processedAt = new Date();
      withdrawal.processedBy = sessionUser.id as unknown as typeof withdrawal.processedBy;
      await withdrawal.save();

      // Record in transactions so balance updates immediately
      await Transaction.create({
        userId: withdrawal.userId,
        type: "withdrawal",
        amount: withdrawal.amount,
        status: "completed",
        description: `Withdrawal to ${withdrawal.bankName} — ${withdrawal.accountNumber}`,
        metadata: { withdrawalId: id, transferReference: transferReference || null },
      });

      // Notify the affiliate
      const user = await User.findById(withdrawal.userId).select("email firstName").lean() as { email: string; firstName: string } | null;
      if (user) {
        sendWithdrawalCompletedEmail({
          email: user.email,
          firstName: user.firstName,
          amount: withdrawal.amount,
          bankName: withdrawal.bankName,
          accountNumber: withdrawal.accountNumber,
        }).catch(console.error);
      }

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
