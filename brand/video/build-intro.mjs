import { readFileSync, writeFileSync } from "node:fs";

const { cracks, shards, smoke, fog, p } = JSON.parse(readFileSync("brand/video/_g2.json", "utf8"));
const audio = readFileSync("brand/video/audio.js", "utf8").replace(/^export /gm, "");
const [, , MW, MH] = p.mvb.split(" ").map(Number);

const crackPaths = cracks
  .map((d, i) => `<path d="${d}" class="crack" style="--i:${i}" stroke-width="${(3.2 - (i % 4) * 0.6).toFixed(1)}"/>`)
  .join("");

const shardEls = shards
  .map((s) => `<rect class="shard" width="${s.s.toFixed(1)}" height="${(s.s * 1.9).toFixed(1)}" style="--tx:${(Math.cos(s.a) * s.d).toFixed(0)}px;--ty:${(Math.sin(s.a) * s.d).toFixed(0)}px;--r:${s.r.toFixed(0)}deg;--d:${s.dl.toFixed(2)}s;--sp:${s.sp.toFixed(2)}s"/>`)
  .join("");

const smokeEls = smoke
  .map((s) => `<div class="puff" style="--x:${s.x.toFixed(0)}px;--y:${s.y.toFixed(0)}px;--r:${s.r.toFixed(0)}px;--dl:${s.dl.toFixed(2)}s;--dur:${s.dur.toFixed(2)}s;--dx:${s.dx.toFixed(0)}px;--dy:${s.dy.toFixed(0)}px;--o:${s.o.toFixed(2)}"></div>`)
  .join("");

const fogEls = fog
  .map((f) => `<div class="fog" style="--fy:${f.y.toFixed(0)}%;--fh:${f.h.toFixed(0)}px;--fdur:${f.dur.toFixed(1)}s;--fdl:${f.dl.toFixed(1)}s;--fo:${f.o.toFixed(2)}"></div>`)
  .join("");

