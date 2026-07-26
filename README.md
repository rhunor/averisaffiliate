# Averis Academy — Developer Documentation

Complete technical reference for the Averis Academy affiliate and learning management platform.  
Covers authentication, payments, subscriptions, affiliate commissions, the Telegram bot, the admin panel, and every bug resolved to date.

**Stack:** Next.js 16 · MongoDB · NextAuth v5 · Grammy · Korapay · Paystack · Resend  
**Hosted on:** Vercel  
**Last updated:** July 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Database Models](#database-models)
6. [Cron Jobs](#cron-jobs)
7. [Authentication System](#authentication-system)
8. [Middleware — Route Protection](#middleware--route-protection)
9. [Payment System](#payment-system)
10. [Withdrawal System](#withdrawal-system)
11. [Subscription Lifecycle](#subscription-lifecycle)
12. [Affiliate System](#affiliate-system)
13. [Telegram Bot](#telegram-bot)
14. [API Reference](#api-reference)
15. [Admin Panel](#admin-panel)
16. [User Dashboard](#user-dashboard)
17. [Issues Found & Resolved](#issues-found--resolved)
18. [External Services](#external-services)
19. [Deployment](#deployment)

---

## Overview

Averis Academy is a Nigerian EdTech and affiliate marketing platform. It combines a full learning management system (LMS) with a multi-tier income programme. Users pay a one-time ₦35,000 subscription to access all courses, then earn 50% commission (₦17,500) on every new member they refer.

Affiliate commissions are held as "pending" for 24 hours then automatically settled, at which point the affiliate can withdraw to their verified Nigerian bank account. **Withdrawals are fully automated via Paystack** — transfers are initiated instantly when the user requests, with no admin approval required.

The platform hosts multiple **income streams** — currently *Digital Income Blueprint* (DIB) as the flagship course, with a Forex Income Blueprint as a separate paid product (₦50,000). Each income stream gets its own Telegram community group, managed automatically by a Grammy-powered bot.

**User tiers:**
- **Regular subscribers** — 12-month rolling subscription
- **Lifetime members** (`isLifetime: true`) — never affected by expiry logic, never kicked from Telegram

---

## Tech Stack

| Layer | Technology | Version | Role |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 | Full-stack — pages, API routes, server components |
| UI | React | 19.2.4 | Client components, dashboard interactivity |
| Auth | NextAuth v5 (beta) | 5.0.0-beta.30 | JWT sessions, credential login, session callbacks |
| Database | MongoDB via Mongoose | 8.24.0 | Primary data store |
| Styling | Tailwind CSS v4 | 4.x | All styling via utility classes |
| Payments (checkout) | Korapay | REST v1 | Card & bank transfer checkout for subscriptions |
| Withdrawals | Paystack | REST v1 | Automated affiliate payout transfers |
| Email | Resend | 6.x | Transactional emails |
| Media | Cloudinary | 2.x | Profile photo upload and delivery |
| Bot | Grammy | 1.x | Telegram group management bot |
| Animation | Motion (Framer) | 12.x | Dashboard UI animations |
| Charts | Recharts | 3.x | Earnings charts |
| Hosting | Vercel | — | Serverless deployment, cron jobs |

---

## Project Structure

```
src/
├── app/
│   ├── (admin)/admin/          # Admin-only pages (role-gated)
│   │   ├── page.tsx            # Stats overview dashboard
│   │   ├── users/              # User management
│   │   ├── transactions/       # All transaction log
│   │   ├── withdrawals/        # Withdrawal history and status
│   │   ├── commissions/        # Commission overview
│   │   ├── courses/            # Course & lesson management
│   │   ├── products/           # Product listing
│   │   └── migrations/         # Data tools & recovery
│   ├── (auth)/join/[affiliateCode]/  # Payment form (new signup)
│   ├── (dashboard)/dashboard/  # Member dashboard
│   │   ├── page.tsx            # Home — stats + referral link
│   │   ├── academy/            # LMS — courses & lessons
│   │   ├── earnings/           # Commission history + chart
│   │   ├── referrals/          # Referred users list
│   │   ├── products/           # Available income streams
│   │   ├── subscription/       # Subscription status + renew
│   │   ├── withdrawals/        # Withdrawal requests
│   │   └── settings/           # Profile, bank, Telegram link
│   ├── api/
│   │   ├── auth/               # Register, login, verify, reset
│   │   ├── payments/           # Korapay checkout, verify, webhook
│   │   │   ├── pre-register/   # New user payment (2-step)
│   │   │   ├── forex/          # Forex Blueprint purchase
│   │   │   └── webhook/        # Korapay event receiver
│   │   ├── webhooks/
│   │   │   └── paystack/       # Paystack transfer event receiver
│   │   ├── dashboard/          # Member data APIs
│   │   ├── admin/              # Admin-only APIs
│   │   ├── academy/            # Course content APIs
│   │   └── cron/               # Scheduled job endpoints
│   ├── digital-income-blueprint/     # Public sales page
│   ├── page.tsx                # Marketing home page
│   ├── terms-of-service/
│   └── privacy-policy/
├── bot/                        # Telegram Grammy bot
│   ├── handlers/               # /start, /averis commands
│   ├── services/groupManager.ts
│   └── index.ts
├── lib/
│   ├── auth.ts                 # NextAuth config + callbacks
│   ├── db.ts                   # MongoDB connection singleton
│   ├── korapay.ts              # Korapay API wrapper (subscriptions)
│   ├── paystack.ts             # Paystack API wrapper (withdrawals)
│   ├── email.ts                # Resend email functions
│   └── utils.ts
├── models/                     # Mongoose schemas
├── config/site.ts              # Fees, commission rates, links
├── proxy.ts                    # Next.js middleware (auth gating)
└── types/next-auth.d.ts        # Session type augmentation
```

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | ✓ | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | ✓ | JWT signing secret (min 32 chars) |
| `NEXTAUTH_URL` | ✓ | Canonical app URL |
| `NEXT_PUBLIC_APP_URL` | ✓ | Same as above — used in client code and email links |
| `KORAPAY_SECRET_KEY` | ✓ | Korapay merchant secret key (subscription checkout) |
| `KORAPAY_WEBHOOK_SECRET` | ✓ | HMAC-SHA256 webhook signature key for Korapay |
| `PAYSTACK_SECRET_KEY` | ✓ | Paystack secret key (withdrawal transfers) |
| `PAYSTACK_TRANSFERS_ENABLED` | — | Set to `"false"` to disable withdrawal requests while maintenance runs |
| `RESEND_API_KEY` | ✓ | Resend transactional email API key |
| `TELEGRAM_BOT_TOKEN` | ✓ | Grammy bot token from BotFather |
| `TELEGRAM_GROUP_ID` | ✓ | Telegram supergroup chat ID (negative number) |
| `TELEGRAM_CHANNEL_ID` | — | Optional — for channel invite link generation |
| `CRON_SECRET` | ✓ | Bearer token for Vercel cron requests |
| `CLOUDINARY_CLOUD_NAME` | ✓ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✓ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✓ | Cloudinary API secret |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | — | Google reCAPTCHA v3 (optional) |
| `FOREX_COURSE_ACCESS_URL` | — | URL sent to Forex Blueprint buyers |

---

## Database Models

All models live in `src/models/` and connect to MongoDB Atlas via Mongoose 8. The connection is a singleton in `src/lib/db.ts` that reuses an existing connection across serverless invocations.

### User

| Field | Type | Notes |
|---|---|---|
| `firstName / lastName` | String | Required, trimmed |
| `email` | String | Unique, lowercase |
| `passwordHash` | String | bcrypt hash |
| `role` | `"user" \| "admin"` | Controls access to /admin routes |
| `referralCode` | String | Unique, e.g. `AVR-8MKXBQ` |
| `referredBy` | ObjectId → User | Affiliate who referred this user |
| `hasPaidSignup` | Boolean | True once the initial payment clears |
| `signupPaymentRef` | String | Korapay reference used for signup/renewal webhook matching |
| `subscriptionExpiresAt` | Date | Null for lifetime users; set to +12 months on signup/renewal |
| `isActive` | Boolean | Gateway flag — middleware blocks dashboard if false |
| `isLifetime` | Boolean | Exempt from expiry checks and Telegram kicks |
| `isSpecialAffiliate` | Boolean | Special commission rate flag |
| `telegramId / telegramLinked` | String / Boolean | Links Telegram account via bot /start flow |
| `bankDetails` | Object | bankName, bankCode, accountNumber, accountName |
| `trustedDevices` | Array | Hashed tokens for "remember this device" login (skips OTP) |
| `twoFAOTP / twoFAOTPExpires` | String / Date | Time-limited 6-digit OTP for new-device login |
| `knownDevices` | Array | IP + lastSeen — audit log for login locations |

### PendingSignup

Holds pre-registration data created when a new user begins the payment flow — *before* they have an account. The record is marked `paid: true` once payment is confirmed, then `used: true` once the user completes registration.

| Field | Type | Notes |
|---|---|---|
| `paymentReference` | String | Unique index — Korapay charge reference |
| `signupToken` | String | 64-hex token emailed to buyer; used to complete registration |
| `paid` | Boolean | Set to true by verify route or Korapay webhook |
| `used` | Boolean | Set to true when registration is completed |
| `affiliateUserId` | ObjectId → User | Affiliate who owns the link the buyer used |
| `commissionEmailSent` | Boolean | Prevents double commission emails on registration |
| `expiresAt` | Date | TTL index — MongoDB auto-deletes after this date (7 days) |

### Transaction

Single ledger for all money movements — subscriptions, commissions, and withdrawals. The admin Transactions page queries this collection directly.

| Field | Type | Notes |
|---|---|---|
| `type` | `"subscription" \| "commission" \| "withdrawal"` | |
| `status` | `"pending" \| "processing" \| "completed" \| "failed"` | Commissions start pending; withdrawals are completed by Paystack webhook |
| `userId` | ObjectId → User | Who this transaction belongs to |
| `sourceUserId` | ObjectId → User | Buyer — populated once registration completes (commissions only) |
| `paymentReference` | String | Korapay reference — used for idempotency |
| `orderId` | String | Internal order ID displayed in UI |
| `description` | String | Human-readable summary |
| `metadata` | Object | Includes `withdrawalId`, `transferReference`, `transferCode` for withdrawals |

### Withdrawal

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | Who requested the withdrawal |
| `amount` | Number | In naira, minimum ₦10,000 |
| `status` | `"pending" \| "processing" \| "completed" \| "rejected" \| "failed"` | Set to `processing` immediately on Paystack transfer initiation |
| `bankName / bankCode` | String | Bank selected by user |
| `accountNumber / accountName` | String | Verified via Paystack account resolution |
| `transferCode` | String | Paystack transfer code |
| `transferReference` | String | UUID generated by the system, used as idempotency key with Paystack |
| `paystackRecipientCode` | String | Paystack transfer recipient code |
| `rejectionReason` | String | Populated on failed/reversed transfers from Paystack webhook |
| `processedAt` | Date | Timestamp when Paystack confirmed the transfer |

### Other Models

| Model | Purpose |
|---|---|
| `AverisSubscriber` | Mirrors subscription state for the Telegram bot — tracks `telegramId`, `expiryDate`, `remindersSent` |
| `Referral` | One record per referrer→referred pair; tracks commission amount and whether it's a renewal |
| `Course` | Course metadata — title, slug, description, phase |
| `Lesson` | Individual lesson — `videoUrl` (Cloudinary or YouTube), `googleDriveUrl`, `order`, `courseId` |
| `Progress` | Tracks which lessons a user has completed (`completedLessons[]`) |
| `Product` | Purchasable income stream products — name, slug, price, commissionAmount |
| `ForexPurchase` | Records Forex Blueprint purchases; links buyer to payer and affiliate |
| `Notification` | In-app notifications for users |

---

## Cron Jobs

Cron endpoints live in `src/app/api/cron/`. Every request must include `Authorization: Bearer {CRON_SECRET}` or it returns 401.

| Endpoint | Schedule | What It Does |
|---|---|---|
| `/api/cron/settle-commissions` | Daily 02:00 UTC | Finds all `Transaction` records with `status: "pending"` older than 24 hours and marks them `"completed"` |
| `/api/cron/expiry` | Daily 06:00 UTC | Calls `processTelegramExpiry()` — sends reminders at 14 days and 3 days before expiry, kicks expired users from Telegram, sets `User.isActive = false` |

---

## Authentication System

Authentication uses **NextAuth v5 (beta)** with the Credentials provider and JWT sessions. Config is in `src/lib/auth.ts`.

### Session JWT Fields

These fields are added to the token on login and carried in every session. Defined in `src/types/next-auth.d.ts`.

| Field | Type | Source |
|---|---|---|
| `id` | String | MongoDB `_id` |
| `role` | `"user" \| "admin"` | User.role |
| `referralCode` | String | User.referralCode |
| `isActive` | Boolean | User.isActive — middleware checks this |
| `isEmailVerified` | Boolean | User.isEmailVerified |
| `isLifetime` | Boolean | User.isLifetime — exempts from expiry gating |
| `subscriptionExpiresAt` | String \| null | ISO date string — middleware compares to `new Date()` |

### Login Flow (New Device)

1. **Pre-login check** — `POST /api/auth/pre-login` verifies email + password, checks if device IP is known or if user has a trusted device cookie. Returns `{ requires_otp: true/false }`.
2. **OTP sent** — if IP is unknown and no trusted-device cookie matches, a 6-digit OTP is generated, stored hashed with a 10-minute expiry, and emailed via Resend.
3. **OTP verified** — `POST /api/auth/verify-otp` compares OTP, calls `signIn("credentials", ...)` which runs the NextAuth `authorize()` callback.
4. **Trusted device stored** — if user chose "remember this device", a `crypto.randomBytes(32)` token is generated, its SHA-256 hash stored in `User.trustedDevices[]`, and the raw token set as an HttpOnly cookie expiring in 30 days.
5. **JWT session created** — NextAuth `jwt()` callback writes all session fields to the token.

### Password Reset Flow

1. `POST /api/auth/forgot-password` — generates a secure token, stores hash + 1h expiry on User, emails a reset link.
2. `POST /api/auth/reset-password` — validates token, bcrypt-hashes new password, clears the token fields.

---

## Middleware — Route Protection

The middleware lives in `src/proxy.ts` and wraps NextAuth's `auth()` helper. It runs on every request matching `config.matcher` — this covers both page routes AND the APIs they call, so no API can be reached with an invalid session.

```ts
// Simplified logic in src/proxy.ts

if (isOnDashboard && isLoggedIn) {
  // 1. Account not yet active (never paid)
  if (!sessionUser.isActive) → redirect "/pending-payment"

  // 2. Subscription expired (non-lifetime users only)
  if (!isLifetime && expiresAt && new Date(expiresAt) < new Date())
    → redirect "/pending-payment?expired=1"  // or 403 for API calls
}

if (isOnAdmin && role !== "admin") → redirect "/dashboard"
```

> **Lifetime users** (`isLifetime: true`) bypass the expiry check entirely. They are never redirected for subscription reasons.

---

## Payment System

**Korapay** handles all subscription payments (new signups, renewals, Forex Blueprint purchases). **Paystack** handles all affiliate withdrawal transfers. These are two separate integrations with separate API keys and webhooks.

### New Signup — Pre-register Flow

This is a two-step flow for users who don't have an account yet. They pay first, then complete registration using a token-protected link.

1. **User visits affiliate link** — `/join/AVR-XXXXXX` — payment form. Collects first name, last name, email.
2. **Initialize payment** — `POST /api/payments/pre-register/initialize` — creates a fresh `PendingSignup` document with a unique `paymentReference`, calls Korapay `/charges/initialize`, returns `checkoutUrl`. Each form submission creates its own PendingSignup — references are never overwritten.
3. **User pays on Korapay** — card or bank transfer.
4a. **Redirect path (card / instant)** — Korapay redirects to `/api/payments/pre-register/verify?reference=REF`. The verify route confirms the charge, marks PendingSignup as paid, sends the signup link email, creates a pending commission Transaction for the affiliate.
4b. **Webhook path (bank transfer fallback)** — Korapay fires `charge.success` to `/api/payments/webhook`. The webhook checks PendingSignup if no User is found, marks it paid, sends the signup link. This is the reliable fallback for bank transfers.
5. **Buyer completes registration** — email contains a link to `/complete-registration/{signupToken}`. User sets their password. `POST /api/auth/register-paid` creates the User, creates the Referral record, marks PendingSignup as `used: true`, sends welcome email.

### Renewal Flow (Existing User)

1. `POST /api/payments/initialize` — logged-in user. Calls Korapay checkout with ₦30,000.
2. `GET /api/payments/verify?reference=REF` — confirms charge, extends `subscriptionExpiresAt` by 12 months, sets `isActive: true`, updates `AverisSubscriber`.
3. Korapay webhook handles renewals as fallback via `User.findOne({ signupPaymentRef: reference })`.

### Korapay Webhook Security

Every incoming webhook POST is verified with HMAC-SHA256 using `KORAPAY_WEBHOOK_SECRET`. The raw body is signed before JSON parsing. Idempotency is handled by checking `Transaction.findOne({ paymentReference: reference })` before creating any records.

---

## Withdrawal System

Withdrawals are **fully automated via Paystack**. When an affiliate requests a withdrawal, the transfer is initiated immediately — no admin action is required. The Paystack webhook then confirms completion and records the transaction.

### Withdrawal Flow

1. **User requests withdrawal** — `POST /api/dashboard/withdraw` — submits amount, bank code, account number.
2. **Balance check** — the route calculates available balance: `completedCommissions − completedWithdrawals − processingWithdrawals`. Blocks if insufficient.
3. **Account verification** — Paystack's `/bank/resolve` endpoint confirms the account name matches the user's name on Averis (fuzzy match via `compareNames()`).
4. **Recipient created** — `createTransferRecipient()` registers the bank account with Paystack and returns a `recipientCode`.
5. **Transfer initiated** — `initiateTransfer()` sends the funds via Paystack. A unique UUID `transferReference` is generated and stored before calling Paystack (idempotency key).
6. **Withdrawal record created** — a `Withdrawal` document is saved with `status: "processing"` and the Paystack `transferCode`.
7. **Admin notified** — a notification email is sent to admin (fire-and-forget, does not block the response).
8. **User sees success** — the withdrawal appears in their dashboard as "processing".

### Paystack Webhook (`/api/webhooks/paystack`)

Paystack fires events to this endpoint as transfers complete. Signature is verified with HMAC-SHA512 using `PAYSTACK_SECRET_KEY`.

| Event | Action |
|---|---|
| `transfer.success` | Sets `Withdrawal.status = "completed"`, creates a `Transaction` record (`type: "withdrawal"`, `status: "completed"`), sends completion email to the affiliate |
| `transfer.failed` | Sets `Withdrawal.status = "failed"` with reason — affiliate's balance is restored automatically |
| `transfer.reversed` | Sets `Withdrawal.status = "failed"` with reason — funds returned by bank |

The Transaction created on `transfer.success` is what makes the completed withdrawal visible in the **admin Transactions panel**.

### Temporary Disable

Set `PAYSTACK_TRANSFERS_ENABLED=false` in environment variables to temporarily block all withdrawal requests (e.g. during maintenance). Users receive a clear message to check back later.

### Key Fees (`config/site.ts`)

| Item | Amount |
|---|---|
| New subscription (Digital Income Blueprint) | ₦35,000 |
| Renewal | ₦30,000 |
| New subscription commission (affiliate) | ₦17,500 (50%) |
| Renewal commission | ₦15,000 (50%) |
| Forex Blueprint price | ₦50,000 |
| Forex Blueprint commission | ₦25,000 (50%) |
| Minimum withdrawal | ₦10,000 |

---

## Subscription Lifecycle

| Event | isActive | subscriptionExpiresAt | Telegram |
|---|---|---|---|
| Signup payment confirmed | false → waits for registration | Set to now + 12 months at registration | Invite sent via bot |
| Registration completed | true | now + 12 months | Member added to group |
| 14 days before expiry | true | — | Reminder email sent |
| 3 days before expiry | true | — | Second reminder sent |
| Expired (cron runs) | false | unchanged (past) | User kicked from group |
| Renewal payment | true | Extended by +12 months | Re-invited if needed |
| `isLifetime = true` | true (permanent) | null (ignored) | Never kicked |

---

## Affiliate System

Every registered user gets a unique `referralCode` (e.g. `AVR-8MKXBQ`) that doubles as their affiliate code. Their shareable link is `https://averisacademy.com/join/AVR-XXXXXX`.

### Commission Timeline

1. **Payment confirmed** — a `Transaction` with `type: "commission"`, `status: "pending"` is created for the affiliate. An email notifies them immediately.
2. **24-hour hold** — commission sits in pending. The affiliate sees it in their earnings dashboard but cannot withdraw it yet.
3. **Auto-settle (daily cron)** — the settle-commissions cron marks all pending commissions older than 24h as `completed`. The affiliate's available balance increases.
4. **Withdrawal** — affiliate requests withdrawal. Paystack transfer is initiated immediately and automatically.

### Idempotency Protection

Before creating any commission transaction, the system checks `Transaction.findOne({ userId: referrerId, sourceUserId: buyerId, type: "commission" })`. If one already exists, the commission is skipped.

---

## Telegram Bot

The Telegram bot uses the **Grammy** framework. It runs as a Next.js API route handler (webhook mode on Vercel).

### Bot Commands

| Command | Who | What it does |
|---|---|---|
| `/start` | Any Telegram user | Prompts login, links Telegram ID to Averis account, sends group invite link |
| `/averis` | Linked members | Shows subscription status, expiry date, and renewal link |

### Group Management Functions (`src/bot/services/groupManager.ts`)

| Function | What it does |
|---|---|
| `generateInviteLink()` | Creates a single-use Telegram group invite link |
| `removeFromGroup(telegramId)` | Bans then immediately unbans the user — effectively kicks without a permanent ban |
| `handleAverisJoin()` | Full join flow: verify subscription, create AverisSubscriber, send invite link |
| `processTelegramExpiry()` | Scans AverisSubscriber records, sends reminders, kicks expired users, sets `User.isActive = false` |

> **Lifetime users are excluded from `processTelegramExpiry()`** by checking `User.isLifetime` before any kick action.

---

## API Reference

### Auth APIs

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Free/invite-only registration (legacy) |
| POST | `/api/auth/register-paid` | Complete registration after paying — consumes signupToken |
| POST | `/api/auth/register-lifetime` | Admin-initiated lifetime member registration |
| POST | `/api/auth/pre-login` | Password check + device detection before full login |
| POST | `/api/auth/verify-otp` | Validate 6-digit OTP, complete login session |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Apply new password using reset token |
| GET | `/api/auth/verify-email` | Email verification via token link |
| GET | `/api/auth/signup-token-info` | Validate signupToken before showing registration form |

### Payment APIs (Korapay — Subscriptions)

| Method | Route | Description |
|---|---|---|
| POST | `/api/payments/pre-register/initialize` | New user — create PendingSignup + Korapay checkout |
| GET | `/api/payments/pre-register/verify` | Korapay redirect handler — confirm + send signup link |
| POST | `/api/payments/initialize` | Existing user renewal — create Korapay checkout |
| GET | `/api/payments/verify` | Renewal confirm — extend subscription by 12 months |
| POST | `/api/payments/webhook` | Korapay event receiver — handles `charge.success` for all subscription payments |
| POST | `/api/payments/forex/initialize` | Forex Blueprint payment init (₦50,000) |
| GET | `/api/payments/forex/verify` | Forex payment confirm — creates ForexPurchase, sends access email |

### Withdrawal APIs (Paystack — Payouts)

| Method | Route | Description |
|---|---|---|
| POST | `/api/dashboard/withdraw` | Request withdrawal — resolves account, creates Paystack recipient, initiates transfer immediately |
| POST | `/api/webhooks/paystack` | Paystack webhook — handles transfer.success/failed/reversed, creates Transaction record on success |

### Dashboard APIs

| Method | Route | Description |
|---|---|---|
| GET | `/api/dashboard` | Home stats — earnings total, referral count, wallet balance |
| GET | `/api/dashboard/earnings` | Commission transaction history + chart data |
| GET | `/api/dashboard/referrals` | List of users referred by current user |
| GET | `/api/dashboard/subscription` | Current subscription status + expiry date |
| GET | `/api/dashboard/profile` | User profile data |
| PATCH | `/api/dashboard/settings` | Update profile — name, photo, bank details, Telegram link |
| GET | `/api/academy` | List all courses available to the user |
| GET | `/api/academy/[courseId]` | Course detail with lessons grouped by section |
| GET | `/api/academy/[courseId]/[lessonId]` | Single lesson content |
| POST | `/api/academy/progress` | Mark a lesson as complete / incomplete |
| GET | `/api/banks` | List Nigerian banks from Paystack |
| POST | `/api/banks/resolve` | Verify bank account via Paystack — returns account holder name |

### Admin APIs

> All `/api/admin/*` routes check `session.user.role === "admin"` first. Non-admin sessions receive a 403.

| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform overview — total users, revenue, pending withdrawals |
| GET | `/api/admin/users` | Paginated user list with search |
| PATCH | `/api/admin/users/[id]` | Actions: `toggle_active`, `toggle_special`, `set_role` |
| GET | `/api/admin/transactions` | All transactions — subscriptions, commissions, and completed withdrawals |
| GET | `/api/admin/withdrawals` | All withdrawal records with status |
| GET | `/api/admin/commissions` | Commission overview by affiliate |
| POST | `/api/admin/settle-commissions` | Manually trigger commission settlement (same as cron) |
| GET | `/api/admin/courses` | List all courses |
| POST | `/api/admin/courses` | Create a new course |
| PATCH | `/api/admin/courses/[id]` | Update course details |
| PATCH | `/api/admin/lessons/[lessonId]` | Update lesson content (video URL, Google Drive link, title) |
| POST | `/api/admin/tools/resend-welcome` | Re-send welcome email to a user by email address |
| POST | `/api/admin/tools/resend-bot-link` | Re-send Telegram bot link to a user |
| POST | `/api/admin/tools/recover-payment` | Manually recover a lost Korapay payment |
| GET | `/api/admin/upload/signature` | Generate Cloudinary upload signature |

---

## Admin Panel

### `/admin` — Overview

Platform stats: total users, active users, total revenue, commissions paid, pending withdrawals. Shows a list of the most recently registered users.

### `/admin/users` — User Management

Searchable, paginated list of all registered users. Actions per user:

- **Toggle Active** — flips `isActive`. Deactivating a user blocks them from the dashboard immediately.
- **Toggle Special Affiliate** — flips `isSpecialAffiliate`.
- **Resend Welcome Email** — re-sends the welcome + referral link email.
- **Resend Bot Link** — re-sends the Telegram bot link.

### `/admin/transactions` — Transaction Log

Read-only view of every transaction in the system — subscriptions, commissions, and completed withdrawals. Filterable by type and status. All three transaction types appear here:
- `subscription` — new signups and renewals (from Korapay)
- `commission` — affiliate earnings
- `withdrawal` — completed Paystack transfers (created by the Paystack `transfer.success` webhook)

### `/admin/withdrawals` — Withdrawal History

Shows all withdrawal records with their current Paystack status (`processing`, `completed`, `failed`). Since withdrawals are fully automated, this page is a read-only audit log. Status is updated automatically by the Paystack webhook.

### `/admin/commissions` — Commission Overview

Commission breakdown by affiliate — referral count, total earned, total pending.

### `/admin/courses` — Course Management

Create and edit courses. Manage lessons — each lesson supports Cloudinary video, YouTube video, Google Drive resource link, section grouping, and display order.

### `/admin/migrations` — Tools & Migrations

| Tool | What it does |
|---|---|
| **Settle Pending Commissions** | Manually triggers commission settlement — same as the daily cron. |
| **Resend Welcome Email** | Input an email address and resend the welcome email. |
| **Recover Lost Payment** | For users who paid via Korapay but never received their signup link. Input the Korapay reference, buyer email + name, and affiliate code. Verifies the payment is real, creates a paid signup record, sends the registration link, credits the affiliate commission. |
| **Data Migrations** | One-time scripts for database updates. Each is idempotent. |

#### Using Recover Lost Payment

1. Go to your Korapay dashboard and copy the charge reference (format: `AVR-SIGNUP-TIMESTAMP-RANDOM`)
2. Navigate to `/admin/migrations`
3. Fill in the "Recover Lost Payment" form with the reference, buyer's email/name, and affiliate code
4. Click **Recover & Send Signup Link**

---

## User Dashboard

### `/dashboard` — Home

Stats summary: total earnings, available balance, referral count. Displays the user's unique affiliate link and a QR code.

### `/dashboard/academy` — LMS

Lists all available courses. Each course page shows lessons grouped by section. Lessons include video content, resource links, and a completion toggle. Progress is tracked via the `Progress` model.

### `/dashboard/earnings` — Earnings

Commission transaction history with a Recharts bar chart. Displays pending vs. available balance.

### `/dashboard/referrals` — Referrals

Table of all users who signed up through the current user's affiliate link.

### `/dashboard/subscription` — Subscription

Current subscription status, expiry date, and renewal link. Lifetime users see a "Lifetime Access" badge.

### `/dashboard/withdrawals` — Withdrawals

Submit withdrawal requests. Amount must be above ₦10,000. Bank account is verified via Paystack account resolution before the transfer is initiated. Withdrawal history shows Paystack transfer status in real time.

### `/dashboard/settings` — Settings

- **Profile** — update name, upload profile photo (Cloudinary)
- **Bank details** — add/update Nigerian bank account; verified via Paystack before saving
- **Telegram** — link Telegram account (triggers group join flow)

---

## Issues Found & Resolved

### Bug 1 — Payment reference overwrite — bank transfer "not found" error (Critical) ✓ Fixed

**File:** `src/app/api/payments/pre-register/initialize/route.ts`

**Root cause:** When a user submitted the payment form more than once, the route found the existing `PendingSignup` by email and overwrote its `paymentReference` with a new reference. Korapay still held the old reference. When payment completed, the verify route couldn't find a PendingSignup matching the old reference → "not found" error. No account created, no commission logged.

**Fix:** Always create a fresh PendingSignup for each checkout attempt. Each Korapay checkout reference maps 1:1 to its own document permanently.

---

### Bug 2 — Webhook ignores new-signup bank transfers — no fallback path (Critical) ✓ Fixed

**File:** `src/app/api/payments/webhook/route.ts`

**Root cause:** The `charge.success` webhook only searched `User.findOne({ signupPaymentRef: reference })`. For new signups, no User exists yet — only a PendingSignup. If the redirect failed, the webhook fired, found nothing, and silently returned OK. Payment permanently lost.

**Fix:** Added PendingSignup fallback. After `User.findOne` returns null, the webhook now checks `PendingSignup.findOneAndUpdate({ paymentReference: reference, paid: false })`. If found, marks as paid, sends signup link, creates affiliate commission transaction.

---

### Bug 3 — Paystack withdrawals not recorded in Transaction ledger (High) ✓ Fixed

**File:** `src/app/api/webhooks/paystack/route.ts`

**Root cause:** The Paystack webhook updated the `Withdrawal` status to `completed` but never created a `Transaction` record. So completed withdrawals were invisible in the admin Transactions panel, and the user's available balance calculation could become out of sync.

**Fix:** Added idempotent Transaction creation inside the `transfer.success` webhook handler. When Paystack confirms a transfer, a `Transaction` with `type: "withdrawal"`, `status: "completed"` is created, making the withdrawal visible in the admin Transactions panel.

---

### Bug 4 — Subscription duration: 6 months instead of 12 months ✓ Fixed

**Files:** webhook, verify, register-paid, groupManager.ts, bot handlers (7 files)

**Root cause:** Subscription duration was set to 180 days in 7 separate places.

**Fix:** All 7 occurrences updated to `365 * 24 * 60 * 60 * 1000` ms. All UI text updated to say "12 months".

---

### Bug 5 — Expired users not blocked from dashboard API routes (High) ✓ Fixed

**File:** `src/proxy.ts`

**Root cause:** Middleware checked `isActive` but not `subscriptionExpiresAt`. An expired user with `isActive: true` could still reach the dashboard.

**Fix:** Added expiry check in `proxy.ts`. Non-lifetime users with `subscriptionExpiresAt` in the past get redirected to `/pending-payment?expired=1` (pages) or a 403 (API routes).

---

### Bug 6 — Telegram expiry cron doesn't set `User.isActive = false` (Medium) ✓ Fixed

**File:** `src/bot/services/groupManager.ts`

**Root cause:** When `processTelegramExpiry()` kicked an expired user from Telegram, it only updated `AverisSubscriber`. `User.isActive` was left as `true`, so the user could still log into the dashboard.

**Fix:** After `removeFromGroup()`, the cron now also calls `User.findByIdAndUpdate(sub.averisUserId, { isActive: false })`.

---

### Bug 7 — `isLifetime` and `subscriptionExpiresAt` missing from JWT session (High) ✓ Fixed

**Files:** `src/lib/auth.ts`, `src/types/next-auth.d.ts`

**Root cause:** The NextAuth JWT and session callbacks did not carry `isLifetime` or `subscriptionExpiresAt` — needed for the middleware expiry check.

**Fix:** Added both fields to `authorize()`, `jwt()` (login and `trigger: "update"`), and `session()`. TypeScript interfaces extended in `next-auth.d.ts`.

---

### Bug 8 — No manual payment recovery path for admin ✓ Fixed

**Files:** New route + admin UI

**Root cause:** No tool existed to recover a payment that went through on Korapay but failed to create a signup record on the platform side.

**Fix:** Created `POST /api/admin/tools/recover-payment` — verifies the Korapay charge is real, creates a paid PendingSignup with a signupToken, sends the registration link, creates the affiliate commission Transaction. A UI form was added to the Migrations admin page.

---

## External Services

### Korapay — Subscription Payments

All subscription checkout flows. The wrapper is at `src/lib/korapay.ts`.

| Function | Purpose |
|---|---|
| `initializeCharge()` | Creates a checkout session, returns `checkout_url` |
| `verifyCharge(reference)` | Confirms payment status (`success \| failed \| pending \| processing`) |
| `listBanks()` | Returns Nigerian banks (legacy — Paystack used for withdrawals now) |
| `resolveAccount()` | Verifies a bank account number (legacy) |

Korapay webhook endpoint: `POST /api/payments/webhook` — handles `charge.success`.

### Paystack — Withdrawal Transfers

All affiliate payout transfers. The wrapper is at `src/lib/paystack.ts`.

| Function | Purpose |
|---|---|
| `listPaystackBanks()` | Returns all Nigerian banks for the withdrawal bank selector |
| `resolvePaystackAccount()` | Verifies account number, returns account holder name |
| `createTransferRecipient()` | Registers a bank account with Paystack, returns `recipientCode` |
| `initiateTransfer()` | Sends funds to a Paystack recipient, returns `transferCode` |
| `verifyPaystackSignature()` | HMAC-SHA512 webhook signature verification |

Paystack webhook endpoint: `POST /api/webhooks/paystack` — handles `transfer.success`, `transfer.failed`, `transfer.reversed`.

### Resend

All transactional emails. The wrapper is at `src/lib/email.ts`.

| Function | When sent |
|---|---|
| `sendWelcomeEmail()` | After user completes registration |
| `sendPaidSignupLinkEmail()` | After Korapay payment confirmed — sends registration link |
| `sendPendingCommissionEmail()` | Notifies affiliate their commission is pending |
| `sendWithdrawalCompletedEmail()` | After Paystack `transfer.success` — notifies affiliate payout landed |
| `sendAdminWithdrawalNotificationEmail()` | Notifies admin when a withdrawal is initiated |
| `sendEmailVerification()` | Email address verification link |
| `sendPasswordReset()` | Password reset link |
| `sendOTPEmail()` | 6-digit OTP for new-device login |
| `sendExpiryReminder()` | 14-day and 3-day subscription expiry warnings |

### Cloudinary

Profile photo storage. `GET /api/admin/upload/signature` generates a signed upload signature so clients upload directly to Cloudinary. URL stored in `User.profileImage`.

### MongoDB Atlas

Connection singleton in `src/lib/db.ts` uses a module-level cached promise to avoid multiple connections across serverless invocations.

---

## Deployment

The app is deployed on **Vercel**. The Telegram bot runs in webhook mode.

### Cron Configuration (`vercel.json`)

```json
{
  "crons": [
    { "path": "/api/cron/settle-commissions", "schedule": "0 2 * * *" },
    { "path": "/api/cron/expiry",              "schedule": "0 6 * * *" }
  ]
}
```

### Korapay Webhook Setup

In your Korapay merchant dashboard:
- Webhook URL: `https://www.averisacademy.com/api/payments/webhook`
- Set `KORAPAY_WEBHOOK_SECRET` on Vercel to match
- Enable the `charge.success` event

### Paystack Webhook Setup

In your Paystack dashboard:
- Webhook URL: `https://www.averisacademy.com/api/webhooks/paystack`
- `PAYSTACK_SECRET_KEY` is used to verify signatures — no separate secret needed
- Enable transfer events: `transfer.success`, `transfer.failed`, `transfer.reversed`

### Telegram Bot Webhook

```
https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook?url=https://www.averisacademy.com/api/telegram/webhook
```

### Local Development

```bash
npm install
cp .env.example .env.local  # fill in all required vars
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
