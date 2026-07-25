import { NextRequest, NextResponse } from "next/server";
import type { Types } from "mongoose";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PendingSignup from "@/models/PendingSignup";
import { initializeCharge, generateSignupRef } from "@/lib/korapay";
import { siteConfig } from "@/config/site";

// Drop any stale non-sparse signupToken_1 index on the first request of each
// serverless instance. Must run AFTER dbConnect() so the connection is ready.
let indexesSynced = false;

async function ensureIndexes() {
  if (indexesSynced) return;
  indexesSynced = true;
  try {
    await PendingSignup.syncIndexes();
  } catch (e) {
    console.error("[PendingSignup] syncIndexes failed:", e);
    indexesSynced = false; // allow retry on next request if it failed
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, affiliateCode } = body ?? {};

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 }
      );
    }

    const emailNorm = String(email).toLowerCase().trim();
    const firstNameTrim = String(firstName).trim();
    const lastNameTrim = String(lastName).trim();

    await dbConnect();
    await ensureIndexes(); // fix stale index on first cold-start request

    // Reject if a full account already exists
    const existingUser = await User.findOne({ email: emailNorm }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // If this email already has a PAID+unused pending signup, the link was already sent.
    // Check separately from the unpaid check so we don't block a retry after a failed payment.
    const paidPending = await PendingSignup.findOne({
      email: emailNorm,
      paid: true,
      used: false,
      expiresAt: { $gt: new Date() },
    });
    if (paidPending) {
      return NextResponse.json(
        {
          error:
            "A signup link was already sent to this email. Please check your inbox (and spam folder).",
        },
        { status: 409 }
      );
    }

    // Resolve affiliate
    let affiliateUserId: Types.ObjectId | null = null;
    if (affiliateCode) {
      const affiliate = await User.findOne({
        referralCode: String(affiliateCode).toUpperCase().trim(),
      }).lean();
      if (affiliate) {
        affiliateUserId = (affiliate as { _id: Types.ObjectId })._id;
      }
    }

    const reference = generateSignupRef();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";
    const redirectUrl = `${appUrl}/api/payments/pre-register/verify?reference=${reference}`;

    const checkoutUrl = await initializeCharge({
      reference,
      amount: siteConfig.signupFee,
      email: emailNorm,
      name: `${firstNameTrim} ${lastNameTrim}`,
      redirectUrl,
    });

    // Always create a fresh PendingSignup for each checkout attempt.
    // We never overwrite an existing record's paymentReference — doing so would orphan
    // any in-progress Korapay checkout that still carries the old reference. Each checkout
    // gets its own document so verify/webhook can find it by reference regardless of how
    // many times the user reopened the payment form.
    await PendingSignup.create({
      email: emailNorm,
      firstName: firstNameTrim,
      lastName: lastNameTrim,
      affiliateUserId,
      paymentReference: reference,
      paid: false,
      used: false,
      amount: siteConfig.signupFee,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({ checkoutUrl, reference });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[pre-register/initialize]", msg);

    // Transient duplicate on paymentReference (two concurrent requests, same email,
    // both missed the existingPending check) — safe to ask the user to retry.
    if (msg.includes("E11000") && msg.includes("paymentReference")) {
      return NextResponse.json(
        { error: "A temporary conflict occurred. Please try again." },
        { status: 409 }
      );
    }

    // Any other E11000 — never surface raw Mongo errors to the client.
    if (msg.includes("E11000")) {
      return NextResponse.json(
        { error: "A temporary database conflict occurred. Please try again in a moment." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Payment initialization failed. Please try again." },
      { status: 500 }
    );
  }
}
