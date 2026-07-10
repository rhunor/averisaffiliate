import mongoose from "mongoose";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { sendCommissionSettledEmail } from "@/lib/email";

/**
 * Settles pending commissions older than 24 hours for a specific user.
 * Called lazily when the user loads their earnings dashboard or attempts a withdrawal,
 * ensuring commissions are settled within 24–25 hours without needing a frequent cron.
 */
export async function autoSettleUserCommissions(userId: mongoose.Types.ObjectId | string): Promise<number> {
  const settleBefore = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const toSettle = await Transaction.find({
    userId,
    type: "commission",
    status: "pending",
    createdAt: { $lt: settleBefore },
  }).lean();

  if (toSettle.length === 0) return 0;

  await Transaction.updateMany(
    { userId, type: "commission", status: "pending", createdAt: { $lt: settleBefore } },
    { $set: { status: "completed" } }
  );

  const totalAmount = toSettle.reduce((sum, tx) => sum + tx.amount, 0);

  const user = await User.findById(userId, "firstName email").lean();
  if (user) {
    sendCommissionSettledEmail({
      email: user.email,
      firstName: user.firstName,
      amount: totalAmount,
    }).catch((e) => console.error("[autoSettle] email failed:", e));
  }

  return toSettle.length;
}
