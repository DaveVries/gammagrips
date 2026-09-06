import { redirect } from "next/navigation";

/** The catalogue is a single line today, so /shop is an alias for the grips
    listing rather than a second, near-identical page. */
export default function ShopPage() {
  redirect("/controller-grips");
}
