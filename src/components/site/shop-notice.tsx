import { shopOpen } from "@/lib/inventory";

/**
 * Site-wide notice while the shop is closed.
 *
 * Rendered on the server from the same flag the checkout enforces, so the
 * banner cannot claim one thing while the API does another.
 */
export async function ShopNotice() {
  if (await shopOpen()) return null;
  return (
    <div className="border-b border-[var(--color-plate-edge)] bg-[var(--color-hot)] text-[var(--color-hot-ink)]">
      <div className="gutter">
        <p className="shell py-2 text-center text-[13px] font-bold leading-snug">
          We are not taking orders yet — first production run is still being
          moulded. Everything here is browsable; nothing is for sale today.
        </p>
      </div>
    </div>
  );
}
