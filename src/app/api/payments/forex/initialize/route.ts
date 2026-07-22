import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import ForexPurchase from "@/models/ForexPurchase";
import { initializeCharge, generateForexRef } from "@/lib/korapay";
import { siteConfig } from "@/config/site";
import type { Types } from "mongoose";

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

    // Resolve affiliate from referral code
    let affiliateUserId: Types.ObjectId | null = null;
    if (affiliateCode) {
      const affiliate = await User.findOne({
        referralCode: String(affiliateCode).toUpperCase().trim(),
      }).lean();
      if (affiliate) {
        affiliateUserId = (affiliate as { _id: Types.ObjectId })._id;
      }
    }

    const reference = generateForexRef();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";
    const redirectUrl = `${appUrl}/api/payments/forex/verify?reference=${reference}`;

    const checkoutUrl = await initializeCharge({
      reference,
      amount: siteConfig.forex.price,
      email: emailNorm,
      name: `${firstNameTrim} ${lastNameTrim}`,
      redirectUrl,
    });

    await ForexPurchase.create({
      email: emailNorm,
      firstName: firstNameTrim,
      lastName: lastNameTrim,
      affiliateUserId,
      paymentReference: reference,
      paid: false,
      amount: siteConfig.forex.price,
    });

    return NextResponse.json({ checkoutUrl, reference });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[forex/initialize]", msg);

    if (msg.includes("E11000") && msg.includes("paymentReference")) {
      return NextResponse.json(
        { error: "A temporary conflict occurred. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Payment initialization failed. Please try again." },
      { status: 500 }
    );
  }
}
