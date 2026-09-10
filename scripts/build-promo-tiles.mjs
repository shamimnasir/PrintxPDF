// Chrome Web Store promotional tiles, rendered from the site's own brand tokens.
//   node scripts/build-promo-tiles.mjs
// Store rules these follow: no screenshots inside a tile, no text under 18px, no browser
// chrome, no other company's marks, the full canvas filled edge to edge.
import { chromium } from 'playwright'
import path from 'node:path'

const OUT = path.resolve(import.meta.dirname, '../extension/store-assets')
const ACCENT = '#2b5bff'
const INK = '#0f172a'

/** @param {{w:number,h:number,markSize:number,wordmark:number,line:number,gap:number,pad:number,stack:boolean}} s */
const page = (s) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
<style>
  *{ margin:0; padding:0; box-sizing:border-box }
  html,body{ width:${s.w}px; height:${s.h}px; overflow:hidden }
  body{
    font-family:'Inter',system-ui,sans-serif; background:${INK};
    display:flex; align-items:center; justify-content:${s.stack ? 'center' : 'flex-start'};
    padding:${s.pad}px; position:relative;
  }
  /* a soft brand wash so the tile is not a flat rectangle */
  body::before{
    content:''; position:absolute; inset:0;
    background:
      radial-gradient(120% 90% at 100% 0%, ${ACCENT}55 0%, transparent 60%),
      radial-gradient(90% 80% at 0% 100%, ${ACCENT}22 0%, transparent 55%);
  }
  .inner{ position:relative; display:flex; flex-direction:${s.stack ? 'column' : 'row'};
    align-items:${s.stack ? 'flex-start' : 'center'}; gap:${s.gap}px; width:100% }
  .brand{ display:flex; align-items:center; gap:${Math.round(s.markSize * 0.34)}px }
  .mark{
    width:${s.markSize}px; height:${s.markSize}px; border-radius:${Math.round(s.markSize * 0.26)}px;
    background:${ACCENT}; color:#fff; display:grid; place-items:center;
    font-weight:900; font-size:${Math.round(s.markSize * 0.55)}px; letter-spacing:-0.02em;
    box-shadow:0 ${Math.round(s.markSize * 0.14)}px ${Math.round(s.markSize * 0.4)}px -${Math.round(s.markSize * 0.12)}px ${ACCENT}cc;
  }
  .word{ font-size:${s.wordmark}px; font-weight:800; color:#fff; letter-spacing:-0.03em; white-space:nowrap }
  .word .x{ color:${ACCENT} }
  .copy{ display:flex; flex-direction:column; gap:${Math.round(s.line * 0.45)}px; min-width:0 }
  .line{ font-size:${s.line}px; font-weight:600; color:#fff; line-height:1.25; letter-spacing:-0.01em }
  .sub{ font-size:${Math.round(s.line * 0.72)}px; font-weight:400; color:#ffffffb0; line-height:1.35 }
</style></head><body><div class="inner">
  <div class="brand"><div class="mark">P</div><div class="word">Print<span class="x">x</span>PDF</div></div>
  <div class="copy">
    <div class="line">Print any article<br>without the clutter</div>
    <div class="sub">Ads, menus and comments removed. Print it or save a clean PDF.</div>
  </div>
</div></body></html>`

const TILES = [
  { file: 'promo-small-440x280.png', w: 440, h: 280, markSize: 44, wordmark: 30, line: 22, gap: 22, pad: 32, stack: true },
  { file: 'promo-marquee-1400x560.png', w: 1400, h: 560, markSize: 104, wordmark: 68, line: 46, gap: 64, pad: 80, stack: false },
]

const browser = await chromium.launch()
for (const t of TILES) {
  const p = await browser.newPage({ viewport: { width: t.w, height: t.h }, deviceScaleFactor: 1 })
  await p.setContent(page(t), { waitUntil: 'load' })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(400)
  await p.screenshot({ path: path.join(OUT, t.file) })
  console.log(`${t.file}  ${t.w}x${t.h}`)
  await p.close()
}
await browser.close()
