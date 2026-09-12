import { SITE_URL } from "@/lib/site";
import { sendMail } from "@/lib/mail";
import { BRAND, button, esc, euro, layout } from "@/lib/email-layout";

export type ConfirmationLine = { name: string; qty: number; line_cents: number };

const cell = `font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;`;

function lineTable(
  lines: ConfirmationLine[],
  shippingCents: number,
  totalCents: number,
) {
  const rows = lines
    .map(
      (l) =>
        `<tr><td style="${cell}padding:8px 0;color:${BRAND.ink};">${esc(l.name)} <span style="color:${BRAND.muted};">× ${l.qty}</span></td>` +
        `<td align="right" style="${cell}padding:8px 0;color:${BRAND.ink};white-space:nowrap;">${euro(l.line_cents)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;border-top:1px solid ${BRAND.hair};">
${rows}
<tr><td style="${cell}padding:8px 0;color:${BRAND.muted};">Verzending</td>
<td align="right" style="${cell}padding:8px 0;color:${BRAND.muted};">${shippingCents === 0 ? "Gratis" : euro(shippingCents)}</td></tr>
<tr><td style="${cell}padding:12px 0 0;border-top:2px solid ${BRAND.ink};font-weight:800;color:${BRAND.ink};">Totaal</td>
<td align="right" style="${cell}padding:12px 0 0;border-top:2px solid ${BRAND.ink};font-weight:800;color:${BRAND.ink};">${euro(totalCents)}</td></tr>
</table>`;
}

/* ---------------------------------------------------------------- order --- */

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
  const html = layout({
    preheader: `Order ${opts.orderNumber} is bevestigd — we pakken 'm in.`,
    heading: `Order ${opts.orderNumber} bevestigd`,
    body: `
<p style="margin:0 0 18px;">Hoi ${esc(opts.firstName)}, bedankt voor je bestelling. We pakken 'm in en je krijgt een track &amp; trace zodra hij Hillegom verlaat.</p>
${lineTable(opts.lines, opts.shippingCents, opts.totalCents)}
${button(url, "Bekijk je bestelling")}
<p style="margin:14px 0 0;font-size:12px;color:${BRAND.muted};word-break:break-all;">Of plak deze link: ${url}</p>
<p style="margin:18px 0 0;font-size:13px;color:${BRAND.muted};">Bewaar deze mail — met deze link volg je je bestelling, regel je een retour of bestel je opnieuw, zonder account. Vragen? Antwoord gewoon op deze mail.</p>`,
  });

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
    `GammaGrips · Brouwerlaan 1273, 2182 KG Hillegom · KvK 95473785`,
  ].join("\n");

  return sendMail({ to: opts.to, subject: `Order ${opts.orderNumber} bevestigd — GammaGrips`, text, html });
}

/* ---------------------------------------------------------------- login --- */

export async function sendLoginLink(opts: { to: string; url: string; isAdmin?: boolean }) {
  const html = layout({
    preheader: "Je inloglink — 15 minuten geldig, werkt één keer.",
    heading: opts.isAdmin ? "Inloggen op het dashboard" : "Je inloglink",
    body: `
<p style="margin:0 0 18px;">Klik hieronder om in te loggen. De link is <strong>15 minuten geldig</strong> en werkt één keer.</p>
${button(opts.url, "Inloggen")}
<p style="margin:14px 0 0;font-size:12px;color:${BRAND.muted};word-break:break-all;">Of plak deze link: ${opts.url}</p>
<p style="margin:18px 0 0;font-size:13px;color:${BRAND.muted};">Niet aangevraagd? Dan kun je deze mail negeren — zonder de link gebeurt er niets.</p>`,
  });

  const text = [
    `Je inloglink voor GammaGrips`,
    ``,
    `15 minuten geldig, werkt één keer:`,
    opts.url,
    ``,
    `Niet aangevraagd? Negeer deze mail.`,
  ].join("\n");

  return sendMail({ to: opts.to, subject: "Je inloglink — GammaGrips", text, html });
}

/* -------------------------------------------------------------- shipped --- */

export async function sendShipped(opts: {
  to: string;
  firstName: string;
  orderNumber: string | number;
  token: string;
  carrier?: string;
  trackingUrl?: string;
}) {
  const url = `${SITE_URL}/order/${opts.token}`;
  const html = layout({
    preheader: `Order ${opts.orderNumber} is onderweg.`,
    heading: `Order ${opts.orderNumber} is onderweg`,
    body: `
<p style="margin:0 0 18px;">Hoi ${esc(opts.firstName)}, je grips hebben Hillegom verlaten${opts.carrier ? ` met ${esc(opts.carrier)}` : ""}.</p>
${button(opts.trackingUrl ?? url, opts.trackingUrl ? "Volg je pakket" : "Bekijk je bestelling")}
<p style="margin:18px 0 0;font-size:13px;color:${BRAND.muted};">Past hij niet of bevalt hij niet? Je hebt 60 dagen om te ruilen of te retourneren.</p>`,
  });
  const text = `Order ${opts.orderNumber} is onderweg.\n\n${opts.trackingUrl ?? url}`;
  return sendMail({ to: opts.to, subject: `Order ${opts.orderNumber} is onderweg — GammaGrips`, text, html });
}

/* ----------------------------------------------------------- newsletter --- */

export async function sendNewsletterWelcome(opts: { to: string }) {
  const html = layout({
    preheader: "Je staat op de lijst. Alleen als er iets nieuws is.",
    heading: "Je staat op de lijst",
    body: `
<p style="margin:0 0 18px;">Bedankt. Je hoort van ons als er een nieuwe grip of kleur is — geen kortingsspam, en uitschrijven kan met één klik onderaan elke mail.</p>
${button(`${SITE_URL}/controller-grips`, "Bekijk de zes grips")}`,
  });
  const text = `Je staat op de lijst bij GammaGrips.\n\n${SITE_URL}/controller-grips`;
  return sendMail({ to: opts.to, subject: "Je staat op de lijst — GammaGrips", text, html });
}
