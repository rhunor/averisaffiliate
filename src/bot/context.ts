import type { Context, SessionFlavor } from "grammy";

export interface SessionData {
  // Intentionally minimal — Averis bot is stateless between messages
}

export type BotContext = Context & SessionFlavor<SessionData>;
