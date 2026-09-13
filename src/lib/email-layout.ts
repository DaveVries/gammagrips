import { SITE_URL } from "@/lib/site";

/**
 * Shared shell for every transactional email.
 *
 * Constraints that shape all of this, and are worth not re-learning:
 *  - Tables and inline styles only. Clients strip <style> blocks; Outlook
 *    renders through Word, which has no flexbox, no grid and no border-radius
 *    on most elements.
 *  - The lime is an accent, never a background for text. #9bd800 against white
 *    is about 1.7:1 — unreadable. It carries buttons and rules, with near-black
 *    text on top where it is a fill.
 *  - The body stays light. A black email looks right in the brand but many
 *    clients force their own light mode and invert only parts of it, which
 *    ends up worse than not trying. The black band at the top carries the
 *    identity instead.
 *  - Every image needs an absolute URL and alt text: most clients block images
 *    by default, so the mail has to read fine with none of them loaded.
 */

export const BRAND = {
  lime: "#9bd800",
  limeInk: "#0a1200",
  ink: "#111318",
  body: "#3c4149",
  muted: "#6b7280",
  hair: "#e6e8ec",
  page: "#f4f5f7",
} as const;

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export const euro = (cents: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);

export function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 6px;"><tr>
<td align="center" bgcolor="${BRAND.lime}" style="border-radius:8px;">
<a href="${href}" style="display:inline-block;padding:13px 26px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:${BRAND.limeInk};text-decoration:none;border-radius:8px;">${esc(label)}</a>
</td></tr></table>`;
}

/** A lime rule that mirrors the signal bar on the site. */
export const rule = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td height="3" bgcolor="${BRAND.lime}" style="width:56px;font-size:0;line-height:0;">&nbsp;</td>
<td height="3" bgcolor="${BRAND.hair}" style="font-size:0;line-height:0;">&nbsp;</td>
</tr></table>`;

export function layout(opts: {
  preheader: string;
  heading: string;
  body: string;
}) {
  return `<!doctype html>
<html lang="nl"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.page};">
<!-- Preheader: the grey line clients show next to the subject. Hidden in the
     body itself, otherwise the first sentence gets shown twice. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.page};padding:24px 12px;">
<tr><td align="center">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;">

  <tr><td bgcolor="${BRAND.ink}" style="padding:22px 28px;">
    <a href="${SITE_URL}" style="text-decoration:none;">
      <img src="${SITE_URL}/email/logo.png" width="180" alt="GammaGrips"
           style="display:block;border:0;width:180px;max-width:180px;height:auto;">
    </a>
  </td></tr>
  <tr><td bgcolor="${BRAND.lime}" height="4" style="font-size:0;line-height:0;">&nbsp;</td></tr>

  <tr><td style="padding:28px 28px 8px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <h1 style="margin:0 0 14px;font-size:22px;line-height:1.25;color:${BRAND.ink};font-weight:800;letter-spacing:-0.02em;">${esc(opts.heading)}</h1>
  </td></tr>

  <tr><td style="padding:0 28px 28px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${BRAND.body};">
    ${opts.body}
  </td></tr>

  <tr><td style="padding:0 28px;">${rule}</td></tr>
  <tr><td style="padding:16px 28px 26px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.65;color:${BRAND.muted};">
    GammaGrips · Le Mairekade 77, 1013 CB Amsterdam<br>
    KvK 95473785 · BTW NL005155877B40 · <a href="mailto:info@gammagrips.com" style="color:${BRAND.muted};">info@gammagrips.com</a>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}
