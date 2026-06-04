import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = (process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM)!;
const APP_NAME = "Averis Academy";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

function header(appUrl: string) {
  return `
    <div style="text-align:center;padding:28px 0 20px;border-bottom:1px solid #e2e8f0;margin-bottom:8px;">
      <a href="${appUrl}" style="text-decoration:none;display:inline-block;">
        <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);padding:14px 24px;border-radius:12px;display:inline-block;">
          <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
            <tr>
              <td style="vertical-align:middle;padding-right:10px;">
                <svg width="36" height="28" viewBox="0 0 65 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="white"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457"/>
                </svg>
              </td>
              <td style="vertical-align:middle;">
                <div style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:900;letter-spacing:0.18em;line-height:1.1;">AVERIS</div>
                <div style="color:#40D457;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:900;letter-spacing:0.18em;line-height:1.1;">ACADEMY</div>
              </td>
            </tr>
          </table>
        </div>
      </a>
    </div>
  `;
}

function footer() {
  return `
    <div style="text-align:center;padding:24px 0 8px;border-top:1px solid #eee;margin-top:8px;">
      <p style="color:#999;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} Averis Global Limited. All rights reserved.</p>
      <p style="color:#bbb;font-size:11px;margin-top:4px;">averisacademy.com</p>
    </div>
  `;
}

const btn = (href: string, label: string) =>
  `<div style="text-align:center;margin:30px 0;">
    <a href="${href}" style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">${label}</a>
  </div>`;

