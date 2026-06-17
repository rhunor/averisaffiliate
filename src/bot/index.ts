import { webhookCallback } from "grammy";
import { getBotInstance } from "@/bot/instance";
import { registerStartHandlers } from "@/bot/handlers/start";
import { registerAverisHandlers } from "@/bot/handlers/averis";

export function buildBot() {
  const bot = getBotInstance();

  registerStartHandlers(bot);
  registerAverisHandlers(bot);

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
