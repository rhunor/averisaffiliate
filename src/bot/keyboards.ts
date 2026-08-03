import { InlineKeyboard } from "grammy";
import { EMOJI, CALLBACK } from "@/bot/constants";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

export function mainMenuKeyboard(hasSubscription: boolean, isAdmin: boolean = false): InlineKeyboard {
  const kb = new InlineKeyboard()
    .text("\u{1F4CA} My Subscription Status", CALLBACK.AVERIS_STATUS)
    .row();

  if (hasSubscription) {
    kb.text("\u{1F504} Renew Subscription", CALLBACK.AVERIS_RENEW)
      .row()
      .text("\u{1F517} Get Community Invite", CALLBACK.AVERIS_REINVITE)
      .row();
  }

  kb.url("\u{1F310} Visit Averis Academy", APP_URL)
    .row()
    .text("\u{1F4C8} FIB Copy Trade Signals", CALLBACK.FIB_MENU)
    .row()
    .text(`${EMOJI.HELP} Help`, CALLBACK.HELP);

  if (isAdmin) {
    kb.row().text("\u{1F6E0} Admin Panel", CALLBACK.FIB_ADMIN_PANEL);
  }

  return kb;
}

export function helpKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("\u{1F4CA} My Subscription Status", CALLBACK.AVERIS_STATUS)
    .row()
    .text(`${EMOJI.BACK} Back`, CALLBACK.MAIN_MENU);
}

export function fibMenuKeyboard(hasSubscription: boolean): InlineKeyboard {
  const kb = new InlineKeyboard();

  if (hasSubscription) {
    kb.text("\u{1F504} Renew Subscription", CALLBACK.FIB_RENEW)
      .row()
      .text("\u{1F517} Get Channel Invite", CALLBACK.FIB_REINVITE)
      .row();
  } else {
    kb.text("\u{1F4B3} Subscribe — \u{20A6}35,000/month", CALLBACK.FIB_SUBSCRIBE).row();
  }

  kb.text(`${EMOJI.BACK} Back`, CALLBACK.MAIN_MENU);
  return kb;
}

export function adminPanelKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("\u{1F4CA} Stats", CALLBACK.FIB_ADMIN_STATS)
    .row()
    .text("\u{1F4B3} Recent Payments", CALLBACK.FIB_ADMIN_PAYMENTS)
    .row()
    .text("\u{1F465} Subscribers", CALLBACK.FIB_ADMIN_SUBS)
    .row()
    .text("\u{1F4E2} Broadcast", CALLBACK.FIB_ADMIN_BROADCAST)
    .row()
    .text(`${EMOJI.BACK} Back to Main Menu`, CALLBACK.MAIN_MENU);
}

export function fibAdminBackButton(target: string = CALLBACK.FIB_ADMIN_PANEL): InlineKeyboard {
  return new InlineKeyboard().text(`${EMOJI.BACK} Back`, target);
}

export function fibSubscriberListKeyboard(page: number, totalPages: number): InlineKeyboard {
  const kb = new InlineKeyboard();

  if (totalPages > 1) {
    if (page > 0) kb.text("⬅️ Prev", CALLBACK.FIB_ADMIN_SUBS_PREV);
    if (page < totalPages - 1) kb.text("Next ➡️", CALLBACK.FIB_ADMIN_SUBS_NEXT);
    kb.row();
  }

  kb.text("\u{1F50D} Search", CALLBACK.FIB_ADMIN_SUBS_SEARCH)
    .row()
    .text(`${EMOJI.BACK} Back to Panel`, CALLBACK.FIB_ADMIN_PANEL);

  return kb;
}

export function fibSubscriberDetailKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("➕ Extend 30 Days", CALLBACK.FIB_ADMIN_SUB_EXTEND)
    .row()
    .text("\u{1F5D1} Remove", CALLBACK.FIB_ADMIN_SUB_REMOVE)
    .row()
    .text(`${EMOJI.BACK} Back to List`, CALLBACK.FIB_ADMIN_SUBS);
}

export function fibBroadcastTargetKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("\u{1F465} All Subscribers", CALLBACK.FIB_BROADCAST_TARGET_ALL)
    .row()
    .text("\u{1F4E2} Post to Channel", CALLBACK.FIB_BROADCAST_TARGET_CHANNEL)
    .row()
    .text("❌ Cancel", CALLBACK.FIB_BROADCAST_CANCEL);
}

export function fibBroadcastConfirmKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("✅ Send", CALLBACK.FIB_BROADCAST_SEND)
    .row()
    .text("❌ Cancel", CALLBACK.FIB_BROADCAST_CANCEL);
}
