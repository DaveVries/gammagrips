import nodemailer from "nodemailer";

/**
 * Transactional mail over TransIP's SMTP.
 *
 * Deliberately not a dedicated provider: gammagrips.com already publishes
 * SPF and TransIP's three DKIM records, so mail from this host is already
 * authenticated. Adding Resend would have meant new DNS and a second sender
 * identity for no gain at this volume.
 *
 * The trade-off to know about: a mailbox SMTP has send-rate limits and gives
 * no bounce or complaint feedback. Fine for order volumes here; if sending
 * ever grows, this module is the only thing that has to change.
 */
function transport() {
  const host = process.env.SMTP_HOST ?? "smtp.transip.email";
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error("SMTP_USER / SMTP_PASS are not set");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user, pass },
  });
}

export function mailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export const FROM = process.env.MAIL_FROM ?? "GammaGrips <info@gammagrips.com>";

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}) {
  if (!mailConfigured()) {
    // Never let a mail failure break a paid order — log and move on.
    console.warn("[mail] not configured; skipping:", opts.subject);
    return { skipped: true as const };
  }
  const info = await transport().sendMail({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo ?? "info@gammagrips.com",
  });
  return { skipped: false as const, messageId: info.messageId };
}
