import type { Metadata } from "next";
import { PRODUCTS } from "@/data/catalog";
import { CollectionPage } from "@/components/plp/collection-page";

export const metadata: Metadata = {
  alternates: { canonical: "/playstation" },
  title: "PlayStation 5 — DualSense grips & accessories",
  description:
    "Controller grips, thumb grips and accessories for the PS5 DualSense and DualSense Edge. Moulded per controller, fitted without adhesive.",
};

export default async function PlayStationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pool = PRODUCTS.filter((p) =>
    p.platforms.some((id) => id.startsWith("dualsense")),
  );
  return (
    <CollectionPage
      pool={pool}
      eyebrow="PlayStation 5"
      title="Everything for the DualSense"
      intro="Fits the DualSense Wireless Controller and the DualSense Edge. Edge shells are cut around the rear paddle module, so you can still swap stick modules with the grips on."
      crumbs={[{ label: "PlayStation" }]}
      searchParams={await searchParams}
      platformId="dualsense"
    />
  );
}
