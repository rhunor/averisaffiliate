/**
 * Singleton bot instance. Imported by the webhook route, handlers, and
 * the groupManager service. We use a getter rather than top-level init so
 * Next.js build doesn't throw when TELEGRAM_BOT_TOKEN is absent.
 */
import { Bot, GrammyError, session } from "grammy";
import type { BotContext, SessionData } from "@/bot/context";

let _bot: Bot<BotContext> | null = null;

export function getBotInstance(): Bot<BotContext> {
  if (_bot) return _bot;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  _bot = new Bot<BotContext>(token);
  _bot.use(session({ initial: (): SessionData => ({}) }));

  // Any unhandled error used to fail silently from the user's perspective
  // (button taps that "did nothing"). Surface something instead of dead
  // silence, whenever we still have a ctx to reply through.
  _bot.catch(async (botErr) => {
    console.error("[bot]", botErr.error);

    const { ctx, error } = botErr;
    if (error instanceof GrammyError && error.description.includes("message is not modified")) {
      return; // harmless no-op edit, nothing to tell the user
    }

    try {
      if (ctx.callbackQuery) {
        await ctx.answerCallbackQuery({ text: "Something went wrong. Please try again.", show_alert: true }).catch(() => {});
      } else if (ctx.chat) {
        await ctx.reply("⚠️ Something went wrong. Please try again.").catch(() => {});
      }
    } catch {
      // best-effort only
    }
  });

  return _bot;
}
