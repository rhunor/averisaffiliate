/**
 * Telegram group/subscription management for "FIB Copy Trade By Averis
 * Academy" — an independent product from Averis Academy. Mirrors the
 * pattern in groupManager.ts but scoped to its own channel, model, and
 * payment collection so nothing here touches Averis Academy tracking.
 */
import dbConnect from "@/lib/db";
import FibSubscriber from "@/models/FibSubscriber";
import FibPayment from "@/models/FibPayment";
import { getBotInstance } from "@/bot/instance";
import { initializeCharge, verifyCharge } from "@/lib/korapay";

const FIB_CHANNEL_ID = process.env.FIB_TELEGRAM_CHANNEL_ID || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";
const FIB_PRICE = 35000;
const DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export async function generateFibInviteLink(): Promise<string> {
  const bot = getBotInstance();
  const invite = await bot.api.createChatInviteLink(Number(FIB_CHANNEL_ID), { member_limit: 1 });
  return invite.invite_link;
}

export async function removeFromFibChannel(telegramId: string): Promise<void> {
  const bot = getBotInstance();
  await bot.api.banChatMember(Number(FIB_CHANNEL_ID), Number(telegramId));
  await bot.api.unbanChatMember(Number(FIB_CHANNEL_ID), Number(telegramId));
}

async function sendFibInvite(sub: {
  telegramId: string;
  firstName: string;
  expiryDate: Date;
}): Promise<void> {
  const bot = getBotInstance();
  const link = await generateFibInviteLink();
  const expiryStr = sub.expiryDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await bot.api.sendMessage(
    Number(sub.telegramId),
    `\u{1F4C8} <b>Welcome to FIB Copy Trade By Averis Academy!</b>\n\n` +
      `Hi${sub.firstName ? ` <b>${sub.firstName}</b>` : ""}! Here's your invite:\n\n` +
      `${link}\n\n` +
      `⚠️ This link is single-use. Join now before it expires!\n\n` +
      `Your subscription is active until <b>${expiryStr}</b>.`,
    { parse_mode: "HTML" }
  );
}

/**
 * Used by the /addfibsubscriber admin command. Registers the subscriber
 * immediately but defers the invite DM — Telegram bots can't message a
 * user who has never started a conversation with them, so the invite is
 * sent later by the fibAutoInvite middleware the first time they text the
 * bot (see bot/handlers/fibAutoInvite.ts).
 */
