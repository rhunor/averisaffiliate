import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ForexPurchase from "@/models/ForexPurchase";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { verifyCharge } from "@/lib/korapay";
import { sendForexCourseAccessEmail, sendPendingCommissionEmail } from "@/lib/email";
import { generateOrderId } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

  if (!reference) {
    return NextResponse.redirect(new URL("/forex-income-blueprint?error=missing_reference", appUrl));
  }

  try {
    await dbConnect();

    // Verify with Korapay before touching the DB
    const verify = await verifyCharge(reference);
    if (!verify.data || verify.data.status !== "success") {
      return NextResponse.redirect(new URL("/forex-income-blueprint?error=payment_failed", appUrl));
    }

    // Atomic update — only mark paid if not already done (idempotency)
    const purchase = await ForexPurchase.findOneAndUpdate(
      { paymentReference: reference, paid: false },
      { $set: { paid: true } },
      { new: true }
    );

    if (!purchase) {
      // Already processed — idempotent redirect to success
      const existing = await ForexPurchase.findOne({ paymentReference: reference }).lean();
      if (existing && (existing as Record<string, unknown>).paid) {
        return NextResponse.redirect(new URL("/forex-income-blueprint?success=1", appUrl));
      }
      return NextResponse.redirect(new URL("/forex-income-blueprint?error=not_found", appUrl));
    }

    const orderId = generateOrderId();

    // Send course access email to buyer
    sendForexCourseAccessEmail({
      email: purchase.email,
      firstName: purchase.firstName,
      lastName: purchase.lastName,
      orderId,
    }).catch((e) => console.error("[forex/verify] access email failed:", e));

    purchase.accessEmailSent = true;

    // Credit affiliate commission
    if (purchase.affiliateUserId) {
      try {
        const referrer = await User.findById(purchase.affiliateUserId, "email firstName lastName");
        if (referrer) {
          // Check idempotency
          const existingTx = await Transaction.findOne({
            paymentReference: reference,
            type: "commission",
          });

          if (!existingTx) {
            await Transaction.create({
              userId: referrer._id,
              type: "commission",
              amount: siteConfig.forex.commission,
              status: "pending",
              referralId: null,
              sourceUserId: null,
              paymentReference: reference,
              orderId,
              description: `50% commission — ${purchase.firstName} ${purchase.lastName} bought Forex Income Blueprint`,
            });

            sendPendingCommissionEmail({
              affiliateEmail: referrer.email,
              affiliateName: `${referrer.firstName} ${referrer.lastName}`,
              buyerName: `${purchase.firstName} ${purchase.lastName}`,
              commissionAmount: siteConfig.forex.commission,
              orderId,
              productName: siteConfig.forex.productName,
            }).catch((e) => console.error("[forex/verify] commission email failed:", e));

            purchase.commissionCredited = true;
            purchase.commissionOrderId = orderId;
          }
        }
      } catch (commissionErr) {
        console.error("[forex/verify] commission error:", commissionErr);
      }
    }

    await purchase.save();

    return NextResponse.redirect(new URL("/forex-income-blueprint?success=1", appUrl));
  } catch (err) {
    console.error("[forex/verify]", err);
    return NextResponse.redirect(new URL("/forex-income-blueprint?error=server_error", appUrl));
  }
}
