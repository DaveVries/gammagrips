import type { PlatformFamily } from "@/lib/types";

/* A plain line glyph for the two platform pickers. It is a UI icon — it never
   stands in for product imagery, which always comes from a real photo. */
export function ControllerIcon({
  family,
  className,
  title,
}: {
  family: PlatformFamily;
  className?: string;
  title?: string;
}) {
  const ps = family === "playstation";
  return (
    <svg
      viewBox="0 0 64 44"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      {/* body */}
      <path d="M22 11h20c5 0 8 3 9.5 7l6 17c1.4 4-1 7-4.6 7-2.6 0-4.3-1.4-6.2-3.3L41 33H23l-5.7 5.7C15.4 40.6 13.7 42 11.1 42c-3.6 0-6-3-4.6-7l6-17C14 14 17 11 22 11Z" />
      {/* face buttons */}
      <circle cx="43" cy="21" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="47.5" cy="25" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="38.5" cy="25" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="43" cy="29" r="1.6" fill="currentColor" stroke="none" />
      {ps ? (
        <>
          {/* symmetric sticks, d-pad above the left one */}
          <path d="M17 22h8M21 18v8" />
          <circle cx="25" cy="33" r="3.6" />
          <circle cx="37" cy="33" r="3.6" />
        </>
      ) : (
        <>
          {/* offset sticks, d-pad low and inboard */}
          <circle cx="22" cy="22" r="3.6" />
          <circle cx="34" cy="32" r="3.6" />
          <path d="M22 34h7M25.5 30.5v7" />
        </>
      )}
    </svg>
  );
}
