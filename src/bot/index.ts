import { webhookCallback } from "grammy";
import { getBotInstance } from "@/bot/instance";
import { registerStartHandlers } from "@/bot/handlers/start";
import { registerAverisHandlers } from "@/bot/handlers/averis";
import { registerFibAutoInvite } from "@/bot/handlers/fibAutoInvite";
import { registerFibAdminHandlers } from "@/bot/handlers/fibAdmin";
import { registerFibHandlers } from "@/bot/handlers/fib";
import { registerFibAdminPanelHandlers } from "@/bot/handlers/fibAdminPanel";
import { registerFibAdminSubscriberHandlers } from "@/bot/handlers/fibAdminSubscribers";
import { registerFibAdminBroadcastHandlers } from "@/bot/handlers/fibAdminBroadcast";

export function buildBot() {
  const bot = getBotInstance();

  // Must run before other handlers so a pending FIB invite is delivered
  // on the subscriber's very next message, but always calls next() so
  // every handler below still runs exactly as before.
  registerFibAutoInvite(bot);

  registerStartHandlers(bot);
  registerAverisHandlers(bot);
  registerFibAdminHandlers(bot);
  registerFibHandlers(bot);
  registerFibAdminPanelHandlers(bot);
  registerFibAdminSubscriberHandlers(bot);
  registerFibAdminBroadcastHandlers(bot);

  // Set visible bot commands
  bot.api.setMyCommands([
    { command: "start", description: "Welcome to Averis Academy" },
    { command: "help", description: "How the bot works" },
    { command: "status", description: "Check your subscription" },
  ]).catch(console.error);

  return bot;
}

export function getWebhookHandler() {
  const bot = buildBot();
  return webhookCallback(bot, "std/http");
}
