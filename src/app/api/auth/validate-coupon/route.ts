import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendCouponRegistrationEmail } from "@/lib/email";
import {
  SIGNUP_COUPON_CAPACITY,
  createCouponToken,
  getSignupCouponCode,
  isValidSignupCoupon,
} from "@/lib/coupon";

export async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      return NextResponse.json({ error: "Coupon code and email are required." }, { status: 400 });
    }

    if (!isValidSignupCoupon(code)) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const couponCode = getSignupCouponCode()!;

    await dbConnect();

    const usedSlots = await User.countDocuments({ signupCoupon: couponCode });
    if (usedSlots >= SIGNUP_COUPON_CAPACITY) {
      return NextResponse.json({ error: "This coupon has been fully redeemed." }, { status: 400 });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 409 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";
    const { token, exp } = createCouponToken(normalizedEmail);
    const registrationLink = `${appUrl}/register-coupon?token=${token}&exp=${exp}&email=${encodeURIComponent(normalizedEmail)}`;

    await sendCouponRegistrationEmail(normalizedEmail, registrationLink);

    return NextResponse.json({ success: true, remaining: SIGNUP_COUPON_CAPACITY - usedSlots });
  } catch (err) {
    console.error("[validate-coupon]", err);
    return NextResponse.json({ error: "Failed. Please try again." }, { status: 500 });
  }
}
