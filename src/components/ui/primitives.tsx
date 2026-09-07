import Link from "next/link";
import { cn, money } from "@/lib/utils";
import { Glyph } from "@/components/ui/glyphs";

/* ============================================================================
   Console-grey primitives. Server components — no client JS.

   Buttons and panels are built from the two-step bevel: raised by default,
   pressed becomes recessed and the label nudges 1px down-right, exactly the
   way the era signalled a click.
   ========================================================================= */

const btnBase =
  "sheen cut-sm relative inline-flex select-none items-center justify-center gap-2 " +
  "font-bold uppercase tracking-[0.06em] transition-[transform,background] duration-100 " +
  "active:translate-x-[2px] active:translate-y-[2px] " +
  "disabled:cursor-not-allowed disabled:opacity-45";

const btnTone = {
  /* Solid console blue. The primary action is one colour, not a ramp. */
  primary:
    "bg-[var(--color-blk-blue)] text-white drop-sm hover:brightness-110 active:shadow-none " +
    "shadow-[0_0_0_0_rgba(32,89,196,0)] hover:shadow-[3px_3px_0_rgba(22,23,27,0.28),0_10px_28px_-10px_rgba(32,89,196,0.85)]",
  default:
    "plate text-ink drop-sm hover:bg-[var(--color-plate-hi)] active:shadow-none",
  go:
    "bg-[var(--color-blk-green)] text-white drop-sm hover:brightness-110 active:shadow-none " +
    "hover:shadow-[3px_3px_0_rgba(22,23,27,0.28),0_10px_28px_-10px_rgba(18,133,74,0.85)]",
  /* On console plastic. */
  panel: "plate text-ink hover:bg-[var(--color-plate-hi)]",
  quiet: "text-ps-blue hover:text-ink active:translate-x-0 active:translate-y-0",
};

const btnSize = {
  sm: "h-8 px-3 text-[11px]",
  md: "h-10 px-4 text-[12px]",
  lg: "h-[52px] px-7 text-[13px]",
};

type ButtonProps = {
  variant?: keyof typeof btnTone;
  size?: keyof typeof btnSize;
  full?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "default",
  size = "md",
  full,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(btnBase, btnTone[variant], btnSize[size], full && "w-full", className)}
      {...rest}
    />
  );
}

