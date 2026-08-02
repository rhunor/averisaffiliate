import { NextRequest, NextResponse } from "next/server";
import { activateFibSubscription } from "@/bot/services/fibManager";

const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || "";

// Korapay's redirect_url for FIB Copy Trade checkouts. Verifies/activates
// the payment server-side (idempotent — harmless if the webhook already
// did it) then bounces the in-app browser straight back into the bot so
// the user lands on a confirmation message without any manual steps.
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

  if (reference) {
    try {
      await activateFibSubscription(reference);
    } catch (err) {
      console.error("[payments/fib/redirect]", err);
    }
  }

  const payload = reference ? `fib_paid_${reference}` : "";
  const deepLink = TELEGRAM_BOT_USERNAME
    ? `https://t.me/${TELEGRAM_BOT_USERNAME}${payload ? `?start=${payload}` : ""}`
    : "https://t.me/";

  return NextResponse.redirect(deepLink);
}
