import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendSubscriptionExpiryEmail } from "@/lib/email";
import { processTelegramExpiry } from "@/bot/services/groupManager";
import { processFibExpiry } from "@/bot/services/fibManager";

// Runs every 6 hours via vercel cron: 0 */6 * * *
// Handles: 30d, 15d, 7d, 3d, 24h, 6h reminders + expired deactivation

const REMINDER_WINDOWS_DAYS = [30, 15, 7, 3] as const;
const REMINDER_WINDOWS_HOURS = [24, 6] as const;
const WINDOW_TOLERANCE_MS = 3 * 60 * 60 * 1000; // ±3 hour window per check

async function handler(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();
    const now = new Date();
    let expiredCount = 0;
    let reminderCount = 0;

    // 1. Deactivate expired subscriptions
    const expired = await User.find({
      isActive: true,
      subscriptionExpiresAt: { $lte: now },
    });

    for (const user of expired) {
      user.isActive = false;
      await user.save();
      expiredCount++;
      sendSubscriptionExpiryEmail({
        email: user.email,
        firstName: user.firstName,
        daysLeft: 0,
        expiryDate: user.subscriptionExpiresAt!,
      }).catch(console.error);
    }

    // 2. Day-based reminders: 30, 15, 7, 3 days
    for (const days of REMINDER_WINDOWS_DAYS) {
      const targetMs = days * 24 * 60 * 60 * 1000;
      const rangeStart = new Date(now.getTime() + targetMs - WINDOW_TOLERANCE_MS);
      const rangeEnd = new Date(now.getTime() + targetMs + WINDOW_TOLERANCE_MS);

      const users = await User.find({
        isActive: true,
        subscriptionExpiresAt: { $gte: rangeStart, $lte: rangeEnd },
      });

      for (const user of users) {
        reminderCount++;
        const daysLeft = Math.ceil(
          (user.subscriptionExpiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        sendSubscriptionExpiryEmail({
          email: user.email,
          firstName: user.firstName,
          daysLeft,
          expiryDate: user.subscriptionExpiresAt!,
        }).catch(console.error);
      }
    }

    // 3. Hour-based reminders: 24h, 6h
    for (const hours of REMINDER_WINDOWS_HOURS) {
      const targetMs = hours * 60 * 60 * 1000;
      // Tighter ±30 min window for hour-level precision
      const hourWindow = 30 * 60 * 1000;
      const rangeStart = new Date(now.getTime() + targetMs - hourWindow);
      const rangeEnd = new Date(now.getTime() + targetMs + hourWindow);

      const users = await User.find({
        isActive: true,
        subscriptionExpiresAt: { $gte: rangeStart, $lte: rangeEnd },
      });

      for (const user of users) {
        reminderCount++;
        sendSubscriptionExpiryEmail({
          email: user.email,
          firstName: user.firstName,
          daysLeft: hours < 24 ? 0 : 1,
          expiryDate: user.subscriptionExpiresAt!,
          hoursLeft: hours,
        }).catch(console.error);
      }
    }

    // Telegram group management: remove expired members, send reminder DMs
    let telegramStats = { expired: 0, reminders: 0 };
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.AVERIS_TELEGRAM_GROUP_ID) {
      try {
        telegramStats = await processTelegramExpiry();
      } catch (err) {
        console.error("[cron/expiry] Telegram processing failed:", err);
      }
    }

    // FIB Copy Trade — independent of the Averis Telegram block above,
    // its own try/catch so a failure here can never affect Averis or
    // email processing.
    let fibStats = { expired: 0, reminders: 0 };
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.FIB_TELEGRAM_CHANNEL_ID) {
      try {
        fibStats = await processFibExpiry();
      } catch (err) {
        console.error("[cron/expiry] FIB processing failed:", err);
      }
    }

    return NextResponse.json({
      expired: expiredCount,
      reminders: reminderCount,
      telegram: telegramStats,
      fib: fibStats,
    });
  } catch (err) {
    console.error("[cron/expiry]", err);
    return NextResponse.json({ error: "Cron failed." }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
