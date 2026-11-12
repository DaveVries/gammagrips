"use client";

import { useId, useState } from "react";

/**
 * "Notify me when available", directly under the product photos. The footer
 * signup was the only way to leave an address, and nobody scrolls that far on
 * a phone. Same list, same endpoint; the source records which grip they wanted.
 */
export function NotifyMe({
  slug = "launch",
  name,
  title = "Notify me when available",
  className = "mt-2",
}: {
  /** Recorded as notify:<slug>; the home page uses "launch". */
  slug?: string;
  /** Product name for the confirmation; omitted on the home page. */
  name?: string;
  title?: string;
  className?: string;
}) {
  const id = useId();
  const [state, setState] = useState<"idle" | "sending" | "done" | "invalid">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", body: form });
      setState(res.url.includes("s=invalid") ? "invalid" : "done");
    } catch {
      setState("invalid");
    }
  }

  if (state === "done") {
    return (
      <p className={`plate-in cut-sm p-3 text-[13.5px] leading-relaxed ${className}`} role="status">
        <strong>You&apos;re on the list.</strong>{" "}
        <span className="text-ink-dim">We&apos;ll email you when {name ? `the ${name} is` : "GammaGrips are"} available.</span>
      </p>
    );
  }

  return (
    <form onSubmit={submit} action="/api/newsletter" method="post" className={`plate-in cut-sm p-3 ${className}`}>
      <input type="hidden" name="source" value={`notify:${slug}`} />
      <label htmlFor={id} className="mb-2 block text-[13.5px] font-bold">
        {title}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          className="plate h-11 min-w-0 flex-1 px-3 text-[14px] text-ink outline-none placeholder:text-ink-mute"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-11 shrink-0 rounded-[var(--radius-md)] bg-[var(--color-ice)] px-4 text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--color-on-ice)] disabled:opacity-60"
        >
          {state === "sending" ? "…" : "Notify me"}
        </button>
      </div>
      <p className="mt-1.5 text-[12px] text-ink-mute">
        {state === "invalid"
          ? "That doesn't look like an email address — try again."
          : "One email when it ships. No spam."}
      </p>
    </form>
  );
}
