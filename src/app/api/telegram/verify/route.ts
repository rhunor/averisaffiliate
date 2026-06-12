/**
 * POST /api/telegram/verify
 *
 * Called by the Averis Academy Telegram bot to verify whether a referral code
 * belongs to an active subscriber, and to link a Telegram ID to that user.
 *
 * The bot sends this after receiving /start averis_link_<referralCode>.
 * On success it receives the user's name + subscription expiry so it can
 * admit them to the community group and announcement channel.
 *
 * Authentication: shared secret via TELEGRAM_BOT_SECRET env var.
 * The bot must include: Authorization: Bearer <TELEGRAM_BOT_SECRET>
 */
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    // Verify the request is from our bot
    const secret = process.env.TELEGRAM_BOT_SECRET;
    if (secret) {
      const auth = req.headers.get("authorization");
      if (!auth || auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
    }

    const { referralCode, telegramId, telegramUsername } = await req.json();

    if (!referralCode) {
      return NextResponse.json({ error: "referralCode is required." }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ referralCode: referralCode.toUpperCase() });

    if (!user) {
      return NextResponse.json({
        ok: false,
        reason: "not_found",
        message: "No Averis Academy account found for this link. Make sure you used the correct link from your welcome email.",
      });
    }

    if (!user.isActive) {
      return NextResponse.json({
        ok: false,
        reason: "not_active",
        message: "Your Averis Academy account is not yet active. Please complete your subscription payment first.",
        email: user.email,
      });
    }

    const now = new Date();
    const isExpired = user.subscriptionExpiresAt && user.subscriptionExpiresAt < now && !user.isLifetime;
    if (isExpired) {
      return NextResponse.json({
        ok: false,
        reason: "expired",
        message: "Your Averis Academy subscription has expired. Please renew to regain access to the community.",
        expiryDate: user.subscriptionExpiresAt,
      });
    }

    // Link the Telegram account if provided
    if (telegramId && (!user.telegramLinked || user.telegramId !== telegramId)) {
      user.telegramId = String(telegramId);
      user.telegramLinked = true;
      await user.save();
    }

    return NextResponse.json({
      ok: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isLifetime: user.isLifetime,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        telegramLinked: true,
      },
    });
  } catch (err) {
    console.error("[telegram/verify]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