export function ButtonLink({
  href,
  variant = "default",
  size = "md",
  full,
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: keyof typeof btnTone;
  size?: keyof typeof btnSize;
  full?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={cn(btnBase, btnTone[variant], btnSize[size], full && "w-full", className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

/* ============================================================================
   Panel — the core container.

   Replaces the earlier window frame. The title-bar-with-window-buttons was the
   single most Windows thing on the site; a skewed gradient tab reads console
   menu instead, and it is one element rather than three.
   ========================================================================= */

export function Win({
  title,
  right,
  bodyClass,
  className,
  children,
  as: Tag = "section",
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
  idle?: boolean;
  bodyClass?: string;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  return (
    <Tag className={cn("relative", className)}>
      {title !== undefined && (
        <div className="mb-[-1px] flex items-end gap-3">
          <span className="skew-bar inline-flex items-stretch bg-[var(--color-blk-green)]">
            <span className="label flex items-center px-5 py-1.5 text-[10px] text-white">
              {title}
            </span>
            {/* four-segment spine: the console colour set, as a fixed motif */}
            <span className="flex w-8 flex-col" aria-hidden="true">
              {["--color-blk-blue", "--color-blk-yellow", "--color-blk-red"].map((c) => (
                <span key={c} className="flex-1" style={{ background: `var(${c})` }} />
              ))}
            </span>
          </span>
          {right && <span className="ml-auto pb-1">{right}</span>}
        </div>
      )}
      <div className={cn("glass cut", bodyClass)}>{children}</div>
    </Tag>
  );
}

/** Retained for callers; the window buttons are gone with the frame. */
export function WinDots() {
  return null;
}

/** A recessed strip on dark. */
export function Groove({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("plate-in", className)}>{children}</div>
  );
}

/**
 * The dark well. Every piece of product media lives in one: the renders carry
 * their own dark backdrop, so a recessed screen is the honest way to frame
 * them, and the scanline sells it as a display rather than a photo.
 */
export function Well({
  className,
  scan = true,
  children,
}: {
  className?: string;
  scan?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "plate-in relative overflow-hidden",
        scan && "scanlines",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ============================================================================
   Badges — colour carries meaning, never decoration
   ========================================================================= */

const badgeTone = {
  neutral: "plate text-ink",
  blue: "bg-[var(--color-blk-blue)] text-white",
  green: "bg-[var(--color-blk-green)] text-white",
  yellow: "bg-[var(--color-blk-yellow)] text-[var(--color-on-yellow)]",
  red: "bg-[var(--color-blk-red)] text-white",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof badgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "cut-sm label inline-flex items-center gap-1 px-2 py-[4px]",
        badgeTone[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Compatibility is never implied by page context — every product surface states
 * it. Rendered as a system "chip" so it reads as hardware spec, not marketing.
 */
export function CompatibilityBadge({
  children,
  className,
  icon = true,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
}) {
  return (
    <span
      className={cn(
        "label inline-flex items-center gap-1.5 text-[10px] text-ink-mute",
        className,
      )}
    >
      {icon && (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
          <path
            d="M1 4.2C1 3 2 2 3.2 2h5.6C10 2 11 3 11 4.2v3.6C11 9 10 10 8.8 10H3.2C2 10 1 9 1 7.8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <circle cx="4" cy="6" r="1" fill="currentColor" />
          <circle cx="8" cy="6" r="1" fill="currentColor" />
        </svg>
      )}
      {children}
    </span>
  );
}

/* ============================================================================
   Price
   ========================================================================= */

export function Price({
  value,
  compareAt,
  size = "md",
  className,
}: {
  value: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "text-[12px]", md: "text-[14px]", lg: "text-[26px]" };
  const off = compareAt ? Math.round(((compareAt - value) / compareAt) * 100) : 0;
  return (
    <span className={cn("inline-flex items-baseline gap-2", sizes[size], className)}>
      <span className="display font-extrabold tabular-nums text-ink">{money(value)}</span>
      {compareAt && (
        <>
          <s className="text-[0.8em] tabular-nums text-ink-mute">{money(compareAt)}</s>
          <span className="cut-sm bg-[var(--color-blk-yellow)] px-1.5 py-[2px] text-[10px] font-bold text-[var(--color-on-yellow)]">
            −{off}%
          </span>
        </>
      )}
    </span>
  );
}

/* ============================================================================
   Rating
   ========================================================================= */

function Star({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0">
      <path
        d="M8 1.2 10 5.6l4.8.5-3.6 3.2 1 4.7L8 11.6 3.8 14l1-4.7L1.2 6.1l4.8-.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  const pct = (value / 5) * 100;
  return (
    <span
      className="relative inline-block leading-none"
      style={{ width: size * 5 + 8, height: size }}
      aria-hidden="true"
    >
      <span className="absolute inset-0 flex gap-[2px] text-[var(--color-pip-off)]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-[2px] overflow-hidden text-ps-yellow"
        style={{ width: `${pct}%` }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} />
        ))}
      </span>
    </span>
  );
}

export function Rating({
  value,
  count: n,
  href,
  size = 13,
  className,
}: {
  value: number;
  count: number;
  href?: string;
  size?: number;
  className?: string;
}) {
  const inner = (
    <>
      <Stars value={value} size={size} />
      <span className="text-[12px] font-bold tabular-nums text-ink">{value.toFixed(1)}</span>
      <span className="text-[12px] tabular-nums text-ink-mute">
        ({new Intl.NumberFormat("en-GB").format(n)})
      </span>
    </>
  );
  const cls = cn("inline-flex items-center gap-1.5", className);
  return href ? (
    <a href={href} className={cn(cls, "hover:underline")}>
      <span className="sr-only">
        Rated {value.toFixed(1)} out of 5 from {n} reviews. Jump to reviews.
      </span>
      {inner}
    </a>
  ) : (
    <span className={cls}>
      <span className="sr-only">
        Rated {value.toFixed(1)} out of 5 from {n} reviews
      </span>
      {inner}
    </span>
  );
}

/* ============================================================================
   Layout helpers
   ========================================================================= */

export function Section({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("gutter", className)} {...rest}>
      <div className="shell">{children}</div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  copy,
  action,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  copy?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-3 inline-flex items-center">
            <span className="skew-bar label inline-flex items-center gap-1.5 bg-[var(--color-blk-blue)] px-3 py-1.5 text-white">
              <Glyph name="tri" size={9} colour="#fff" />
              {eyebrow}
            </span>
          </p>
        )}
        <h2 className="display text-[26px] leading-[1.05] md:text-[34px]">{title}</h2>
        {copy && (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-dim">{copy}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Rule({ className }: { className?: string }) {
  return <div className={cn("ps-rule h-[3px] w-full", className)} aria-hidden="true" />;
}
