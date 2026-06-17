/**
 * Singleton bot instance. Imported by the webhook route, handlers, and
 * the groupManager service. We use a getter rather than top-level init so
 * Next.js build doesn't throw when TELEGRAM_BOT_TOKEN is absent.
 */
import { Bot, session } from "grammy";
import type { BotContext, SessionData } from "@/bot/context";

let _bot: Bot<BotContext> | null = null;

export function getBotInstance(): Bot<BotContext> {
  if (_bot) return _bot;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  _bot = new Bot<BotContext>(token);
  _bot.use(session({ initial: (): SessionData => ({}) }));
  _bot.catch((err) => console.error("[bot]", err));

  return _bot;
}
