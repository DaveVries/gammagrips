import Link from "next/link";
import { PRODUCTS, designById } from "@/data/catalog";
import { ControllerRender } from "@/components/product/controller-render";
import { ButtonLink } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="gutter">
      <div className="shell grid items-center gap-10 py-20 lg:grid-cols-2">
        <div>
          <p className="label text-ink-mute">404</p>
          <h1 className="mt-4 text-[32px] font-semibold leading-tight tracking-tight md:text-[40px]">
            That page does not exist
          </h1>
          <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-ink-dim">
            It may have moved, or the link may be wrong. The catalogue is six
            grips, so nothing is more than one click away from here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/controller-grips" size="lg">
              All six grips
            </ButtonLink>
            <ButtonLink href="/customize" size="lg" variant="default">
              Find my grip
            </ButtonLink>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-edge pt-6">
            {[
              ["Compatibility", "/compatibility"],
              ["Shipping", "/shipping"],
              ["Returns", "/returns"],
              ["Contact", "/contact"],
            ].map(([l, h]) => (
              <li key={h}>
                <Link
                  href={h}
                  className="text-[13.5px] text-ink-dim underline-offset-2 hover:text-ink hover:underline"
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden lg:block">
          <ControllerRender
            design={designById(PRODUCTS[0].designs[0])!}
            platformId="dualsense"
            className="mx-auto w-full max-w-[480px] opacity-70"
          />
        </div>
      </div>
    </div>
  );
}