export async function sendVerificationEmail(email: string, firstName: string, token: string) {
  const appUrl = APP_URL;
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;
  if (process.env.NODE_ENV !== "production") console.log(`[DEV] Email verify URL for ${email}:`, verifyUrl);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Verify your ${APP_NAME} account`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <h2 style="color:#1a3a52;margin-top:0;">Welcome, ${firstName}!</h2>
        <p style="color:#555;line-height:1.6;">Please verify your email address to activate your Averis Academy account.</p>
        ${btn(verifyUrl, "Verify Email Address")}
        <p style="color:#888;font-size:13px;">This link expires in <strong>24 hours</strong>.</p>
        <p style="color:#888;font-size:13px;">Can't click the button? <a href="${verifyUrl}" style="color:#2d7f8f;word-break:break-all;">${verifyUrl}</a></p>
      </div>
      ${footer()}
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendPasswordResetEmail(email: string, firstName: string, token: string) {
  const appUrl = APP_URL;
  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  if (process.env.NODE_ENV !== "production") console.log(`[DEV] Password reset URL for ${email}:`, resetUrl);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <h2 style="color:#1a3a52;margin-top:0;">Password Reset Request</h2>
        <p style="color:#555;line-height:1.6;">Hi ${firstName}, click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        ${btn(resetUrl, "Reset My Password")}
        <p style="color:#888;font-size:13px;">If you didn't request this, ignore this email — your password won't change.</p>
      </div>
      ${footer()}
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendWelcomeEmail(email: string, firstName: string, referralCode?: string) {
  const appUrl = APP_URL;
  const communityLink = "https://t.me/averisacademycommunity";
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || "primetrexbot";
  const botDeepLink = referralCode
    ? `https://t.me/${botUsername}?start=averis_link_${referralCode}`
    : null;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to ${APP_NAME} — Your account is active!`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);border-radius:12px;padding:30px;margin:20px 0;text-align:center;">
        <h2 style="color:#fff;margin:0 0 8px;font-size:24px;">Welcome aboard, ${firstName}!</h2>
        <p style="color:rgba(255,255,255,0.8);margin:0;">Your Averis Academy account is now active. Start learning and earning today.</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;font-weight:bold;">Your login details:</p>
        <div style="background:white;border-radius:8px;padding:16px;margin:12px 0;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Login URL</td>
              <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;"><a href="${appUrl}/login" style="color:#2d7f8f;font-size:13px;">${appUrl}/login</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#888;font-size:13px;">Email</td>
              <td style="padding:8px 0;text-align:right;color:#333;font-size:13px;">${email}</td>
            </tr>
          </table>
        </div>
        <p style="color:#888;font-size:12px;margin:0 0 20px;">Use the password you set during registration to sign in.</p>

        <p style="color:#555;line-height:1.6;margin-top:0;">Share your referral link with others and earn <strong>50% commission</strong> on every subscription — every 6 months.</p>
        <div style="background:white;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e2e8f0;">
          <p style="color:#1a3a52;margin:0 0 12px;font-weight:bold;">Your commission structure:</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:13px;">New Subscription (₦35,000)</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;color:#2d7f8f;font-size:18px;">₦17,500</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#555;font-size:13px;">Renewal every 6 months (₦30,000)</td>
              <td style="padding:10px 0;text-align:right;font-weight:bold;color:#2d7f8f;font-size:18px;">₦15,000</td>
            </tr>
          </table>
        </div>
        <p style="color:#555;font-size:13px;line-height:1.6;margin-bottom:8px;"><strong>Note:</strong> Commissions are credited to your wallet the day after a confirmed sale.</p>
        ${btn(`${appUrl}/dashboard`, "Go to Your Dashboard →")}
        ${botDeepLink ? `
        <div style="margin-top:20px;padding:20px;background:#1a3a52;border-radius:10px;text-align:center;">
          <p style="color:#fff;font-weight:bold;margin:0 0 6px;font-size:15px;">Step 2 — Join the Averis Community on Telegram</p>
          <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0 0 14px;">Tap the button below to connect your account to the Telegram group. The bot will verify your subscription and send you an invite link instantly.</p>
          <a href="${botDeepLink}" style="background:#40D457;color:#122F38;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">Join Community via Bot →</a>
          <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:10px 0 0;">Or open Telegram and message: <strong style="color:rgba(255,255,255,0.8);">@${botUsername}</strong> with the command: <code style="color:#40D457;">/start averis_link_${referralCode}</code></p>
        </div>` : ""}
        <div style="margin-top:16px;padding:16px;background:#e8f4f8;border-radius:10px;text-align:center;">
          <p style="color:#1a3a52;font-weight:bold;margin:0 0 8px;font-size:14px;">Averis Academy Affiliate Community</p>
          <p style="color:#555;font-size:13px;margin:0 0 12px;">Connect with other affiliates, get tips, and stay updated.</p>
          <a href="${communityLink}" style="background:#2d7f8f;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;display:inline-block;">Join Telegram Channel →</a>
        </div>
      </div>
      ${footer()}
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendOTPEmail(email: string, firstName: string, otp: string) {
  const appUrl = APP_URL;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your ${APP_NAME} Login Code`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <h2 style="color:#1a3a52;margin-top:0;">Login Verification</h2>
        <p style="color:#555;line-height:1.6;">Hi ${firstName}, we detected a login from a new device. Enter the code below:</p>
        <div style="text-align:center;margin:30px 0;">
          <div style="display:inline-block;background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);border-radius:12px;padding:20px 40px;">
            <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0 0 8px;letter-spacing:0.1em;text-transform:uppercase;">Verification Code</p>
            <p style="color:white;font-size:36px;font-weight:bold;letter-spacing:0.3em;margin:0;font-family:monospace;">${otp}</p>
          </div>
        </div>
        <p style="color:#888;font-size:13px;text-align:center;">Expires in <strong>10 minutes</strong>. If you didn't attempt to log in, change your password immediately.</p>
      </div>
      ${footer()}
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendPendingCommissionEmail(params: {
  affiliateEmail: string;
  affiliateFirstName: string;
  buyerName: string;
  commissionAmount: number;
  orderId: string;
  productName: string;
}) {
  const appUrl = APP_URL;
  const { affiliateEmail, affiliateFirstName, buyerName, commissionAmount, orderId, productName } = params;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: affiliateEmail,
    subject: `Sale Confirmed — ₦${commissionAmount.toLocaleString()} credits tomorrow | ${APP_NAME}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
        <h2 style="color:#fff;margin:0 0 6px;font-size:22px;">Sale Confirmed!</h2>
        <p style="color:rgba(255,255,255,0.8);margin:0;">${productName}</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">Hi ${affiliateFirstName}, great news — a sale was just confirmed through your referral link!</p>
        <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Order ID</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;font-family:monospace;color:#2d7f8f;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Buyer</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#333;">${buyerName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#1a3a52;font-weight:bold;">Your Commission</td>
              <td style="padding:10px 0;text-align:right;font-weight:bold;color:#2d7f8f;font-size:20px;">₦${commissionAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:14px;margin:16px 0;">
          <p style="color:#856404;font-size:13px;margin:0;">⏰ <strong>Settlement:</strong> Your commission will be credited to your wallet balance <strong>tomorrow</strong>. You can then withdraw it anytime.</p>
        </div>
        ${btn(`${appUrl}/dashboard/earnings`, "View Earnings →")}
      </div>
      ${footer()}
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendCommissionEmail(params: {
  affiliateEmail: string;
  affiliateFirstName: string;
  buyerName: string;
  commissionAmount: number;
  orderId: string;
  productName: string;
  paymentReference: string;
}) {
  const appUrl = APP_URL;
  const { affiliateEmail, affiliateFirstName, buyerName, commissionAmount, orderId, productName } = params;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: affiliateEmail,
    subject: `Commission Earned — Order ${orderId} | ${APP_NAME}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
        <h2 style="color:#fff;margin:0 0 6px;font-size:22px;">Commission Earned!</h2>
        <p style="color:rgba(255,255,255,0.8);margin:0;">${productName}</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">Hi ${affiliateFirstName}, you earned a commission from a referral.</p>
        <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Order ID</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;font-family:monospace;color:#2d7f8f;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Buyer</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#333;">${buyerName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#1a3a52;font-weight:bold;">Your Commission</td>
              <td style="padding:10px 0;text-align:right;font-weight:bold;color:#2d7f8f;font-size:20px;">₦${commissionAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        ${btn(`${appUrl}/dashboard/earnings`, "View Earnings →")}
      </div>
      ${footer()}
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendWithdrawalRequestEmail(params: {
  email: string;
  firstName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  withdrawalId: string;
}) {
  const appUrl = APP_URL;
  const { email, firstName, amount, bankName, accountNumber, accountName, withdrawalId } = params;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Withdrawal Request Received — ₦${amount.toLocaleString()} | ${APP_NAME}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <h2 style="color:#1a3a52;margin-top:0;">Withdrawal Request Received</h2>
        <p style="color:#555;line-height:1.6;">Hi ${firstName}, your withdrawal request has been received and is being processed now via Korapay.</p>
        <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Amount</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;color:#2d7f8f;font-size:18px;">₦${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Bank</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#333;">${bankName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Account</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-family:monospace;color:#333;">${accountNumber}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#888;font-size:13px;">Name</td>
              <td style="padding:10px 0;text-align:right;color:#333;">${accountName}</td>
            </tr>
          </table>
        </div>
        <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:14px;margin:16px 0;">
          <p style="color:#856404;font-size:13px;margin:0;"><strong>⚠ If you did not request this withdrawal</strong>, cancel it immediately from your dashboard or contact support.</p>
        </div>
        ${btn(`${appUrl}/dashboard/withdrawals`, "View / Cancel Withdrawal →")}
        <p style="color:#aaa;font-size:11px;text-align:center;margin-top:12px;">Reference: ${withdrawalId}</p>
      </div>
      ${footer()}
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendBankDetailsChangedEmail(params: {
  email: string;
  firstName: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}) {
  const appUrl = APP_URL;
  const { email, firstName, bankName, accountNumber, accountName } = params;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Security Alert: Bank Details Updated | ${APP_NAME}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:#fff3cd;border:2px solid #ffc107;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="font-size:28px;margin:0;">⚠️</p>
        <h2 style="color:#856404;margin:8px 0 0;">Security Alert</h2>
        <p style="color:#856404;margin:4px 0 0;font-size:14px;">Your bank account details were changed</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">Hi ${firstName}, your withdrawal bank details were just updated to:</p>
        <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Bank</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#333;">${bankName}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Account Number</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-family:monospace;color:#333;">${accountNumber}</td></tr>
            <tr><td style="padding:10px 0;color:#888;font-size:13px;">Account Name</td><td style="padding:10px 0;text-align:right;color:#333;">${accountName}</td></tr>
          </table>
        </div>
        <div style="background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;padding:14px;margin:16px 0;">
          <p style="color:#721c24;font-size:13px;margin:0;"><strong>If you did not make this change</strong>, your account may be compromised. Change your password immediately and contact support.</p>
        </div>
        <div style="text-align:center;margin:20px 0 0;">
          <a href="${appUrl}/dashboard/settings" style="background:#dc3545;color:white;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">Secure My Account →</a>
        </div>
      </div>
      ${footer()}
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendSubscriptionExpiryEmail(params: {
  email: string;
  firstName: string;
  daysLeft: number;
  expiryDate: Date;
  hoursLeft?: number;
}) {
  const appUrl = APP_URL;
  const { email, firstName, daysLeft, expiryDate, hoursLeft } = params;
  const isExpired = daysLeft <= 0 && !hoursLeft;
  const formattedDate = expiryDate.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

  let timeLabel: string;
  let subject: string;
  if (isExpired) {
    timeLabel = "Subscription Expired";
    subject = `Your ${APP_NAME} subscription has expired — Renew now`;
  } else if (hoursLeft) {
    timeLabel = `Expires in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}`;
    subject = `⚠️ Only ${hoursLeft}h left on your ${APP_NAME} subscription`;
  } else {
    timeLabel = `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
    subject = `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — ${APP_NAME}`;
  }

  const bannerBg = isExpired ? "#f8d7da" : "#fff3cd";
  const bannerBorder = isExpired ? "#f5c6cb" : "#ffc107";
  const bannerColor = isExpired ? "#721c24" : "#856404";
  const emoji = isExpired ? "🚫" : hoursLeft && hoursLeft <= 6 ? "🔴" : "⏳";

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:${bannerBg};border:2px solid ${bannerBorder};border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="font-size:32px;margin:0;">${emoji}</p>
        <h2 style="color:${bannerColor};margin:8px 0 0;">${timeLabel}</h2>
        <p style="color:${bannerColor};margin:4px 0 0;font-size:14px;">${formattedDate}</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">Hi ${firstName}, ${
          isExpired
            ? "your Averis Academy subscription has expired. Renew now to regain access to all courses and your affiliate dashboard."
            : "renew now to keep your access and affiliate earnings uninterrupted. Renewal is ₦30,000 for another 6 months."
        }</p>
        ${btn(`${appUrl}/dashboard/subscription`, "Renew Subscription →")}
      </div>
      ${footer()}
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
