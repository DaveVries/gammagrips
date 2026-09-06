"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { designById, platformById, productBySlug } from "@/data/catalog";
import { ProductVisual } from "@/components/product/product-visual";
import { Button, ButtonLink, Groove, Rule } from "@/components/ui/primitives";
import { RETURN_DAYS, cn, deliveryWindow, money } from "@/lib/utils";
import type { PlatformId } from "@/lib/types";

/* ============================================================================
   Guest-first checkout.

   Deliberate choices, each addressing a documented abandonment cause:
     • guest is the default and the only required path; the account offer comes
       AFTER the order, pre-filled, as one optional click
     • the field set is the minimum a digital-to-physical order needs
     • required AND optional fields are both marked
     • validation messages are specific per failure, not one generic string
     • nothing about cost appears for the first time on this page
   ========================================================================= */

type Errors = Partial<Record<string, string>>;

const FIELDS = [
  { name: "email", label: "Email", type: "email", autoComplete: "email", required: true, hint: "Order confirmation and tracking go here." },
  { name: "firstName", label: "First name", type: "text", autoComplete: "given-name", required: true },
  { name: "lastName", label: "Last name", type: "text", autoComplete: "family-name", required: true },
  { name: "address", label: "Address", type: "text", autoComplete: "street-address", required: true },
  { name: "postcode", label: "Postcode", type: "text", autoComplete: "postal-code", required: true },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2", required: true },
] as const;

/** Specific messages beat one generic "invalid" — the most-failed guideline in
    the checkout benchmark, and the one that loses people at the last step. */
function validate(name: string, value: string): string | undefined {
  const v = value.trim();
  if (!v) {
    const f = FIELDS.find((x) => x.name === name);
    return `Enter your ${f ? f.label.toLowerCase() : "details"}`;
  }
  if (name === "email") {
    if (!v.includes("@")) return "This email is missing the @ character";
    const [local, domain] = v.split("@");
    if (!local) return "This email is missing the part before the @";
    if (!domain) return "This email is missing everything after the @";
    if (!domain.includes(".")) return "This email domain is missing a dot, for example .com";
    if (/\s/.test(v)) return "This email contains a space";
  }
  if (name === "postcode" && v.length < 4) return "A postcode is at least 4 characters";
  if ((name === "firstName" || name === "lastName") && v.length < 2)
    return "That looks too short — please use your full name";
  return undefined;
}

