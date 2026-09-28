import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import {
  Assurance,
  Benefits,
  CollectionsShowcase,
  CompatibilityStrip,
  Featured,
  GuidesTeaser,
  PlatformSplit,
  TextureTech,
  TwoSides,
} from "@/components/home/sections";
import { Rule } from "@/components/ui/primitives";

/* Title and description come from the root layout; the home page only needs
   to claim the origin as its canonical. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <PlatformSplit />
      <div className="gutter"><div className="shell"><Rule /></div></div>
      <Featured />
      <TwoSides />
      <div className="gutter"><div className="shell"><Rule /></div></div>
      <Benefits />
      <TextureTech />
      <div className="gutter"><div className="shell"><Rule /></div></div>
      <CollectionsShowcase />
      <Assurance />
      <CompatibilityStrip />
      <GuidesTeaser />
    </>
  );
}
