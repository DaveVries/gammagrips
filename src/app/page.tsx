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
