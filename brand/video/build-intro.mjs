import { readFileSync, writeFileSync } from "node:fs";

const { cracks, shards, p } = JSON.parse(readFileSync("brand/video/_geom.json", "utf8"));
const [, , MW, MH] = p.mvb.split(" ").map(Number);

const crackPaths = cracks
  .map(
    (d, i) =>
      `<path d="${d}" stroke="#fff" stroke-width="${(2.6 - (i % 3) * 0.6).toFixed(1)}" fill="none" stroke-linecap="round" class="crack" style="--i:${i}"/>`,
  )
  .join("");

const shardEls = shards
  .map(
    (s) =>
      `<rect class="shard" width="${s.s.toFixed(1)}" height="${(s.s * 1.7).toFixed(1)}" x="-1" y="-1" style="--tx:${(Math.cos(s.a) * s.d).toFixed(0)}px;--ty:${(Math.sin(s.a) * s.d).toFixed(0)}px;--r:${s.r.toFixed(0)}deg;--d:${s.delay.toFixed(2)}s"/>`,
  )
  .join("");

const markScale = 0.463;
const markX = ((120 - MW * markScale) / 2).toFixed(2);
const markY = ((120 - 13.8 - MH * markScale) / 2 + 2.16).toFixed(2);

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>GammaGrips — intro / outro</title>
<style>
  :root { --lime:#9bd800; }
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%;background:#000;overflow:hidden;
    font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
  /* Fixed 1920x1080 stage, scaled to the window. Record at 1920x1080 and it is
     pixel-exact; anything else is a clean downscale. */
  .frame{position:absolute;left:50%;top:50%;width:1920px;height:1080px;background:#000;
    overflow:hidden;transform-origin:center center}

  @keyframes shake{
    0%,100%{translate:0 0} 10%{translate:-26px 14px} 20%{translate:22px -18px}
    30%{translate:-16px -10px} 40%{translate:12px 12px} 55%{translate:-7px 4px} 70%{translate:4px -3px}}
  .inner{position:absolute;inset:0;animation:shake .55s cubic-bezier(.22,1,.36,1) .40s both}

  @keyframes flash{0%{opacity:0}2%{opacity:1}9%{opacity:.25}16%{opacity:0}100%{opacity:0}}
  #flash{position:absolute;inset:0;background:#fff;opacity:0;mix-blend-mode:screen;
    animation:flash 1s linear .38s both;z-index:9}

  @keyframes ch{0%{opacity:0;scale:1.6}30%{opacity:1;scale:1}70%{opacity:1}85%{opacity:.2}100%{opacity:0;scale:.7}}
  #cross{position:absolute;left:50%;top:50%;translate:-50% -50%;
    animation:ch .42s steps(4,end) both;z-index:6}

  #impact{position:absolute;left:50%;top:50%;translate:-50% -50%;z-index:5}
  @keyframes hole{0%{scale:0}100%{scale:1}}
  .hole{animation:hole .18s cubic-bezier(.16,1,.3,1) .40s both;transform-origin:center}
  @keyframes crackIn{0%{stroke-dashoffset:600;opacity:0}12%{opacity:1}100%{stroke-dashoffset:0;opacity:1}}
  .crack{stroke-dasharray:600;stroke-dashoffset:600;
    animation:crackIn .5s cubic-bezier(.16,1,.3,1) calc(.42s + var(--i)*.012s) both}
  @keyframes shardOut{0%{opacity:1;translate:0 0;rotate:0deg}
    100%{opacity:0;translate:var(--tx) var(--ty);rotate:var(--r)}}
  .shard{fill:#fff;animation:shardOut .8s cubic-bezier(.12,.8,.3,1) calc(.42s + var(--d)) both}

  @keyframes markOut{0%{opacity:0;scale:.05}45%{opacity:1;scale:1.18}70%{scale:.95}100%{opacity:1;scale:1}}
  #mark{position:absolute;left:50%;top:calc(50% - 30px);translate:-50% -50%;z-index:7;
    animation:markOut .62s cubic-bezier(.2,1.3,.35,1) .78s both;
    filter:drop-shadow(0 0 70px rgba(155,216,0,.5))}

  @keyframes wipe{0%{clip-path:inset(0 100% 0 0);opacity:0}12%{opacity:1}100%{clip-path:inset(0 0 0 0);opacity:1}}
  #word{position:absolute;left:50%;top:calc(50% + 92px);translate:-50% -50%;z-index:7;
    animation:wipe .5s cubic-bezier(.16,1,.3,1) 1.32s both}

  @keyframes rule{0%{width:0;opacity:0}10%{opacity:1}100%{width:560px;opacity:1}}
  #rule{position:absolute;left:50%;top:calc(50% + 138px);translate:-50% 0;height:6px;
    background:var(--lime);z-index:7;animation:rule .42s cubic-bezier(.16,1,.3,1) 1.72s both}

  @keyframes slam{0%{opacity:0;scale:2.4;filter:blur(14px)}60%{opacity:1;scale:.96;filter:blur(0)}100%{opacity:1;scale:1}}
  #tag{position:absolute;left:50%;top:calc(50% + 178px);translate:-50% 0;z-index:8;
    color:#fff;font-size:54px;font-weight:800;letter-spacing:.16em;white-space:nowrap;
    animation:slam .42s cubic-bezier(.2,1.4,.3,1) 1.96s both}
  #tag b{color:var(--lime)}

  #vig{position:absolute;inset:0;z-index:10;pointer-events:none;
    background:radial-gradient(120% 90% at 50% 50%,transparent 42%,rgba(0,0,0,.9) 100%)}
  @keyframes grain{to{translate:-6% -6%}}
  #grain{position:absolute;inset:-15%;z-index:11;pointer-events:none;opacity:.055;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
    animation:grain .3s steps(3) infinite}
  #hint{position:fixed;left:16px;bottom:14px;z-index:20;color:#5c6672;font-size:13px}
  #hint b{color:var(--lime)}
