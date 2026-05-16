import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM!;
const APP_NAME = "Averis Academy";

function header(appUrl: string) {
  return `
    <div style="text-align:center;padding:28px 0 20px;border-bottom:1px solid #e2e8f0;margin-bottom:8px;">
      <a href="${appUrl}" style="text-decoration:none;display:inline-block;">
        <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);padding:12px 24px;border-radius:12px;display:inline-block;">
          <span style="color:#4dbdd4;font-family:Georgia,serif;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Averis</span>
          <span style="color:#ffffff;font-family:Georgia,serif;font-size:22px;font-weight:700;letter-spacing:-0.5px;"> Academy</span>
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

const btn = (href: string, label: string, color = "#1a3a52") =>
  `<div style="text-align:center;margin:30px 0;">
    <a href="${href}" style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">${label}</a>
  </div>`;

export async function sendVerificationEmail(email: string, firstName: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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

export async function sendWelcomeEmail(email: string, firstName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to ${APP_NAME} — Your account is active!`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:linear-gradient(138deg,#070f1a 0%,#1a3a52 48%,#1f5f6e 100%);border-radius:12px;padding:30px;margin:20px 0;text-align:center;">
        <h2 style="color:#fff;margin:0 0 8px;font-size:24px;">Welcome aboard, ${firstName}!</h2>
        <p style="color:rgba(255,255,255,0.8);margin:0;">Your account is now active. Start learning and earning today.</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">Share your referral link with others and earn <strong>50% commission</strong> on every subscription — every 6 months.</p>
        <div style="background:white;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e2e8f0;">
          <p style="color:#1a3a52;margin:0 0 12px;font-weight:bold;">Your commission structure:</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:13px;">New Subscription Referral</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;color:#2d7f8f;font-size:18px;">₦17,500</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#555;font-size:13px;">Renewal Referral (every 6 months)</td>
              <td style="padding:10px 0;text-align:right;font-weight:bold;color:#2d7f8f;font-size:18px;">₦15,000</td>
            </tr>
          </table>
        </div>
        <ul style="color:#555;line-height:2;padding-left:20px;margin:0 0 24px;">
          <li>Access all 4 learning modules</li>
          <li>Weekly live coaching calls</li>
          <li>Private community access</li>
          <li>Unique affiliate link &amp; QR code</li>
          <li>Direct bank withdrawals (min ₦10,000)</li>
        </ul>
        ${btn(`${appUrl}/dashboard`, "Go to Your Dashboard →")}
      </div>
      ${footer()}
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

export async function sendOTPEmail(email: string, firstName: string, otp: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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

export async function sendCommissionEmail(params: {
  affiliateEmail: string;
  affiliateFirstName: string;
  buyerName: string;
  commissionAmount: number;
  orderId: string;
  productName: string;
  paymentReference: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { email, firstName, amount, bankName, accountNumber, accountName, withdrawalId } = params;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Withdrawal Request Received — ₦${amount.toLocaleString()} | ${APP_NAME}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <h2 style="color:#1a3a52;margin-top:0;">Withdrawal Request Received</h2>
        <p style="color:#555;line-height:1.6;">Hi ${firstName}, your withdrawal request has been received and will be processed this Friday.</p>
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { email, firstName, daysLeft, expiryDate } = params;
  const isExpired = daysLeft <= 0;
  const formattedDate = expiryDate.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: isExpired
      ? `Your ${APP_NAME} subscription has expired — Renew now`
      : `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — ${APP_NAME}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
      ${header(appUrl)}
      <div style="background:${isExpired ? "#f8d7da" : "#fff3cd"};border:2px solid ${isExpired ? "#f5c6cb" : "#ffc107"};border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="font-size:32px;margin:0;">${isExpired ? "🚫" : "⏳"}</p>
        <h2 style="color:${isExpired ? "#721c24" : "#856404"};margin:8px 0 0;">${isExpired ? "Subscription Expired" : `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}</h2>
        <p style="color:${isExpired ? "#721c24" : "#856404"};margin:4px 0 0;font-size:14px;">${formattedDate}</p>
      </div>
      <div style="background:#f5f8fa;border-radius:12px;padding:30px;margin:20px 0;">
        <p style="color:#555;line-height:1.6;margin-top:0;">Hi ${firstName}, ${isExpired ? "your Averis Academy subscription has expired. Renew now to regain access to all courses and your affiliate dashboard." : "renew now to keep your access uninterrupted."}</p>
        ${btn(`${appUrl}/dashboard/subscription`, "Renew Subscription →")}
      </div>
      ${footer()}
    </div>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
