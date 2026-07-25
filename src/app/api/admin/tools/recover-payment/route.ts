import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import type { Types } from "mongoose";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PendingSignup from "@/models/PendingSignup";
import Transaction from "@/models/Transaction";
import { verifyCharge } from "@/lib/korapay";
import { sendPaidSignupLinkEmail, sendPendingCommissionEmail } from "@/lib/email";
import { generateOrderId } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/tools/recover-payment
 *
 * Manually recover a payment where the user paid on Korapay but no account
 * or signup link was created (e.g. bank-transfer redirect failure, reference
 * mismatch, etc.).
 *
 * Body: {
 *   korapayReference: string   — the Korapay charge reference to verify
 *   email: string              — buyer's email
 *   firstName: string          — buyer's first name
 *   lastName: string           — buyer's last name
 *   affiliateCode?: string     — affiliate referral code (e.g. AVR-8MKXBQ)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const { korapayReference, email, firstName, lastName, affiliateCode } = body ?? {};

    if (!korapayReference || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "korapayReference, email, firstName, and lastName are all required." },
        { status: 400 }
      );
    }

    const emailNorm = String(email).toLowerCase().trim();
    const ref = String(korapayReference).trim();

    await dbConnect();

    // 1. Confirm the payment actually succeeded on Korapay
    const verify = await verifyCharge(ref);
    if (!verify.data || verify.data.status !== "success") {
      return NextResponse.json(
        {
          error: `Korapay payment not confirmed. Status: ${verify.data?.status ?? "unknown"}. Do not create an account unless the payment is genuinely successful.`,
        },
        { status: 400 }
      );
    }

    // 2. Guard: if a full user account already exists for this email, do nothing
    const existingUser = await User.findOne({ email: emailNorm }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: `A full account already exists for ${emailNorm}. No recovery needed.` },
        { status: 409 }
      );
    }

    // 3. Guard: if this reference already has a paid PendingSignup, just resend the link
    const existingPaid = await PendingSignup.findOne({ paymentReference: ref, paid: true });
    if (existingPaid) {
      await sendPaidSignupLinkEmail({
        email: existingPaid.email,
        firstName: existingPaid.firstName,
        signupToken: existingPaid.signupToken!,
      });
      return NextResponse.json({
        success: true,
        action: "resent_existing_link",
        message: `Signup link resent to ${existingPaid.email} using existing token.`,
      });
    }

    // 4. Resolve affiliate
    let affiliateUserId: Types.ObjectId | null = null;
    let referrerDoc: Record<string, unknown> | null = null;
    if (affiliateCode) {
      referrerDoc = (await User.findOne({
        referralCode: String(affiliateCode).toUpperCase().trim(),
      }).lean()) as Record<string, unknown> | null;
      if (referrerDoc) {
        affiliateUserId = referrerDoc._id as Types.ObjectId;
      }
    }

    // 5. Mark any existing UNPAID PendingSignup for this reference as expired
    //    (so there's no duplicate when we create the paid record below)
    await PendingSignup.findOneAndUpdate(
      { paymentReference: ref, paid: false },
      { $set: { expiresAt: new Date() } }
    );

    // 6. Create a fresh paid PendingSignup with a signup token
    const signupToken = crypto.randomBytes(32).toString("hex");
    await PendingSignup.create({
      email: emailNorm,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      affiliateUserId: affiliateUserId ?? null,
      paymentReference: ref,
      signupToken,
      paid: true,
      used: false,
      amount: verify.data.amount,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 7. Send the signup link
    await sendPaidSignupLinkEmail({
      email: emailNorm,
      firstName: String(firstName).trim(),
      signupToken,
    });

    // 8. Create pending commission for the affiliate if not already recorded
    let commissionCreated = false;
    if (referrerDoc) {
      const existingCommission = await Transaction.findOne({
        paymentReference: ref,
        type: "commission",
      });

      if (!existingCommission) {
        const orderId = generateOrderId();

        await Transaction.create({
          userId: referrerDoc._id,
          type: "commission",
          amount: siteConfig.commission.newSubscription,
          status: "pending",
          referralId: null,
          sourceUserId: null,
          paymentReference: ref,
          orderId,
          description: `50% commission — ${firstName} ${lastName} subscribed (manual recovery)`,
        });

        await PendingSignup.findOneAndUpdate(
          { paymentReference: ref },
          { $set: { commissionEmailSent: true, commissionOrderId: orderId } }
        );

        sendPendingCommissionEmail({
          affiliateEmail: referrerDoc.email as string,
          affiliateName: `${referrerDoc.firstName} ${referrerDoc.lastName}`,
          buyerName: `${firstName} ${lastName}`,
          commissionAmount: siteConfig.commission.newSubscription,
          orderId,
          productName: "Averis Academy",
        }).catch(console.error);

        commissionCreated = true;
      }
    }

    console.log(`[admin/recover-payment] Recovered payment for ${emailNorm}, ref: ${ref}`);

    return NextResponse.json({
      success: true,
      action: "recovered",
      email: emailNorm,
      reference: ref,
      commissionCreated,
      message: `Signup link sent to ${emailNorm}. ${commissionCreated ? `Commission of ₦${siteConfig.commission.newSubscription.toLocaleString()} created for affiliate.` : "No commission created (already recorded or no affiliate)."}`,
    });
  } catch (err) {
    console.error("[admin/recover-payment]", err);
    return NextResponse.json({ error: "Recovery failed. Check server logs." }, { status: 500 });
  }
}
