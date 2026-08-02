import type { BotContext } from "@/bot/context";

export function isFibBotAdmin(ctx: BotContext): boolean {
  const adminIds = (process.env.FIB_BOT_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const senderId = ctx.from?.id.toString();
  return !!senderId && adminIds.includes(senderId);
}
