# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A full, exhaustive developer reference (models, every API route, admin panel pages, bug history) already exists in `README.md` — read it for details beyond what's below. This file focuses on architecture that isn't obvious from any single file, and corrects a few places where `README.md` has drifted from the actual code.

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build (also runs the TypeScript check)
npm run lint     # ESLint
npx tsc --noEmit -p tsconfig.json   # type-check only, faster than a full build
```

There is no test suite/runner in this repo (`package.json` only has `dev`/`build`/`start`/`lint`) — treat `npm run lint` + `npx tsc --noEmit` + `npm run build` as the correctness bar for any change.

Path alias: `@/*` → `src/*`.

## Architecture

Next.js 16 App Router, MongoDB/Mongoose, NextAuth v5 (JWT/Credentials). One codebase serves the web app, all API routes, the Telegram bot (as a webhook route), and Vercel cron jobs.

### Two payment providers, two directions
- **Korapay** (`src/lib/korapay.ts`) — all *inbound* subscription/product payments (Averis Academy signup/renewal, Forex Income Blueprint, FIB Copy Trade). Webhook: `POST /api/payments/webhook`, HMAC-SHA256 verified, raw body signed before JSON parsing.
- **Paystack** (`src/lib/paystack.ts`) — all *outbound* affiliate withdrawal transfers, fully automated (no admin approval step). Webhook: `POST /api/webhooks/paystack`, HMAC-SHA512 verified.
Never mix these up — a Korapay change should not touch `paystack.ts` or vice versa.

### Two independent Telegram products on one bot
The bot (`src/bot/`, grammY, single webhook at `POST /api/telegram/webhook`) runs **Averis Academy** and **FIB Copy Trade By Averis Academy** side by side, deliberately kept non-interfering:
- Averis: `AverisSubscriber` model, `src/bot/services/groupManager.ts`, handlers in `start.ts`/`averis.ts`. Telegram linking happens via a deep-link tied to a paid web account (`/start averis_link_<referralCode>`), not manual entry.
- FIB: `FibSubscriber`/`FibPayment` models (separate collections — `AverisSubscriber.telegramId` has a *global unique index*, so a person holding both subscriptions needs FIB in its own collection), `src/bot/services/fibManager.ts`, handlers in `fib.ts`/`fibAdmin.ts`/`fibAdminPanel.ts`/`fibAdminSubscribers.ts`/`fibAdminBroadcast.ts`. FIB supports both admin-manual registration (`/addfibsubscriber`, gated by `FIB_BOT_ADMIN_IDS`) and self-serve in-chat Korapay checkout — three independent payment-confirmation paths (webhook, Korapay redirect-back-into-bot via `/start fib_paid_<reference>`, and an in-chat "I've Paid" button) all funnel into one idempotent `activateFibSubscription(reference)`, keyed by `FibPayment.reference`.
- An FIB-only admin panel (`🛠 Admin Panel` button, only rendered when `isFibBotAdmin(ctx)` is true) lives entirely inside the bot conversation — stats, recent payments, paginated subscriber list with a `/fibsub_<telegramId>`-style tappable detail link (grammY `bot.hears(regex)`), and broadcast.
- `src/bot/context.ts`'s `SessionData` is intentionally near-empty — the bot is stateless between messages except for a few explicit multi-step admin flows (`fibAdminStep`, `fibAdminPanelStep`, etc.). Any new step-based flow must guard its `bot.on("message:text")` handler on its own session-step value and fall through (`return next()` / grammY's `.filter()`) so it never intercepts other flows' text input.
- **`ctx.editMessageText` gotcha**: Telegram throws if the new text+keyboard are byte-identical to what's already shown (e.g. tapping the same button twice). Always call `safeEditMessageText()` (`src/bot/utils.ts`) instead of `ctx.editMessageText` directly — it swallows only that specific error. The global `bot.catch` in `src/bot/instance.ts` also now tells the user "something went wrong" on any other unexpected error rather than failing silently — don't revert that to a bare `console.error`.

### Auth/session gating happens in two layers
- `src/proxy.ts` (Next.js middleware) blocks unauthenticated/inactive/expired/wrong-role users from both dashboard pages and the API routes they call, using JWT session fields (`isActive`, `isLifetime`, `subscriptionExpiresAt`, `role`) set in `src/lib/auth.ts`'s NextAuth callbacks.
- Every `/api/admin/*` route *additionally* re-checks `session.user.role === "admin"` itself — there's no shared middleware wrapper for this, it's copy-pasted per route, so new admin routes need the same inline check.
`isLifetime: true` users bypass all expiry logic everywhere (middleware, cron, Telegram kicks) — never gate a new feature on `subscriptionExpiresAt` alone without also checking this flag.

### Cron jobs (`vercel.json` — verify against this file, not README's prose table, which has drifted)
```json
{ "path": "/api/cron/expiry", "schedule": "0 2 * * *" },
{ "path": "/api/cron/settle-commissions", "schedule": "5 23 * * *" },
{ "path": "/api/cron/process-withdrawals", "schedule": "0 10 * * 5" }
```
All three require `Authorization: Bearer $CRON_SECRET` (or `x-cron-secret` header on `/api/cron/expiry`). **Vercel Hobby plan caps cron jobs at once-per-day frequency** — this has bitten the project before (see `git log --grep=cron`); don't add a new `vercel.json` cron entry running more than daily. If a new scheduled task is needed, prefer adding a function call inside an existing daily cron route (this is how FIB's `processFibExpiry()` was added to `/api/cron/expiry` without touching `vercel.json` at all) over creating a new cron entry.

`/api/cron/expiry` does three independent, separately-try/caught things in sequence: deactivate/email-remind expired web `User`s, run `processTelegramExpiry()` (Averis), run `processFibExpiry()` (FIB). A failure in one must never take down the others — keep new expiry-related logic in its own try/catch block here.

### Idempotency pattern used everywhere money moves
Every payment/commission code path checks for an existing record before creating one — `Transaction.findOne({ paymentReference })`, `FibPayment.findOne({ reference })`, commission creation checks `{ userId: referrerId, sourceUserId: buyerId, type: "commission" }` — because webhooks can fire more than once and multiple confirmation paths can race. Match this pattern in any new payment-adjacent code rather than assuming a webhook fires exactly once.

## Known env var name drift
`README.md`'s env var table doesn't match the code in a few places — trust the code:
- Actual: `AVERIS_TELEGRAM_GROUP_ID` / `AVERIS_TELEGRAM_CHANNEL_ID` (README says `TELEGRAM_GROUP_ID`/`TELEGRAM_CHANNEL_ID`).
- FIB adds: `FIB_TELEGRAM_CHANNEL_ID`, `FIB_BOT_ADMIN_IDS` (not documented in README yet).
