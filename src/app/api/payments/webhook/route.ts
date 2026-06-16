import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Referral from "@/models/Referral";
import Transaction from "@/models/Transaction";
import Product from "@/models/Product";
import AverisSubscriber from "@/models/AverisSubscriber";
import { sendWelcomeEmail, sendPendingCommissionEmail } from "@/lib/email";
import { generateOrderId } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.KORAPAY_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  // Read raw body before parsing — signature must be verified against exact bytes sent
  const rawBody = await req.text();

  const signature =
    req.headers.get("x-korapay-signature") ||
    req.headers.get("x-kora-signature") ||
    "";

  if (WEBHOOK_SECRET) {
    const expected = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    try {
      const sigBuf = Buffer.from(signature, "hex");
      const expBuf = Buffer.from(expected, "hex");
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        console.warn("[webhook] Invalid signature — request rejected");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } catch {
      console.warn("[webhook] Signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Only process successful charges
  if (payload.event !== "charge.success") {
    return NextResponse.json({ ok: true });
  }

  const data = payload.data as Record<string, unknown> | undefined;
  const reference = data?.reference as string | undefined;

  if (!reference) {
    console.warn("[webhook] charge.success with no reference");
    return NextResponse.json({ ok: true });
  }

  try {
    await dbConnect();

    // Idempotency — if this reference was already processed, do nothing
    const existing = await Transaction.findOne({ paymentReference: reference });
    if (existing) {
      console.log("[webhook] Already processed reference:", reference);
      return NextResponse.json({ ok: true });
    }

    const user = await User.findOne({ signupPaymentRef: reference });
    if (!user) {
      console.warn("[webhook] No user found for reference:", reference);
      return NextResponse.json({ ok: true });
    }

    const orderId = generateOrderId();
    const productSlug = user.signupProductSlug || "averis-academy";
    const productId: string | null = null;

    let productRecord: Record<string, unknown> | null = null;
    if (productSlug && productSlug !== "averis-academy") {
      productRecord = (await Product.findOne({ slug: productSlug }).lean()) as Record<string, unknown> | null;
    }

    // Determine new vs renewal by whether the user has already paid signup
    const isRenewal = user.hasPaidSignup === true;

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

      await Transaction.create({
        userId: user._id,
        type: "subscription",
        amount: (productRecord?.renewalPrice as number) ?? siteConfig.renewalFee,
        status: "completed",
        paymentReference: reference,
        orderId,
        description: "Averis Academy 6-Month Renewal",
      });

      await AverisSubscriber.findOneAndUpdate(
        { averisUserId: user._id.toString() },
        { expiryDate: newExpiry, status: "active", removedAt: null, remindersSent: [] }
      ).catch(() => {});

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

          await Referral.findOneAndUpdate(
            { referrerId: referrer._id, referredUserId: user._id },
            { $set: { status: "active", commissionAmount, isRenewal: true }, $setOnInsert: { referrerId: referrer._id, referredUserId: user._id, productId: null } },
            { upsert: true }
          );

          sendPendingCommissionEmail({
            affiliateEmail: referrer.email,
            affiliateFirstName: referrer.firstName,
            buyerName: `${user.firstName} ${user.lastName}`,
            commissionAmount,
            orderId,
            productName: (productRecord?.name as string) ?? "Averis Academy Renewal",
          }).catch(console.error);
        }
      }

      console.log("[webhook] Renewal processed for", user.email, "ref:", reference);
      return NextResponse.json({ ok: true });
    }

    // ── NEW SUBSCRIPTION ────────────────────────────────────────────────────
    if (user.isActive) {
      console.log("[webhook] User already active, skipping:", user.email);
      return NextResponse.json({ ok: true });
    }

    const now = new Date();
    const newExpiry = new Date(now.getTime() + sixMonths);

    user.isActive = true;
    user.hasPaidSignup = true;
    user.subscriptionExpiresAt = newExpiry;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: "subscription",
      amount: (productRecord?.price as number) ?? siteConfig.signupFee,
      status: "completed",
      paymentReference: reference,
      orderId,
      description: "Averis Academy 6-Month Subscription",
    });

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
          productName: (productRecord?.name as string) ?? "Averis Academy",
        }).catch(console.error);
      }
    }

    await sendWelcomeEmail(user.email, user.firstName, user.referralCode);
    console.log("[webhook] New subscription processed for", user.email, "ref:", reference);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook] Error processing payment:", err);
    // Return 500 so Korapay retries the webhook
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
