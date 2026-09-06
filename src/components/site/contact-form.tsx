"use client";

import { useState } from "react";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const TOPICS = [
  "Will this fit my controller?",
  "Help choosing a surface",
  "An existing order",
  "A return or exchange",
  "A fault or warranty claim",
  "Wholesale or press",
];

export function ContactForm() {
  const [values, setValues] = useState<Record<string, string>>({ topic: TOPICS[0] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const check = (name: string, v: string) => {
    if (!v.trim()) return name === "message" ? "Tell us what you need" : "This field is required";
    if (name === "email") {
      if (!v.includes("@")) return "This email is missing the @ character";
      if (!v.split("@")[1]?.includes(".")) return "This email domain is missing a dot, for example .com";
    }
    if (name === "message" && v.trim().length < 12) return "A little more detail will get you a faster answer";
    return "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    for (const f of ["name", "email", "message"]) {
      const msg = check(f, values[f] ?? "");
      if (msg) next[f] = msg;
    }
    setErrors(next);
    if (!Object.keys(next).length) setSent(true);
  };

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-lg)] border border-ps-green/30 plate p-6"
      >
        <h2 className="text-[17px] font-semibold text-ink">Message sent</h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-dim">
          Thanks — we have it. You will get a reply at{" "}
          <span className="text-ink">{values.email}</span> within one working
          day, usually sooner. Nothing else is needed from you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-xl">
      <p className="mb-5 text-[12.5px] text-ink-mute">
        Fields marked <span className="text-ink">*</span> are required.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="name"
          label="Your name"
          autoComplete="name"
          required
          value={values.name ?? ""}
          error={errors.name}
          onChange={(v) => setValues((s) => ({ ...s, name: v }))}
          onBlur={() => setErrors((e) => ({ ...e, name: check("name", values.name ?? "") }))}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={values.email ?? ""}
          error={errors.email}
          onChange={(v) => setValues((s) => ({ ...s, email: v }))}
          onBlur={() => setErrors((e) => ({ ...e, email: check("email", values.email ?? "") }))}
        />

        <div className="sm:col-span-2">
          <label htmlFor="topic" className="mb-1.5 block text-[13px] font-medium">
            What is it about? <span className="text-ink-mute">*</span>
          </label>
          <select
            id="topic"
            name="topic"
            value={values.topic}
            onChange={(e) => setValues((s) => ({ ...s, topic: e.target.value }))}
            className="h-11 w-full rounded-[var(--radius-md)] plate-in px-3 text-[14px] text-ink outline-none focus:border-ink"
          >
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="order" className="mb-1.5 block text-[13px] font-medium">
            Order number <span className="font-normal text-ink-mute">(optional)</span>
          </label>
          <input
            id="order"
            name="order"
            value={values.order ?? ""}
            onChange={(e) => setValues((s) => ({ ...s, order: e.target.value }))}
            placeholder="GG-00000"
            className="h-11 w-full rounded-[var(--radius-md)] plate-in px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-mute focus:border-ink"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-[13px] font-medium">
            Message <span className="text-ink-mute">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={values.message ?? ""}
            onChange={(e) => setValues((s) => ({ ...s, message: e.target.value }))}
            onBlur={() =>
              setErrors((e) => ({ ...e, message: check("message", values.message ?? "") }))
            }
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "message-err" : undefined}
            className={cn(
              "w-full resize-y rounded-[var(--radius-md)] border plate-in p-3.5 text-[14px] leading-relaxed text-ink outline-none",
              errors.message ? "border-ps-red" : "border-edge focus:border-ink",
            )}
          />
          {errors.message && (
            <p id="message-err" role="alert" className="mt-1.5 text-[12.5px] text-ps-red">
              {errors.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-6">
        Send message
      </Button>
      <p className="mt-3 text-[12px] leading-relaxed text-ink-mute">
        We use your address to answer this message and nothing else. It is not
        added to any mailing list.
      </p>
    </form>
  );
}

function TextField({
  name,
  label,
  type = "text",
  autoComplete,
  required,
  value,
  error,
  onChange,
  onBlur,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const id = `c-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">
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
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(
          "h-11 w-full rounded-[var(--radius-md)] border plate-in px-3.5 text-[14px] text-ink outline-none transition-colors",
          error ? "border-ps-red" : "border-edge focus:border-ink",
        )}
      />
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-[12.5px] text-ps-red">
          {error}
        </p>
      )}
    </div>
  );
}
