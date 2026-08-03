import type { Context, SessionFlavor } from "grammy";

export interface SessionData {
  // Intentionally minimal — Averis bot is stateless between messages.
  // Everything below is state for the FIB Copy Trade admin flows only.
  fibAdminStep?: "awaiting_user_id";

  // FIB admin panel: subscriber search / broadcast composer / detail screen
  fibAdminPanelStep?: "awaiting_search_query" | "awaiting_broadcast_message";
  fibSubscriberPage?: number;
  fibBroadcastTarget?: "all" | "channel";
  fibPendingBroadcastMessage?: string;
  fibAdminDetailTelegramId?: string;
}

export type BotContext = Context & SessionFlavor<SessionData>;
