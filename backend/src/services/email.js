/**
 * SAHELI — Real Email Delivery Service
 * Supports Resend (HTTPS API), SendGrid (HTTPS API), and Standard SMTP (via nodemailer).
 * Strictly adheres to production security: no hardcoded secrets, robust error reporting.
 */

import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function ensureEnvLoaded() {
  if (process.env.SMTP_USER) return;
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const envCandidates = [
      path.resolve(__dirname, '../../../.env'),
      path.resolve(__dirname, '../../.env'),
      path.resolve(process.cwd(), '.env'),
    ];
    for (const envPath of envCandidates) {
      if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
        break;
      }
    }
  } catch {
    // Ignore load errors
  }
}

function getEmailConfig() {
  ensureEnvLoaded();
  const smtpUser = process.env.SMTP_USER || '';
  const smtpHost = process.env.SMTP_HOST || (smtpUser.endsWith('@gmail.com') ? 'smtp.gmail.com' : '');
  const provider = (process.env.EMAIL_PROVIDER || (smtpUser ? 'smtp' : 'resend')).toLowerCase();
  const defaultFrom = smtpUser
    ? `"SAHELI Safety" <${smtpUser}>`
    : '"SAHELI Safety" <noreply@saheli-safety.org>';

  return {
    provider,
    from: process.env.EMAIL_FROM || defaultFrom,
    appUrl: process.env.APP_URL || 'http://localhost:5173',
    apiUrl: process.env.API_URL || 'http://localhost:5000',
    resendApiKey: process.env.RESEND_API_KEY || '',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    smtp: {
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: smtpUser,
      pass: process.env.SMTP_PASS || '',
    },
  };
}

/**
 * Deliver email via Resend HTTPS API (zero extra dependencies, fast & reliable)
 */
async function sendViaResend({ from, to, subject, html, text, apiKey }) {
  if (!apiKey) {
    return {
      delivered: false,
      error: 'RESEND_API_KEY_MISSING',
      message: 'RESEND_API_KEY is not configured in .env',
    };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || `Resend API returned status ${res.status}`;
    console.error('[EmailService] Resend delivery error:', errorMsg);
    return { delivered: false, error: errorMsg };
  }

  return { delivered: true, messageId: data.id };
}

/**
 * Deliver email via SendGrid v3 API
 */
async function sendViaSendGrid({ from, to, subject, html, text, apiKey }) {
  if (!apiKey) {
    return {
      delivered: false,
      error: 'SENDGRID_API_KEY_MISSING',
      message: 'SENDGRID_API_KEY is not configured in .env',
    };
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from.includes('<') ? from.replace(/.*<([^>]+)>.*/, '$1') : from },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[EmailService] SendGrid delivery error:', errText);
    return { delivered: false, error: errText };
  }

  return { delivered: true };
}

/**
 * Deliver email via standard SMTP (Gmail, Brevo, Outlook, custom)
 */
