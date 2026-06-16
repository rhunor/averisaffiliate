import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { sendPendingCommissionEmail } from "@/lib/email";
import { generateOrderId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { affiliateEmail, buyerName, amount, productName, emailOnly, transactionId } = await req.json();

    if (!affiliateEmail || !buyerName || !amount) {
      return NextResponse.json({ error: "affiliateEmail, buyerName, and amount are required." }, { status: 400 });
    }

    await dbConnect();

    const affiliate = await User.findOne({ email: affiliateEmail.toLowerCase().trim() });
    if (!affiliate) {
      return NextResponse.json({ error: `No user found with email: ${affiliateEmail}` }, { status: 404 });
    }

    const orderId = generateOrderId();

    // emailOnly = just resend the email for an existing transaction, don't create a new one
    if (emailOnly && transactionId) {
      const tx = await Transaction.findById(transactionId);
      if (!tx) return NextResponse.json({ error: "Transaction not found." }, { status: 404 });

      await sendPendingCommissionEmail({
        affiliateEmail: affiliate.email,
        affiliateFirstName: affiliate.firstName,
        buyerName,
        commissionAmount: tx.amount,
        orderId: tx.orderId || orderId,
        productName: productName || "Averis Academy",
      });

      return NextResponse.json({ success: true, action: "email_resent" });
    }

    // Create a new commission transaction and send the email
    const transaction = await Transaction.create({
      userId: affiliate._id,
      type: "commission",
      amount: Number(amount),
      status: "pending",
      orderId,
      description: `50% commission — ${buyerName} subscribed (manually credited)`,
    });

    await sendPendingCommissionEmail({
      affiliateEmail: affiliate.email,
      affiliateFirstName: affiliate.firstName,
      buyerName,
      commissionAmount: Number(amount),
      orderId,
      productName: productName || "Averis Academy",
    });

    return NextResponse.json({ success: true, action: "credited", transaction });
  } catch (err) {
    console.error("[admin/commissions]", err);
    return NextResponse.json({ error: "Failed to credit commission." }, { status: 500 });
  }
}
