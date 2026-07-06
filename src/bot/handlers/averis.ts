import { InlineKeyboard } from "grammy";
import type { Bot } from "grammy";
import type { BotContext } from "@/bot/context";
import { EMOJI, CALLBACK } from "@/bot/constants";
import { mainMenuKeyboard } from "@/bot/keyboards";
import { getSubscriptionStatus, generateInviteLink, generateChannelInviteLink } from "@/bot/services/groupManager";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

async function showAverisStatus(ctx: BotContext) {
  await ctx.answerCallbackQuery();
  const telegramId = ctx.from!.id.toString();
  const status = await getSubscriptionStatus(telegramId);
  const hasSubscription = !!(status?.isSubscribed);

  let text: string;
  if (!hasSubscription) {
    text =
      `\u{1F534} <b>No Active Averis Academy Subscription</b>\n\n` +
      `Your Telegram account is not linked to an active subscription.\n\n` +
      `If you've already paid, tap the <b>Join Community via Bot</b> link in your welcome email to connect your account.\n\n` +
      `To subscribe, visit <a href="${APP_URL}">${APP_URL}</a>.`;
  } else {
    const expiryStr = status!.expiryDate!.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const daysLeft = status!.daysLeft!;
    const urgency = daysLeft <= 3 ? "\u{1F534}" : daysLeft <= 15 ? "⚠️" : "\u{1F7E2}";

    text =
      `${urgency} <b>Averis Academy Subscription</b>\n\n` +
      `Hi <b>${status!.firstName}</b>!\n\n` +
      `Status: <b>Active</b>\n` +
      `Expires: <b>${expiryStr}</b>\n` +
      `Days remaining: <b>${daysLeft} day${daysLeft === 1 ? "" : "s"}</b>\n\n` +
      (daysLeft <= 30
        ? `\u{1F4B3} Your subscription expires soon. Renew for ₦30,000 to keep your access and commissions.`
        : `Keep sharing your referral link to earn 50% on every sale!`);
  }

  await ctx.editMessageText(text, {
    parse_mode: "HTML",
    reply_markup: mainMenuKeyboard(hasSubscription),
  });
}

async function handleAverisRenew(ctx: BotContext) {
  await ctx.answerCallbackQuery();
  const telegramId = ctx.from!.id.toString();
  const status = await getSubscriptionStatus(telegramId);

  if (!status?.isSubscribed) {
    await ctx.editMessageText(
      `\u{1F534} <b>No subscription found to renew.</b>\n\nCheck your status first.`,
      { parse_mode: "HTML", reply_markup: mainMenuKeyboard(false) }
    );
    return;
  }

  const expiryStr = status.expiryDate!.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await ctx.editMessageText(
    `\u{1F504} <b>Renew Your Averis Academy Subscription</b>\n\n` +
      `Current expiry: <b>${expiryStr}</b>\n` +
      `Renewal price: <b>₦30,000</b> for another 6 months\n\n` +
      `Tap the button below to complete your renewal. Your subscription extends automatically after payment is confirmed.`,
    {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .url("\u{1F4B3} Renew Now — \u{20A6}30,000", `${APP_URL}/dashboard/subscription`)
        .row()
        .text(`${EMOJI.BACK} Back`, CALLBACK.MAIN_MENU),
    }
  );
}

async function handleAverisReinvite(ctx: BotContext) {
  await ctx.answerCallbackQuery();
  const telegramId = ctx.from!.id.toString();
  const status = await getSubscriptionStatus(telegramId);

  if (!status?.isSubscribed) {
    await ctx.editMessageText(
      `\u{1F534} <b>No active subscription found.</b>\n\nYou need an active subscription to get a community invite.`,
      { parse_mode: "HTML", reply_markup: mainMenuKeyboard(false) }
    );
    return;
  }

  try {
    const [groupLink, channelLink] = await Promise.all([
      generateInviteLink(),
      generateChannelInviteLink(),
    ]);

    let text =
      `\u{1F517} <b>Your Averis Academy Community Invite</b>\n\n` +
      `\u{1F4AC} <b>Community Group:</b>\n${groupLink}\n\n`;

    if (channelLink) {
      text += `\u{1F4E2} <b>Announcement Channel:</b>\n${channelLink}\n\n`;
    }

    text += `⚠️ These links are single-use. Join immediately!`;

    await ctx.editMessageText(text, {
      parse_mode: "HTML",
      reply_markup: mainMenuKeyboard(true),
    });
  } catch {
    await ctx.editMessageText(
      `${EMOJI.WARNING} Could not generate invite link. Please try again or email Averislimited@gmail.com.`,
      { parse_mode: "HTML", reply_markup: mainMenuKeyboard(true) }
    );
  }
}

export function registerAverisHandlers(bot: Bot<BotContext>) {
  bot.callbackQuery(CALLBACK.AVERIS_STATUS, showAverisStatus);
  bot.callbackQuery(CALLBACK.AVERIS_RENEW, handleAverisRenew);
  bot.callbackQuery(CALLBACK.AVERIS_REINVITE, handleAverisReinvite);
}
