import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PendingSignup from "@/models/PendingSignup";
import { initializeCharge, generateSignupRef } from "@/lib/korapay";
import { siteConfig } from "@/config/site";
export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, affiliateCode } = await req.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const emailNorm = email.toLowerCase().trim();
    await dbConnect();

    // Check if email already has an account
    const existing = await User.findOne({ email: emailNorm });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 409 });
    }

    // Check for an active (unpaid or paid-but-unused) pending signup for this email
    const existingPending = await PendingSignup.findOne({
      email: emailNorm,
      used: false,
      expiresAt: { $gt: new Date() },
    });
    if (existingPending?.paid) {
      return NextResponse.json({
        error: "A signup link was already sent to this email. Please check your inbox or spam folder.",
      }, { status: 409 });
    }

    // Find affiliate
    let affiliateUserId = null;
    if (affiliateCode) {
      const affiliate = await User.findOne({ referralCode: affiliateCode.toUpperCase() });
      if (affiliate) affiliateUserId = affiliate._id;
    }

    const reference = generateSignupRef();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";
    const redirectUrl = `${appUrl}/api/payments/pre-register/verify?reference=${reference}`;

    const checkoutUrl = await initializeCharge({
      reference,
      amount: siteConfig.signupFee,
      email: emailNorm,
      name: `${firstName.trim()} ${lastName.trim()}`,
      redirectUrl,
    });

    // Create or update pending signup
    if (existingPending) {
      existingPending.paymentReference = reference;
      existingPending.affiliateUserId = affiliateUserId;
      existingPending.firstName = firstName.trim();
      existingPending.lastName = lastName.trim();
      existingPending.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await existingPending.save();
    } else {
      await PendingSignup.create({
        email: emailNorm,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        affiliateUserId,
        paymentReference: reference,
        paid: false,
        used: false,
        amount: siteConfig.signupFee,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    return NextResponse.json({ checkoutUrl, reference });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pre-register/initialize]", msg);

    // Duplicate key on paymentReference → transient collision, safe to retry
    if (msg.includes("E11000") && msg.includes("paymentReference")) {
      return NextResponse.json(
        { error: "A temporary conflict occurred. Please try again." },
        { status: 409 }
      );
    }

    // Any other duplicate key (e.g. stale non-sparse signupToken index) →
    // do NOT surface raw Mongo errors to the client.
    if (msg.includes("E11000")) {
      return NextResponse.json(
        { error: "A database conflict occurred. Please try again in a moment." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Payment initialization failed. Please try again." },
      { status: 500 }
    );
  }
}
