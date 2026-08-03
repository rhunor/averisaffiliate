import type { Bot } from "grammy";
import type { BotContext } from "@/bot/context";
import { CALLBACK, PAGE_SIZE } from "@/bot/constants";
import { fibSubscriberListKeyboard, fibSubscriberDetailKeyboard, fibAdminBackButton } from "@/bot/keyboards";
import { isFibBotAdmin } from "@/bot/middleware/auth";
import { safeEditMessageText } from "@/bot/utils";
import { removeFromFibChannel } from "@/bot/services/fibManager";
import dbConnect from "@/lib/db";
import FibSubscriber, { type IFibSubscriber } from "@/models/FibSubscriber";

function daysLeft(expiryDate: Date): number {
  return Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function formatEntry(sub: IFibSubscriber, index: number): string {
  const statusIcon = sub.status === "active" ? "\u{1F7E2}" : "\u{1F534}";
  const name = [sub.firstName, sub.lastName].filter(Boolean).join(" ") || sub.username || "Unknown";
  return (
    `${index}. ${statusIcon} ${name} (${sub.telegramId})\n` +
    `   Expires: ${sub.expiryDate.toLocaleDateString("en-NG")} (${daysLeft(sub.expiryDate)}d left)\n` +
    `   \u{1F449} /fibsub_${sub.telegramId}`
  );
}

async function showSubscriberList(ctx: BotContext, page: number) {
  await dbConnect();

  const total = await FibSubscriber.countDocuments({});
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  page = Math.max(0, Math.min(page, totalPages - 1));
  ctx.session.fibSubscriberPage = page;

  const subscribers = await FibSubscriber.find({})
    .sort({ expiryDate: -1 })
    .skip(page * PAGE_SIZE)
    .limit(PAGE_SIZE);

  if (subscribers.length === 0) {
    await safeEditMessageText(
      ctx,
      `\u{1F465} <b>FIB Subscribers</b>\n\nNo subscribers found.`,
      { parse_mode: "HTML", reply_markup: fibAdminBackButton() }
    );
    return;
  }

  const start = page * PAGE_SIZE + 1;
  const end = Math.min(start + subscribers.length - 1, total);
  const entries = subscribers.map((s, i) => formatEntry(s, start + i));

  const text =
    `\u{1F465} <b>FIB Subscribers</b>\n\n${entries.join("\n\n")}\n\n` +
    `<i>Showing ${start}-${end} of ${total}. Tap a /fibsub_ line to manage that subscriber.</i>`;

  await safeEditMessageText(ctx, text, {
    parse_mode: "HTML",
    reply_markup: fibSubscriberListKeyboard(page, totalPages),
  });
}

async function showSubscriberDetail(ctx: BotContext, telegramId: string) {
  await dbConnect();
  const sub = await FibSubscriber.findOne({ telegramId });

  if (!sub) {
    await ctx.reply(`No FIB subscriber found with Telegram ID ${telegramId}.`);
    return;
  }

  ctx.session.fibAdminDetailTelegramId = telegramId;

  const name = [sub.firstName, sub.lastName].filter(Boolean).join(" ") || sub.username || "Unknown";
  const text =
    `\u{1F464} <b>${name}</b>\n\n` +
    `Telegram ID: <code>${sub.telegramId}</code>\n` +
    `Username: ${sub.username ? "@" + sub.username : "—"}\n` +
    `Status: <b>${sub.status}</b>\n` +
    `Start: ${sub.startDate.toLocaleDateString("en-NG")}\n` +
    `Expires: ${sub.expiryDate.toLocaleDateString("en-NG")} (${daysLeft(sub.expiryDate)}d left)\n` +
    `Added by: ${sub.addedBy}\n` +
    `Invite sent: ${sub.inviteSentAt ? sub.inviteSentAt.toLocaleDateString("en-NG") : "Not yet"}`;

  await ctx.reply(text, { parse_mode: "HTML", reply_markup: fibSubscriberDetailKeyboard() });
}

export function registerFibAdminSubscriberHandlers(bot: Bot<BotContext>) {
  bot.callbackQuery(CALLBACK.FIB_ADMIN_SUBS, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;
    await showSubscriberList(ctx, 0);
  });

  bot.callbackQuery(CALLBACK.FIB_ADMIN_SUBS_NEXT, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;
    await showSubscriberList(ctx, (ctx.session.fibSubscriberPage || 0) + 1);
  });

  bot.callbackQuery(CALLBACK.FIB_ADMIN_SUBS_PREV, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;
    await showSubscriberList(ctx, Math.max(0, (ctx.session.fibSubscriberPage || 0) - 1));
  });

  bot.callbackQuery(CALLBACK.FIB_ADMIN_SUBS_SEARCH, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;

    ctx.session.fibAdminPanelStep = "awaiting_search_query";
    await safeEditMessageText(
      ctx,
      `\u{1F50D} <b>Search Subscribers</b>\n\nSend a Telegram ID, username, or name to search.\n\nSend /cancel to go back.`,
      { parse_mode: "HTML" }
    );
  });

  bot.on("message:text").filter(
    (ctx) => ctx.session.fibAdminPanelStep === "awaiting_search_query",
    async (ctx) => {
      if (!isFibBotAdmin(ctx)) {
        ctx.session.fibAdminPanelStep = undefined;
        return;
      }

      const query = ctx.message.text.trim();
      ctx.session.fibAdminPanelStep = undefined;

      if (query === "/cancel") {
        await showSubscriberList(ctx, 0);
        return;
      }

      await dbConnect();
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const results = await FibSubscriber.find({
        $or: [
          { telegramId: { $regex: escaped, $options: "i" } },
          { username: { $regex: escaped, $options: "i" } },
          { firstName: { $regex: escaped, $options: "i" } },
          { lastName: { $regex: escaped, $options: "i" } },
        ],
      })
        .sort({ expiryDate: -1 })
        .limit(PAGE_SIZE);

      if (results.length === 0) {
        await ctx.reply(`No subscribers found matching "${query}".`, {
          reply_markup: fibAdminBackButton(CALLBACK.FIB_ADMIN_SUBS),
        });
        return;
      }

      const entries = results.map((s, i) => formatEntry(s, i + 1));
      await ctx.reply(`\u{1F50D} <b>Search Results</b>\n\n${entries.join("\n\n")}`, {
        parse_mode: "HTML",
        reply_markup: fibAdminBackButton(CALLBACK.FIB_ADMIN_SUBS),
      });
    }
  );

  bot.hears(/^\/fibsub_(\d+)$/, async (ctx) => {
    if (!isFibBotAdmin(ctx)) return;
    await showSubscriberDetail(ctx, ctx.match[1]);
  });

  bot.callbackQuery(CALLBACK.FIB_ADMIN_SUB_EXTEND, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;

    const telegramId = ctx.session.fibAdminDetailTelegramId;
    if (!telegramId) {
      await ctx.reply("No subscriber selected. Open their detail screen again.");
      return;
    }

    await dbConnect();
    const sub = await FibSubscriber.findOne({ telegramId });
    if (!sub) {
      await ctx.reply("Subscriber not found.");
      return;
    }

    const now = new Date();
    const base = sub.status === "active" && sub.expiryDate > now ? sub.expiryDate : now;
    sub.expiryDate = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
    sub.status = "active";
    sub.removedAt = null;
    sub.remindersSent = [];
    await sub.save();

    await ctx.reply(
      `✅ Extended <b>${telegramId}</b> to ${sub.expiryDate.toLocaleDateString("en-NG")}.`,
      { parse_mode: "HTML", reply_markup: fibAdminBackButton(CALLBACK.FIB_ADMIN_SUBS) }
    );
  });

  bot.callbackQuery(CALLBACK.FIB_ADMIN_SUB_REMOVE, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;

    const telegramId = ctx.session.fibAdminDetailTelegramId;
    if (!telegramId) {
      await ctx.reply("No subscriber selected. Open their detail screen again.");
      return;
    }

    await dbConnect();
    const sub = await FibSubscriber.findOne({ telegramId });
    if (!sub) {
      await ctx.reply("Subscriber not found.");
      return;
    }

    try {
      await removeFromFibChannel(telegramId);
    } catch (err) {
      console.error("[bot/fibAdminSubscribers] remove failed:", err);
    }

    sub.status = "expired";
    sub.removedAt = new Date();
    await sub.save();

    await ctx.reply(
      `\u{1F5D1} Removed <b>${telegramId}</b> from the channel and marked expired.`,
      { parse_mode: "HTML", reply_markup: fibAdminBackButton(CALLBACK.FIB_ADMIN_SUBS) }
    );
  });
}
