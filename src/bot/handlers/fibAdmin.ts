import type { Bot } from "grammy";
import type { BotContext } from "@/bot/context";
import { isFibBotAdmin } from "@/bot/middleware/auth";
import { manualActivateFibSubscriber } from "@/bot/services/fibManager";

export function registerFibAdminHandlers(bot: Bot<BotContext>) {
  bot.command("addfibsubscriber", async (ctx) => {
    if (!isFibBotAdmin(ctx)) return;

    ctx.session.fibAdminStep = "awaiting_user_id";
    await ctx.reply(
      "\u{1F4C8} <b>Add FIB Copy Trade Subscriber</b>\n\n" +
        "Send the numeric Telegram user ID to register (they'll be activated for 30 days and get their invite link as soon as they message this bot).",
      { parse_mode: "HTML" }
    );
  });

  bot.on("message:text").filter(
    (ctx) => ctx.session.fibAdminStep === "awaiting_user_id",
    async (ctx) => {
      if (!isFibBotAdmin(ctx)) {
        ctx.session.fibAdminStep = undefined;
        return;
      }

      const raw = ctx.message.text.trim();
      const targetId = parseInt(raw, 10);

      if (!Number.isFinite(targetId) || String(targetId) !== raw) {
        await ctx.reply("That doesn't look like a numeric Telegram user ID. Try again, or send /addfibsubscriber to restart.");
        return;
      }

      let username: string | null = null;
      let firstName: string | null = null;
      let lastName: string | null = null;

      try {
        const chat = await ctx.api.getChat(targetId);
        if ("username" in chat) username = chat.username ?? null;
        if ("first_name" in chat) firstName = chat.first_name ?? null;
        if ("last_name" in chat) lastName = chat.last_name ?? null;
      } catch {
        // Bot may not have seen this user yet — that's fine, name fields stay empty.
      }

      const result = await manualActivateFibSubscriber({
        telegramId: String(targetId),
        username,
        firstName,
        lastName,
      });

      ctx.session.fibAdminStep = undefined;

      await ctx.reply(
        `✅ <b>${result.created ? "Registered" : "Updated"}</b> FIB Copy Trade subscriber <code>${targetId}</code>` +
          (firstName ? ` (${firstName}${lastName ? ` ${lastName}` : ""})` : "") +
          `.\n\nActive for 30 days. They'll receive their channel invite link automatically the next time they message this bot.`,
        { parse_mode: "HTML" }
      );
    }
  );
}