const markScale = 0.463;
const markX = ((120 - MW * markScale) / 2).toFixed(2);
const markY = ((120 - 13.8 - MH * markScale) / 2 + 2.16).toFixed(2);

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>GammaGrips — intro</title>
<style>
  :root{--lime:#9bd800}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%;background:#000;overflow:hidden;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
  .frame{position:absolute;left:50%;top:50%;width:1920px;height:1080px;background:#000;overflow:hidden;transform-origin:center}

  /* Camera: a hard kick plus a slow settle, with a touch of roll. A pure
     translate shake reads as a glitch; adding rotation reads as a camera. */
  @keyframes cam{
    0%,100%{translate:0 0;rotate:0deg;scale:1}
    6%{translate:-34px 20px;rotate:-.7deg;scale:1.035}
    13%{translate:28px -22px;rotate:.5deg;scale:1.028}
    22%{translate:-19px -12px;rotate:-.3deg;scale:1.018}
    34%{translate:13px 14px;rotate:.18deg;scale:1.01}
    50%{translate:-6px 5px;rotate:-.07deg;scale:1.004}
    72%{translate:3px -2px;rotate:.03deg;scale:1.001}}
  .cam{position:absolute;inset:0;animation:cam 1.5s cubic-bezier(.19,1,.22,1) .40s both}

  /* Ambient fog drifting across the frame before and after the shot */
  @keyframes drift{0%{transform:translateX(-30%)}100%{transform:translateX(130%)}}
  .fog{position:absolute;left:0;top:var(--fy);width:60%;height:var(--fh);z-index:1;pointer-events:none;
    background:radial-gradient(closest-side,rgba(150,170,190,var(--fo)),transparent 72%);
    filter:blur(46px);animation:drift var(--fdur) linear var(--fdl) infinite}

  /* Muzzle smoke: expands, rises, dissipates */
  @keyframes puff{
    0%{opacity:0;transform:translate(0,0) scale(.2)}
    8%{opacity:var(--o)}
    100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(2.6)}}
  .puff{position:absolute;left:calc(50% + var(--x));top:calc(50% + var(--y));width:var(--r);height:var(--r);
    margin:calc(var(--r)/-2) 0 0 calc(var(--r)/-2);z-index:4;pointer-events:none;
    background:radial-gradient(closest-side,rgba(210,220,230,.55),rgba(160,175,190,.16) 55%,transparent 75%);
    filter:blur(26px);animation:puff var(--dur) cubic-bezier(.12,.7,.3,1) calc(.42s + var(--dl)) both}

  @keyframes flash{0%{opacity:0}1%{opacity:1}4%{opacity:.55}7%{opacity:.95}14%{opacity:.15}22%{opacity:0}100%{opacity:0}}
  #flash{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#fff 0%,#fff6c4 22%,rgba(255,200,80,.3) 45%,transparent 70%);
    opacity:0;mix-blend-mode:screen;z-index:9;animation:flash .5s linear .38s both}

  /* Chromatic split on impact — two coloured copies of the crack layer */
  @keyframes ab{0%{opacity:0}4%{opacity:.85}30%{opacity:.3}70%{opacity:0}100%{opacity:0}}
  .ab{position:absolute;inset:0;z-index:6;pointer-events:none;mix-blend-mode:screen;animation:ab 1s ease-out .40s both}
  .ab.r{translate:-7px 0;filter:blur(.6px)}
  .ab.b{translate:7px 0;filter:blur(.6px)}

  @keyframes ch{0%{opacity:0;scale:1.7}25%{opacity:1;scale:1}60%{opacity:1}72%{opacity:.15}100%{opacity:0;scale:.6}}
  #cross{position:absolute;left:50%;top:50%;translate:-50% -50%;animation:ch .42s steps(5,end) both;z-index:6}

  #impact{position:absolute;left:50%;top:50%;translate:-50% -50%;z-index:5}
  @keyframes hole{0%{scale:0}70%{scale:1.25}100%{scale:1}}
  .hole{animation:hole .22s cubic-bezier(.16,1,.3,1) .40s both;transform-origin:center}
  @keyframes crackIn{0%{stroke-dashoffset:900;opacity:0}10%{opacity:1}100%{stroke-dashoffset:0;opacity:1}}
  .crack{stroke:#fff;fill:none;stroke-linecap:round;stroke-dasharray:900;stroke-dashoffset:900;
    animation:crackIn .55s cubic-bezier(.16,1,.3,1) calc(.42s + var(--i)*.009s) both}
  @keyframes shardOut{0%{opacity:1;translate:0 0;rotate:0deg}
    12%{opacity:1}100%{opacity:0;translate:var(--tx) var(--ty);rotate:var(--r)}}
  .shard{fill:#e8f0ff;animation:shardOut var(--sp) cubic-bezier(.1,.75,.28,1) calc(.42s + var(--d)) both}

  /* Light spilling out of the hole */
  @keyframes rays{0%{opacity:0;scale:.2}30%{opacity:.85}100%{opacity:0;scale:2.2}}
  #rays{position:absolute;left:50%;top:50%;translate:-50% -50%;width:900px;height:900px;z-index:4;pointer-events:none;
    background:conic-gradient(from 0deg,transparent 0 6deg,rgba(155,216,0,.5) 7deg,transparent 8deg 22deg,
      rgba(155,216,0,.35) 23deg,transparent 24deg 44deg,rgba(255,255,255,.3) 45deg,transparent 46deg 70deg,
      rgba(155,216,0,.4) 71deg,transparent 72deg 120deg,rgba(155,216,0,.3) 121deg,transparent 122deg 200deg,
      rgba(255,255,255,.25) 201deg,transparent 202deg 260deg,rgba(155,216,0,.35) 261deg,transparent 262deg 360deg);
    filter:blur(3px);animation:rays 1.1s cubic-bezier(.2,.8,.3,1) .52s both}

  @keyframes markOut{0%{opacity:0;scale:.04;filter:blur(10px)}
    40%{opacity:1;scale:1.22;filter:blur(0)}62%{scale:.94}80%{scale:1.04}100%{opacity:1;scale:1}}
  #mark{position:absolute;left:50%;top:calc(50% - 34px);translate:-50% -50%;z-index:7;
    animation:markOut .66s cubic-bezier(.2,1.35,.35,1) .74s both;filter:drop-shadow(0 0 90px rgba(155,216,0,.55))}

  @keyframes wipe{0%{clip-path:inset(0 100% 0 0);opacity:0}10%{opacity:1}100%{clip-path:inset(0 0 0 0);opacity:1}}
  #word{position:absolute;left:50%;top:calc(50% + 96px);translate:-50% -50%;z-index:7;
    animation:wipe .48s cubic-bezier(.16,1,.3,1) 1.30s both}

  @keyframes rule{0%{width:0;opacity:0}10%{opacity:1}100%{width:580px;opacity:1}}
  #rule{position:absolute;left:50%;top:calc(50% + 142px);translate:-50% 0;height:6px;background:var(--lime);
    z-index:7;box-shadow:0 0 26px rgba(155,216,0,.8);animation:rule .4s cubic-bezier(.16,1,.3,1) 1.70s both}

  @keyframes slam{0%{opacity:0;scale:2.6;filter:blur(16px)}55%{opacity:1;scale:.95;filter:blur(0)}
    75%{scale:1.03}100%{opacity:1;scale:1}}
  #tag{position:absolute;left:50%;top:calc(50% + 182px);translate:-50% 0;z-index:8;color:#fff;
    font-size:54px;font-weight:800;letter-spacing:.16em;white-space:nowrap;
    animation:slam .44s cubic-bezier(.2,1.45,.3,1) 1.94s both}
  #tag b{color:var(--lime);text-shadow:0 0 34px rgba(155,216,0,.65)}

  #vig{position:absolute;inset:0;z-index:10;pointer-events:none;
    background:radial-gradient(125% 92% at 50% 50%,transparent 38%,rgba(0,0,0,.92) 100%)}
  @keyframes grain{to{translate:-6% -6%}}
  #grain{position:absolute;inset:-15%;z-index:11;pointer-events:none;opacity:.06;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
    animation:grain .28s steps(3) infinite}

  #gate{position:fixed;inset:0;z-index:50;display:grid;place-items:center;background:#000;cursor:pointer}
  #gate div{text-align:center;color:#fff}
  #gate b{color:var(--lime);font-size:15px;letter-spacing:.18em;font-weight:800}
  #gate p{color:#6b7684;font-size:13px;margin-top:10px}
  #hint{position:fixed;left:16px;bottom:14px;z-index:20;color:#5c6672;font-size:13px}
  #hint b{color:var(--lime)}
