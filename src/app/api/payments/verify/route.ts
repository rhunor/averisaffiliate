import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Referral from "@/models/Referral";
import Transaction from "@/models/Transaction";
import Product from "@/models/Product";
import AverisSubscriber from "@/models/AverisSubscriber";
import { verifyCharge } from "@/lib/korapay";
import { sendWelcomeEmail, sendPendingCommissionEmail } from "@/lib/email";
import { generateOrderId } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  const orderId = req.nextUrl.searchParams.get("orderId") || generateOrderId();
  const paymentType = req.nextUrl.searchParams.get("type");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

  if (!reference) {
    return NextResponse.redirect(new URL("/pending-payment?error=missing_reference", appUrl));
  }

  try {
    await dbConnect();

    // Idempotency: already processed
    const existing = await Transaction.findOne({ paymentReference: reference });
    if (existing) {
      return NextResponse.redirect(new URL("/payment-success", appUrl));
    }

    const verify = await verifyCharge(reference);
    if (!verify.data || verify.data.status !== "success") {
      return NextResponse.redirect(new URL("/pending-payment?error=payment_failed", appUrl));
    }

    const user = await User.findOne({ signupPaymentRef: reference });
    if (!user) {
      return NextResponse.redirect(new URL("/pending-payment?error=user_not_found", appUrl));
    }

    // Read payment context from URL params (avoids relying on Korapay metadata)
    const isRenewal = paymentType === "renewal";
    const productSlug = user.signupProductSlug || "averis-academy";
    const productId: string | null = null;

    // Look up product for commission amounts
    let productRecord: Record<string, unknown> | null = null;
    if (productSlug && productSlug !== "averis-academy") {
      productRecord = (await Product.findOne({ slug: productSlug }).lean()) as Record<string, unknown> | null;
    }

    const commissionAmount = isRenewal
      ? ((productRecord?.renewalCommissionAmount as number) ?? siteConfig.commission.renewal)
      : ((productRecord?.commissionAmount as number) ?? siteConfig.commission.newSubscription);

    const sixMonths = 180 * 24 * 60 * 60 * 1000;

    // ── RENEWAL ─────────────────────────────────────────────────────────────
    if (isRenewal) {
      const now = new Date();
      const currentExpiry = user.subscriptionExpiresAt
        ? new Date(Math.max(user.subscriptionExpiresAt.getTime(), now.getTime()))
        : now;
      const newExpiry = new Date(currentExpiry.getTime() + sixMonths);

      user.isActive = true;
      user.subscriptionExpiresAt = newExpiry;
      await user.save();

      // Record renewal transaction
      await Transaction.create({
        userId: user._id,
        type: "subscription",
        amount: isRenewal
          ? ((productRecord?.renewalPrice as number) ?? siteConfig.renewalFee)
          : siteConfig.signupFee,
        status: "completed",
        paymentReference: reference,
        orderId,
        description: "Averis Academy 6-Month Renewal",
      });

      // Sync bot AverisSubscriber record
      await AverisSubscriber.findOneAndUpdate(
        { averisUserId: user._id.toString() },
        {
          expiryDate: newExpiry,
          status: "active",
          removedAt: null,
          remindersSent: [],
        }
      ).catch(() => {});

      // Credit renewal commission to referrer (pending → settles next day)
      if (user.referredBy) {
        const referrer = await User.findById(user.referredBy);
        if (referrer) {
          await Transaction.create({
            userId: referrer._id,
            type: "commission",
            amount: commissionAmount,
            status: "pending",
            referralId: null,
            sourceUserId: user._id,
            productId: productId || null,
            paymentReference: reference,
            orderId,
            description: `50% renewal commission — ${user.firstName} ${user.lastName} renewed`,
          });

          // Update referral record to active and store commission (upsert covers edge case where record is missing)
          await Referral.findOneAndUpdate(
            { referrerId: referrer._id, referredUserId: user._id },
            { $set: { status: "active", commissionAmount, isRenewal: true }, $setOnInsert: { referrerId: referrer._id, referredUserId: user._id, productId: productId || null } },
            { upsert: true },
          );

          sendPendingCommissionEmail({
            affiliateEmail: referrer.email,
            affiliateFirstName: referrer.firstName,
            buyerName: `${user.firstName} ${user.lastName}`,
            commissionAmount,
            orderId,
            productName: productRecord?.name as string ?? "Averis Academy Renewal",
          }).catch(console.error);
        }
      }

      return NextResponse.redirect(new URL("/dashboard/subscription?renewed=1", appUrl));
    }

    // ── NEW SUBSCRIPTION ────────────────────────────────────────────────────
    if (user.isActive) {
      return NextResponse.redirect(new URL("/dashboard", appUrl));
    }

    const now = new Date();
    const newExpiry = new Date(now.getTime() + sixMonths);

    user.isActive = true;
    user.hasPaidSignup = true;
    user.subscriptionExpiresAt = newExpiry;
    await user.save();

    // Record subscription transaction
    await Transaction.create({
      userId: user._id,
      type: "subscription",
      amount: (productRecord?.price as number) ?? siteConfig.signupFee,
      status: "completed",
      paymentReference: reference,
      orderId,
      description: "Averis Academy 6-Month Subscription",
    });

    // Handle referral commission
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        const referral = await Referral.create({
          referrerId: referrer._id,
          referredUserId: user._id,
          productId: productId || null,
          status: "active",
          commissionAmount,
          isRenewal: false,
        });

        await Transaction.create({
          userId: referrer._id,
          type: "commission",
          amount: commissionAmount,
          status: "pending",
          referralId: referral._id,
          sourceUserId: user._id,
          productId: productId || null,
          paymentReference: reference,
          orderId,
          description: `50% commission — ${user.firstName} ${user.lastName} subscribed`,
        });

        sendPendingCommissionEmail({
          affiliateEmail: referrer.email,
          affiliateFirstName: referrer.firstName,
          buyerName: `${user.firstName} ${user.lastName}`,
          commissionAmount,
          orderId,
          productName: productRecord?.name as string ?? "Averis Academy",
        }).catch(console.error);
      }
    }

    await sendWelcomeEmail(user.email, user.firstName, user.referralCode);

    return NextResponse.redirect(new URL("/payment-success", appUrl));
  } catch (err) {
    console.error("[payments/verify]", err);
    return NextResponse.redirect(new URL("/pending-payment?error=server_error", appUrl));
  }
}
