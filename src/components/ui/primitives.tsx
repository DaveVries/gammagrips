import Link from "next/link";
import { cn, money } from "@/lib/utils";

/* ============================================================================
   Console-grey primitives. Server components — no client JS.

   Buttons and panels are built from the two-step bevel: raised by default,
   pressed becomes recessed and the label nudges 1px down-right, exactly the
   way the era signalled a click.
   ========================================================================= */

const btnBase =
  "sheen cut-sm relative inline-flex select-none items-center justify-center gap-2 " +
  "font-bold uppercase tracking-[0.06em] transition-[transform,background] duration-100 " +
  "disabled:cursor-not-allowed disabled:opacity-45";

const btnTone = {
  /* Solid console blue. The primary action is one colour, not a ramp. */
  /* One loud action per view. `primary` is the hot key, `go` is its cold
     inverse for confirmations, `default` is graphite. */
  /* On a near-black page white is the loudest thing available, so it carries
     the primary action. The accent is spent only on add-to-cart, which is the
     one moment it should mean something. */
  primary:
    "key bg-[var(--color-ice)] text-[var(--color-on-ice)] [--key-glow:rgba(220,232,255,0.35)]",
  default:
    "key plate text-ink [--key-glow:rgba(0,0,0,0)] hover:bg-[var(--color-plate-hi)]",
  go: "key bg-[var(--color-hot)] text-[var(--color-hot-ink)] [--key-glow:rgba(155,216,0,0.85)]",
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
      {/* Was a bordered tab clipped to the top edge of the panel — a window
          chrome tab, and it made every panel on the site look like an
          application. It is a caption now: it labels the panel without
          pretending to be part of one. */}
      {title !== undefined && (
        <div className="mb-3 flex min-w-0 items-center gap-2.5">
          <span
            className="h-[3px] w-6 shrink-0 rounded-full bg-[var(--color-hot)]"
            aria-hidden="true"
          />
          <span className="label min-w-0 truncate text-ink-mute">{title}</span>
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
  style,
}: {
  className?: string;
  scan?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
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
  blue: "bg-[var(--color-blk-blue)] text-[var(--color-on-blk-blue)]",
  green: "bg-[var(--color-blk-green)] text-[var(--color-on-blk-green)]",
  yellow: "bg-[var(--color-blk-yellow)] text-[var(--color-on-yellow)]",
  red: "bg-[var(--color-blk-red)] text-[var(--color-on-blk-red)]",
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
        "label inline-flex items-center gap-1 rounded-full px-2.5 py-[5px]",
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
          <p className="mb-4 flex items-center gap-2.5">
            <span
              className="h-[3px] w-6 shrink-0 rounded-full bg-[var(--color-hot)]"
              aria-hidden="true"
            />
            <span className="label text-ink-mute">{eyebrow}</span>
          </p>
        )}
        <h2 className="shout text-[32px] leading-[0.95] md:text-[46px]">{title}</h2>
        {copy && (
          <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">{copy}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Rule({ className }: { className?: string }) {
  return <div className={cn("ps-rule h-px w-full", className)} aria-hidden="true" />;
}


/**
 * Collapsible below-the-fold section, phones only.
 *
 * The PDP's detail column ran 7,430px on a 375px screen — thirteen screens of
 * scrolling past specs to reach reviews. Native <details> does the work: no
 * client JS, the content stays in the DOM for crawlers, and `open` is forced
 * back on from `sm` up so desktop is unchanged.
 */
export function MobileFold({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="fold group border-b border-[var(--color-plate-edge)] sm:border-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 sm:hidden">
        <span className="text-[15px] font-bold">{title}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          aria-hidden="true"
          className="shrink-0 text-ink-mute transition-transform group-open:rotate-180"
        >
          <path d="M3 5.5 7 9.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </summary>
      <div className="pb-5 sm:pb-0">{children}</div>
    </details>
  );
}
