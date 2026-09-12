/**
 * Pay.nl / ING Checkout client.
 *
 * ING Checkout is Pay.nl's platform, so this is the plain Pay.nl v1 API.
 * Credentials come from the ING Checkout portal and live only in environment
 * variables — never in the repo, never sent to the browser.
 */

const BASE = "https://connect.pay.nl/v1";

/**
 * Pay.nl issues two credential pairs and they are not interchangeable:
 *
 *   AT-code + token   → merchant management APIs
 *   SL-code + secret  → payment processing  ← what creating an order needs
 *
 * Authenticating an order create with AT+token returns a bare 401 with no
 * body explaining why, which is a slow thing to debug. The portal groups the
 * right pair under "Receive payments".
 */
function serviceSecret() {
  return process.env.PAY_SERVICE_SECRET ?? process.env.PAY_SIGNING_SECRET ?? "";
}

function credentials() {
  const serviceId = process.env.PAY_SERVICE_ID;
  const secret = serviceSecret();
  if (!serviceId || !secret) {
    throw new Error(
      "Pay.nl is not configured. Set PAY_SERVICE_ID (SL-code) and PAY_SERVICE_SECRET.",
    );
  }
  return { serviceId, secret };
}

export function payConfigured() {
  return Boolean(process.env.PAY_SERVICE_ID && serviceSecret());
}

/** The sales location secret also signs the exchange callbacks. */
export function exchangeSecret() {
  return serviceSecret();
}

export type CreatedOrder = { id: string; redirectUrl: string };

export async function createPayOrder(opts: {
  amountCents: number;
  reference: string;
  description: string;
  returnUrl: string;
  exchangeUrl: string;
  email: string;
  firstName: string;
  lastName: string;
}): Promise<CreatedOrder> {
  const { serviceId, secret } = credentials();

  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${serviceId}:${secret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      serviceId,
      amount: { value: opts.amountCents, currency: "EUR" },
      description: opts.description,
      reference: opts.reference,
      returnUrl: opts.returnUrl,
      exchangeUrl: opts.exchangeUrl,
      customer: {
        email: opts.email,
        firstName: opts.firstName,
        lastName: opts.lastName,
      },
    }),
  });

  if (!res.ok) {
    // Never surface the provider's raw error to the shopper; log it for us.
    const body = await res.text().catch(() => "");
    throw new Error(`Pay.nl order create failed (${res.status}): ${body.slice(0, 400)}`);
  }

  const json = (await res.json()) as {
    id: string;
    links?: { redirect?: string };
  };
  const redirectUrl = json.links?.redirect;
  if (!json.id || !redirectUrl) throw new Error("Pay.nl response missing id or redirect link");

  return { id: json.id, redirectUrl };
}

/** Pay.nl signals a completed payment with status code 100. */
export const PAID = 100;

export function mapStatus(code: number | undefined): string {
  if (code === PAID) return "paid";
  if (code === 20 || code === 50 || code === 90) return "pending"; // new / pending variants
  if (code === -90) return "cancelled";
  if (code === -80 || code === -81) return "refunded";
  if (code === -60 || code === -63) return "expired";
  if (typeof code === "number" && code < 0) return "failed";
  return "pending";
}
