import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PendingSignup from "@/models/PendingSignup";
import Referral from "@/models/Referral";
import Transaction from "@/models/Transaction";
import AverisSubscriber from "@/models/AverisSubscriber";
import { generateReferralCode } from "@/lib/utils";
import { sendWelcomeEmail, sendPendingCommissionEmail } from "@/lib/email";
import { siteConfig } from "@/config/site";
import { generateOrderId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ errors: { password: "Password must be at least 8 characters." } }, { status: 400 });
    }

    await dbConnect();

    const pending = await PendingSignup.findOne({
      signupToken: token,
      paid: true,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!pending) {
      return NextResponse.json({
        error: "This signup link is invalid, has already been used, or has expired. Please contact support.",
      }, { status: 400 });
    }

    // Check email not already taken
    const existing = await User.findOne({ email: pending.email });
    if (existing) {
      return NextResponse.json({ errors: { email: "An account with this email already exists. Please log in." } }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateUniqueReferralCode();
    const sixMonths = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    const user = await User.create({
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
      passwordHash,
      referralCode,
      referredBy: pending.affiliateUserId || null,
      hasPaidSignup: true,
      isActive: true,
      isEmailVerified: true,
      subscriptionExpiresAt: sixMonths,
      signupPaymentRef: pending.paymentReference,
    });

    // Mark token as used
    pending.used = true;
    await pending.save();

    // Credit affiliate commission
    if (pending.affiliateUserId) {
      const referrer = await User.findById(pending.affiliateUserId);
      if (referrer) {
        const orderId = generateOrderId();

        const referral = await Referral.create({
          referrerId: referrer._id,
          referredUserId: user._id,
          productId: null,
          status: "active",
          commissionAmount: siteConfig.commission.newSubscription,
          isRenewal: false,
        });

        await Transaction.create({
          userId: referrer._id,
          type: "commission",
          amount: siteConfig.commission.newSubscription,
          status: "pending",
          referralId: referral._id,
          sourceUserId: user._id,
          paymentReference: pending.paymentReference,
          orderId,
          description: `50% commission — ${pending.firstName} ${pending.lastName} subscribed`,
        });

        sendPendingCommissionEmail({
          affiliateEmail: referrer.email,
          affiliateName: `${referrer.firstName} ${referrer.lastName}`,
          buyerName: `${pending.firstName} ${pending.lastName}`,
          commissionAmount: siteConfig.commission.newSubscription,
          orderId,
          productName: "Averis Academy",
        }).catch(console.error);
      }
    }

    // Sync bot subscriber record
    await AverisSubscriber.findOneAndUpdate(
      { averisUserId: user._id.toString() },
      { expiryDate: sixMonths, status: "active", removedAt: null, remindersSent: [] },
      { upsert: true }
    ).catch(() => {});

    // Record subscription transaction
    await Transaction.create({
      userId: user._id,
      type: "subscription",
      amount: siteConfig.signupFee,
      status: "completed",
      paymentReference: pending.paymentReference,
      orderId: generateOrderId(),
      description: "Averis Academy 6-Month Subscription",
    });

    sendWelcomeEmail(user.email, user.firstName, user.referralCode).catch(console.error);

    return NextResponse.json({ success: true, email: user.email }, { status: 201 });
  } catch (err) {
    console.error("[register-paid]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}

async function generateUniqueReferralCode(): Promise<string> {
  let code: string;
  let exists = true;
  do {
    code = generateReferralCode("AVR");
    exists = !!(await User.findOne({ referralCode: code }));
  } while (exists);
  return code;
}
