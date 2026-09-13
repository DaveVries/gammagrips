/* Synthesised sound. No files: a gunshot is broadband noise shaped by a fast
   filter sweep plus a low-frequency body, and that is cheap to build. Real
   samples would need licensing and a CDN; this ships inside the HTML. */
let ctx;
const AC = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());

function noiseBuffer(seconds = 1) {
  const ac = AC();
  const len = Math.floor(ac.sampleRate * seconds);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function env(node, t0, peak, attack, decay) {
  const g = node.gain;
  g.setValueAtTime(0.0001, t0);
  g.exponentialRampToValueAtTime(peak, t0 + attack);
  g.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
}

/** Rifle crack: three layers — the snap, the body, the tail. */
export function gunshot(at = 0, gain = 1) {
  const ac = AC();
  const t = ac.currentTime + at;
  const out = ac.createGain();
  out.gain.value = gain;
  out.connect(ac.destination);

  // 1. the crack — high, extremely short
  const crack = ac.createBufferSource();
  crack.buffer = noiseBuffer(0.3);
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(2200, t);
  const cg = ac.createGain();
  env(cg, t, 1.0, 0.001, 0.055);
  crack.connect(hp).connect(cg).connect(out);
  crack.start(t);
  crack.stop(t + 0.35);

  // 2. the body — noise swept down, this is what reads as "big"
  const body = ac.createBufferSource();
  body.buffer = noiseBuffer(0.8);
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(5200, t);
  lp.frequency.exponentialRampToValueAtTime(190, t + 0.28);
  const bg = ac.createGain();
  env(bg, t, 0.85, 0.004, 0.3);
  body.connect(lp).connect(bg).connect(out);
  body.start(t);
  body.stop(t + 0.9);

  // 3. sub thump — felt more than heard
  const sub = ac.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(120, t);
  sub.frequency.exponentialRampToValueAtTime(32, t + 0.22);
  const sg = ac.createGain();
  env(sg, t, 0.9, 0.006, 0.4);
  sub.connect(sg).connect(out);
  sub.start(t);
  sub.stop(t + 0.6);
}

/** Glass breaking: many short high pings, scattered in time. */
export function glass(at = 0, gain = 0.5) {
  const ac = AC();
  const t0 = ac.currentTime + at;
  const out = ac.createGain();
  out.gain.value = gain;
  out.connect(ac.destination);
  for (let i = 0; i < 22; i++) {
    const t = t0 + Math.random() * 0.34;
    const o = ac.createOscillator();
    o.type = "triangle";
    o.frequency.value = 2400 + Math.random() * 5200;
    const g = ac.createGain();
    env(g, t, 0.12 + Math.random() * 0.16, 0.001, 0.04 + Math.random() * 0.09);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.2);
  }
}

/** Low riser into the logo reveal. */
export function riser(at = 0, dur = 0.7, gain = 0.32) {
  const ac = AC();
  const t = ac.currentTime + at;
  const o = ac.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(48, t);
  o.frequency.exponentialRampToValueAtTime(320, t + dur);
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(300, t);
  lp.frequency.exponentialRampToValueAtTime(3400, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.85);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.14);
  o.connect(lp).connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + dur + 0.2);
}

/** Deep hit under the logo landing. */
export function impact(at = 0, gain = 0.85) {
  const ac = AC();
  const t = ac.currentTime + at;
  const o = ac.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.5);
  const g = ac.createGain();
  env(g, t, gain, 0.004, 0.75);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + 1.0);

  const n = ac.createBufferSource();
  n.buffer = noiseBuffer(0.4);
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  const ng = ac.createGain();
  env(ng, t, 0.4, 0.002, 0.22);
  n.connect(lp).connect(ng).connect(ac.destination);
  n.start(t);
  n.stop(t + 0.5);
}

/** Air movement for the wordmark wipe. */
export function whoosh(at = 0, gain = 0.3) {
  const ac = AC();
  const t = ac.currentTime + at;
  const n = ac.createBufferSource();
  n.buffer = noiseBuffer(0.7);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.1;
  bp.frequency.setValueAtTime(320, t);
  bp.frequency.exponentialRampToValueAtTime(2600, t + 0.3);
  const g = ac.createGain();
  env(g, t, gain, 0.06, 0.32);
  n.connect(bp).connect(g).connect(ac.destination);
  n.start(t);
  n.stop(t + 0.75);
}

/** Shell casing hitting concrete, a beat after the shot. */
export function casing(at = 0, gain = 0.22) {
  const ac = AC();
  for (let i = 0; i < 3; i++) {
    const t = ac.currentTime + at + i * (0.09 + Math.random() * 0.05);
    const o = ac.createOscillator();
    o.type = "triangle";
    o.frequency.value = 3200 + Math.random() * 1800;
    const g = ac.createGain();
    env(g, t, gain * (1 - i * 0.3), 0.001, 0.07);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + 0.14);
  }
}

export function unlock() { AC().resume(); }
