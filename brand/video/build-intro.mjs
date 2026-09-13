import { readFileSync, writeFileSync } from "node:fs";

const cells = JSON.parse(readFileSync("brand/video/_shatter.json", "utf8"));
const imgs = JSON.parse(readFileSync("brand/video/_imgs.json", "utf8"));
const audio = readFileSync("brand/video/audio.js", "utf8").replace(/^export /gm, "");
const s = readFileSync("src/lib/logo-mark.ts", "utf8");
const gp = (k) => s.match(new RegExp(`export const ${k} = "([^"]+)"`))[1];
const gn = (k) => parseFloat(s.match(new RegExp(`export const ${k} = ([-0-9.]+)`))[1]);

/* Fragments. Filled with a faint gradient and a lit edge so they read as
   plates of glass catching light, not as outlines on black. */
const frags = cells
  .map(
    (c, i) =>
      `<path d="${c.d}" class="frag" style="--tx:${c.tx}px;--ty:${c.ty}px;--rot:${c.rot}deg;--rx:${c.rx}deg;--ry:${c.ry}deg;--dl:${c.delay}s;--dur:${c.dur}s;--f:${c.fill};--e:${c.edge}" />`,
  )
  .join("");

/* Six grips launching out of the hole on staggered arcs. */
const GRIPS = ["dark-matter", "volt", "ember", "vapor", "venom", "ice-froyo"];
const gripEls = GRIPS.map((g, i) => {
  /* Wide arc and a big spread in travel distance, so six grips read as a
     stream past the camera instead of a pile in the middle of frame. */
  const a = (i / GRIPS.length) * Math.PI * 2 - Math.PI / 2 + 0.5;
  const dist = 620 + (i % 3) * 240;
  return `<img class="grip" src="${imgs[g]}" alt="" style="--gx:${Math.round(Math.cos(a) * dist)}px;--gy:${Math.round(Math.sin(a) * dist * 0.5)}px;--gr:${[-22, 15, -9, 26, -17, 11][i]}deg;--gd:${(0.30 + i * 0.115).toFixed(3)}s"/>`;
}).join("");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>GammaGrips — intro</title>
<style>
  :root{--lime:#9bd800}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%;background:#000;overflow:hidden;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
  .frame{position:absolute;left:50%;top:50%;width:1920px;height:1080px;background:#000;overflow:hidden;
    transform-origin:center;perspective:1600px}

  /* Camera: a violent kick that settles, with roll and a push in. */
  @keyframes cam{
    0%{translate:0 0;rotate:0deg;scale:1.06}
    /* pre-shot: slow creep toward the target */
    26%{translate:0 0;rotate:0deg;scale:1.02}
    27%{translate:-46px 28px;rotate:-1.2deg;scale:1.09}
    31%{translate:38px -30px;rotate:.9deg;scale:1.07}
    36%{translate:-24px -15px;rotate:-.45deg;scale:1.045}
    44%{translate:15px 16px;rotate:.22deg;scale:1.03}
    58%{translate:-7px 6px;rotate:-.08deg;scale:1.016}
    76%{translate:3px -2px;rotate:.03deg;scale:1.008}
    100%{translate:0 0;rotate:0deg;scale:1}}
  .cam{position:absolute;inset:0;transform-style:preserve-3d;
    animation:cam 3.4s cubic-bezier(.2,.9,.25,1) both}

  /* Atmosphere before the shot: haze and slow-moving fog */
  @keyframes hazeIn{0%{opacity:0}20%{opacity:.5}100%{opacity:.5}}
  #haze{position:absolute;inset:-10%;z-index:1;pointer-events:none;opacity:0;
    background:radial-gradient(60% 50% at 50% 55%,rgba(120,140,160,.14),transparent 70%),
               radial-gradient(40% 60% at 22% 40%,rgba(90,110,130,.10),transparent 72%);
    filter:blur(30px);animation:hazeIn 1.2s ease-out both}
  @keyframes drift{0%{transform:translateX(-35%) scaleX(1)}100%{transform:translateX(135%) scaleX(1.3)}}
  .fog{position:absolute;left:0;width:70%;z-index:2;pointer-events:none;
    background:radial-gradient(closest-side,rgba(160,180,200,var(--fo)),transparent 74%);
    filter:blur(56px);animation:drift var(--fdur) linear var(--fdl) infinite}

  /* Muzzle flash: warm, asymmetric, two frames */
  @keyframes flash{0%{opacity:0}1%{opacity:1}3%{opacity:.4}5%{opacity:.95}11%{opacity:.12}20%{opacity:0}100%{opacity:0}}
  #flash{position:absolute;inset:0;z-index:14;opacity:0;mix-blend-mode:screen;pointer-events:none;
    background:radial-gradient(ellipse 40% 26% at 50% 50%,#fff 0%,#fff3c0 18%,rgba(255,190,70,.45) 38%,transparent 66%);
    animation:flash .55s linear .90s both}

  /* Impact shockwave ring */
  @keyframes shock{0%{opacity:0;scale:.05}8%{opacity:.9}100%{opacity:0;scale:5.5}}
  #shock{position:absolute;left:50%;top:50%;translate:-50% -50%;width:340px;height:340px;border-radius:50%;
    border:3px solid rgba(255,255,255,.75);z-index:9;pointer-events:none;filter:blur(1px);
    animation:shock .85s cubic-bezier(.1,.7,.3,1) .92s both}

  /* The glass plane, fragmented */
  #glass{position:absolute;inset:0;z-index:8;transform-style:preserve-3d}
  @keyframes fragOut{
    0%{opacity:0;translate:0 0;rotate:0deg;transform:none}
    /* held together for one frame after the hit, then let go */
    6%{opacity:1;transform:none}
    100%{opacity:0;transform:translate3d(var(--tx),var(--ty),420px) rotateZ(var(--rot)) rotateX(var(--rx)) rotateY(var(--ry))}}
  .frag{fill:rgba(190,215,240,var(--f));stroke:rgba(226,240,255,var(--e));stroke-width:1.1;
    transform-origin:center;transform-box:fill-box;
    animation:fragOut var(--dur) cubic-bezier(.15,.72,.3,1) calc(.92s + var(--dl)) both}

  /* The hole itself */
  @keyframes hole{0%{opacity:0;scale:0}55%{opacity:1;scale:1.3}100%{opacity:1;scale:1}}
  #hole{position:absolute;left:50%;top:50%;translate:-50% -50%;z-index:10;
    animation:hole .3s cubic-bezier(.16,1,.3,1) .92s both}

  /* Light pouring out of the hole */
  @keyframes glow{0%{opacity:0;scale:.15}22%{opacity:1}100%{opacity:0;scale:3.4}}
  #glow{position:absolute;left:50%;top:50%;translate:-50% -50%;width:700px;height:700px;z-index:5;pointer-events:none;
    background:radial-gradient(circle,rgba(155,216,0,.42) 0%,rgba(155,216,0,.10) 22%,transparent 52%);
    filter:blur(24px);animation:glow 1.5s cubic-bezier(.2,.8,.3,1) 1.0s both}

  /* THE PRODUCT — grips launch out of the hole toward camera */
  @keyframes gripOut{
    0%{opacity:0;transform:translate3d(0,0,-420px) scale(.04) rotate(0deg)}
    14%{opacity:1}
    55%{transform:translate3d(calc(var(--gx)*.46),calc(var(--gy)*.46),260px) scale(.82) rotate(calc(var(--gr)*.6))}
    100%{opacity:0;transform:translate3d(var(--gx),var(--gy),1150px) scale(1.9) rotate(var(--gr))}}
  .grip{position:absolute;left:50%;top:50%;width:620px;margin:-200px 0 0 -310px;z-index:11;
    filter:drop-shadow(0 30px 70px rgba(0,0,0,.95)) drop-shadow(0 0 40px rgba(155,216,0,.22));
    animation:gripOut 1.6s cubic-bezier(.3,.58,.35,1) calc(1.0s + var(--gd)) both}

  /* Logo lands last */
  @keyframes markIn{0%{opacity:0;scale:3.2;filter:blur(22px)}
    55%{opacity:1;scale:.94;filter:blur(0)}78%{scale:1.05}100%{opacity:1;scale:1}}
  #mark{position:absolute;left:50%;top:calc(50% - 78px);translate:-50% -50%;z-index:15;width:190px;
    animation:markIn .5s cubic-bezier(.2,1.5,.3,1) 2.55s both;
    filter:drop-shadow(0 0 100px rgba(155,216,0,.6))}

  @keyframes wipe{0%{clip-path:inset(0 100% 0 0);opacity:0}8%{opacity:1}100%{clip-path:inset(0 0 0 0);opacity:1}}
  #word{position:absolute;left:50%;top:calc(50% + 108px);translate:-50% -50%;z-index:15;
    animation:wipe .46s cubic-bezier(.16,1,.3,1) 2.86s both}

  @keyframes rule{0%{width:0;opacity:0}10%{opacity:1}100%{width:600px;opacity:1}}
  #rule{position:absolute;left:50%;top:calc(50% + 158px);translate:-50% 0;height:5px;background:var(--lime);
    z-index:15;box-shadow:0 0 30px rgba(155,216,0,.9);animation:rule .38s cubic-bezier(.16,1,.3,1) 3.14s both}

  @keyframes slam{0%{opacity:0;scale:2.2;filter:blur(14px);letter-spacing:.5em}
    58%{opacity:1;scale:.97;filter:blur(0);letter-spacing:.14em}100%{opacity:1;scale:1;letter-spacing:.16em}}
  #tag{position:absolute;left:50%;top:calc(50% + 194px);translate:-50% 0;z-index:16;color:#fff;
    font-size:52px;font-weight:800;white-space:nowrap;
    animation:slam .46s cubic-bezier(.2,1.4,.3,1) 3.34s both}
  #tag b{color:var(--lime);text-shadow:0 0 40px rgba(155,216,0,.7)}

  /* Hex field. Fades up under the lockup at the end so the last frame is not
     flat black. Two offset layers make a true honeycomb — one grid of hexes
     cannot tile without the second row shifted half a cell. */
  @keyframes hexIn{0%{opacity:0}100%{opacity:1}}
  #hex{position:absolute;inset:-4%;z-index:3;pointer-events:none;opacity:0;
    animation:hexIn 1.1s ease-out 2.45s both;
    mask-image:radial-gradient(62% 58% at 50% 50%,#000 12%,transparent 78%);
    -webkit-mask-image:radial-gradient(62% 58% at 50% 50%,#000 12%,transparent 78%)}
  @keyframes hexDrift{0%{transform:translate(0,0)}100%{transform:translate(-104px,-60px)}}
  #hex svg{width:100%;height:100%;animation:hexDrift 26s linear infinite}

  /* Green fire behind the wordmark.
     Three blurred lime blobs rising at different rates give the body; an SVG
     turbulence displacement on top gives the flicker. Blobs alone read as a
     lava lamp, turbulence alone reads as noise — together they read as fire. */
  @keyframes fireRise{
    0%{transform:translate(var(--fx),40px) scale(.7);opacity:0}
    18%{opacity:var(--fop)}
    72%{opacity:calc(var(--fop)*.7)}
    100%{transform:translate(calc(var(--fx)*-1),-70px) scale(1.35);opacity:0}}
  #fire{position:absolute;left:50%;top:calc(50% + 108px);translate:-50% -50%;
    width:1040px;height:300px;z-index:13;pointer-events:none;opacity:0;
    animation:hexIn .8s ease-out 2.70s both;
    mask-image:radial-gradient(64% 78% at 50% 55%,#000 8%,transparent 76%);
    -webkit-mask-image:radial-gradient(64% 78% at 50% 55%,#000 8%,transparent 76%);
    filter:url(#flameWarp) blur(2px)}
  .flame{position:absolute;bottom:0;border-radius:50%;
    background:radial-gradient(closest-side,rgba(215,255,120,1),rgba(155,216,0,.8) 38%,rgba(80,150,0,.25) 62%,rgba(40,90,0,0) 80%);
    filter:blur(15px);mix-blend-mode:screen;
    animation:fireRise var(--fdurr) ease-in-out var(--fdl2) infinite}

  #vig{position:absolute;inset:0;z-index:20;pointer-events:none;
    background:radial-gradient(130% 95% at 50% 50%,transparent 34%,rgba(0,0,0,.94) 100%)}
  @keyframes grain{to{translate:-6% -6%}}
  #grain{position:absolute;inset:-15%;z-index:21;pointer-events:none;opacity:.055;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
    animation:grain .26s steps(3) infinite}

  #gate{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:#000;cursor:pointer}
  #gate b{color:var(--lime);font-size:15px;letter-spacing:.2em;font-weight:800}
  #gate p{color:#6b7684;font-size:13px;margin-top:10px;text-align:center}
  #hint{position:fixed;left:16px;bottom:14px;z-index:30;color:#4c5560;font-size:12px}
</style></head><body>

<div class="frame" id="frame">
  <div id="haze"></div>
  <div class="fog" style="--fo:.08;top:12%;height:260px;--fdur:22s;--fdl:0s"></div>
  <div class="fog" style="--fo:.06;top:52%;height:320px;--fdur:28s;--fdl:-9s"></div>
  <div class="fog" style="--fo:.05;top:74%;height:200px;--fdur:19s;--fdl:-14s"></div>

  <div class="cam">
    <div id="glow"></div>

    <div id="hex"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2200 1300" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="hexcell" width="104" height="60" patternUnits="userSpaceOnUse">
          <path d="M26 1 L78 1 L104 30 L78 59 L26 59 L0 30 Z" fill="none" stroke="#9bd800" stroke-width="1.4" opacity=".16"/>
        </pattern>
        <pattern id="hexcell2" width="104" height="60" patternUnits="userSpaceOnUse" patternTransform="translate(52 30)">
          <path d="M26 1 L78 1 L104 30 L78 59 L26 59 L0 30 Z" fill="none" stroke="#9bd800" stroke-width="1.4" opacity=".10"/>
        </pattern>
      </defs>
      <rect width="2200" height="1300" fill="url(#hexcell)"/>
      <rect width="2200" height="1300" fill="url(#hexcell2)"/>
    </svg></div>

    <svg width="0" height="0" style="position:absolute">
      <filter id="flameWarp">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="9" result="n">
          <animate attributeName="baseFrequency" dur="7s" values="0.012 0.05;0.02 0.075;0.012 0.05" repeatCount="indefinite"/>
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>

    <div id="fire">
      <div class="flame" style="left:6%;width:270px;height:210px;--fx:-26px;--fop:.55;--fdurr:3.1s;--fdl2:0s"></div>
      <div class="flame" style="left:26%;width:330px;height:250px;--fx:20px;--fop:.62;--fdurr:2.6s;--fdl2:-.7s"></div>
      <div class="flame" style="left:48%;width:300px;height:230px;--fx:-16px;--fop:.58;--fdurr:3.4s;--fdl2:-1.4s"></div>
      <div class="flame" style="left:68%;width:280px;height:215px;--fx:24px;--fop:.5;--fdurr:2.9s;--fdl2:-2.1s"></div>
    </div>

    <svg id="glass" width="1920" height="1080" viewBox="0 0 1920 1080">${frags}</svg>

    <svg id="hole" width="300" height="300" viewBox="-150 -150 300 300">
      <defs>
        <radialGradient id="hg"><stop offset="0" stop-color="#000"/><stop offset=".75" stop-color="#000"/>
          <stop offset="1" stop-color="#1a1f26"/></radialGradient>
      </defs>
      <circle r="42" fill="url(#hg)"/>
      <circle r="42" fill="none" stroke="#dfe9f5" stroke-width="2.5" opacity=".8"/>
      <circle r="58" fill="none" stroke="#9bd800" stroke-width="1.4" opacity=".45"/>
      <circle r="76" fill="none" stroke="#dfe9f5" stroke-width="1" opacity=".18"/>
    </svg>

    <div id="shock"></div>
    ${gripEls}

    <img id="mark" src="${imgs.logo}" alt="GammaGrips"/>

    <svg id="word" width="820" height="80" viewBox="${gp("WORDMARK_VIEWBOX")}">
      <g transform="translate(${gn("WORDMARK_X")} ${gn("CAP_HEIGHT")})">
        <path d="${gp("WORDMARK_GAMMA")}" fill="#fff"/>
        <path d="${gp("WORDMARK_GRIPS")}" fill="#9bd800"/>
      </g>
    </svg>

    <div id="rule"></div>
    <div id="tag">GET A <b>GRIP</b>.</div>
    <div id="flash"></div>
  </div>

  <div id="vig"></div>
  <div id="grain"></div>
</div>

<div id="gate"><div><b>CLICK TO PLAY WITH SOUND</b><p>browsers block audio until you interact · R to replay</p></div></div>
<div id="hint">1920×1080 stage · ~4s · R to replay</div>

<script type="module">
${audio}

const frame = document.getElementById('frame');
const fit = () => { const s = Math.min(innerWidth/1920, innerHeight/1080);
  frame.style.transform = 'translate(-50%,-50%) scale('+s+')'; };
addEventListener('resize', fit); fit();

/* cues() is defined in the audio module so the offline renderer uses the very
   same timeline — the mp4 mix cannot drift from what plays here. */
function play(){ unlock(); cues(); }
window.__audio = { renderInto, cues, useContext };
document.getElementById('gate').addEventListener('click', e => {
  e.currentTarget.remove();
  document.querySelectorAll('*').forEach(el =>
    (el.getAnimations?.() ?? []).forEach(a => { a.cancel(); a.play(); }));
  play();
}, { once:true });
addEventListener('keydown', e => { if (e.key.toLowerCase()==='r') location.reload(); });
</script>
</body></html>`;

writeFileSync("brand/video/intro.html", html);
console.log("intro.html", (html.length / 1024 / 1024).toFixed(2) + "MB ·", cells.length, "fragments · 6 grips");
