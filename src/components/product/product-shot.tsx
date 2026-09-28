import Image from "next/image";
import type { Design, PlatformId } from "@/lib/types";
import { designMedia } from "@/data/media";
import { ColourPlate } from "@/components/product/grip-photo";
import { cn } from "@/lib/utils";

/* ============================================================================
   Product presentation
   ----------------------------------------------------------------------------
   Every grip is shot twice — fitted from the front, and from the back where
   the branding sits. One photo in a bezel was a catalogue entry; these two
   components spend both shots.

     ProductShot   card media. Front by default, cross-fades to the back on
                   hover or keyboard focus. Two pips say a second view exists,
                   because a hover-only affordance does not exist on a phone.

     ProductStage  the hero. The back shot sits behind and to the side at
                   reduced scale, the front shot stands in front of it, and the
                   design's own colour pools on the floor underneath.
   ========================================================================= */

function shots(design: Design, platformId: PlatformId) {
  return {
    front: designMedia(design.id, platformId, "front"),
    back: designMedia(design.id, platformId, "back"),
  };
}

export function ProductShot({
  design,
  platformId = "dualsense",
  className,
  sizes = "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw",
  priority,
}: {
  design: Design;
  platformId?: PlatformId;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const { front, back } = shots(design, platformId);
  if (!front) return <ColourPlate design={design} className={className} />;

  /* The caller owns the box: `fill` needs a positioned ancestor with a size,
     and adding `relative` here as well would fight an `absolute` passed in
     from a card and collapse the span to zero height. */
  return (
    <span className={cn("block", className)}>
      <Image
        src={front.src}
        alt={front.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-contain transition-[opacity,transform] duration-500 ease-[var(--ease-out)]",
          back && "group-hover:opacity-0 group-focus-within:opacity-0",
        )}
      />
      {back && (
        <>
          <Image
            src={back.src}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            className="scale-[0.96] object-contain opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out)] group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
          />
          {/* Hover is not an affordance on touch, so say there are two views. */}
          <span
            aria-hidden
            className="absolute bottom-2 left-1/2 z-[2] flex -translate-x-1/2 gap-1"
          >
            <span className="h-1 w-3 rounded-full bg-white/70 transition-colors duration-300 group-hover:bg-white/25" />
            <span className="h-1 w-3 rounded-full bg-white/25 transition-colors duration-300 group-hover:bg-white/70" />
          </span>
        </>
      )}
    </span>
  );
}

export function ProductStage({
  design,
  platformId = "dualsense",
  className,
  priority,
}: {
  design: Design;
  platformId?: PlatformId;
  className?: string;
  priority?: boolean;
}) {
  const { front, back } = shots(design, platformId);
  if (!front) return <ColourPlate design={design} className={className} />;

  return (
    <div
      className={cn("relative isolate aspect-[4/5] w-full sm:aspect-[5/4]", className)}
      style={{ ["--spill" as string]: design.ink }}
    >
      {/* Colour pooled on the floor. The renders are cut out, so without this
          they hang in the middle of nothing. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[6%] bottom-[4%] top-[14%] z-0 rounded-full opacity-60 blur-[60px]"
        style={{
          background:
            "radial-gradient(50% 46% at 50% 64%, var(--spill), transparent 72%)",
        }}
      />

      {/* Both shots are sized off the stage HEIGHT, not its width: the renders
          are portrait, so width-based sizing overflows the frame the moment the
          column gets narrow. */}
      {back && (
        <div className="absolute bottom-[18%] left-0 z-[1] h-[46%] -rotate-[9deg] opacity-45 sm:bottom-[16%] sm:h-[58%]">
          <Image
            src={back.src}
            alt={back.alt}
            width={back.w}
            height={back.h}
            sizes="(max-width: 640px) 40vw, 24vw"
            className="h-full w-auto"
          />
        </div>
      )}

      <div className="absolute bottom-0 right-[1%] z-[2] h-[80%] drop-shadow-[0_34px_50px_rgba(0,0,0,0.9)] sm:h-[94%]">
        <Image
          src={front.src}
          alt={front.alt}
          width={front.w}
          height={front.h}
          priority={priority}
          sizes="(max-width: 640px) 66vw, 40vw"
          className="h-full w-auto"
        />
      </div>
    </div>
  );
}
