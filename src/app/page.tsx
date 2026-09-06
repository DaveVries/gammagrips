import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import {
  Benefits,
  CollectionsShowcase,
  CompatibilityStrip,
  Featured,
  GuidesTeaser,
  PlatformSplit,
  SocialProof,
  TextureTech,
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
      <div className="gutter"><div className="shell"><Rule /></div></div>
      <Benefits />
      <TextureTech />
      <div className="gutter"><div className="shell"><Rule /></div></div>
      <CollectionsShowcase />
      <SocialProof />
      <CompatibilityStrip />
      <GuidesTeaser />
    </>
  );
}
