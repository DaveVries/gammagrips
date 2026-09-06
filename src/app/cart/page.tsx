import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <>
      <div className="gutter border-b border-edge">
        <div className="shell py-5">
          <Breadcrumbs items={[{ label: "Cart" }]} />
        </div>
      </div>
      <CartView />
    </>
  );
}
