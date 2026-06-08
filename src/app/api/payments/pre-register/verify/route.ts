import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import PendingSignup from "@/models/PendingSignup";
import { verifyCharge } from "@/lib/korapay";
import { sendPaidSignupLinkEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

  if (!reference) {
    return NextResponse.redirect(new URL("/join?error=missing_reference", appUrl));
  }

  try {
    await dbConnect();

    const pending = await PendingSignup.findOne({ paymentReference: reference });
    if (!pending) {
      return NextResponse.redirect(new URL("/join?error=not_found", appUrl));
    }

    // Already processed
    if (pending.paid && pending.signupToken) {
      return NextResponse.redirect(
        new URL(`/check-email?email=${encodeURIComponent(pending.email)}`, appUrl)
      );
    }

    const verify = await verifyCharge(reference);
    if (!verify.data || verify.data.status !== "success") {
      return NextResponse.redirect(new URL("/join?error=payment_failed", appUrl));
    }

    // Generate unique signup token
    const signupToken = crypto.randomBytes(32).toString("hex");

    pending.paid = true;
    pending.signupToken = signupToken;
    pending.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pending.save();

    await sendPaidSignupLinkEmail({
      email: pending.email,
      firstName: pending.firstName,
      signupToken,
    });

    return NextResponse.redirect(
      new URL(`/check-email?email=${encodeURIComponent(pending.email)}`, appUrl)
    );
  } catch (err) {
    console.error("[pre-register/verify]", err);
    return NextResponse.redirect(new URL("/join?error=server_error", appUrl));
  }
}
