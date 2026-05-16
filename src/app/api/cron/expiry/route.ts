import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendSubscriptionExpiryEmail } from "@/lib/email";

async function handler(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();
    const now = new Date();
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Expire overdue subscriptions
    const expired = await User.find({
      isActive: true,
      subscriptionExpiresAt: { $lte: now },
    });

    for (const user of expired) {
      user.isActive = false;
      await user.save();
      sendSubscriptionExpiryEmail({
        email: user.email,
        firstName: user.firstName,
        daysLeft: 0,
        expiryDate: user.subscriptionExpiresAt!,
      }).catch(console.error);
    }

    // Send 14-day reminders
    const expiringSoon = await User.find({
      isActive: true,
      subscriptionExpiresAt: { $gte: now, $lte: in14Days },
    });

    for (const user of expiringSoon) {
      const daysLeft = Math.ceil((user.subscriptionExpiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      sendSubscriptionExpiryEmail({
        email: user.email,
        firstName: user.firstName,
        daysLeft,
        expiryDate: user.subscriptionExpiresAt!,
      }).catch(console.error);
    }

    return NextResponse.json({
      expired: expired.length,
      remindersSet: expiringSoon.length,
    });
  } catch (err) {
    console.error("[cron/expiry]", err);
    return NextResponse.json({ error: "Cron failed." }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
