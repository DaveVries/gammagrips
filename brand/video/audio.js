/* Cinematic sound, synthesised. No sample files: everything here is built from
 * oscillators and noise, so the whole sting stays in one HTML file with
 * nothing to license or host.
 *
 * The thing that makes a hit sound expensive is not loudness, it is the tail —
 * a dry impulse reads as a click, the same impulse through a long decaying
 * reverb reads as a room. So there is one convolution reverb here and almost
 * everything is sent through it.
 */
let ctx, verb, verbGain, master;

/** Swap in an OfflineAudioContext so the exact same cue list can be rendered
 *  to a file instead of played. Everything below reads `ctx` through AC(), so
 *  this is the only seam needed. */
export function useContext(offline) {
  ctx = offline; verb = verbGain = master = undefined;
  buildGraph();
  return ctx;
}

function buildGraph() {
  master = ctx.createGain();
  master.gain.value = 0.75;
  /* Turning the master down did not stop it hitting 0 dBFS — the shot, the
     impact and the reverb tail sum. A limiter on the bus catches the peaks
     without flattening everything below them. */
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.18;
  master.connect(limiter).connect(ctx.destination);

  // Impulse response: exponentially decaying noise. Cheap, and indistinguishable
  // from a sampled hall at this length.
  const secs = 3.4, len = Math.floor(ctx.sampleRate * secs);
  const imp = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = imp.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
  }
  verb = ctx.createConvolver();
  verb.buffer = imp;
  verbGain = ctx.createGain();
  verbGain.gain.value = 0.55;
  verb.connect(verbGain).connect(master);
}

const AC = () => {
  if (ctx) { if (!master) buildGraph(); return ctx; }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  buildGraph();
  return ctx;
};