async function sendViaSMTP({ from, to, subject, html, text, smtpConfig, otp }) {
  if (!smtpConfig.user) {
    if (otp) {
      console.log(`\n=======================================================\n[SAHELI Email Service] SMTP_USER is not configured in .env\nReal 6-Digit Email OTP for ${to}: [${otp}]\n=======================================================\n`);
    }
    return {
      delivered: false,
      error: 'SMTP_CREDENTIALS_MISSING',
      message: 'SMTP_USER is not configured in .env',
    };
  }

  const cleanPass = (smtpConfig.pass || '').replace(/\s+/g, '');
  if (!cleanPass) {
    if (otp) {
      console.log(`\n=======================================================\n[SAHELI Email Service] SMTP_PASS (App Password) is empty in .env\nReal 6-Digit Email OTP for ${to}: [${otp}]\n(Add your 16-character Google App Password to SMTP_PASS in .env to receive direct emails)\n=======================================================\n`);
    }
    return {
      delivered: false,
      error: 'SMTP_PASS_MISSING',
      message: 'SMTP_PASS is not configured in .env',
    };
  }

  const isGmail = (smtpConfig.host || '').toLowerCase().includes('gmail') || smtpConfig.user.endsWith('@gmail.com');
  const transporterOpts = isGmail
    ? {
        service: 'gmail',
        auth: {
          user: smtpConfig.user,
          pass: cleanPass,
        },
      }
    : {
        host: smtpConfig.host || 'smtp.gmail.com',
        port: smtpConfig.port || 587,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: cleanPass,
        },
      };

  const transporter = nodemailer.createTransport(transporterOpts);

  // For Gmail, ensure sender address matches authenticated account
  const effectiveFrom = isGmail || !from || from.includes('onboarding@resend.dev')
    ? `"SAHELI Safety" <${smtpConfig.user}>`
    : from;

  try {
    const info = await transporter.sendMail({
      from: effectiveFrom,
      to,
      replyTo: smtpConfig.user,
      subject,
      html,
      text,
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'Importance': 'high',
        'X-MSMail-Priority': 'High',
        'X-Mailer': 'SAHELI-Platform-Mailer',
        'X-Entity-Ref-ID': Date.now().toString(),
      },
    });
    console.log(`[EmailService] OTP Email successfully delivered to ${to} via SMTP (MessageId: ${info.messageId})`);
    return { delivered: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] SMTP delivery error sending to ${to}:`, err.message);
    if (otp) {
      console.log(`[EmailService] Fallback active OTP for ${to}: [${otp}]`);
    }
    return { delivered: false, error: err.message };
  }
}

/**
 * Main dispatch handler
 */
export async function sendEmail({ to, subject, html, text, otp }) {
  const cfg = getEmailConfig();

  if (cfg.provider === 'smtp' || (cfg.smtp.user && cfg.provider !== 'resend')) {
    return sendViaSMTP({
      from: cfg.from,
      to,
      subject,
      html,
      text,
      smtpConfig: cfg.smtp,
      otp,
    });
  }

  if (cfg.provider === 'sendgrid') {
    return sendViaSendGrid({
      from: cfg.from,
      to,
      subject,
      html,
      text,
      apiKey: cfg.sendgridApiKey,
    });
  }

  if (cfg.provider === 'resend') {
    if (cfg.resendApiKey) {
      return sendViaResend({
        from: cfg.from,
        to,
        subject,
        html,
        text,
        apiKey: cfg.resendApiKey,
      });
    } else if (cfg.smtp.user) {
      return sendViaSMTP({
        from: cfg.from,
        to,
        subject,
        html,
        text,
        smtpConfig: cfg.smtp,
        otp,
      });
    } else {
      if (otp) {
        console.log(`\n=======================================================\n[SAHELI Email Service] Active OTP for ${to}: [${otp}]\n(Configure SMTP_USER & SMTP_PASS in .env to dispatch to actual inbox)\n=======================================================\n`);
      }
      return {
        delivered: false,
        error: 'RESEND_API_KEY_MISSING',
        message: 'No email service credentials configured in .env',
      };
    }
  }

  return {
    delivered: false,
    error: 'UNKNOWN_EMAIL_PROVIDER',
    message: `Unsupported EMAIL_PROVIDER: ${cfg.provider}. Use 'resend', 'sendgrid', or 'smtp'.`,
  };
}

/**
 * Deliver Real Account Verification Email
 */
export async function sendVerificationEmail({ to, name, token, otp, verificationToken }) {
  const cfg = getEmailConfig();
  const otpCode = String(otp || token || '').trim();
  const recipientName = name || 'there';
  const isLocalUrl = !cfg.appUrl || cfg.appUrl.includes('localhost') || cfg.appUrl.includes('127.0.0.1');
  const verifyUrl = `${cfg.appUrl}/?verify=${encodeURIComponent(otpCode)}`;

  const subject = `Your SAHELI Verification Code: ${otpCode}`;

  // When testing locally, avoid sending unencrypted localhost URLs to prevent
  // major spam filters (Gmail, Yahoo, Outlook) from flagging as phishing.
  const text = isLocalUrl
    ? `Hello ${recipientName},\n\nThank you for creating an account on SAHELI Women Safety & Emergency Assistance Platform.\n\nYour 6-Digit Email Verification Code (OTP) is:\n${otpCode}\n\nThis verification code expires in 5 minutes. Enter it in the SAHELI app to activate your account.\n\nIf you did not request this account, please disregard this message.\n\nStay safe,\nSAHELI Engineering & Safety Team`
    : `Hello ${recipientName},\n\nThank you for creating an account on SAHELI Women Safety & Emergency Assistance Platform.\n\nYour 6-Digit Email Verification Code (OTP) is:\n${otpCode}\n\nThis verification code expires in 5 minutes. Enter it in the SAHELI app to activate your account.\n\nAlternatively, you can verify your account by opening this link in your browser:\n${verifyUrl}\n\nIf you did not request this account, please disregard this message.\n\nStay safe,\nSAHELI Engineering & Safety Team`;

  const actionSectionHtml = isLocalUrl
    ? `
        <div style="background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 10px; padding: 14px 18px; margin: 24px 0 16px 0; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #3730A3; font-weight: 600;">
            Enter this 6-digit code in the SAHELI registration window to activate your account immediately.
          </p>
        </div>
      `
    : `
        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 13px 32px; background-color: #3758F9; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 9999px; box-shadow: 0 4px 14px rgba(55, 88, 249, 0.35);">
            Verify My Account Directly
          </a>
        </div>
      `;

  const footerLinkHtml = isLocalUrl
    ? `© 2026 SAHELI Platform • Smart Women Safety & Emergency Assistance`
    : `© 2026 SAHELI Platform • Smart Women Safety & Emergency Assistance<br>Direct verification link: <a href="${verifyUrl}" style="color: #3758F9; text-decoration: none;">${verifyUrl}</a>`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <tr>
      <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); text-align: center;">
        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: rgba(55, 88, 249, 0.2); border: 1px solid rgba(55, 88, 249, 0.4); line-height: 48px; font-size: 24px;">
          🛡️
        </div>
        <h1 style="margin: 12px 0 4px 0; color: #FFFFFF; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">
          SAHELI
        </h1>
        <p style="margin: 0; color: #94A3B8; font-size: 13px; font-weight: 500;">
          Women Safety & Emergency Assistance Platform
        </p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 32px;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0F172A;">
          Verify Your Email Address
        </h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
          Hello <strong>${recipientName}</strong>, thank you for joining SAHELI. Please enter the following 6-digit verification code in the app to activate your safety companion:
        </p>

        <!-- Big Bold OTP Code Box -->
        <div style="background: #F8FAFC; border: 2px dashed #3758F9; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
          <div style="font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
            Your 6-Digit Email Verification OTP
          </div>
          <div style="font-size: 38px; font-weight: 800; color: #1E293B; letter-spacing: 0.35em; font-family: 'Courier New', Courier, monospace; margin: 6px 0;">
            ${otpCode}
          </div>
          <div style="font-size: 12px; color: #94A3B8; margin-top: 6px;">
            Expires in <strong>5 minutes</strong> • Single-use code
          </div>
        </div>

        ${actionSectionHtml}

        <p style="margin: 24px 0 0 0; font-size: 12px; line-height: 1.5; color: #64748B; text-align: center;">
          If you did not create a SAHELI account, you can safely ignore this email.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #94A3B8;">
        ${footerLinkHtml}
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text,
    otp: otpCode,
  });
}

/**
 * Verify SMTP connectivity on server boot or test
 */
export async function verifySmtpConnection() {
  const cfg = getEmailConfig();
  if (!cfg.smtp.user) {
    return { connected: false, message: 'SMTP_USER is not configured in .env' };
  }
  const cleanPass = (cfg.smtp.pass || '').replace(/\s+/g, '');
  if (!cleanPass) {
    return { connected: false, message: 'SMTP_PASS (Google App Password) is empty in .env' };
  }
  const isGmail = (cfg.smtp.host || '').toLowerCase().includes('gmail') || cfg.smtp.user.endsWith('@gmail.com');
  const transporterOpts = isGmail
    ? { service: 'gmail', auth: { user: cfg.smtp.user, pass: cleanPass } }
    : { host: cfg.smtp.host, port: cfg.smtp.port, secure: cfg.smtp.secure, auth: { user: cfg.smtp.user, pass: cleanPass } };

  try {
    const transporter = nodemailer.createTransport(transporterOpts);
    await transporter.verify();
    return { connected: true, message: `SMTP connection established successfully to ${cfg.smtp.user}` };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

/**
 * Deliver Password Reset Email
 */
export async function sendPasswordResetEmail({ to, name, token }) {
  const cfg = getEmailConfig();
  const resetUrl = `${cfg.appUrl}/?reset=${encodeURIComponent(token)}`;

  const subject = 'Reset Your SAHELI Password';
  const text = `Hello ${name || 'there'},\n\nA password reset request was received for your SAHELI account.\n\nTo reset your password, click the link below:\n${resetUrl}\n\nOr enter this reset token in the app:\n${token}\n\nThis reset link expires in 1 hour.\n\nIf you did not request this, please secure your account immediately.\n\nSAHELI Safety Team`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #F8FAFC; font-family: sans-serif; color: #0F172A;">
  <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; padding: 32px;">
    <h2 style="color: #0F172A; margin: 0 0 16px 0;">Reset Your Password</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
      Hello <strong>${name || 'there'}</strong>, a request was received to reset your SAHELI account password.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 28px; background-color: #3758F9; color: #FFFFFF; text-decoration: none; font-weight: 700; border-radius: 8px;">
        Reset Password
      </a>
    </div>
    <div style="background-color: #F1F5F9; padding: 12px; border-radius: 6px; font-size: 12px; text-align: center;">
      Reset Token: <code>${token}</code>
    </div>
    <p style="color: #64748B; font-size: 12px; margin-top: 24px;">
      This link is valid for 1 hour. If you did not make this request, please contact safety support.
    </p>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}
