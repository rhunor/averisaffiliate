/**
 * Delivers the FIB Copy Trade invite link the first time a manually
 * registered subscriber texts the bot. Telegram bots can't message a user
 * who hasn't started a conversation, so /addfibsubscriber registers the
 * subscriber with inviteSentAt: null and this middleware watches every
 * incoming update for that pending state.
 *
 * Always calls next() so every existing handler (Averis included) runs
 * completely unaffected — this is purely additive.
 */
import type { Bot, MiddlewareFn } from "grammy";
import type { BotContext } from "@/bot/context";
import dbConnect from "@/lib/db";
import FibSubscriber from "@/models/FibSubscriber";
import { getBotInstance } from "@/bot/instance";
import { generateFibInviteLink } from "@/bot/services/fibManager";

const fibAutoInviteMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
  const telegramId = ctx.from?.id.toString();

  if (telegramId) {
    try {
      await dbConnect();
      const sub = await FibSubscriber.findOne({
        telegramId,
        status: "active",
        inviteSentAt: null,
      });

      if (sub) {
        const bot = getBotInstance();
        const link = await generateFibInviteLink();
        const expiryStr = sub.expiryDate.toLocaleDateString("en-NG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        await bot.api.sendMessage(
          Number(telegramId),
          `\u{1F4C8} <b>Welcome to FIB Copy Trade By Averis Academy!</b>\n\n` +
            `Hi${sub.firstName ? ` <b>${sub.firstName}</b>` : ""}! You've been registered for the forex signals channel. Here's your invite:\n\n` +
            `${link}\n\n` +
            `⚠️ This link is single-use. Join now before it expires!\n\n` +
            `Your subscription is active until <b>${expiryStr}</b>.`,
          { parse_mode: "HTML" }
        );

        sub.inviteSentAt = new Date();
        await sub.save();
      }
    } catch (err) {
      console.error("[bot/fibAutoInvite]", err);
    }
  }

  await next();
};

export function registerFibAutoInvite(bot: Bot<BotContext>) {
  bot.use(fibAutoInviteMiddleware);
}
