import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { initializeCharge, generateSignupRef } from "@/lib/korapay";
import { generateOrderId } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({})) as { type?: string };
    const isRenewal = body?.type === "renewal";

    const sessionUser = session.user as unknown as Record<string, unknown>;
    await dbConnect();

    const user = await User.findById(sessionUser.id as string);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (!isRenewal && user.isActive) {
      return NextResponse.json({ error: "Account already active." }, { status: 400 });
    }
    if (isRenewal && !user.hasPaidSignup) {
      return NextResponse.json({ error: "No previous subscription found to renew." }, { status: 400 });
    }

    // Look up product for product-specific pricing
    let productRecord: (typeof Product extends { findOne: (...a: unknown[]) => infer R } ? Awaited<R> : null) | null = null;
    if (user.signupProductSlug) {
      productRecord = await Product.findOne({ slug: user.signupProductSlug, isActive: true }).lean() as typeof productRecord;
    }

    const amount = isRenewal
      ? ((productRecord as Record<string, unknown> | null)?.renewalPrice as number ?? siteConfig.renewalFee)
      : ((productRecord as Record<string, unknown> | null)?.price as number ?? siteConfig.signupFee);

    const reference = generateSignupRef();
    const orderId = generateOrderId();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

    const checkoutUrl = await initializeCharge({
      reference,
      amount,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      narration: isRenewal
        ? "Averis Academy 6-Month Renewal"
        : "Averis Academy 6-Month Subscription",
      redirectUrl: `${appUrl}/api/payments/verify?reference=${reference}&orderId=${orderId}`,
      metadata: {
        userId: user._id.toString(),
        orderId,
        paymentType: isRenewal ? "renewal" : "new",
        productSlug: user.signupProductSlug ?? "averis-academy",
        productId: productRecord ? String((productRecord as Record<string, unknown>)._id) : null,
      },
    });

    user.signupPaymentRef = reference;
    await user.save();

    return NextResponse.json({ checkoutUrl, reference, orderId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[payments/initialize]", msg);
    return NextResponse.json({ error: `Payment initialization failed: ${msg}` }, { status: 500 });
  }
}
