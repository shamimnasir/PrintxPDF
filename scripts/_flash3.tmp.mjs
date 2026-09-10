import { chromium } from 'playwright'
const b = await chromium.launch()
for (const [label, url] of [['home','/'],['tool','/tools/merge-pdf'],['post','/blog/merge/reorder-pdf-pages'],['pricing','/pricing'],['support','/support'],['cluster','/blog/merge']]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } })
  const cdp = await p.context().newCDPSession(p)
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1e6/8, uploadThroughput: 5e5/8 })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 })
  await p.addInitScript(() => {
    window.__log = []
    const tick = () => { const m = document.querySelector('main'); window.__log.push((m?.innerText || '').slice(0, 24).replace(/\s+/g, ' ')); requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  })
  await p.goto('http://localhost:4175' + url, { waitUntil: 'load' })
  await p.waitForTimeout(2500)
  const log = await p.evaluate(() => window.__log)
  const runs = []
  for (const t of log) if (!runs.length || runs[runs.length-1] !== t) runs.push(t)
  const flashed = runs.some((r) => r.startsWith('Loading'))
  console.log(`${flashed ? 'FLASH' : 'clean'}  ${label.padEnd(8)} states: ${runs.map(r => JSON.stringify(r.slice(0,18))).join(' -> ')}`)
  await p.close()
}
await b.close()
