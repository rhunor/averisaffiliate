/**
 * Core Telegram group management for Averis Academy.
 *
 * Uses the same DB connection and models as the rest of the app — no
 * separate AVERIS_MONGODB_URI needed. This is what was causing the
 * Primetrex bot to lose sync with user data.
 */
import dbConnect from "@/lib/db";
import User from "@/models/User";
import AverisSubscriber from "@/models/AverisSubscriber";
import { getBotInstance } from "@/bot/instance";

const GROUP_ID = process.env.AVERIS_TELEGRAM_GROUP_ID!;
const CHANNEL_ID = process.env.AVERIS_TELEGRAM_CHANNEL_ID || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

export async function generateInviteLink(): Promise<string> {
  const bot = getBotInstance();
  const invite = await bot.api.createChatInviteLink(Number(GROUP_ID), { member_limit: 1 });
  return invite.invite_link;
}

export async function generateChannelInviteLink(): Promise<string | null> {
  if (!CHANNEL_ID) return null;
  const bot = getBotInstance();
  const invite = await bot.api.createChatInviteLink(Number(CHANNEL_ID), { member_limit: 1 });
  return invite.invite_link;
}

export async function removeFromGroup(telegramId: string): Promise<void> {
  const bot = getBotInstance();
  await bot.api.banChatMember(Number(GROUP_ID), Number(telegramId));
  await bot.api.unbanChatMember(Number(GROUP_ID), Number(telegramId));
}

/**
 * Called when user clicks the deep link in their welcome email:
 * /start averis_link_<referralCode>
 *
 * Links their Telegram to their User record (same DB, direct lookup)
 * and creates/updates the AverisSubscriber tracking record.
 */
export async function handleAverisJoin(
  telegramId: string,
  referralCode: string
): Promise<{ success: boolean; message: string }> {
  await dbConnect();

  const user = await User.findOne({ referralCode: referralCode.toUpperCase() });

  if (!user) {
    return {
      success: false,
      message:
        "No Averis Academy account found for this link. Make sure you used the exact link from your welcome email.",
    };
  }

  if (!user.isActive) {
    return {
      success: false,
      message:
        "Your Averis Academy account is not yet active. Please complete your subscription payment first.",
    };
  }

  const now = new Date();
  const isExpired =
    !user.isLifetime && user.subscriptionExpiresAt && user.subscriptionExpiresAt < now;
  if (isExpired) {
    return {
      success: false,
      message:
        "Your subscription has expired. Please renew at " + APP_URL + "/dashboard/subscription",
    };
  }

  // Prevent linking to a different Telegram account
  if (user.telegramLinked && user.telegramId && user.telegramId !== telegramId) {
    return {
      success: false,
      message:
        "This Averis Academy account is already linked to a different Telegram account. Contact support if this is an error.",
    };
  }

  // Link telegram to User record
  user.telegramId = telegramId;
  user.telegramLinked = true;
  await user.save();

  const expiryDate =
    user.subscriptionExpiresAt ?? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

  // Create or update AverisSubscriber (used for group management + reminders)
  const existing = await AverisSubscriber.findOne({ telegramId });
  if (existing) {
    existing.expiryDate = expiryDate;
    existing.status = "active";
    existing.removedAt = null;
    existing.averisUserId = user._id.toString();
    existing.email = user.email;
    existing.firstName = user.firstName;
    existing.lastName = user.lastName;
    await existing.save();
  } else {
    await AverisSubscriber.create({
      telegramId,
      averisUserId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      groupId: GROUP_ID,
      expiryDate,
      status: "active",
      remindersSent: [],
    });
  }

  // Send invite links via DM
  try {
    const bot = getBotInstance();
    const [groupLink, channelLink] = await Promise.all([
      generateInviteLink(),
      generateChannelInviteLink(),
    ]);

    const expiryStr = expiryDate.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    let message =
      `✅ <b>Welcome to Averis Academy!</b>\n\n` +
      `Hi <b>${user.firstName}</b>! Your subscription is confirmed.\n\n` +
      `\u{1F4AC} <b>Next step — Join the Community Group:</b>\n${groupLink}\n\n`;

    if (channelLink) {
      message += `\u{1F4E2} <b>Join the Announcement Channel:</b>\n${channelLink}\n\n`;
    }

    message +=
      `⚠️ These links are single-use. Join now before they expire!\n\n` +
      `Your subscription is active until <b>${expiryStr}</b>.`;

    await bot.api.sendMessage(Number(telegramId), message, { parse_mode: "HTML" });
    return { success: true, message: "Joined successfully." };
  } catch {
    return {
      success: true,
      message:
        "Account linked — use the \u{1F517} Get Community Invite button below to get your join link.",
    };
  }
}

