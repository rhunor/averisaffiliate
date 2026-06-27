import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Withdrawal from "@/models/Withdrawal";
import {
  resolvePaystackAccount,
  createTransferRecipient,
  initiateTransfer,
} from "@/lib/paystack";
import { sendAdminWithdrawalNotificationEmail } from "@/lib/email";
import { siteConfig } from "@/config/site";
import { compareNames } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { amount, bankCode, bankName, accountNumber } = await req.json();

    if (!amount || !bankCode || !accountNumber) {
      return NextResponse.json({ error: "Amount, bank, and account number are required." }, { status: 400 });
    }

    if (amount < siteConfig.minWithdrawal) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ₦${siteConfig.minWithdrawal.toLocaleString()}.` },
        { status: 400 }
      );
    }

    const sessionUser = session.user as unknown as Record<string, unknown>;
    await dbConnect();

    const userId = sessionUser.id as string;
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    // Block if there is already a pending or processing withdrawal
    const activeWithdrawal = await Withdrawal.findOne({
      userId,
      status: { $in: ["pending", "processing"] },
    });
    if (activeWithdrawal) {
      return NextResponse.json({ error: "You already have a withdrawal in progress." }, { status: 400 });
    }

    // Calculate available balance
    const [earningsAgg, withdrawnAgg, processingAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: user._id, type: { $in: ["commission", "renewal_commission"] }, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Withdrawal.aggregate([
        { $match: { userId: user._id, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Withdrawal.aggregate([
        { $match: { userId: user._id, status: { $in: ["pending", "processing"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalEarned = earningsAgg[0]?.total || 0;
    const totalWithdrawn = withdrawnAgg[0]?.total || 0;
    const processingAmount = processingAgg[0]?.total || 0;
    const available = totalEarned - totalWithdrawn - processingAmount;

    if (amount > available) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ₦${available.toLocaleString()}.` },
        { status: 400 }
      );
    }

    // Resolve account name from Paystack (backend verification)
    let accountName: string = `${user.firstName} ${user.lastName}`;
    let nameVerified = false;
    try {
      const resolved = await resolvePaystackAccount(accountNumber, bankCode);
      accountName = resolved.accountName;
      nameVerified = true;
    } catch (resolveErr) {
      console.warn("[withdraw] Paystack account resolution failed:", resolveErr instanceof Error ? resolveErr.message : resolveErr);
    }

    if (nameVerified) {
      const averisName = `${user.firstName} ${user.lastName}`;
      const nameScore = compareNames(accountName, averisName);
      if (nameScore < 0.5) {
        return NextResponse.json(
          {
            error: `The bank account name "${accountName}" does not match the name on your Averis Academy account. Please use a bank account registered in your name.`,
          },
          { status: 400 }
        );
      }
    }

    // Create Paystack transfer recipient
    let recipientCode: string;
    try {
      recipientCode = await createTransferRecipient({
        name: accountName,
        accountNumber,
        bankCode,
      });
    } catch (recipientErr) {
      const msg = recipientErr instanceof Error ? recipientErr.message : String(recipientErr);
      console.error("[withdraw] Recipient creation failed:", msg);
      return NextResponse.json(
        { error: "Could not verify your bank account with our payment processor. Please check your details and try again." },
        { status: 400 }
      );
    }

    // Generate a unique idempotency reference (stored before calling Paystack so retries are safe)
    const transferReference = crypto.randomUUID().toLowerCase();

    // Save withdrawal record first — if Paystack call fails we mark it failed
    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      bankName: bankName || bankCode,
      bankCode,
      accountNumber,
      accountName,
      status: "pending",
      transferReference,
      paystackRecipientCode: recipientCode,
    });

    // Initiate the Paystack transfer
    try {
      const { transferCode } = await initiateTransfer({
        amountNaira: amount,
        recipientCode,
        reference: transferReference,
        reason: "Averis Academy affiliate payout",
      });

      withdrawal.transferCode = transferCode;
      withdrawal.status = "processing";
      await withdrawal.save();
    } catch (transferErr) {
      // Mark the withdrawal failed immediately so the user can try again
      withdrawal.status = "failed";
      withdrawal.rejectionReason = transferErr instanceof Error ? transferErr.message : "Transfer initiation failed";
      await withdrawal.save();

      const msg = transferErr instanceof Error ? transferErr.message : String(transferErr);
      console.error("[withdraw] Paystack transfer failed:", msg);

      // Surface a user-friendly version of common Paystack errors
      const userMsg = msg.toLowerCase().includes("insufficient")
        ? "Our payment processor has insufficient funds at this time. Please contact support."
        : "Transfer could not be initiated. Please try again or contact support.";

      return NextResponse.json({ error: userMsg }, { status: 400 });
    }

    // Admin notification (fire-and-forget)
    sendAdminWithdrawalNotificationEmail({
      affiliateName: `${user.firstName} ${user.lastName}`,
      affiliateEmail: user.email,
      amount,
      bankName: withdrawal.bankName,
      accountNumber,
      accountName,
      withdrawalId: withdrawal._id.toString(),
    }).catch(console.error);

    return NextResponse.json({ success: true, withdrawal });
  } catch (err) {
    console.error("[withdraw]", err);
    return NextResponse.json({ error: "Withdrawal failed. Please try again." }, { status: 500 });
  }
}
