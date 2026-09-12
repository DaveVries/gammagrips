import { SITE_URL } from "@/lib/site";
import { sendMail } from "@/lib/mail";

const euro = (cents: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export type ConfirmationLine = { name: string; qty: number; line_cents: number };

/**
 * Order confirmation.
 *
 * Plain-table HTML with inline styles on purpose: mail clients strip <style>
 * blocks, ignore flexbox and grid, and Outlook renders through Word. The site's
 * design system cannot survive that trip, so this deliberately looks plain
 * rather than broken. A text/plain part goes alongside for the clients that
 * refuse HTML.
 *
 * The tracking link is the whole point — it is how an order is followed
 * without an account, so it appears twice and is never behind a button alone.
 */
export async function sendOrderConfirmation(opts: {
  to: string;
  firstName: string;
  orderNumber: string | number;
  token: string;
  lines: ConfirmationLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}) {
  const url = `${SITE_URL}/order/${opts.token}`;
  const rows = opts.lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 0;">${esc(l.name)} × ${l.qty}</td>` +
        `<td align="right" style="padding:6px 0;">${euro(l.line_cents)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f5;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;padding:28px;">
<tr><td>
<p style="margin:0 0 4px;font-size:13px;color:#666;">GammaGrips</p>
<h1 style="margin:0 0 16px;font-size:21px;">Order ${esc(String(opts.orderNumber))} bevestigd</h1>
<p style="margin:0 0 18px;font-size:15px;line-height:1.55;">Hoi ${esc(opts.firstName)}, bedankt voor je bestelling. We pakken 'm in en je krijgt een track &amp; trace zodra hij Hillegom verlaat.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #e5e5e5;margin-bottom:8px;">
${rows}
<tr><td style="padding:6px 0;color:#666;">Verzending</td><td align="right" style="padding:6px 0;color:#666;">${opts.shippingCents === 0 ? "Gratis" : euro(opts.shippingCents)}</td></tr>
<tr><td style="padding:10px 0 0;border-top:1px solid #e5e5e5;font-weight:700;">Totaal</td><td align="right" style="padding:10px 0 0;border-top:1px solid #e5e5e5;font-weight:700;">${euro(opts.totalCents)}</td></tr>
</table>
<p style="margin:22px 0 8px;font-size:15px;">Volg je bestelling:</p>
<p style="margin:0 0 6px;"><a href="${url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-size:14px;font-weight:700;">Bekijk je order</a></p>
<p style="margin:10px 0 0;font-size:12px;color:#666;word-break:break-all;">Of plak deze link: ${url}</p>
<p style="margin:20px 0 0;font-size:12px;color:#666;line-height:1.6;">Bewaar deze mail — met deze link volg je je bestelling, regel je een retour of bestel je opnieuw, zonder account.<br>Vragen? Antwoord gewoon op deze mail.</p>
<p style="margin:16px 0 0;font-size:11px;color:#999;">GammaGrips · Brouwerlaan 1273, 2182 KG Hillegom · KvK 95473785</p>
</td></tr></table></body></html>`;

  const text = [
    `Order ${opts.orderNumber} bevestigd`,
    ``,
    `Hoi ${opts.firstName}, bedankt voor je bestelling.`,
    ``,
    ...opts.lines.map((l) => `- ${l.name} x${l.qty}  ${euro(l.line_cents)}`),
    `Verzending: ${opts.shippingCents === 0 ? "gratis" : euro(opts.shippingCents)}`,
    `Totaal: ${euro(opts.totalCents)}`,
    ``,
    `Volg je bestelling: ${url}`,
    ``,
    `Bewaar deze link — daarmee volg je je bestelling zonder account.`,
    `GammaGrips · Brouwerlaan 1273, 2182 KG Hillegom · KvK 95473785`,
  ].join("\n");

  return sendMail({
    to: opts.to,
    subject: `Order ${opts.orderNumber} bevestigd — GammaGrips`,
    text,
    html,
  });
}
