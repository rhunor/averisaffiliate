import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import AverisSubscriber from "@/models/AverisSubscriber";
import { generateReferralCode, generateOrderId } from "@/lib/utils";
import { sendWelcomeEmail } from "@/lib/email";
import { SIGNUP_COUPON_CAPACITY, getSignupCouponCode, verifyCouponToken } from "@/lib/coupon";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, token, exp } = await req.json();

    if (!firstName || !lastName || !email || !password || !token || !exp) {
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (!verifyCouponToken(normalizedEmail, Number(exp), token)) {
      return NextResponse.json({
        error: "This registration link is invalid or has expired. Go back to /coupon and re-enter your code.",
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ errors: { password: "Password must be at least 8 characters." } }, { status: 400 });
    }

    await dbConnect();

    const couponCode = getSignupCouponCode()!;
    const usedSlots = await User.countDocuments({ signupCoupon: couponCode });
    if (usedSlots >= SIGNUP_COUPON_CAPACITY) {
      return NextResponse.json({ error: "This coupon has been fully redeemed." }, { status: 400 });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ errors: { email: "An account with this email already exists. Please log in." } }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateUniqueReferralCode();
    const twelveMonths = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Same shape as a paid signup (register-paid), minus the payment — NOT
    // lifetime, so renewal is billed normally when subscriptionExpiresAt passes.
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      referralCode,
      hasPaidSignup: true,
      isActive: true,
      isEmailVerified: true, // email proven by the emailed link
      subscriptionExpiresAt: twelveMonths,
      signupCoupon: couponCode,
    });

    // Sync bot subscriber record
    await AverisSubscriber.findOneAndUpdate(
      { averisUserId: user._id.toString() },
      { expiryDate: twelveMonths, status: "active", removedAt: null, remindersSent: [] },
      { upsert: true }
    ).catch(() => {});

    await Transaction.create({
      userId: user._id,
      type: "subscription",
      amount: 0,
      status: "completed",
      orderId: generateOrderId(),
      description: `Averis Academy 12-Month Subscription (coupon ${couponCode})`,
      metadata: { coupon: couponCode },
    });

    try {
      await sendWelcomeEmail(user.email, user.firstName, user.referralCode);
    } catch (emailErr) {
      console.error("[register-coupon] welcome email failed:", emailErr);
    }

    return NextResponse.json({ success: true, email: user.email }, { status: 201 });
  } catch (err) {
    console.error("[register-coupon]", err);
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
