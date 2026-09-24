const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * One transporter for the whole process.
 *
 * `createTransport` opens a connection pool; building one per message — which
 * the OTP helpers in this folder still do — means a fresh TLS handshake for
 * every send, and on a broadcast that is the dominant cost.
 */
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
    pool: true,
    maxConnections: 5,
  });

  return transporter;
};

const isMailConfigured = () =>
  Boolean(process.env.NODEMAILER_EMAIL && process.env.NODEMAILER_PASSWORD);

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * The house email shell.
 *
 * ⚠️ `title` and `body` are escaped, not interpolated raw. The body of a
 * broadcast is typed by an admin into a free-text box; dropping it into HTML
 * unescaped would let a stray `<` silently break every message, and an
 * `<img onerror>` do rather more than that.
 *
 * Newlines become `<br>` after escaping, so the admin's line breaks survive.
 */
const renderHtml = ({ title, body, ctaLabel, ctaUrl, footnote }) => `
  <div style="max-width:600px;margin:auto;padding:30px;font-family:Arial,sans-serif;background-color:#f9f9f9;border-radius:10px;border:1px solid #e0e0e0;">
    <h2 style="color:#4CAF50;margin-top:0;">${escapeHtml(title)}</h2>
    <div style="font-size:15px;color:#333;line-height:1.6;">
      ${escapeHtml(body).replace(/\n/g, "<br>")}
    </div>
    ${
      ctaLabel && ctaUrl
        ? `<div style="text-align:center;margin:28px 0;">
             <a href="${encodeURI(ctaUrl)}" style="background:#4CAF50;color:#fff;padding:12px 26px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">${escapeHtml(ctaLabel)}</a>
           </div>`
        : ""
    }
    ${
      footnote
        ? `<p style="font-size:13px;color:#888;margin-top:24px;">${escapeHtml(footnote)}</p>`
        : ""
    }
    <hr style="margin:30px 0;border:none;border-top:1px solid #e0e0e0;">
    <p style="font-size:12px;color:#aaa;text-align:center;margin:0;">
      © ${new Date().getFullYear()} HiranyaGarbha Garbhasanskar. All rights reserved.
    </p>
  </div>
`;

/**
 * Send one email.
 *
 * ⚠️ **Never throws, and always awaits the provider.** The existing OTP helpers
 * in this folder pass a callback to `transporter.sendMail` and return before it
 * fires, so their `{ success }` return value is meaningless and a bounced OTP
 * looks identical to a delivered one. This returns the real outcome.
 *
 * @returns {Promise<{sent:boolean, skipped?:boolean, error?:string, messageId?:string}>}
 */
exports.sendMail = async ({
  to,
  subject,
  title,
  body,
  html,
  ctaLabel,
  ctaUrl,
  footnote,
}) => {
  if (!to) return { sent: false, skipped: true, error: "no recipient address" };

  if (!isMailConfigured()) {
    // Same contract as an unconfigured FCM: skip cleanly so a developer
    // without SMTP credentials can still run everything else.
    return {
      sent: false,
      skipped: true,
      error: "Mail is not configured (NODEMAILER_EMAIL / NODEMAILER_PASSWORD)",
    };
  }

  try {
    const info = await getTransporter().sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to,
      subject: subject || title,
      html:
        html ||
        renderHtml({ title: title || subject, body, ctaLabel, ctaUrl, footnote }),
    });

    return { sent: true, messageId: info?.messageId };
  } catch (error) {
    console.error(`[sendMail] delivery to ${to} failed:`, error?.message);
    return { sent: false, error: error?.message || "unknown mail error" };
  }
};

exports.isMailConfigured = isMailConfigured;