function noise(seconds = 1) {
  const ac = AC();
  const b = ac.createBuffer(1, Math.floor(ac.sampleRate * seconds), ac.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

/** Route a source dry to master and wet to the reverb. */
function send(node, dry = 1, wet = 0.5) {
  const ac = AC();
  const d = ac.createGain(); d.gain.value = dry; node.connect(d).connect(master);
  const w = ac.createGain(); w.gain.value = wet; node.connect(w).connect(verb);
}

const env = (g, t, peak, a, dec) => {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
};

/** Low swell that pulls you in before the shot. Cinematic trailers live on this. */
export function swell(at = 0, dur = 1.2, gain = 0.3) {
  const ac = AC(); const t = ac.currentTime + at;
  const n = ac.createBufferSource(); n.buffer = noise(dur + 0.4);
  const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 2.2;
  bp.frequency.setValueAtTime(90, t);
  bp.frequency.exponentialRampToValueAtTime(1400, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.92);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
  n.connect(bp).connect(g); send(g, 1, 0.7);
  n.start(t); n.stop(t + dur + 0.3);
}

/** Rifle shot: snap, body, and a long sub that decays into the reverb. */
export function gunshot(at = 0, gain = 1) {
  const ac = AC(); const t = ac.currentTime + at;

  const crack = ac.createBufferSource(); crack.buffer = noise(0.35);
  const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2600;
  const cg = ac.createGain(); env(cg, t, 1.15 * gain, 0.0008, 0.05);
  crack.connect(hp).connect(cg); send(cg, 1, 0.35);
  crack.start(t); crack.stop(t + 0.4);

  const body = ac.createBufferSource(); body.buffer = noise(1.2);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.setValueAtTime(6000, t);
  lp.frequency.exponentialRampToValueAtTime(140, t + 0.42);
  const bg = ac.createGain(); env(bg, t, 0.95 * gain, 0.003, 0.5);
  body.connect(lp).connect(bg); send(bg, 1, 0.85);
  body.start(t); body.stop(t + 1.4);

  const sub = ac.createOscillator(); sub.type = "sine";
  sub.frequency.setValueAtTime(140, t);
  sub.frequency.exponentialRampToValueAtTime(26, t + 0.5);
  const sg = ac.createGain(); env(sg, t, 1.0 * gain, 0.005, 0.9);
  sub.connect(sg); send(sg, 1, 0.3);
  sub.start(t); sub.stop(t + 1.5);
}

/** Glass, but with a body under it so it is not just tinkling. */
export function glass(at = 0, gain = 0.55) {
  const ac = AC(); const t0 = ac.currentTime + at;
  for (let i = 0; i < 34; i++) {
    const t = t0 + Math.pow(Math.random(), 1.6) * 0.75;
    const o = ac.createOscillator(); o.type = "triangle";
    o.frequency.value = 1800 + Math.random() * 6000;
    const g = ac.createGain();
    env(g, t, (0.05 + Math.random() * 0.14) * gain, 0.001, 0.05 + Math.random() * 0.16);
    o.connect(g); send(g, 0.8, 0.9);
    o.start(t); o.stop(t + 0.3);
  }
  const rum = ac.createBufferSource(); rum.buffer = noise(0.9);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
  const rg = ac.createGain(); env(rg, t0, 0.34 * gain, 0.01, 0.7);
  rum.connect(lp).connect(rg); send(rg, 1, 0.8);
  rum.start(t0); rum.stop(t0 + 1.1);
}

/** Braam. The trailer horn — detuned saws through a slow filter, into the hall. */
export function braam(at = 0, dur = 1.6, gain = 0.34) {
  const ac = AC(); const t = ac.currentTime + at;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.09);
  g.gain.setValueAtTime(gain, t + dur * 0.55);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.setValueAtTime(220, t);
  lp.frequency.exponentialRampToValueAtTime(1500, t + dur * 0.5);
  lp.frequency.exponentialRampToValueAtTime(400, t + dur);
  [55, 55.4, 82.5, 110, 110.7].forEach((f, i) => {
    const o = ac.createOscillator();
    o.type = i % 2 ? "sawtooth" : "square";
    o.frequency.value = f;
    o.detune.value = (Math.random() - 0.5) * 14;
    const og = ac.createGain(); og.gain.value = i === 0 ? 0.5 : 0.22;
    o.connect(og).connect(lp);
    o.start(t); o.stop(t + dur + 0.2);
  });
  lp.connect(g); send(g, 1, 0.95);
}

/** Whoosh for the grips flying past camera. */
export function whoosh(at = 0, gain = 0.34, dur = 0.5) {
  const ac = AC(); const t = ac.currentTime + at;
  const n = ac.createBufferSource(); n.buffer = noise(dur + 0.4);
  const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(260, t);
  bp.frequency.exponentialRampToValueAtTime(3400, t + dur * 0.8);
  bp.frequency.exponentialRampToValueAtTime(700, t + dur);
  const g = ac.createGain(); env(g, t, gain, 0.07, dur);
  n.connect(bp).connect(g); send(g, 1, 0.7);
  n.start(t); n.stop(t + dur + 0.4);
}

/** Final logo hit — the one that should shake the room. */
export function impact(at = 0, gain = 1) {
  const ac = AC(); const t = ac.currentTime + at;
  const sub = ac.createOscillator(); sub.type = "sine";
  sub.frequency.setValueAtTime(180, t);
  sub.frequency.exponentialRampToValueAtTime(24, t + 0.8);
  const sg = ac.createGain(); env(sg, t, gain, 0.004, 1.5);
  sub.connect(sg); send(sg, 1, 0.5);
  sub.start(t); sub.stop(t + 2.0);

  const n = ac.createBufferSource(); n.buffer = noise(0.7);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100;
  const ng = ac.createGain(); env(ng, t, 0.5 * gain, 0.002, 0.35);
  n.connect(lp).connect(ng); send(ng, 1, 0.9);
  n.start(t); n.stop(t + 0.8);
}

export function unlock() { AC().resume(); }


/* ---------------------------------------------------------------------------
   The cue list. One definition, used by both live playback and the offline
   render, so the mix in the mp4 is the mix you hear in the browser.
   -------------------------------------------------------------------------*/
export function cues() {
  swell(0.00, 0.90, 0.30);
  gunshot(0.90, 1.00);
  glass(0.96, 0.60);
  whoosh(1.45, 0.30, 0.55);
  whoosh(1.85, 0.24, 0.45);
  braam(2.30, 1.70, 0.32);
  impact(2.55, 1.00);
  impact(3.34, 0.55);
}

export async function renderInto(offline) {
  useContext(offline);
  cues();
}