</style></head><body>
<div class="frame" id="frame"><div class="inner">

  <svg id="cross" width="120" height="120" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="30" fill="none" stroke="#9bd800" stroke-width="2" opacity=".9"/>
    <path d="M60 8v26M60 86v26M8 60h26M86 60h26" stroke="#9bd800" stroke-width="3"/>
  </svg>

  <svg id="impact" width="1500" height="1050" viewBox="-750 -525 1500 1050">
    <g class="hole">
      <circle r="30" fill="#000"/>
      <circle r="30" fill="none" stroke="#fff" stroke-width="3" opacity=".85"/>
      <circle r="54" fill="none" stroke="#fff" stroke-width="1.2" opacity=".3"/>
    </g>
    <g opacity=".9">${crackPaths}</g>
    <g>${shardEls}</g>
  </svg>

  <svg id="mark" width="170" height="170" viewBox="0 0 120 120">
    <defs><clipPath id="kc"><path d="M26.4 0H120V93.6L93.6 120H0V26.4Z"/></clipPath></defs>
    <path d="M26.4 0H120V93.6L93.6 120H0V26.4Z" fill="#fff"/>
    <g clip-path="url(#kc)">
      <rect x="0" y="106.2" width="93.6" height="13.8" fill="#000"/>
      <rect x="0" y="106.2" width="31.8" height="13.8" fill="#9bd800"/>
    </g>
    <g transform="translate(${markX} ${markY}) scale(${markScale})">
      <g transform="translate(${p.mx} ${p.my})">
        <path d="${p.m1}" fill="#000"/><path d="${p.m2}" fill="#000"/>
      </g>
    </g>
  </svg>

  <svg id="word" width="760" height="74" viewBox="${p.wvb}">
    <g transform="translate(${p.wx} ${p.cap})">
      <path d="${p.gamma}" fill="#fff"/>
      <path d="${p.grips}" fill="#9bd800"/>
    </g>
  </svg>

  <div id="rule"></div>
  <div id="tag">GET A <b>GRIP</b>.</div>

  <div id="flash"></div>
  <div id="vig"></div>
  <div id="grain"></div>
</div></div>
<div id="hint">Press <b>R</b> to replay · stage is 1920×1080 · record the window at that size</div>
<script>
  const frame = document.getElementById('frame');
  function fit(){
    const s = Math.min(innerWidth/1920, innerHeight/1080);
    frame.style.transform = 'translate(-50%,-50%) scale('+s+')';
  }
  addEventListener('resize', fit); fit();
  addEventListener('keydown', e => { if (e.key.toLowerCase()==='r') location.reload(); });
</script>
</body></html>`;

writeFileSync("brand/video/intro.html", html);
console.log("brand/video/intro.html", (html.length / 1024).toFixed(1) + "KB");
