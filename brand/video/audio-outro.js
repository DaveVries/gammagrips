/* Outro mix. Fewer elements than the intro on purpose — an outro that is busy
 * is an outro editors cut off. Three cues: a short reverse swell that pulls
 * into the logo, one deep impact with a long tail, and a high shimmer as the
 * URL settles.
 */
let ctx, verb, master, limiter;

export function useContext(offline) { ctx = offline; verb = master = limiter = undefined; build(); return ctx; }

function build() {
  master = ctx.createGain();
  master.gain.value = 0.8;
  limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20;
  limiter.attack.value = 0.002; limiter.release.value = 0.2;
  master.connect(limiter).connect(ctx.destination);

  // Long hall. The tail is what makes a two-second sting feel expensive.
  const secs = 3.8, len = Math.floor(ctx.sampleRate * secs);
  const imp = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = imp.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
  }
  verb = ctx.createConvolver(); verb.buffer = imp;
  const vg = ctx.createGain(); vg.gain.value = 0.6;
  verb.connect(vg).connect(master);
}

const AC = () => { if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); build(); } else if (!master) build(); return ctx; };
const noise = (s) => { const ac = AC(); const b = ac.createBuffer(1, Math.floor(ac.sampleRate * s), ac.sampleRate);
  const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
const send = (n, dry, wet) => { const ac = AC();
  const a = ac.createGain(); a.gain.value = dry; n.connect(a).connect(master);
  const w = ac.createGain(); w.gain.value = wet; n.connect(w).connect(verb); };
const env = (g, t, p, a, d) => { g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(p, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };

/** Reverse swell — noise rising into the hit. */
export function pull(at, dur = 0.42, gain = 0.34) {
  const ac = AC(); const t = ac.currentTime + at;
  const n = ac.createBufferSource(); n.buffer = noise(dur + 0.2);
  const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(160, t);
  bp.frequency.exponentialRampToValueAtTime(4200, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.95);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
  n.connect(bp).connect(g); send(g, 1, 0.5);
  n.start(t); n.stop(t + dur + 0.3);
}

/** The hit. Sub, body and a bright transient, all into the hall. */
export function hit(at, gain = 1) {
  const ac = AC(); const t = ac.currentTime + at;

  const sub = ac.createOscillator(); sub.type = "sine";
  sub.frequency.setValueAtTime(150, t);
  sub.frequency.exponentialRampToValueAtTime(28, t + 0.7);
  const sg = ac.createGain(); env(sg, t, gain, 0.004, 1.7);
  sub.connect(sg); send(sg, 1, 0.45);
  sub.start(t); sub.stop(t + 2.3);

  const body = ac.createBufferSource(); body.buffer = noise(0.8);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.setValueAtTime(3800, t);
  lp.frequency.exponentialRampToValueAtTime(220, t + 0.3);
  const bg = ac.createGain(); env(bg, t, 0.55 * gain, 0.002, 0.38);
  body.connect(lp).connect(bg); send(bg, 1, 0.95);
  body.start(t); body.stop(t + 1.0);

  const tick = ac.createBufferSource(); tick.buffer = noise(0.15);
  const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 4200;
  const tg = ac.createGain(); env(tg, t, 0.3 * gain, 0.001, 0.05);
  tick.connect(hp).connect(tg); send(tg, 1, 0.3);
  tick.start(t); tick.stop(t + 0.2);
}

/** Air for the type wipe. */
export function sweep(at, gain = 0.22, dur = 0.34) {
  const ac = AC(); const t = ac.currentTime + at;
  const n = ac.createBufferSource(); n.buffer = noise(dur + 0.3);
  const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(700, t);
  bp.frequency.exponentialRampToValueAtTime(3000, t + dur);
  const g = ac.createGain(); env(g, t, gain, 0.04, dur);
  n.connect(bp).connect(g); send(g, 1, 0.6);
  n.start(t); n.stop(t + dur + 0.3);
}

/** Small bright shimmer as the URL settles. */
export function shimmer(at, gain = 0.13) {
  const ac = AC(); const t0 = ac.currentTime + at;
  [1560, 2340, 3120].forEach((f, i) => {
    const o = ac.createOscillator(); o.type = "sine"; o.frequency.value = f;
    const g = ac.createGain(); env(g, t0 + i * 0.035, gain * (1 - i * 0.22), 0.006, 0.7);
    o.connect(g); send(g, 0.7, 1.0);
    o.start(t0 + i * 0.035); o.stop(t0 + 1.4);
  });
}

export function cues() {
  pull(0.06, 0.40, 0.34);
  hit(0.46, 1.0);
  sweep(0.66, 0.22, 0.34);
  shimmer(1.28, 0.13);
  hit(1.02, 0.34);
}

export async function renderInto(off) { useContext(off); cues(); }
export function unlock() { AC().resume(); }
