import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Win } from "@/components/ui/primitives";

/** Shared shell for editorial and policy pages — one place that owns measure,
    rhythm and heading scale, so support content never drifts from the store. */
export function PageShell({
  title,
  deck,
  crumbs,
  aside,
  children,
}: {
  title: string;
  deck?: string;
  crumbs: { label: string; href?: string }[];
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="gutter pt-3">
        <div className="shell">
          <Win title={title.toUpperCase()} bodyClass="p-4 md:p-6">
            <Breadcrumbs items={crumbs} />
            <h1 className="mt-3 max-w-[24ch] text-[26px] font-bold leading-tight md:text-[32px]">
              {title}
            </h1>
            {deck && (
              <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-ink-dim">
                {deck}
              </p>
            )}
          </Win>
        </div>
      </div>
      <div className="gutter">
        <div className="shell grid gap-4 py-4 lg:grid-cols-12">
          <div className="glass p-5 md:p-7 lg:col-span-8">
            <Prose>{children}</Prose>
          </div>
          {aside && <aside className="lg:col-span-4">{aside}</aside>}
        </div>
      </div>
    </>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
max-w-[68ch]
        [&_h2]:mt-9 [&_h2]:font-[Verdana] [&_h2]:text-[18px] [&_h2]:font-bold first:[&_h2]:mt-0
        [&_h3]:mt-6 [&_h3]:font-[Verdana] [&_h3]:text-[15px] [&_h3]:font-bold
        [&_p]:mt-3.5 [&_p]:text-[14.5px] [&_p]:leading-relaxed [&_p]:text-ink-dim
        [&_ul]:mt-3.5 [&_ul]:space-y-2 [&_li]:text-[14.5px] [&_li]:leading-relaxed [&_li]:text-ink-dim
        [&_ol]:mt-3.5 [&_ol]:space-y-2.5 [&_ol]:list-decimal [&_ol]:pl-5
        [&_a]:text-ps-blue [&_a]:underline [&_a]:underline-offset-2
        [&_strong]:font-semibold [&_strong]:text-ink
        [&_table]:mt-5 [&_table]:w-full [&_table]:border-collapse
        [&_th]:border-b [&_th]:border-edge [&_th]:py-2.5 [&_th]:text-left [&_th]:text-[12.5px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-ink-mute
        [&_td]:border-b [&_td]:border-edge [&_td]:py-3 [&_td]:text-[14px] [&_td]:text-ink-dim
      "
    >
      {children}
    </div>
  );
}

export function AsideCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass p-4">
      <h2 className="text-[13px] font-bold">{title}</h2>
      <div className="mt-2.5 space-y-2 text-[13px] leading-relaxed text-ink-dim [&_a]:text-ps-blue [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </div>
  );
}
