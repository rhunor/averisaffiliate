import { InlineKeyboard } from "grammy";
import type { Bot } from "grammy";
import type { BotContext } from "@/bot/context";
import { EMOJI, CALLBACK } from "@/bot/constants";
import { fibMenuKeyboard } from "@/bot/keyboards";
import dbConnect from "@/lib/db";
import FibPayment from "@/models/FibPayment";
import {
  getFibSubscriptionStatus,
  generateFibInviteLink,
  createFibCheckout,
  activateFibSubscription,
  FIB_PRICE,
  APP_URL,
} from "@/bot/services/fibManager";
import { safeEditMessageText } from "@/bot/utils";

async function showFibMenu(ctx: BotContext) {
  const telegramId = ctx.from!.id.toString();
  const status = await getFibSubscriptionStatus(telegramId);
  const hasSubscription = !!status?.isSubscribed;

  let text: string;
  if (!hasSubscription) {
    text =
      `\u{1F4C8} <b>FIB Copy Trade By Averis Academy</b>\n\n` +
      `Get daily forex signals and copy-trade calls in our private Telegram channel.\n\n` +
      `\u{1F4B0} <b>Price:</b> ₦${FIB_PRICE.toLocaleString()} / month\n\n` +
      `Tap Subscribe below to pay with Korapay and get instant access.`;
  } else {
    const expiryStr = status!.expiryDate!.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const daysLeft = status!.daysLeft!;
    const urgency = daysLeft <= 3 ? "\u{1F534}" : daysLeft <= 7 ? "⚠️" : "\u{1F7E2}";

    text =
      `${urgency} <b>FIB Copy Trade Subscription</b>\n\n` +
      `Status: <b>Active</b>\n` +
      `Expires: <b>${expiryStr}</b>\n` +
      `Days remaining: <b>${daysLeft} day${daysLeft === 1 ? "" : "s"}</b>`;
  }

  if (ctx.callbackQuery) {
    await safeEditMessageText(ctx, text, { parse_mode: "HTML", reply_markup: fibMenuKeyboard(hasSubscription) });
  } else {
    await ctx.reply(text, { parse_mode: "HTML", reply_markup: fibMenuKeyboard(hasSubscription) });
  }
}

async function handleFibSubscribe(ctx: BotContext) {
  await ctx.answerCallbackQuery();
  const telegramId = ctx.from!.id.toString();

  try {
    const redirectUrl = `${APP_URL}/api/payments/fib/redirect`;
    const checkoutUrl = await createFibCheckout({
      telegramId,
      username: ctx.from!.username ?? null,
      firstName: ctx.from!.first_name ?? null,
      lastName: ctx.from!.last_name ?? null,
      redirectUrl,
    });

    await safeEditMessageText(
      ctx,
      `\u{1F4B3} <b>Subscribe to FIB Copy Trade — ₦${FIB_PRICE.toLocaleString()}</b>\n\n` +
        `Tap below to pay with Korapay. After paying, come back and tap "I've Paid" to confirm.`,
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .url("\u{1F4B3} Pay Now", checkoutUrl)
          .row()
          .text("✅ I've Paid", CALLBACK.FIB_VERIFY)
          .row()
          .text(`${EMOJI.BACK} Back`, CALLBACK.FIB_MENU),
      }
    );
  } catch (err) {
    console.error("[bot/fib] checkout init failed:", err);
    await safeEditMessageText(
      ctx,
      `${EMOJI.WARNING} Could not start checkout. Please try again shortly.`,
      { parse_mode: "HTML", reply_markup: fibMenuKeyboard(false) }
    );
  }
}

async function handleFibVerify(ctx: BotContext) {
  await ctx.answerCallbackQuery();
  const telegramId = ctx.from!.id.toString();

  await dbConnect();
  const pending = await FibPayment.findOne({ telegramId, status: "pending" }).sort({ createdAt: -1 });

  if (!pending) {
    await safeEditMessageText(
      ctx,
      `${EMOJI.WARNING} No pending payment found. Tap Subscribe to start a new one.`,
      { parse_mode: "HTML", reply_markup: fibMenuKeyboard(false) }
    );
    return;
  }

  const result = await activateFibSubscription(pending.reference);

  if (!result.success) {
    await safeEditMessageText(
      ctx,
      `⏳ <b>Payment not confirmed yet.</b>\n\nIf you've just paid, wait a moment and tap "I've Paid" again.`,
      {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .text("✅ I've Paid", CALLBACK.FIB_VERIFY)
          .row()
          .text(`${EMOJI.BACK} Back`, CALLBACK.FIB_MENU),
      }
    );
    return;
  }

  await safeEditMessageText(
    ctx,
    `✅ <b>Payment confirmed!</b>\n\nYour FIB Copy Trade invite link has been sent to you above.`,
    { parse_mode: "HTML", reply_markup: fibMenuKeyboard(true) }
  );
}

async function handleFibReinvite(ctx: BotContext) {
  await ctx.answerCallbackQuery();
  const telegramId = ctx.from!.id.toString();
  const status = await getFibSubscriptionStatus(telegramId);

  if (!status?.isSubscribed) {
    await safeEditMessageText(
      ctx,
      `\u{1F534} <b>No active subscription found.</b>`,
      { parse_mode: "HTML", reply_markup: fibMenuKeyboard(false) }
    );
    return;
  }

  try {
    const link = await generateFibInviteLink();
    await safeEditMessageText(
      ctx,
      `\u{1F517} <b>Your FIB Copy Trade Invite</b>\n\n${link}\n\n⚠️ Single-use — join immediately!`,
      { parse_mode: "HTML", reply_markup: fibMenuKeyboard(true) }
    );
  } catch {
    await safeEditMessageText(
      ctx,
      `${EMOJI.WARNING} Could not generate invite link. Please try again shortly.`,
      { parse_mode: "HTML", reply_markup: fibMenuKeyboard(true) }
    );
  }
}

export function registerFibHandlers(bot: Bot<BotContext>) {
  bot.callbackQuery(CALLBACK.FIB_MENU, async (ctx) => {
    await ctx.answerCallbackQuery();
    await showFibMenu(ctx);
  });
  bot.callbackQuery(CALLBACK.FIB_SUBSCRIBE, handleFibSubscribe);
  bot.callbackQuery(CALLBACK.FIB_RENEW, handleFibSubscribe);
  bot.callbackQuery(CALLBACK.FIB_VERIFY, handleFibVerify);
  bot.callbackQuery(CALLBACK.FIB_REINVITE, handleFibReinvite);
}
