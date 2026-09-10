import { chromium } from 'playwright'
const b = await chromium.launch()
for (const [label, url] of [['tool', 'http://localhost:4175/tools/merge-pdf'], ['post', 'http://localhost:4175/blog/merge/reorder-pdf-pages'], ['home', 'http://localhost:4175/']]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } })
  const cdp = await p.context().newCDPSession(p)
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 120, downloadThroughput: 1.6e6/8, uploadThroughput: 750e3/8 })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  const seen = []
  const nav = p.goto(url, { waitUntil: 'load' }).catch(() => {})
  for (let i = 0; i < 14; i++) {
    const state = await p.evaluate(() => {
      const m = document.querySelector('main')
      return { loading: !!document.querySelector('main .badge-acid'), h1: document.querySelector('main h1')?.textContent?.slice(0, 22) || null, chars: (m?.innerText || '').length }
    }).catch(() => null)
    if (state) seen.push(`${state.loading ? 'LOADING' : 'content'}:${state.chars}`)
    await new Promise(r => setTimeout(r, 120))
  }
  await nav
  const bad = seen.filter(s => s.startsWith('LOADING')).length
  console.log(`${bad ? 'FAIL' : 'PASS'}  ${label.padEnd(5)} ${bad} loading frames | ${seen.slice(0, 9).join(' ')}`)
  await p.close()
}
await b.close()
