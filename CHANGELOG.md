# Changelog

All notable changes to this project are recorded here, newest first. Entries are written in plain language — what changed and why — not raw diffs (see `git log` for that).

## 2026-08-03 — FIB Copy Trade admin panel

Added a Telegram-native admin panel, auto-shown as a "🛠 Admin Panel" button on the bot's main menu, but only to Telegram IDs listed in `FIB_BOT_ADMIN_IDS`. Everyone else never sees it.

- **Stats** — active/expired subscriber counts, how many expire in the next 7 days, this month's and all-time revenue, total successful payments.
- **Recent Payments** — last 20 payments with who, how much, and status.
- **Subscribers** — paginated list of every FIB subscriber; tapping a subscriber opens a detail screen with **Extend 30 Days** and **Remove** actions.
- **Broadcast** — send a message to every active subscriber, or post directly into the FIB channel, with a preview/confirm step first.

New files: `src/bot/handlers/fibAdminPanel.ts`, `fibAdminSubscribers.ts`, `fibAdminBroadcast.ts`.

## 2026-08-03 — Fixed silently-failing bot buttons

Several inline buttons (notably "Back" and "Subscribe" in the FIB flow) appeared to do nothing when tapped. Root cause: Telegram rejects `editMessageText` when the new content is identical to what's already on screen, and that error was going uncaught — swallowed silently instead of shown to the user.

- Added `src/bot/utils.ts`'s `safeEditMessageText()`, now used everywhere the bot edits a message, which ignores only that specific harmless error.
- Hardened the bot's global error handler (`src/bot/instance.ts`) so any *other* unexpected error now tells the user "Something went wrong, please try again" instead of failing silently.
- Also found and cleared a leftover **persistent reply keyboard** ("Main Menu" / "Subscribe" buttons docked at the very bottom of the chat, separate from any message) — a holdover from this bot's earlier life as `primetrexbot`. Nothing in this codebase ever sets one, so `/start` now sends a one-time cleanup (`remove_keyboard: true`) to strip it for good.

## 2026-08-02 — FIB Copy Trade Telegram channel (new product)

Added a second, fully independent Telegram product to the existing Averis Academy bot — **FIB Copy Trade By Averis Academy**, a ₦35,000/month private forex-signals channel — without changing any existing Averis Academy bot behavior.

- **New models**: `FibSubscriber` (subscription/expiry tracking, separate from `AverisSubscriber` since a person can hold both subscriptions at once), `FibPayment` (Korapay payment records, since FIB customers are Telegram-only and may have no web account).
- **Admin registration**: `/addfibsubscriber` command (admin-only, gated by `FIB_BOT_ADMIN_IDS`) — registers a Telegram user ID for a 30-day subscription; the invite link is delivered automatically the next time that person messages the bot (Telegram won't let a bot DM someone who's never started a conversation with it).
- **Self-serve payment**: "📈 FIB Copy Trade Signals" button on the main menu → in-chat Korapay checkout → invite link delivered on confirmed payment (via redirect-back-into-bot, webhook, or an in-chat "I've Paid" check — three independent confirmation paths, same pattern the old Primetrex bot used).
- **Reminders & expiry**: daily cron (`processFibExpiry`, added to the existing `/api/cron/expiry` route) sends reminders at 7/3/1 days before expiry and auto-removes expired subscribers from the channel.
- **Payments webhook**: `/api/payments/webhook` now recognizes `FIB-` prefixed references and routes them to FIB activation before any existing Averis-specific logic runs.

New env vars: `FIB_TELEGRAM_CHANNEL_ID`, `FIB_BOT_ADMIN_IDS`.
