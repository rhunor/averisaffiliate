import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import PendingSignup from "@/models/PendingSignup";
import User from "@/models/User";
import { verifyCharge } from "@/lib/korapay";
import { sendPaidSignupLinkEmail, sendPendingCommissionEmail } from "@/lib/email";
import { generateOrderId } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

  if (!reference) {
    return NextResponse.redirect(new URL("/join?error=missing_reference", appUrl));
  }

  try {
    await dbConnect();

    // Verify with the payment provider first (before touching the DB)
    const verify = await verifyCharge(reference);
    if (!verify.data || verify.data.status !== "success") {
      return NextResponse.redirect(new URL("/join?error=payment_failed", appUrl));
    }

    const signupToken = crypto.randomBytes(32).toString("hex");
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Atomic update: only set paid+token if not already paid.
    // This prevents a duplicate Korapay callback from overwriting the token
    // and sending a second signup-link email with a different (now-invalid) token.
    const updated = await PendingSignup.findOneAndUpdate(
      { paymentReference: reference, paid: false },
      { $set: { paid: true, signupToken, expiresAt: newExpiry } },
      { new: true }
    );

    if (!updated) {
      // Either not found, or already paid (webhook fired twice — idempotent: just redirect).
      const existing = await PendingSignup.findOne({ paymentReference: reference }).lean();
      if (existing && (existing as Record<string, unknown>).paid) {
        const email = (existing as Record<string, unknown>).email as string;
        return NextResponse.redirect(
          new URL(`/check-email?email=${encodeURIComponent(email)}`, appUrl)
        );
      }
      return NextResponse.redirect(new URL("/join?error=not_found", appUrl));
    }

    // Send signup link to the buyer
    await sendPaidSignupLinkEmail({
      email: updated.email,
      firstName: updated.firstName,
      signupToken,
    });

    // Notify the affiliate immediately on payment — don't wait for registration
    if (updated.affiliateUserId) {
      try {
        const referrer = await User.findById(updated.affiliateUserId);
        if (referrer) {
          const orderId = generateOrderId();

          await sendPendingCommissionEmail({
            affiliateEmail: referrer.email,
            affiliateName: `${referrer.firstName} ${referrer.lastName}`,
            buyerName: `${updated.firstName} ${updated.lastName}`,
            commissionAmount: siteConfig.commission.newSubscription,
            orderId,
            productName: "Averis Academy",
          });

          // Store flag + orderId so register-paid reuses the same orderId and skips resending
          updated.commissionEmailSent = true;
          updated.commissionOrderId = orderId;
          await updated.save();
        }
      } catch (emailErr) {
        // Non-fatal — commission records will still be created at registration
        console.error("[pre-register/verify] commission email failed:", emailErr);
      }
    }

    return NextResponse.redirect(
      new URL(`/check-email?email=${encodeURIComponent(updated.email)}`, appUrl)
    );
  } catch (err) {
    console.error("[pre-register/verify]", err);
    return NextResponse.redirect(new URL("/join?error=server_error", appUrl));
  }
}
