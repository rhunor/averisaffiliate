import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Withdrawal from "@/models/Withdrawal";
import User from "@/models/User";
import { verifyPaystackSignature } from "@/lib/paystack";
import { sendWithdrawalCompletedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  // Read raw body first — HMAC must be computed over the exact bytes Paystack sent.
  // Any re-serialisation (JSON.parse → JSON.stringify) would change the hash.
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!verifyPaystackSignature(rawBody, signature)) {
    console.warn("[paystack-webhook] Invalid signature — ignoring request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event: eventType, data } = event;

  // Only handle transfer events — acknowledge everything else quickly
  if (!eventType.startsWith("transfer.")) {
    return NextResponse.json({ received: true });
  }

  await dbConnect();

  const reference = data.reference as string;
  const transferCode = data.transfer_code as string;

  switch (eventType) {
    case "transfer.success": {
      const withdrawal = await Withdrawal.findOneAndUpdate(
        { transferReference: reference },
        { $set: { status: "completed", processedAt: new Date(), transferCode } },
        { new: true }
      );

      if (withdrawal) {
        const user = await User.findById(withdrawal.userId, "email firstName");
        if (user) {
          sendWithdrawalCompletedEmail({
            email: user.email,
            firstName: user.firstName,
            amount: withdrawal.amount,
            bankName: withdrawal.bankName,
            accountNumber: withdrawal.accountNumber,
          }).catch((e) => console.error("[paystack-webhook] completion email failed:", e));
        }
      }
      break;
    }

    case "transfer.failed": {
      await Withdrawal.findOneAndUpdate(
        { transferReference: reference },
        {
          $set: {
            status: "failed",
            rejectionReason: "Transfer failed — funds were not sent. Your balance has been restored.",
            processedAt: new Date(),
          },
        }
      );
      break;
    }

    case "transfer.reversed": {
      await Withdrawal.findOneAndUpdate(
        { transferReference: reference },
        {
          $set: {
            status: "failed",
            rejectionReason: "Transfer was reversed by the bank — funds have been returned to your balance.",
            processedAt: new Date(),
          },
        }
      );
      break;
    }

    default:
      break;
  }

  // Always return 200 promptly. Paystack retries if we don't respond within ~30s.
  return NextResponse.json({ received: true });
}