export async function manualActivateFibSubscriber(params: {
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): Promise<{ created: boolean }> {
  await dbConnect();

  const existing = await FibSubscriber.findOne({ telegramId: params.telegramId });
  const now = new Date();
  const expiryDate = new Date(now.getTime() + DURATION_MS);

  if (existing) {
    existing.status = "active";
    existing.expiryDate = expiryDate;
    existing.removedAt = null;
    existing.remindersSent = [];
    if (params.username) existing.username = params.username;
    if (params.firstName) existing.firstName = params.firstName;
    if (params.lastName) existing.lastName = params.lastName;
    await existing.save();
    return { created: false };
  }

  await FibSubscriber.create({
    telegramId: params.telegramId,
    username: params.username || "",
    firstName: params.firstName || "",
    lastName: params.lastName || "",
    channelId: FIB_CHANNEL_ID,
    startDate: now,
    expiryDate,
    status: "active",
    addedBy: "manual",
    inviteSentAt: null,
  });
  return { created: true };
}

export function generateFibReference(telegramId: string): string {
  return `FIB-${telegramId}-${Date.now()}`;
}

/**
 * Creates a pending payment and returns a Korapay checkout URL. Uses a
 * synthetic email since Telegram users have no email on file (same
 * fallback pattern already used for payout beneficiaries in korapay.ts).
 */
export async function createFibCheckout(params: {
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  redirectUrl: string;
}): Promise<string> {
  await dbConnect();

  const reference = generateFibReference(params.telegramId);
  const name = [params.firstName, params.lastName].filter(Boolean).join(" ") || "FIB Subscriber";
  const email = `${params.telegramId}@telegram.fibcopytrade.averisacademy.com`;

  const checkoutUrl = await initializeCharge({
    reference,
    amount: FIB_PRICE,
    email,
    name,
    redirectUrl: params.redirectUrl,
  });

  await FibPayment.create({
    telegramId: params.telegramId,
    username: params.username || "",
    firstName: params.firstName || "",
    lastName: params.lastName || "",
    reference,
    amount: FIB_PRICE,
    status: "pending",
  });

  return checkoutUrl;
}

/**
 * Idempotent activation, keyed by FibPayment.reference. Safe to call from
 * the Korapay webhook, the redirect callback, and the in-bot "I've Paid"
 * button — whichever fires first wins, the rest are no-ops.
 */
export async function activateFibSubscription(
  reference: string
): Promise<{ success: boolean; message: string }> {
  await dbConnect();

  const payment = await FibPayment.findOne({ reference });
  if (!payment) {
    return { success: false, message: "Payment reference not found." };
  }
  if (payment.status === "successful") {
    return { success: true, message: "already_activated" };
  }

  const verified = await verifyCharge(reference);
  if (!verified.status || verified.data?.status !== "success") {
    return { success: false, message: "Payment not confirmed yet." };
  }

  const now = new Date();
  const existing = await FibSubscriber.findOne({ telegramId: payment.telegramId });

  let expiryDate: Date;
  if (existing && existing.status === "active" && existing.expiryDate > now) {
    expiryDate = new Date(existing.expiryDate.getTime() + DURATION_MS);
    existing.expiryDate = expiryDate;
    existing.status = "active";
    existing.removedAt = null;
    existing.remindersSent = [];
    if (payment.username) existing.username = payment.username;
    if (payment.firstName) existing.firstName = payment.firstName;
    if (payment.lastName) existing.lastName = payment.lastName;
    await existing.save();
  } else if (existing) {
    expiryDate = new Date(now.getTime() + DURATION_MS);
    existing.expiryDate = expiryDate;
    existing.status = "active";
    existing.removedAt = null;
    existing.remindersSent = [];
    await existing.save();
  } else {
    expiryDate = new Date(now.getTime() + DURATION_MS);
    await FibSubscriber.create({
      telegramId: payment.telegramId,
      username: payment.username,
      firstName: payment.firstName,
      lastName: payment.lastName,
      channelId: FIB_CHANNEL_ID,
      startDate: now,
      expiryDate,
      status: "active",
      addedBy: "payment",
      inviteSentAt: null,
    });
  }

  payment.status = "successful";
  await payment.save();

  try {
    await sendFibInvite({
      telegramId: payment.telegramId,
      firstName: payment.firstName,
      expiryDate,
    });
    await FibSubscriber.findOneAndUpdate(
      { telegramId: payment.telegramId },
      { inviteSentAt: new Date() }
    );
  } catch {
    // User may not have started the bot conversation yet — the
    // fibAutoInvite middleware will deliver it on their next message.
  }

  return { success: true, message: "activated" };
}

export async function getFibSubscriptionStatus(telegramId: string): Promise<{
  isSubscribed: boolean;
  daysLeft?: number;
  expiryDate?: Date;
  firstName?: string;
} | null> {
  await dbConnect();
  const sub = await FibSubscriber.findOne({ telegramId, status: "active" });
  if (!sub) return { isSubscribed: false };

  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((sub.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  return { isSubscribed: true, daysLeft, expiryDate: sub.expiryDate, firstName: sub.firstName };
}

/**
 * Called by the expiry cron. Mirrors processTelegramExpiry in
 * groupManager.ts but with 7d/3d/1d reminder windows and its own channel.
 */
export async function processFibExpiry(): Promise<{ expired: number; reminders: number }> {
  await dbConnect();
  const bot = getBotInstance();
  const now = new Date();
  let expiredCount = 0;
  let reminderCount = 0;

  const reminderWindows = [
    { key: "7d", days: 7 },
    { key: "3d", days: 3 },
    { key: "1d", days: 1 },
  ];

  const allActive = await FibSubscriber.find({ status: "active" });

  for (const sub of allActive) {
    const msLeft = sub.expiryDate.getTime() - now.getTime();
    const daysLeft = msLeft / (1000 * 60 * 60 * 24);

    if (daysLeft <= 0) {
      sub.status = "expired";
      await sub.save();

      if (FIB_CHANNEL_ID) {
        try {
          await removeFromFibChannel(sub.telegramId);
          sub.removedAt = new Date();
          await sub.save();
        } catch (err: unknown) {
          const desc =
            err && typeof err === "object" && "description" in err
              ? String((err as { description: string }).description)
              : "";
          if (!desc.includes("PARTICIPANT_ID_INVALID") && !desc.includes("USER_NOT_PARTICIPANT")) {
            console.error(`[bot/fibExpiry] Remove failed telegramId=${sub.telegramId}:`, err);
          }
        }
      }

      try {
        await bot.api.sendMessage(
          Number(sub.telegramId),
          `\u{1F534} <b>FIB Copy Trade Subscription Expired</b>\n\n` +
            `Hi${sub.firstName ? ` <b>${sub.firstName}</b>` : ""}, your subscription has expired and you've been removed from the channel.\n\n` +
            `\u{1F504} Renew for ₦${FIB_PRICE.toLocaleString()} to regain access.`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [[{ text: `💳 Renew — ₦${FIB_PRICE.toLocaleString()}`, callback_data: "fib_subscribe" }]],
            },
          }
        );
      } catch { /* user may have blocked the bot */ }

      expiredCount++;
      await new Promise((r) => setTimeout(r, 300));
      continue;
    }

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
            `⏳ <b>FIB Copy Trade — ${roundedDays} day${roundedDays === 1 ? "" : "s"} left</b>\n\n` +
              `Hi${sub.firstName ? ` <b>${sub.firstName}</b>` : ""}! Your subscription expires on <b>${expiryStr}</b>.\n\n` +
              `Renew for ₦${FIB_PRICE.toLocaleString()} to keep your access.`,
            {
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [[{ text: `💳 Renew — ₦${FIB_PRICE.toLocaleString()}`, callback_data: "fib_subscribe" }]],
              },
            }
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

export { FIB_PRICE, APP_URL, FIB_CHANNEL_ID };