export async function getSubscriptionStatus(telegramId: string): Promise<{
  isSubscribed: boolean;
  daysLeft?: number;
  expiryDate?: Date;
  firstName?: string;
} | null> {
  await dbConnect();
  const sub = await AverisSubscriber.findOne({ telegramId, status: "active" });
  if (!sub) return { isSubscribed: false };

  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((sub.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  return { isSubscribed: true, daysLeft, expiryDate: sub.expiryDate, firstName: sub.firstName };
}

/**
 * Called by the expiry cron. Checks all AverisSubscriber records:
 * - Expired → remove from group, send DM, update status
 * - Approaching expiry → send reminder DMs at 30d/15d/7d/3d/1d
 */
export async function processTelegramExpiry(): Promise<{ expired: number; reminders: number }> {
  await dbConnect();
  const bot = getBotInstance();
  const now = new Date();
  let expiredCount = 0;
  let reminderCount = 0;

  const reminderWindows = [
    { key: "30d", days: 30 },
    { key: "15d", days: 15 },
    { key: "7d", days: 7 },
    { key: "3d", days: 3 },
    { key: "1d", days: 1 },
  ];

  const allActive = await AverisSubscriber.find({ status: "active" });

  for (const sub of allActive) {
    const msLeft = sub.expiryDate.getTime() - now.getTime();
    const daysLeft = msLeft / (1000 * 60 * 60 * 24);

    if (daysLeft <= 0) {
      sub.status = "expired";
      await sub.save();

      // Remove from Telegram group
      if (GROUP_ID) {
        try {
          await removeFromGroup(sub.telegramId);
          sub.removedAt = new Date();
          await sub.save();
        } catch (err: unknown) {
          const desc =
            err && typeof err === "object" && "description" in err
              ? String((err as { description: string }).description)
              : "";
          if (!desc.includes("PARTICIPANT_ID_INVALID") && !desc.includes("USER_NOT_PARTICIPANT")) {
            console.error(`[bot/expiry] Remove failed telegramId=${sub.telegramId}:`, err);
          }
        }
      }

      // Expiry DM
      try {
        await bot.api.sendMessage(
          Number(sub.telegramId),
          `\u{1F534} <b>Averis Academy Subscription Expired</b>\n\n` +
            `Hi <b>${sub.firstName}</b>, your subscription has expired and you've been removed from the community.\n\n` +
            `\u{1F504} Renew for ₦30,000 to regain access and keep earning commissions.\n` +
            `<a href="${APP_URL}/dashboard/subscription">Renew now →</a>`,
          { parse_mode: "HTML" }
        );
      } catch { /* user may have blocked the bot */ }

      expiredCount++;
      await new Promise((r) => setTimeout(r, 300));
      continue;
    }

    // Reminder DMs
    for (const window of reminderWindows) {
      if (
        daysLeft <= window.days + 0.5 &&
        daysLeft > window.days - 0.5 &&
        !sub.remindersSent.includes(window.key)
      ) {
        const roundedDays = Math.ceil(daysLeft);
        const expiryStr = sub.expiryDate.toLocaleDateString("en-NG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        try {
          await bot.api.sendMessage(
            Number(sub.telegramId),
            `⏳ <b>Averis Academy — ${roundedDays} day${roundedDays === 1 ? "" : "s"} left</b>\n\n` +
              `Hi <b>${sub.firstName}</b>! Your subscription expires on <b>${expiryStr}</b>.\n\n` +
              `Renew for ₦30,000 to keep your access and earn 50% commissions.\n` +
              `<a href="${APP_URL}/dashboard/subscription">Renew Subscription →</a>`,
            { parse_mode: "HTML" }
          );
          sub.remindersSent.push(window.key);
          await sub.save();
          reminderCount++;
        } catch { /* user may have blocked the bot */ }

        await new Promise((r) => setTimeout(r, 300));
        break;
      }
    }
  }

  return { expired: expiredCount, reminders: reminderCount };
}
