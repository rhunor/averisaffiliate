import type { Context, SessionFlavor } from "grammy";

export interface SessionData {
  // Intentionally minimal — Averis bot is stateless between messages.
  // fibAdminStep is the one exception: a single-step conversation used
  // only by the /addfibsubscriber admin command.
  fibAdminStep?: "awaiting_user_id";
}

export type BotContext = Context & SessionFlavor<SessionData>;
