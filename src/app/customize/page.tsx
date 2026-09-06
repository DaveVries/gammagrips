import type { Metadata } from "next";
import { Configurator } from "@/components/configurator/configurator";
import { Breadcrumbs } from "@/components/site/breadcrumbs";

export const metadata: Metadata = {
  alternates: { canonical: "/customize" },
  title: "Configurator — build your controller",
  description:
    "Pick your controller, grip and design, and see the result before you buy. Three steps, no account needed.",
};

export default async function CustomizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const design = Array.isArray(sp.design) ? sp.design[0] : sp.design;
  const platform = Array.isArray(sp.platform) ? sp.platform[0] : sp.platform;

  return (
    <>
      <div className="gutter border-b border-edge">
        <div className="shell py-5">
          <Breadcrumbs items={[{ label: "Configurator" }]} />
        </div>
      </div>
      <Configurator initialDesign={design} initialPlatform={platform} />
    </>
  );
}
