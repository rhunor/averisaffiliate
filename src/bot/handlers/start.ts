import type { Bot } from "grammy";
import type { BotContext } from "@/bot/context";
import { EMOJI, CALLBACK } from "@/bot/constants";
import { mainMenuKeyboard, helpKeyboard } from "@/bot/keyboards";
import { handleAverisJoin, getSubscriptionStatus } from "@/bot/services/groupManager";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

const WELCOME_TEXT =
  `${EMOJI.WAVE} <b>Welcome to Averis Academy!</b>\n\n` +
  `Averis Academy is Africa's #1 wealth creation platform — we help you build real income selling digital products online, then invest that income to build generational wealth.\n\n` +
  `<b>Here's what I can help you with:</b>\n` +
  `✅ Check your Averis Academy subscription status\n` +
  `\u{1F504} Renew your subscription when it's expiring\n` +
  `\u{1F517} Get your invite link to the Averis community\n` +
  `\u{1F514} Receive automatic reminders before your subscription expires\n\n` +
  `<b>To get started:</b>\n` +
  `Purchase your Averis Academy subscription on our website and tap the <b>Join Community via Bot</b> button in your welcome email — it links your account here automatically.\n\n` +
  `${EMOJI.POINT_DOWN} Use the menu below.`;

async function showMainMenu(ctx: BotContext) {
  const telegramId = ctx.from!.id.toString();
  const status = await getSubscriptionStatus(telegramId);
  const hasSubscription = !!(status?.isSubscribed);

  if (ctx.callbackQuery) {
    await ctx.editMessageText(WELCOME_TEXT, {
      parse_mode: "HTML",
      reply_markup: mainMenuKeyboard(hasSubscription),
    });
  } else {
    await ctx.reply(WELCOME_TEXT, {
      parse_mode: "HTML",
      reply_markup: mainMenuKeyboard(hasSubscription),
    });
  }
}

async function showHelp(ctx: BotContext) {
  const text =
    `${EMOJI.HELP} <b>How Averis Academy Bot Works</b>\n\n` +
    `<b>1. Subscribe on the website</b>\n` +
    `Go to <a href="${APP_URL}">${APP_URL}</a> to purchase your subscription.\n\n` +
    `<b>2. Connect your account</b>\n` +
    `Tap the <b>Join Community via Bot</b> button in your welcome email to link your account here.\n\n` +
    `<b>3. Join the community</b>\n` +
    `The bot verifies your payment and sends you a single-use invite link to the Averis Academy community group.\n\n` +
    `<b>4. Renewal reminders</b>\n` +
    `You'll receive automatic reminders 30, 15, 7, 3 and 1 day before your subscription expires.\n\n` +
    `<b>Renewal price:</b> ₦30,000 for another 12 months\n\n` +
    `Need help? Contact support: <a href="https://wa.me/2348085300040">WhatsApp</a>`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: "HTML",
      reply_markup: helpKeyboard(),
    });
  } else {
    await ctx.reply(text, {
      parse_mode: "HTML",
      reply_markup: helpKeyboard(),
    });
  }
}

export function registerStartHandlers(bot: Bot<BotContext>) {
  bot.command("start", async (ctx) => {
    const payload = ctx.match;

    // Deep link from welcome email: /start averis_link_<referralCode>
    if (typeof payload === "string" && payload.startsWith("averis_link_")) {
      const referralCode = payload.replace("averis_link_", "");
      const telegramId = ctx.from!.id.toString();

      await ctx.reply(`${EMOJI.HOURGLASS} <b>Connecting your Averis Academy account…</b>`, {
        parse_mode: "HTML",
      });

      const result = await handleAverisJoin(telegramId, referralCode);

      if (!result.success) {
        await ctx.reply(
          `${EMOJI.WARNING} <b>Could not connect account</b>\n\n${result.message}\n\nNeed help? Contact <a href="https://wa.me/2348085300040">support</a>.`,
          { parse_mode: "HTML" }
        );
      }
      // On success, handleAverisJoin already sent the invite DM
      return;
    }

    await showMainMenu(ctx);
  });

  bot.command("help", showHelp);

  bot.command("status", async (ctx) => {
    const telegramId = ctx.from!.id.toString();
    const status = await getSubscriptionStatus(telegramId);

    if (!status?.isSubscribed) {
      await ctx.reply(
        `\u{1F534} <b>No Active Subscription</b>\n\n` +
          `Your Telegram account is not linked to an active Averis Academy subscription.\n\n` +
          `Subscribe at <a href="${APP_URL}">${APP_URL}</a> then use the link in your welcome email to connect here.`,
        { parse_mode: "HTML" }
      );
      return;
    }

    const daysLeft = status.daysLeft!;
    const isLifetime = daysLeft > 5000;

    if (isLifetime) {
      await ctx.reply(
        `🎁 <b>Lifetime Access</b>\n\n` +
          `Hi <b>${status.firstName}</b>!\n\n` +
          `You have <b>lifetime access</b> to Averis Academy — your account will never expire.\n\n` +
          `Keep sharing your affiliate link to earn commissions!`,
        { parse_mode: "HTML" }
      );
      return;
    }

    const expiryStr = status.expiryDate!.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const urgency = daysLeft <= 3 ? "\u{1F534}" : daysLeft <= 15 ? "⚠️" : "\u{1F7E2}";

    await ctx.reply(
      `${urgency} <b>Subscription Active</b>\n\n` +
        `Hi <b>${status.firstName}</b>!\n\n` +
        `Expires: <b>${expiryStr}</b>\n` +
        `Days left: <b>${daysLeft} day${daysLeft === 1 ? "" : "s"}</b>\n\n` +
        (daysLeft <= 30
          ? `<a href="${APP_URL}/dashboard/subscription">Renew for ₦30,000 →</a>`
          : `Keep sharing your affiliate link to earn commissions!`),
      { parse_mode: "HTML" }
    );
  });

  bot.callbackQuery(CALLBACK.MAIN_MENU, async (ctx) => {
    await ctx.answerCallbackQuery();
    await showMainMenu(ctx);
  });

  bot.callbackQuery(CALLBACK.HELP, async (ctx) => {
    await ctx.answerCallbackQuery();
    await showHelp(ctx);
  });
}
