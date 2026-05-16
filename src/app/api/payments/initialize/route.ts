import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { initializeCharge, generateSignupRef } from "@/lib/korapay";
import { generateOrderId } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const sessionUser = session.user as unknown as Record<string, unknown>;

    await dbConnect();
    const user = await User.findById(sessionUser.id as string);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (user.isActive) return NextResponse.json({ error: "Account already active." }, { status: 400 });

    const reference = generateSignupRef();
    const orderId = generateOrderId();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutUrl = await initializeCharge({
      reference,
      amount: siteConfig.signupFee,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      narration: "Averis Academy 6-Month Subscription",
      redirectUrl: `${appUrl}/api/payments/verify?reference=${reference}&orderId=${orderId}`,
      metadata: { userId: user._id.toString(), orderId },
    });

    user.signupPaymentRef = reference;
    await user.save();

    return NextResponse.json({ checkoutUrl, reference, orderId });
  } catch (err) {
    console.error("[payments/initialize]", err);
    return NextResponse.json({ error: "Payment initialization failed." }, { status: 500 });
  }
}