export function CheckoutFlow() {
  const cart = useCart();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [showCompany, setShowCompany] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [busy, setBusy] = useState(false);

  const eta = deliveryWindow(new Date("2026-09-04T00:00:00Z"));

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: validate(name, value) }));
  };
  const blur = (name: string) =>
    setErrors((e) => ({ ...e, [name]: validate(name, values[name] ?? "") }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    for (const f of FIELDS) {
      const msg = validate(f.name, values[f.name] ?? "");
      if (msg) next[f.name] = msg;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      const first = document.querySelector<HTMLInputElement>(`[name="${Object.keys(next)[0]}"]`);
      first?.focus();
      first?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    // No payment backend in this build: the order is simulated so the whole
    // flow, including the confirmation state, can be reviewed end to end.
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setPlaced(true);
    }, 700);
  };

  if (!cart.ready) return <div className="gutter"><div className="shell py-20" /></div>;

  if (placed) {
    return <Confirmation email={values.email} eta={eta} />;
  }

  if (cart.lines.length === 0) {
    return (
      <div className="gutter">
        <div className="shell py-20 text-center">
          <h1 className="text-[24px] font-semibold">There is nothing to check out</h1>
          <p className="mt-3 text-[14.5px] text-ink-dim">Your cart is empty.</p>
          <ButtonLink href="/controller-grips" className="mt-6">
            Browse the grips
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="gutter">
      <div className="shell grid gap-10 py-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="glass cut p-5">
          <h1 className="text-[22px] font-bold">Checkout</h1>

          {/* Express first: on mobile this collapses the entire form to one tap */}
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-2">
              {["Apple Pay", "PayPal"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPlaced(true)}
                  className="card h-11 plate text-[13px] font-bold hover:plate-in active:translate-x-[1px]"
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="my-5 flex items-center gap-3">
              <span className="border-t border-edge h-0 flex-1" />
              <span className="label text-ink-mute">OR PAY BY CARD</span>
              <span className="border-t border-edge h-0 flex-1" />
            </div>
          </div>

          {/* Guest is not an option among options — it is the path. */}
          <div className="cut-sm mb-5 border border-ps-green/35 border-l-[3px] border-l-ps-green bg-[#dcece1] p-3">
            <p className="text-[13px] font-bold">Checking out as a guest</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-dim">
              No account needed. After the order you can turn it into one with a
              single click — nothing to re-type.
            </p>
          </div>

          <form onSubmit={submit} noValidate>
            <fieldset>
              <legend className="text-[14px] font-bold">Contact and delivery</legend>
              <p className="mb-4 mt-1 text-[12.5px] text-ink-mute">
                Fields marked <span className="text-ink">*</span> are required.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <Field
                    key={f.name}
                    {...f}
                    className={f.name === "email" || f.name === "address" ? "sm:col-span-2" : ""}
                    value={values[f.name] ?? ""}
                    error={errors[f.name]}
                    onChange={(v) => set(f.name, v)}
                    onBlur={() => blur(f.name)}
                  />
                ))}

                {/* Rarely-used optional fields stay behind a link so people do
                    not type into the wrong box while rushing. */}
                <div className="sm:col-span-2">
                  {showCompany ? (
                    <Field
                      name="company"
                      label="Company name"
                      type="text"
                      autoComplete="organization"
                      required={false}
                      value={values.company ?? ""}
                      onChange={(v) => set("company", v)}
                      onBlur={() => {}}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCompany(true)}
                      className="text-[13px] text-ink-dim underline underline-offset-2 hover:text-ink"
                    >
                      + Add a company name (optional)
                    </button>
                  )}
                </div>
              </div>

              <Groove className="mt-4 p-3">
                <p className="text-[13px] font-bold">
                  Delivery — free, tracked, arrives {eta.earliest} – {eta.latest}
                </p>
                <p className="mt-1 text-[12px] text-ink-dim">
                  Sent from Rotterdam by PostNL. We do not ask for a phone number;
                  tracking is emailed.
                </p>
              </Groove>
            </fieldset>

            <Rule className="my-8" />

            <fieldset>
              <legend className="text-[14px] font-bold">Payment</legend>
              <p className="mb-4 mt-1 text-[12.5px] text-ink-mute">
                This is a demonstration build — no card is charged and no card
                details are collected.
              </p>
              {/* Card fields are visually contained and flagged: perceived
                  security is a design property, not a certificate. */}
              <div className="plate-in p-3">
                <div className="mb-3 flex items-center gap-2 text-ink-mute">
                  <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
                    <rect x="2.5" y="6" width="9" height="6.5" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M4.6 6V4.3a2.4 2.4 0 0 1 4.8 0V6" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                  <span className="label">Encrypted card details</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="border border-edge h-10 plate-in sm:col-span-3" />
                  <div className="border border-edge h-10 plate-in" />
                  <div className="border border-edge h-10 plate-in" />
                  <div className="border border-edge h-10 plate-in" />
                </div>
              </div>
            </fieldset>

            <Button type="submit" variant="go" size="lg" full className="mt-7" disabled={busy}>
              {busy ? "PLACING ORDER…" : `PLACE ORDER — ${money(cart.total)}`}
            </Button>
            <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-mute">
              By ordering you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
                terms
              </Link>
              . {RETURN_DAYS}-day returns apply either way.
            </p>
          </form>
          </div>
        </div>

        {/* --- order summary ------------------------------------------------ */}
        <aside className="lg:col-span-5">
          <div className="card p-[3px] lg:sticky lg:top-4">
            <div className="titlebar flex h-[22px] items-center px-2"><span className="label text-[10px]">YOUR ORDER</span></div>
            <div className="p-4">
            <ul className="mt-4 space-y-3">
              {cart.lines.map((l) => {
                const p = productBySlug(l.slug);
                if (!p) return null;
                const d = designById(l.designId);
                const pl = platformById(l.platformId as PlatformId);
                return (
                  <li key={l.key} className="flex gap-3">
                    <span className="border border-edge relative h-14 w-14 shrink-0 overflow-hidden bg-transparent">
                      <ProductVisual
                        product={p}
                        design={d}
                        platformId={l.platformId as PlatformId}
                        className="w-full"
                      />
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold tabular-nums text-white">
                        {l.qty}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
                      <span className="block truncate text-[12px] text-ink-mute">
                        {pl?.controller}
                      </span>
                    </span>
                    <span className="shrink-0 text-[13.5px] font-semibold tabular-nums">
                      {money(p.price * l.qty)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <Rule className="my-4" />

            <dl className="space-y-2 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-ink-dim">Subtotal</dt>
                <dd className="tabular-nums">{money(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-dim">Delivery</dt>
                <dd className="tabular-nums">
                  {cart.shipping === 0 ? "Free" : money(cart.shipping)}
                </dd>
              </div>
              <div className="flex justify-between text-ink-mute">
                <dt>of which VAT (21%)</dt>
                <dd className="tabular-nums">{money(cart.total - cart.total / 1.21)}</dd>
              </div>
              <div className="flex justify-between border-t border-edge pt-2 text-[17px] font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{money(cart.total)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[12px] text-ink-mute">
              This is the final amount. Nothing is added at the payment step.
            </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type,
  autoComplete,
  required,
  hint,
  value,
  error,
  onChange,
  onBlur,
  className,
}: {
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  required: boolean;
  hint?: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  className?: string;
}) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-bold">
        {label}{" "}
        {required ? (
          <span className="text-ink-mute" aria-hidden="true">*</span>
        ) : (
          <span className="font-normal text-ink-mute">(optional)</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={type === "email" ? "email" : undefined}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={cn(
          "border border-edge h-10 w-full plate-in px-3 text-[13px] text-ink outline-none",
          error && "border-ps-red",
        )}
      />
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-[12.5px] text-ps-red">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12.5px] text-ink-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Confirmation({
  email,
  eta,
}: {
  email?: string;
  eta: { earliest: string; latest: string };
}) {
  return (
    <div className="gutter">
      <div className="shell max-w-2xl py-16">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ps-green/40 text-ps-green">
            <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
              <path d="m4 9.4 3.2 3.2L14 5.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>
          <h1 className="text-[26px] font-semibold tracking-tight">Order placed</h1>
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-ink-dim">
          Order <span className="font-semibold text-ink">GG-24817</span> is
          confirmed. A receipt is on its way to{" "}
          <span className="text-ink">{email || "your inbox"}</span>, and tracking
          follows as soon as it leaves Rotterdam.
        </p>

        <dl className="border border-edge mt-7 divide-y divide-edge plate-in">
          {[
            ["Arrives", `${eta.earliest} – ${eta.latest}`],
            ["Carrier", "PostNL, tracked"],
            ["Returns", `${RETURN_DAYS} days, return postage paid inside the EU`],
          ].map(([k, v], i) => (
            <div
              key={k}
              className={cn("flex justify-between gap-6 px-4 py-3", i % 2 ? "plate" : "plate-in")}
            >
              <dt className="text-[13.5px] text-ink-dim">{k}</dt>
              <dd className="text-right text-[13.5px] font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        {/* The account ask lands here, after the money, pre-filled and optional */}
        <div className="card mt-7 plate p-5">
          <h2 className="text-[14px] font-bold">Keep track of this order?</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">
            Create an account from this order in one click — your details are
            already filled in. You can also track it from the emailed link
            without ever making one.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/account">Create account</ButtonLink>
            <ButtonLink href="/controller-grips" variant="default">
              Keep shopping
            </ButtonLink>
          </div>
        </div>

        <div className="card mt-4 plate p-5">
          <h2 className="text-[14px] font-bold">Before it arrives</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">
            Fitting takes two minutes, and the one step people skip is cleaning
            the handles first — skin oil is why grips work loose.
          </p>
          <Link
            href="/guides/dualsense-grip-installation"
            className="label mt-3 inline-block text-ink-mute transition-colors hover:text-ink"
          >
            Read the fitting guide →
          </Link>
        </div>
      </div>
    </div>
  );
}
