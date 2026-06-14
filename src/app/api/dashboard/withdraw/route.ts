import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Withdrawal from "@/models/Withdrawal";
import { resolveAccount } from "@/lib/korapay";
import { sendWithdrawalRequestEmail } from "@/lib/email";
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

    // Block if there's already a pending or processing withdrawal
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

    // Attempt account name resolution — warn only, never block
    let accountName: string = `${user.firstName} ${user.lastName}`;
    let nameVerified = false;
    try {
      const resolved = await resolveAccount(accountNumber, bankCode);
      accountName = resolved.accountName;
      nameVerified = true;
    } catch (resolveErr) {
      console.warn("[withdraw] Account resolution failed for bank", bankCode, "—", resolveErr instanceof Error ? resolveErr.message : resolveErr);
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

    // Save withdrawal as pending — admin will process manually
    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      bankName: bankName || bankCode,
      bankCode,
      accountNumber,
      accountName,
      status: "pending",
    });

    sendWithdrawalRequestEmail({
      email: user.email,
      firstName: user.firstName,
      amount,
      bankName: withdrawal.bankName,
      accountNumber,
      accountName,
      withdrawalId: withdrawal._id.toString(),
    }).catch(console.error);

    return NextResponse.json({ success: true, withdrawal });
  } catch (err) {
    console.error("[withdraw]", err);
    return NextResponse.json({ error: "Withdrawal failed." }, { status: 500 });
  }
}
