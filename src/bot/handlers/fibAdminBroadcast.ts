import type { Bot } from "grammy";
import type { BotContext } from "@/bot/context";
import { CALLBACK } from "@/bot/constants";
import { fibBroadcastTargetKeyboard, fibBroadcastConfirmKeyboard, adminPanelKeyboard } from "@/bot/keyboards";
import { isFibBotAdmin } from "@/bot/middleware/auth";
import { safeEditMessageText } from "@/bot/utils";
import { getBotInstance } from "@/bot/instance";
import { FIB_CHANNEL_ID } from "@/bot/services/fibManager";
import dbConnect from "@/lib/db";
import FibSubscriber from "@/models/FibSubscriber";

function clearBroadcastState(ctx: BotContext) {
  ctx.session.fibAdminPanelStep = undefined;
  ctx.session.fibBroadcastTarget = undefined;
  ctx.session.fibPendingBroadcastMessage = undefined;
}

async function backToPanel(ctx: BotContext) {
  clearBroadcastState(ctx);
  await safeEditMessageText(
    ctx,
    `\u{1F6E0} <b>FIB Copy Trade — Admin Panel</b>\n\nChoose an action below.`,
    { parse_mode: "HTML", reply_markup: adminPanelKeyboard() }
  );
}

export function registerFibAdminBroadcastHandlers(bot: Bot<BotContext>) {
  bot.callbackQuery(CALLBACK.FIB_ADMIN_BROADCAST, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;

    clearBroadcastState(ctx);
    await safeEditMessageText(
      ctx,
      `\u{1F4E2} <b>Broadcast</b>\n\nChoose where to send your message:`,
      { parse_mode: "HTML", reply_markup: fibBroadcastTargetKeyboard() }
    );
  });

  bot.callbackQuery(CALLBACK.FIB_BROADCAST_TARGET_ALL, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;

    ctx.session.fibBroadcastTarget = "all";
    ctx.session.fibAdminPanelStep = "awaiting_broadcast_message";

    await dbConnect();
    const activeCount = await FibSubscriber.countDocuments({ status: "active" });

    await safeEditMessageText(
      ctx,
      `\u{1F4E2} <b>Broadcast to All Subscribers</b>\n\n` +
        `Active subscribers: <b>${activeCount}</b>\n\n` +
        `Type your message below (HTML formatting supported).\nSend /cancel to go back.`,
      { parse_mode: "HTML" }
    );
  });

  bot.callbackQuery(CALLBACK.FIB_BROADCAST_TARGET_CHANNEL, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;

    ctx.session.fibBroadcastTarget = "channel";
    ctx.session.fibAdminPanelStep = "awaiting_broadcast_message";

    await safeEditMessageText(
      ctx,
      `\u{1F4E2} <b>Post to FIB Copy Trade Channel</b>\n\n` +
        `Type your message below (HTML formatting supported).\nSend /cancel to go back.`,
      { parse_mode: "HTML" }
    );
  });

  bot.on("message:text").filter(
    (ctx) => ctx.session.fibAdminPanelStep === "awaiting_broadcast_message",
    async (ctx) => {
      if (!isFibBotAdmin(ctx)) {
        clearBroadcastState(ctx);
        return;
      }

      const text = ctx.message.text;

      if (text === "/cancel") {
        await backToPanel(ctx);
        return;
      }

      ctx.session.fibPendingBroadcastMessage = text;
      ctx.session.fibAdminPanelStep = undefined;

      await dbConnect();
      let previewLabel = "";
      if (ctx.session.fibBroadcastTarget === "all") {
        const activeCount = await FibSubscriber.countDocuments({ status: "active" });
        previewLabel = `Send to <b>${activeCount}</b> active subscriber(s)`;
      } else {
        previewLabel = `Post to the FIB Copy Trade channel`;
      }

      await ctx.reply(
        `\u{1F4E2} <b>Preview</b>\n\n<i>${text}</i>\n\n${previewLabel}\n\nConfirm send?`,
        { parse_mode: "HTML", reply_markup: fibBroadcastConfirmKeyboard() }
      );
    }
  );

  bot.callbackQuery(CALLBACK.FIB_BROADCAST_SEND, async (ctx) => {
    await ctx.answerCallbackQuery("Sending...");
    if (!isFibBotAdmin(ctx)) return;

    const message = ctx.session.fibPendingBroadcastMessage;
    const target = ctx.session.fibBroadcastTarget ?? "all";
    clearBroadcastState(ctx);

    if (!message) {
      await ctx.reply("No message to send. Please start over.");
      return;
    }

    await dbConnect();
    const bot = getBotInstance();

    if (target === "channel") {
      if (!FIB_CHANNEL_ID) {
        await ctx.reply("FIB_TELEGRAM_CHANNEL_ID is not configured.", {
          reply_markup: adminPanelKeyboard(),
        });
        return;
      }
      try {
        await bot.api.sendMessage(Number(FIB_CHANNEL_ID), message, { parse_mode: "HTML" });
        await ctx.reply(`✅ Message posted to the FIB Copy Trade channel.`, {
          reply_markup: adminPanelKeyboard(),
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        await ctx.reply(`❌ Failed to post to channel.\n\n${errMsg}`, {
          reply_markup: adminPanelKeyboard(),
        });
      }
      return;
    }

    const subscribers = await FibSubscriber.find({ status: "active" });
    let successCount = 0;
    let failCount = 0;

    for (const sub of subscribers) {
      try {
        await bot.api.sendMessage(Number(sub.telegramId), message, { parse_mode: "HTML" });
        successCount++;
      } catch {
        failCount++;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    await ctx.reply(
      `\u{1F4E2} <b>Broadcast Complete</b>\n\n✅ Sent: ${successCount}\n❌ Failed: ${failCount}`,
      { parse_mode: "HTML", reply_markup: adminPanelKeyboard() }
    );
  });

  bot.callbackQuery(CALLBACK.FIB_BROADCAST_CANCEL, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;
    await backToPanel(ctx);
  });
}
