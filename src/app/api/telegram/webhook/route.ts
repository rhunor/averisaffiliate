import { NextRequest, NextResponse } from "next/server";
import { getWebhookHandler } from "@/bot/index";

export const dynamic = "force-dynamic";

let _handler: ReturnType<typeof getWebhookHandler> | null = null;

function getHandler() {
  if (!_handler) _handler = getWebhookHandler();
  return _handler;
}

export async function POST(req: NextRequest) {
  // Validate Telegram's secret token header
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const incoming = req.headers.get("x-telegram-bot-api-secret-token");
    if (incoming !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  try {
    return await getHandler()(req);
  } catch (err) {
    console.error("[telegram/webhook]", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}
