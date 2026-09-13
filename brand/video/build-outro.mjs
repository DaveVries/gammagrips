import { readFileSync, writeFileSync } from "node:fs";

const audio = readFileSync("brand/video/audio-outro.js", "utf8").replace(/^export /gm, "");
const s = readFileSync("src/lib/logo-mark.ts", "utf8");
const gp = (k) => s.match(new RegExp(`export const ${k} = "([^"]+)"`))[1];
const gn = (k) => parseFloat(s.match(new RegExp(`export const ${k} = ([-0-9.]+)`))[1]);
const logo = "data:image/png;base64," + readFileSync("brand/kit/mark-2048-transparent.png").toString("base64");

/* An outro is not a short intro. It has to survive being pasted onto the end
   of anything, so: no narrative, no debris, one hit, and a held end card the
   editor can cut at any frame. Everything lands inside 1.6s; the rest is hold. */

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>GammaGrips — outro</title>
<style>
  :root{--lime:#9bd800}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%;background:#000;overflow:hidden;
    font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
  .frame{position:absolute;left:50%;top:50%;width:1920px;height:1080px;background:#000;
    overflow:hidden;transform-origin:center}

  /* One slow push. No shake — an outro that judders looks like a mistake at
     the end of someone else's edit. */
  @keyframes push{0%{scale:1.035}100%{scale:1}}
  .cam{position:absolute;inset:0;animation:push 3.2s cubic-bezier(.2,.7,.25,1) both}

  /* Hex field, up front and quiet. */
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  #hex{position:absolute;inset:-4%;z-index:1;opacity:0;
    animation:fadeIn .7s ease-out .30s both;
    mask-image:radial-gradient(58% 54% at 50% 50%,#000 6%,transparent 74%);
    -webkit-mask-image:radial-gradient(58% 54% at 50% 50%,#000 6%,transparent 74%)}
  @keyframes hexDrift{0%{transform:translate(0,0)}100%{transform:translate(-104px,-60px)}}
  #hex svg{width:100%;height:100%;animation:hexDrift 30s linear infinite}

  /* A single light streak that wipes through as the logo lands. */
  @keyframes streak{0%{opacity:0;transform:translateX(-70%) skewX(-18deg)}
    18%{opacity:.9}100%{opacity:0;transform:translateX(70%) skewX(-18deg)}}
  #streak{position:absolute;left:0;top:0;width:46%;height:100%;z-index:12;pointer-events:none;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),rgba(155,216,0,.30),rgba(255,255,255,.16),transparent);
    filter:blur(14px);animation:streak .55s cubic-bezier(.3,.8,.3,1) .30s both}

  /* Bloom behind the lockup at the moment of the hit. */
  @keyframes bloom{0%{opacity:0;scale:.4}22%{opacity:1}100%{opacity:.34;scale:1}}
  #bloom{position:absolute;left:50%;top:calc(50% - 20px);translate:-50% -50%;
    width:1100px;height:620px;z-index:2;pointer-events:none;
    background:radial-gradient(closest-side,rgba(155,216,0,.30),rgba(155,216,0,.07) 46%,transparent 72%);
    filter:blur(46px);animation:bloom 1.4s cubic-bezier(.2,.8,.3,1) .40s both}

  /* Logo: one confident snap, no bounce. */
  @keyframes markIn{0%{opacity:0;scale:1.55;filter:blur(18px)}
    60%{opacity:1;filter:blur(0)}100%{opacity:1;scale:1;filter:blur(0)}}
  #mark{position:absolute;left:50%;top:calc(50% - 122px);translate:-50% -50%;z-index:15;width:150px;
    animation:markIn .42s cubic-bezier(.16,1,.3,1) .40s both;
    filter:drop-shadow(0 0 70px rgba(155,216,0,.45))}

  /* Wordmark wipes out from behind the mark. */
  @keyframes wipe{0%{clip-path:inset(0 100% 0 0);opacity:0}8%{opacity:1}100%{clip-path:inset(0 0 0 0);opacity:1}}
  #word{position:absolute;left:50%;top:calc(50% + 34px);translate:-50% -50%;z-index:15;
    animation:wipe .42s cubic-bezier(.16,1,.3,1) .62s both}

  @keyframes rule{0%{width:0;opacity:0}12%{opacity:1}100%{width:560px;opacity:1}}
  #rule{position:absolute;left:50%;top:calc(50% + 76px);translate:-50% 0;height:4px;background:var(--lime);
    z-index:15;box-shadow:0 0 24px rgba(155,216,0,.8);animation:rule .34s cubic-bezier(.16,1,.3,1) .86s both}

  @keyframes tagIn{0%{opacity:0;letter-spacing:.42em;filter:blur(8px)}
    100%{opacity:1;letter-spacing:.17em;filter:blur(0)}}
  #tag{position:absolute;left:50%;top:calc(50% + 106px);translate:-50% 0;z-index:16;color:#fff;
    font-size:42px;font-weight:800;white-space:nowrap;
    animation:tagIn .44s cubic-bezier(.16,1,.3,1) 1.00s both}
  #tag b{color:var(--lime)}

  /* The URL. Quiet, last, and it stays. */
  @keyframes urlIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
  #url{position:absolute;left:50%;top:calc(50% + 182px);translate:-50% 0;z-index:16;
    color:#c3ccd9;font-size:30px;font-weight:700;letter-spacing:.28em;white-space:nowrap;
    animation:urlIn .5s cubic-bezier(.16,1,.3,1) 1.28s both}

  #vig{position:absolute;inset:0;z-index:20;pointer-events:none;
    background:radial-gradient(130% 96% at 50% 48%,transparent 36%,rgba(0,0,0,.93) 100%)}
  @keyframes grain{to{translate:-6% -6%}}
  #grain{position:absolute;inset:-15%;z-index:21;pointer-events:none;opacity:.045;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
    animation:grain .26s steps(3) infinite}

  #gate{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:#000;cursor:pointer}
  #gate b{color:var(--lime);font-size:14px;letter-spacing:.2em;font-weight:800}
  #gate p{color:#6b7684;font-size:12px;margin-top:9px;text-align:center}
