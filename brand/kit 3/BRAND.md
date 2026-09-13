# GammaGrips — brand kit

Everything a video or design tool needs. Hand this folder over as-is.

## Colours

| Role | Hex | Notes |
|---|---|---|
| Background | `#000000` | True black. The brand lives on black. |
| Ink / primary text | `#FFFFFF` | |
| Accent ("lime") | `#9BD800` | The only colour. Use sparingly. |
| Ink on lime | `#0A1200` | Never white on lime — it is ~1.7:1 and unreadable. |
| Surface / panel | `#0B0D11` | Slightly raised off black. |
| Muted text | `#8D97A6` | |

**The one rule that matters:** lime is an accent, not a wash. On a dark frame it
should cover well under 5% of the screen — a rule, a tick, one word. An
all-lime frame reads cheap and loses the contrast that makes it pop.

## Typography

- **Geist** (SIL Open Font License, free): https://vercel.com/font
- Display / headlines: **Geist Black (900)**, uppercase, letter-spacing `-0.02em`, line-height `0.92`
- Tagline lockup: uppercase, letter-spacing `0.16em`
- Fallback if Geist is unavailable: Inter Black, or Helvetica Now Display Black

## Files

| File | Use |
|---|---|
| `mark.svg` / `mark-2048-transparent.png` | Square mark. Favicon, avatar, sting. |
| `lockup.svg` / `lockup-3000-transparent.png` | Mark + wordmark, **white type** — for dark backgrounds |
| `lockup-ink.svg` / `lockup-ink-1800.png` | Mark + wordmark, **dark type** — for light backgrounds |
| `wordmark.svg` | Type only, no mark |
| `monogram.svg` | The GG glyphs alone |
| `og-1200x630.png` | Social share card |
| `intro.html` | Animated intro, see below |

SVG is preferred wherever the tool accepts it — it scales to any resolution.
The PNGs are there for tools that refuse SVG.

## The mark

A white key with a **chamfered top-left and bottom-right corner** — that cut is
the signature, and it is the only chamfer left in the brand now that everything
else is rounded. Do not round it, do not rotate it, do not add a stroke.

At the foot sits a rule: black, with the leftmost third in lime. Keep it.

Minimum size: **26px**. Below that the GG stops reading.
Clear space: at least the height of one G on every side.

## Never

- Lime as a background behind body text
- The mark on a light background (use `lockup-ink` instead)
- Stretching, skewing or rotating the mark
- Adding glow, bevel or drop shadow to the mark itself
- Recolouring the GG — it is always near-black on white

## Tagline

**GET A GRIP.** — set in Geist Black, uppercase, wide tracking. "GRIP" may be
lime while the rest is white.

Secondary line, for product and hero contexts: **FEEL WHAT YOU SEE**

## Animated intro

`intro.html` is a self-contained 2.5-second sting: crosshair, gunshot, bullet
hole with radiating cracks, the mark punching out of the hole, wordmark wipe,
then the tagline.

To capture it:
1. Open in Chrome, set the window to **1920×1080**
2. Screen-record, press **R** to replay
3. Trim to 0.0–2.6s

It uses the real logo geometry from the codebase, so it cannot drift from the
site. For a proper render pass it to a tool like Remotion and rebuild the
timeline from the CSS keyframes — timings are all in the `<style>` block.

## Brief for a video AI

> Dark gaming brand. Pure black background. One accent colour, acid lime
> #9BD800, used sparingly — a rule, a tick, one highlighted word. Heavy
> condensed uppercase type. Hard cuts, no crossfades. Sub-bass and a single
> impact hit rather than a music bed. The logo is a white chamfered key with
> "GG" in near-black and a lime bar at its foot. Restrained, not RGB-gamer.
