import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = (process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM)!;
const APP_NAME = "Averis Academy";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.averisacademy.com";

const SETUP_VIDEO_URL = "https://res.cloudinary.com/dlvac2rkb/video/upload/v1781781956/lv_0_20260618102001_2_syjxeo.mp4";

// Logo wrapped in a dark background strip so it renders on both light and dark email clients
function header(appUrl: string) {
  return `
    <div style="text-align:center;padding:20px 0 16px;border-bottom:1px solid #e2e8f0;margin-bottom:8px;background:#0d2035;border-radius:12px 12px 0 0;">
      <a href="${appUrl}" style="text-decoration:none;display:inline-block;">
        <img src="${appUrl}/email-logo.png" alt="Averis Academy" width="160" height="auto"
          style="display:block;height:auto;border:0;outline:none;max-width:160px;" />
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
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <h2 style="color:#1a3a52;margin-top:0;">Welcome, ${firstName}!</h2>
        <p style="color:#555;line-height:1.6;">Please verify your email address to activate your Averis Academy account.</p>
        ${btn(verifyUrl, "Verify Email Address")}
        <p style="color:#888;font-size:13px;">This link expires in <strong>24 hours</strong>.</p>
        <p style="color:#888;font-size:13px;">Can't click the button? <a href="${verifyUrl}" style="color:#2d7f8f;word-break:break-all;">${verifyUrl}</a></p>
      </div>
      ${footer()}
      </div>
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
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <h2 style="color:#1a3a52;margin-top:0;">Password Reset Request</h2>
        <p style="color:#555;line-height:1.6;">Hi ${firstName}, click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        ${btn(resetUrl, "Reset My Password")}
        <p style="color:#888;font-size:13px;">If you didn't request this, ignore this email — your password won't change.</p>
      </div>
      ${footer()}
      </div>
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendWelcomeEmail(email: string, firstName: string, referralCode?: string) {
  const appUrl = APP_URL;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || "averisacademybot";
  const botDeepLink = referralCode
    ? `https://t.me/${botUsername}?start=averis_link_${referralCode}`
    : null;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to ${APP_NAME} — Your account is active!`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);border-radius:12px;padding:30px;margin:20px 0;text-align:center;">
        <h2 style="color:#fff;margin:0 0 8px;font-size:24px;">Welcome aboard, ${firstName}!</h2>
        <p style="color:rgba(255,255,255,0.8);margin:0;">Your Averis Academy account is now active, Start learning and earning today.</p>
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
        ${btn(`${appUrl}/dashboard`, "Go to Your Dashboard →")}
        ${SETUP_VIDEO_URL ? `
        <div style="margin-top:20px;">
          <p style="color:#333;font-weight:bold;font-size:14px;margin:0 0 10px;">🎬 Watch: How to set up your Averis Academy account</p>
          <a href="${SETUP_VIDEO_URL}" target="_blank" style="display:block;text-decoration:none;border-radius:10px;overflow:hidden;position:relative;line-height:0;">
            <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);border-radius:10px;padding:48px 20px;text-align:center;">
              <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:50%;line-height:56px;font-size:24px;margin-bottom:10px;">▶</div>
              <p style="color:#fff;font-weight:bold;font-size:15px;margin:0 0 4px;">Account Setup Guide</p>
              <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0;">Click to watch the video</p>
            </div>
          </a>
        </div>` : ""}
        ${botDeepLink ? `
        <div style="margin-top:20px;padding:20px;background:#1a3a52;border-radius:10px;text-align:center;">
          <p style="color:#fff;font-weight:bold;margin:0 0 6px;font-size:15px;">Next step — Join the Averis Academy Community</p>
          <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0 0 14px;">Tap the button below to connect your account to Telegram. The bot will verify your subscription and send you invite links to the community and announcement channel instantly.</p>
          <a href="${botDeepLink}" style="background:#40D457;color:#122F38;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">Join Community via Bot →</a>
          <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:10px 0 0;">Or open Telegram and message: <strong style="color:rgba(255,255,255,0.8);">@${botUsername}</strong> with the command: <code style="color:#40D457;">/start averis_link_${referralCode}</code></p>
        </div>` : ""}
      </div>
      ${footer()}
      </div>
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
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
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
        <p style="color:#888;font-size:13px;text-align:center;">After verifying, this device will be remembered for 30 days so you won't need a code again.</p>
      </div>
      ${footer()}
      </div>
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendPendingCommissionEmail(params: {
  affiliateEmail: string;
  affiliateName: string;
  buyerName: string;
  commissionAmount: number;
  orderId: string;
  productName: string;
}) {
  const appUrl = APP_URL;

  
  const { affiliateEmail, affiliateName, commissionAmount, orderId, productName } = params;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: affiliateEmail,
    subject: `Sale Confirmed! ₦${commissionAmount.toLocaleString()} affiliate commission earned`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">Hi <strong style="color:#122F38;">${affiliateName}</strong>, great news: a sale was just confirmed through your affiliate link!</p>
        <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Product</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#333;font-size:13px;">${productName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Order ID</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;font-family:monospace;color:#2d7f8f;">${orderId}</td>
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
      </div>
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
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
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
      </div>
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendCommissionSettledEmail(params: {
  email: string;
  firstName: string;
  amount: number;
}) {
  const appUrl = APP_URL;
  const { email, firstName, amount } = params;
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `₦${amount.toLocaleString()} is now available to withdraw | ${APP_NAME}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:linear-gradient(138deg,#0a2e1a 0%,#1a5235 48%,#2ec97a 100%);border-radius:12px;padding:28px;margin:20px 0;text-align:center;">
        <p style="color:rgba(255,255,255,0.7);margin:0 0 6px;font-size:13px;">YOUR COMMISSION IS READY</p>
        <h2 style="color:#fff;margin:0 0 4px;font-size:32px;font-weight:900;">₦${amount.toLocaleString()}</h2>
        <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">Available to withdraw now</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:24px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">Hi <strong style="color:#122F38;">${firstName}</strong>, your affiliate commission has been settled and is now available in your wallet.</p>
        <p style="color:#555;line-height:1.6;">You can request a withdrawal anytime from your dashboard.</p>
        ${btn(`${appUrl}/dashboard/withdrawals`, "Withdraw Now →")}
      </div>
      ${footer()}
      </div>
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
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <h2 style="color:#1a3a52;margin-top:0;">Withdrawal Request Received</h2>
        <p style="color:#555;line-height:1.6;">Hi ${firstName}, your withdrawal request has been received and is being reviewed by our team. Please allow up to <strong>2 business days</strong> for processing — you will receive another email once the funds have been sent.</p>
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
          <p style="color:#856404;font-size:13px;margin:0;"><strong>⚠ If you did not request this withdrawal</strong>, cancel it immediately from your dashboard or email Averislimited@gmail.com.</p>
        </div>
        ${btn(`${appUrl}/dashboard/withdrawals`, "View / Cancel Withdrawal →")}
        <p style="color:#aaa;font-size:11px;text-align:center;margin-top:12px;">Reference: ${withdrawalId}</p>
      </div>
      ${footer()}
      </div>
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendAdminWithdrawalNotificationEmail(params: {
  affiliateName: string;
  affiliateEmail: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  withdrawalId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "Averislimited@gmail.com";
  const appUrl = APP_URL;
  const { affiliateName, affiliateEmail, amount, bankName, accountNumber, accountName, withdrawalId } = params;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `💸 New Withdrawal Request — ₦${amount.toLocaleString()} | ${APP_NAME}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <h2 style="color:#1a3a52;margin-top:0;">New Withdrawal Request</h2>
        <p style="color:#555;line-height:1.6;">An affiliate has requested a withdrawal. Please send the money manually and then mark it as paid in the admin panel.</p>
        <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Affiliate</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#333;">${affiliateName} (${affiliateEmail})</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Amount</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;color:#2d7f8f;font-size:18px;">₦${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Bank</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#333;">${bankName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Account Number</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-family:monospace;font-size:16px;font-weight:bold;color:#333;">${accountNumber}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#888;font-size:13px;">Account Name</td>
              <td style="padding:10px 0;text-align:right;color:#333;">${accountName}</td>
            </tr>
          </table>
        </div>
        ${btn(`${appUrl}/admin/withdrawals`, "Go to Admin Panel →")}
        <p style="color:#aaa;font-size:11px;text-align:center;margin-top:12px;">Withdrawal ID: ${withdrawalId}</p>
      </div>
      ${footer()}
      </div>
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendWithdrawalCompletedEmail(params: {
  email: string;
  firstName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
}) {
  const appUrl = APP_URL;
  const { email, firstName, amount, bankName, accountNumber } = params;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Withdrawal Sent — ₦${amount.toLocaleString()} | ${APP_NAME}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <div style="text-align:center;margin-bottom:16px;">
          <div style="width:56px;height:56px;background:#d1fae5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;">✅</div>
        </div>
        <h2 style="color:#1a3a52;margin-top:0;text-align:center;">Your withdrawal has been sent!</h2>
        <p style="color:#555;line-height:1.6;text-align:center;">Hi ${firstName}, we've processed your withdrawal. The funds should reflect in your account within a few minutes depending on your bank.</p>
        <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;border:1px solid #e2e8f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Amount Sent</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;color:#2d7f8f;font-size:18px;">₦${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;">Bank</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#333;">${bankName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#888;font-size:13px;">Account</td>
              <td style="padding:10px 0;text-align:right;font-family:monospace;color:#333;">${accountNumber}</td>
            </tr>
          </table>
        </div>
        ${btn(`${appUrl}/dashboard/withdrawals`, "View Withdrawal History →")}
      </div>
      ${footer()}
      </div>
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
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
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
          <p style="color:#721c24;font-size:13px;margin:0;"><strong>If you did not make this change</strong>, your account may be compromised. Change your password immediately and email Averislimited@gmail.com.</p>
        </div>
        <div style="text-align:center;margin:20px 0 0;">
          <a href="${appUrl}/dashboard/settings" style="background:#dc3545;color:white;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">Secure My Account →</a>
        </div>
      </div>
      ${footer()}
      </div>
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendPaidSignupLinkEmail(params: {
  email: string;
  firstName: string;
  signupToken: string;
}) {
  const appUrl = APP_URL;
  const { email, firstName, signupToken } = params;
  const signupUrl = `${appUrl}/complete-registration/${signupToken}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your Averis Academy signup link is ready`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);border-radius:12px;padding:30px;margin:20px 0;text-align:center;">
        <p style="font-size:32px;margin:0;">🎉</p>
        <h2 style="color:#fff;margin:10px 0 6px;font-size:22px;">Payment Confirmed, ${firstName}!</h2>
        <p style="color:rgba(255,255,255,0.8);margin:0;">Your Averis Academy access is waiting, Complete your registration below.</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">Hi ${firstName}, your payment was successfully processed. Click the button below to set up your password and access your account.</p>
        <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin:16px 0;">
          <p style="color:#856404;font-size:13px;margin:0;">⚠️ <strong>This link is for your email only</strong> (${email}) and expires in <strong>7 days</strong>. Do not share it with anyone.</p>
        </div>
        ${btn(signupUrl, "Complete My Registration →")}
        <p style="color:#888;font-size:12px;text-align:center;margin-top:8px;">Can't click? Copy this link: <a href="${signupUrl}" style="color:#2d7f8f;word-break:break-all;">${signupUrl}</a></p>
      </div>
      ${footer()}
      </div>
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendLifetimeWelcomeEmail(email: string, firstName: string, referralCode: string) {
  const appUrl = APP_URL;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || "averisacademybot";
  const botDeepLink = `https://t.me/${botUsername}?start=averis_link_${referralCode}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to Averis Academy — Your account is active!`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);border-radius:12px;padding:30px;margin:20px 0;text-align:center;">
        <p style="font-size:32px;margin:0;">🚀</p>
        <h2 style="color:#fff;margin:10px 0 6px;font-size:24px;">Welcome aboard, ${firstName}!</h2>
        <p style="color:rgba(255,255,255,0.8);margin:0;">You have <strong style="color:#40D457;">lifetime access</strong> to Averis Academy.</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">Your account is fully active. Log in to access all courses and start earning as an affiliate.</p>
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
        ${btn(`${appUrl}/dashboard`, "Go to Dashboard →")}
        <div style="margin-top:20px;padding:20px;background:#1a3a52;border-radius:10px;text-align:center;">
          <p style="color:#fff;font-weight:bold;margin:0 0 6px;font-size:15px;">Join the Averis Academy Community on Telegram</p>
          <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0 0 14px;">Connect your account — the bot will verify your membership and send you invite links to the community and announcement channel.</p>
          <a href="${botDeepLink}" style="background:#40D457;color:#122F38;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">Join Community →</a>
        </div>
      </div>
      ${footer()}
      </div>
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
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
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
      </div>
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendSpecialAccessInstructionsEmail(email: string, registrationLink: string) {
  const appUrl = APP_URL;
  const videoUrl = SETUP_VIDEO_URL;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `You've been granted special access to Averis Academy`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);border-radius:12px;padding:30px;margin:20px 0;text-align:center;">
        <p style="font-size:32px;margin:0;">🎁</p>
        <h2 style="color:#fff;margin:10px 0 6px;font-size:24px;">You've been invited!</h2>
        <p style="color:rgba(255,255,255,0.8);margin:0;">You have been granted <strong style="color:#40D457;">free lifetime access</strong> to Averis Academy.</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">To get started, watch the short video below which shows you how to create your account, then click the button to complete your registration.</p>
        <div style="text-align:center;margin:20px 0;">
          <a href="${videoUrl}" style="display:inline-block;text-decoration:none;">
            <div style="background:#1a3a52;padding:40px 60px;border-radius:10px;text-align:center;">
              <div style="width:60px;height:60px;background:#40D457;border-radius:50%;display:inline-block;line-height:60px;margin-bottom:10px;">
                <span style="font-size:28px;color:#122F38;">▶</span>
              </div>
              <p style="color:#fff;font-weight:bold;margin:8px 0 0;font-size:15px;">Watch Setup Video</p>
              <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:4px 0 0;">Click to watch how to create your account</p>
            </div>
          </a>
        </div>
        ${btn(registrationLink, "Create My Account →")}
        <p style="color:#888;font-size:12px;text-align:center;margin-top:8px;">This link is personal to you. Do not share it.</p>
      </div>
      ${footer()}
      </div>
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendBotActivationEmail(email: string, firstName: string, referralCode: string) {
  const appUrl = APP_URL;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || "averisacademybot";
  const botDeepLink = `https://t.me/${botUsername}?start=averis_link_${referralCode}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Account created — one last step to complete your access`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      ${header(appUrl)}
      <div style="padding:20px;">
      <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);border-radius:12px;padding:30px;margin:20px 0;text-align:center;">
        <p style="font-size:32px;margin:0;">✅</p>
        <h2 style="color:#fff;margin:10px 0 6px;font-size:24px;">Account created, ${firstName}!</h2>
        <p style="color:rgba(255,255,255,0.8);margin:0;">Almost there — tap the button below to complete your access.</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">Your Averis Academy account is ready. Tap the button below to open the Telegram bot — it will automatically verify your account and send you the group invite links.</p>
        <div style="background:#fff;border-radius:10px;padding:20px;border:1px solid #e2e8f0;margin:16px 0;">
          <p style="color:#122F38;font-weight:bold;margin:0 0 10px;font-size:15px;">Important — use this exact button:</p>
          <ol style="color:#555;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
            <li>Tap <strong>"Join Community via Bot"</strong> below — do not search for the bot manually</li>
            <li>When Telegram opens, press <strong>Start</strong></li>
            <li>The bot will verify your account and send you your group invite links immediately</li>
          </ol>
        </div>
        <div style="margin-top:20px;padding:20px;background:#1a3a52;border-radius:10px;text-align:center;">
          <p style="color:#fff;font-weight:bold;margin:0 0 6px;font-size:15px;">Join Community via Bot</p>
          <a href="${botDeepLink}" style="background:#40D457;color:#122F38;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;margin-top:10px;">Join Community via Bot →</a>
        </div>
        <p style="color:#aaa;font-size:12px;text-align:center;margin-top:16px;">You can also log into your dashboard at <a href="${appUrl}/login" style="color:#2d7f8f;">${appUrl}/login</a></p>
      </div>
      ${footer()}
      </div>
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
