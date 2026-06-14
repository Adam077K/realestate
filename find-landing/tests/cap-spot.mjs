import { chromium } from 'playwright'
import { resolve } from 'path'
const QA = resolve(process.cwd(), 'qa-screens')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await chromium.launch({ headless: true })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'he-IL' })
const p = await ctx.newPage()
await p.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 45000 })
await sleep(1500)
for (const f of [1.0, 1.3, 1.6, 2.0]) {
  await p.evaluate((y) => window.scrollTo(0, Math.round(window.innerHeight * y)), f)
  await sleep(700)
  await p.screenshot({ path: resolve(QA, `spot-${String(f).replace('.', '_')}.png`) })
}
// pillars
await p.evaluate(() => document.getElementById('services')?.scrollIntoView({ block: 'center' }))
await sleep(600)
await p.screenshot({ path: resolve(QA, 'spot-pillars.png') })
await b.close()
console.log('done')
