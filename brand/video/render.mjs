/**
 * Renders intro.html to an mp4 — picture and sound, no screen recording.
 *
 * Picture: drive the page's own animation clocks rather than recording in real
 * time. Every CSS animation is paused and its currentTime set per frame, and
 * SMIL (the turbulence on the flames) is stepped with setCurrentTime, which
 * getAnimations() does not cover. That makes the render deterministic and
 * independent of how fast the machine happens to be.
 *
 * Sound: the same audio.js run through an OfflineAudioContext, so the mix is
 * computed rather than captured, then encoded to WAV and muxed by ffmpeg.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FPS = Number(process.env.FPS ?? 30);
const DURATION = Number(process.env.DUR ?? 4.6);
const W = 1920, H = 1080;
const SRC = process.env.SRC ?? "brand/video/intro.html";
const NAME = process.env.NAME ?? "gammagrips-intro";
const OUT = "brand/video/out";
const FRAMES = `${OUT}/frames`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });

const total = Math.round(DURATION * FPS);
console.log(`rendering ${total} frames @ ${FPS}fps · ${W}x${H}`);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [`--window-size=${W},${H}`, "--force-device-scale-factor=1",
         "--hide-scrollbars", "--disable-lcd-text", "--allow-file-access-from-files"],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto("file://" + resolve(SRC), { waitUntil: "networkidle0" });

// Drop the click gate and the hint, and lock the stage at 1:1.
await page.evaluate(() => {
  document.getElementById("gate")?.remove();
  document.getElementById("hint")?.remove();
  const f = document.getElementById("frame");
  f.style.transform = "translate(-50%,-50%) scale(1)";
  document.getAnimations().forEach((a) => a.pause());
});

for (let i = 0; i < total; i++) {
  const t = (i / FPS) * 1000;
  await page.evaluate((ms) => {
    document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; });
    // SMIL lives outside the Web Animations timeline
    document.querySelectorAll("svg").forEach((s) => {
      if (typeof s.setCurrentTime === "function") s.setCurrentTime(ms / 1000);
    });
  }, t);
  await page.screenshot({
    path: `${FRAMES}/f${String(i).padStart(5, "0")}.png`,
    captureBeyondViewport: false,
  });
  if (i % 30 === 0) process.stdout.write(`  ${i}/${total}\r`);
}
console.log(`  ${total}/${total} frames`);

// --- audio, computed offline -------------------------------------------------
console.log("rendering audio...");
const wav = await page.evaluate(async (dur) => {
  const OFF = new OfflineAudioContext(2, Math.ceil(44100 * dur), 44100);
  // Re-run the cue list against the offline context by swapping the module's
  // context for it. The module reads `ctx` lazily, so priming it is enough.
  const mod = window.__audio;
  await mod.renderInto(OFF);
  const buf = await OFF.startRendering();

  const n = buf.length, ch = 2;
  const out = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const s = (o, str) => [...str].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  s(0, "RIFF"); out.setUint32(4, 36 + n * ch * 2, true); s(8, "WAVEfmt ");
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, 44100, true); out.setUint32(28, 44100 * ch * 2, true);
  out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); s(36, "data");
  out.setUint32(40, n * ch * 2, true);
  const L = buf.getChannelData(0), R = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L;
  /* Normalise to -1 dBFS. A compressor shapes dynamics but cannot promise
     headroom; scaling the finished buffer can. */
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const norm = peak > 0 ? 0.891 / peak : 1;
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (const c of [L, R]) {
      const v = Math.max(-1, Math.min(1, c[i] * norm));
      out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2;
    }
  }
  return Array.from(new Uint8Array(out.buffer));
}, DURATION).catch((e) => { console.warn("  audio render failed:", e.message); return null; });

await browser.close();

if (wav) writeFileSync(`${OUT}/audio.wav`, Buffer.from(wav));

// --- mux ---------------------------------------------------------------------
const mp4 = `${OUT}/${NAME}.mp4`;
const args = ["-y", "-framerate", String(FPS), "-i", `${FRAMES}/f%05d.png`];
if (wav) args.push("-i", `${OUT}/audio.wav`);
args.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "slow",
          "-movflags", "+faststart");
if (wav) args.push("-c:a", "aac", "-b:a", "192k", "-shortest");
args.push(mp4);
execFileSync("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });

console.log("→", mp4);
