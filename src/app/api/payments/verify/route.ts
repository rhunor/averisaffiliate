import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Referral from "@/models/Referral";
import Transaction from "@/models/Transaction";
import { verifyCharge } from "@/lib/korapay";
import { sendWelcomeEmail, sendPendingCommissionEmail } from "@/lib/email";
import { generateOrderId } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  const orderId = req.nextUrl.searchParams.get("orderId") || generateOrderId();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!reference) {
    return NextResponse.redirect(new URL("/pending-payment?error=missing_reference", appUrl));
  }

  try {
    await dbConnect();

    const existing = await Transaction.findOne({ paymentReference: reference });
    if (existing) {
      return NextResponse.redirect(new URL("/dashboard?activated=1", appUrl));
    }

    const verify = await verifyCharge(reference);
    if (!verify.data || verify.data.status !== "success") {
      return NextResponse.redirect(new URL("/pending-payment?error=payment_failed", appUrl));
    }

    const user = await User.findOne({ signupPaymentRef: reference });
    if (!user) {
      return NextResponse.redirect(new URL("/pending-payment?error=user_not_found", appUrl));
    }

    if (user.isActive) {
      return NextResponse.redirect(new URL("/dashboard", appUrl));
    }

    // Activate user — 6 month subscription
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    user.isActive = true;
    user.hasPaidSignup = true;
    user.subscriptionExpiresAt = sixMonthsFromNow;
    await user.save();

    // Record subscription transaction
    await Transaction.create({
      userId: user._id,
      type: "subscription",
      amount: siteConfig.signupFee,
      status: "completed",
      paymentReference: reference,
      orderId,
      description: "Averis Academy 6-Month Subscription",
    });

    // Handle referral commission
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        const commission = siteConfig.commission.newSubscription;

        const referral = await Referral.create({
          referrerId: referrer._id,
          referredUserId: user._id,
          status: "active",
        });

        await Transaction.create({
          userId: referrer._id,
          type: "commission",
          amount: commission,
          status: "pending",
          referralId: referral._id,
          sourceUserId: user._id,
          paymentReference: reference,
          orderId,
          description: `50% commission — ${user.firstName} ${user.lastName} subscribed`,
        });

        // Notify referrer: commission is pending, credits tomorrow
        sendPendingCommissionEmail({
          affiliateEmail: referrer.email,
          affiliateFirstName: referrer.firstName,
          buyerName: `${user.firstName} ${user.lastName}`,
          commissionAmount: commission,
          orderId,
          productName: "Averis Academy Subscription",
        }).catch(console.error);
      }
    }

    await sendWelcomeEmail(user.email, user.firstName, user.referralCode);

    return NextResponse.redirect(new URL("/dashboard?activated=1", appUrl));
  } catch (err) {
    console.error("[payments/verify]", err);
    return NextResponse.redirect(new URL("/pending-payment?error=server_error", appUrl));
  }
}