</style></head><body>

<div class="frame" id="frame">
  ${fogEls}
  <div class="cam">
    <svg id="cross" width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r="33" fill="none" stroke="#9bd800" stroke-width="2" opacity=".9"/>
      <circle cx="65" cy="65" r="3" fill="#9bd800"/>
      <path d="M65 6v28M65 96v28M6 65h28M96 65h28" stroke="#9bd800" stroke-width="3"/>
    </svg>

    <div id="rays"></div>

    <svg id="impact" width="1700" height="1150" viewBox="-850 -575 1700 1150">
      <g class="hole">
        <circle r="34" fill="#000"/>
        <circle r="34" fill="none" stroke="#fff" stroke-width="3.5" opacity=".9"/>
        <circle r="60" fill="none" stroke="#fff" stroke-width="1.2" opacity=".28"/>
      </g>
      <g opacity=".92">${crackPaths}</g>
      <g>${shardEls}</g>
    </svg>

    <div class="ab r"><svg width="1700" height="1150" viewBox="-850 -575 1700 1150" style="position:absolute;left:50%;top:50%;translate:-50% -50%">
      <g opacity=".5" style="stroke:#ff2b2b">${crackPaths}</g></svg></div>
    <div class="ab b"><svg width="1700" height="1150" viewBox="-850 -575 1700 1150" style="position:absolute;left:50%;top:50%;translate:-50% -50%">
      <g opacity=".5" style="stroke:#2b6bff">${crackPaths}</g></svg></div>

    ${smokeEls}

    <svg id="mark" width="180" height="180" viewBox="0 0 120 120">
      <defs><clipPath id="kc"><path d="M26.4 0H120V93.6L93.6 120H0V26.4Z"/></clipPath></defs>
      <path d="M26.4 0H120V93.6L93.6 120H0V26.4Z" fill="#fff"/>
      <g clip-path="url(#kc)">
        <rect x="0" y="106.2" width="93.6" height="13.8" fill="#000"/>
        <rect x="0" y="106.2" width="31.8" height="13.8" fill="#9bd800"/>
      </g>
      <g transform="translate(${markX} ${markY}) scale(${markScale})">
        <g transform="translate(${p.mx} ${p.my})"><path d="${p.m1}" fill="#000"/><path d="${p.m2}" fill="#000"/></g>
      </g>
    </svg>

    <svg id="word" width="790" height="77" viewBox="${p.wvb}">
      <g transform="translate(${p.wx} ${p.cap})">
        <path d="${p.gamma}" fill="#fff"/><path d="${p.grips}" fill="#9bd800"/>
      </g>
    </svg>

    <div id="rule"></div>
    <div id="tag">GET A <b>GRIP</b>.</div>
    <div id="flash"></div>
  </div>
  <div id="vig"></div>
  <div id="grain"></div>
</div>

<div id="gate"><div><b>CLICK TO PLAY WITH SOUND</b><p>browsers block audio until you interact · press R to replay</p></div></div>
<div id="hint">stage is 1920×1080 · record the window at that size · <b>R</b> replay</div>

<script type="module">
${audio}

const frame = document.getElementById('frame');
function fit(){ const s = Math.min(innerWidth/1920, innerHeight/1080);
  frame.style.transform = 'translate(-50%,-50%) scale('+s+')'; }
addEventListener('resize', fit); fit();

/* Timings mirror the CSS delays. Kept as one table so picture and sound
   cannot drift apart when either is retimed. */
function play(){
  unlock();
  gunshot(0.40, 1.0);
  glass(0.46, 0.55);
  casing(0.78, 0.22);
  riser(1.10, 0.72, 0.30);
  whoosh(1.30, 0.28);
  impact(1.94, 0.85);
}
document.getElementById('gate').addEventListener('click', e => {
  e.currentTarget.remove();
  document.querySelectorAll('*').forEach(el => {
    const a = el.getAnimations?.() ?? []; a.forEach(x => { x.cancel(); x.play(); });
  });
  play();
}, { once:true });
addEventListener('keydown', e => { if (e.key.toLowerCase()==='r') location.reload(); });
</script>
</body></html>`;

writeFileSync("brand/video/intro.html", html);
console.log("brand/video/intro.html", (html.length / 1024).toFixed(1) + "KB");
