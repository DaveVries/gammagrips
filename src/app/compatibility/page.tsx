import type { Metadata } from "next";
import { CompatibilityChecker } from "@/components/site/compatibility-checker";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = {
  alternates: { canonical: "/compatibility" },
  title: "Will these fit my controller?",
  description:
    "Identify your controller in two questions and see exactly which GammaGrips shells fit it.",
};

export default function CompatibilityPage() {
  return (
    <>
      <div className="gutter border-b border-edge">
        <div className="shell py-7 md:py-9">
          <Breadcrumbs items={[{ label: "Compatibility" }]} />
          <h1 className="mt-5 text-[30px] font-semibold leading-tight tracking-tight md:text-[38px]">
            Will these fit my controller?
          </h1>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-dim">
            Our shells are moulded per controller rather than stretched over
            anything, which is why they fit precisely — and why the wrong mould
            will not seat at all. Two questions will identify yours.
          </p>
        </div>
      </div>
      <CompatibilityChecker />
    </>
  );
}
