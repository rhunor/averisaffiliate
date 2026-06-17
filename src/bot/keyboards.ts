import { InlineKeyboard } from "grammy";
import { EMOJI, CALLBACK } from "@/bot/constants";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

export function mainMenuKeyboard(hasSubscription: boolean): InlineKeyboard {
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
    .text(`${EMOJI.HELP} Help`, CALLBACK.HELP);

  return kb;
}

export function helpKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("\u{1F4CA} My Subscription Status", CALLBACK.AVERIS_STATUS)
    .row()
    .text(`${EMOJI.BACK} Back`, CALLBACK.MAIN_MENU);
}
