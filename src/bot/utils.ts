import { GrammyError } from "grammy";
import type { BotContext } from "@/bot/context";

/**
 * ctx.editMessageText throws a GrammyError("Bad Request: message is not
 * modified") whenever the new text+keyboard are byte-identical to what's
 * already on screen (e.g. tapping "Back" twice in a row). That's not a
 * real failure — there's nothing to change — but left uncaught it bubbles
 * up to the global bot.catch and the button appears to silently do
 * nothing. Swallow only that specific error; let everything else surface.
 */
export async function safeEditMessageText(
  ctx: BotContext,
  text: string,
  extra?: Parameters<BotContext["editMessageText"]>[1]
): Promise<void> {
  try {
    await ctx.editMessageText(text, extra);
  } catch (err) {
    if (err instanceof GrammyError && err.description.includes("message is not modified")) {
      return;
    }
    throw err;
  }
}