</style></head><body>

<div class="frame" id="frame"><div class="cam">
  <div id="hex"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2200 1300" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="h1" width="104" height="60" patternUnits="userSpaceOnUse">
        <path d="M26 1 L78 1 L104 30 L78 59 L26 59 L0 30 Z" fill="none" stroke="#9bd800" stroke-width="1.4" opacity=".13"/>
      </pattern>
      <pattern id="h2" width="104" height="60" patternUnits="userSpaceOnUse" patternTransform="translate(52 30)">
        <path d="M26 1 L78 1 L104 30 L78 59 L26 59 L0 30 Z" fill="none" stroke="#9bd800" stroke-width="1.4" opacity=".08"/>
      </pattern>
    </defs>
    <rect width="2200" height="1300" fill="url(#h1)"/>
    <rect width="2200" height="1300" fill="url(#h2)"/>
  </svg></div>

  <div id="bloom"></div>
  <img id="mark" src="${logo}" alt="GammaGrips"/>

  <svg id="word" width="700" height="68" viewBox="${gp("WORDMARK_VIEWBOX")}">
    <g transform="translate(${gn("WORDMARK_X")} ${gn("CAP_HEIGHT")})">
      <path d="${gp("WORDMARK_GAMMA")}" fill="#fff"/>
      <path d="${gp("WORDMARK_GRIPS")}" fill="#9bd800"/>
    </g>
  </svg>

  <div id="rule"></div>
  <div id="tag">GET A <b>GRIP</b>.</div>
  <div id="url">GAMMAGRIPS.COM</div>
  <div id="streak"></div>
</div>
  <div id="vig"></div>
  <div id="grain"></div>
</div>

<div id="gate"><div><b>CLICK TO PLAY WITH SOUND</b><p>outro · everything lands by 1.7s, then holds</p></div></div>

<script type="module">
${audio}
const frame = document.getElementById('frame');
const fit = () => { const s = Math.min(innerWidth/1920, innerHeight/1080);
  frame.style.transform = 'translate(-50%,-50%) scale('+s+')'; };
addEventListener('resize', fit); fit();
window.__audio = { renderInto, cues, useContext };
document.getElementById('gate').addEventListener('click', e => {
  e.currentTarget.remove();
  document.querySelectorAll('*').forEach(el =>
    (el.getAnimations?.() ?? []).forEach(a => { a.cancel(); a.play(); }));
  unlock(); cues();
}, { once:true });
addEventListener('keydown', e => { if (e.key.toLowerCase()==='r') location.reload(); });
</script>
</body></html>`;

writeFileSync("brand/video/outro.html", html);
console.log("outro.html", (html.length / 1024).toFixed(0) + "KB");
