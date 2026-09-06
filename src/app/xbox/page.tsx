import type { Metadata } from "next";
import { PRODUCTS } from "@/data/catalog";
import { CollectionPage } from "@/components/plp/collection-page";

export const metadata: Metadata = {
  title: "Xbox — Series X|S & Elite controller grips",
  description:
    "Controller grips, thumb grips and accessories for the Xbox Wireless Controller and Elite Series 2. Moulded per controller, fitted without adhesive.",
};

export default async function XboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pool = PRODUCTS.filter((p) => p.platforms.some((id) => id.startsWith("xbox")));
  return (
    <CollectionPage
      pool={pool}
      eyebrow="Xbox Series X|S"
      title="Everything for Xbox controllers"
      intro="Fits the Xbox Wireless Controller — including the 2016 Xbox One refresh with the 3.5 mm jack — and the Elite Wireless Controller Series 2. The Elite uses a deeper mould; the two are not interchangeable."
      crumbs={[{ label: "Xbox" }]}
      searchParams={await searchParams}
      platformId="xbox-series"
    />
  );
}
