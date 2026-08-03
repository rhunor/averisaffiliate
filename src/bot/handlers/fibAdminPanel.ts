import type { Bot } from "grammy";
import type { BotContext } from "@/bot/context";
import { CALLBACK } from "@/bot/constants";
import { adminPanelKeyboard, fibAdminBackButton } from "@/bot/keyboards";
import { isFibBotAdmin } from "@/bot/middleware/auth";
import { safeEditMessageText } from "@/bot/utils";
import dbConnect from "@/lib/db";
import FibSubscriber from "@/models/FibSubscriber";
import FibPayment from "@/models/FibPayment";

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

async function showAdminPanel(ctx: BotContext) {
  const text = `\u{1F6E0} <b>FIB Copy Trade — Admin Panel</b>\n\nChoose an action below.`;

  if (ctx.callbackQuery) {
    await safeEditMessageText(ctx, text, { parse_mode: "HTML", reply_markup: adminPanelKeyboard() });
  } else {
    await ctx.reply(text, { parse_mode: "HTML", reply_markup: adminPanelKeyboard() });
  }
}

async function showStats(ctx: BotContext) {
  await dbConnect();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    activeCount,
    expiredCount,
    expiringSoonCount,
    monthlyRevenueAgg,
    totalRevenueAgg,
    totalSuccessfulPayments,
  ] = await Promise.all([
    FibSubscriber.countDocuments({ status: "active" }),
    FibSubscriber.countDocuments({ status: "expired" }),
    FibSubscriber.countDocuments({ status: "active", expiryDate: { $gte: now, $lte: sevenDaysFromNow } }),
    FibPayment.aggregate([
      { $match: { status: "successful", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    FibPayment.aggregate([
      { $match: { status: "successful" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    FibPayment.countDocuments({ status: "successful" }),
  ]);

  const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  const text =
    `\u{1F4CA} <b>FIB Copy Trade — Stats</b>\n\n` +
    `\u{1F7E2} Active subscribers: <b>${activeCount}</b>\n` +
    `\u{1F534} Expired subscribers: <b>${expiredCount}</b>\n` +
    `⚠️ Expiring in next 7 days: <b>${expiringSoonCount}</b>\n\n` +
    `\u{1F4B0} Revenue this month: <b>${formatNaira(monthlyRevenue)}</b>\n` +
    `\u{1F4B0} Revenue all-time: <b>${formatNaira(totalRevenue)}</b>\n` +
    `✅ Successful payments all-time: <b>${totalSuccessfulPayments}</b>`;

  await safeEditMessageText(ctx, text, {
    parse_mode: "HTML",
    reply_markup: fibAdminBackButton(),
  });
}

async function showRecentPayments(ctx: BotContext) {
  await dbConnect();

  const payments = await FibPayment.find({}).sort({ createdAt: -1 }).limit(20);

  if (payments.length === 0) {
    await safeEditMessageText(
      ctx,
      `\u{1F4B3} <b>Recent Payments</b>\n\nNo payments yet.`,
      { parse_mode: "HTML", reply_markup: fibAdminBackButton() }
    );
    return;
  }

  const statusIcon = (status: string) =>
    status === "successful" ? "✅" : status === "pending" ? "⏳" : "❌";

  const entries = payments.map((p) => {
    const name = [p.firstName, p.lastName].filter(Boolean).join(" ") || p.username || p.telegramId;
    const when = p.createdAt.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${statusIcon(p.status)} ${name} (${p.telegramId}) — ₦${p.amount.toLocaleString()} — ${when}`;
  });

  await safeEditMessageText(
    ctx,
    `\u{1F4B3} <b>Recent Payments</b>\n\n${entries.join("\n")}`,
    { parse_mode: "HTML", reply_markup: fibAdminBackButton() }
  );
}

export function registerFibAdminPanelHandlers(bot: Bot<BotContext>) {
  bot.callbackQuery(CALLBACK.FIB_ADMIN_PANEL, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;
    await showAdminPanel(ctx);
  });

  bot.callbackQuery(CALLBACK.FIB_ADMIN_STATS, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;
    await showStats(ctx);
  });

  bot.callbackQuery(CALLBACK.FIB_ADMIN_PAYMENTS, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!isFibBotAdmin(ctx)) return;
    await showRecentPayments(ctx);
  });
}
