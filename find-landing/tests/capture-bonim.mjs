import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { resolve } from 'path'

const QA = resolve(process.cwd(), 'qa-screens')
mkdirSync(QA, { recursive: true })
const URL = 'http://localhost:3000'
const VP = { width: 1440, height: 900 }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const report = { he: [], en: [], heDir: null, enDir: null, hasWordmark: null, errors: [], pageErrors: [] }

async function shotById(page, id, file) {
  const ok = await page.evaluate((id) => {
    const el = document.getElementById(id)
    if (!el) return false
    el.scrollIntoView({ behavior: 'auto', block: 'start' })
    return true
  }, id)
  await sleep(800)
  await page.screenshot({ path: resolve(QA, file) })
  return ok
}

const browser = await chromium.launch({ headless: true })
try {
  // ── HEBREW (default RTL) ──
  const he = await browser.newContext({ viewport: VP, deviceScaleFactor: 2, locale: 'he-IL' })
  const hp = await he.newPage()
  hp.on('console', (m) => { if (m.type() === 'error') report.errors.push(m.text()) })
  hp.on('pageerror', (e) => report.pageErrors.push(e.message))
  await hp.goto(URL, { waitUntil: 'networkidle', timeout: 45000 })
  await sleep(1800)
  report.heDir = await hp.evaluate(() => document.documentElement.dir)
  report.hasWordmark = await hp.evaluate(() => document.documentElement.innerHTML.includes('בונים עתיד'))
  await hp.screenshot({ path: resolve(QA, 'he-hero.png') }); report.he.push('he-hero')
  // wordmark mid-pin
  await hp.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight * 1.9))); await sleep(900)
  await hp.screenshot({ path: resolve(QA, 'he-wordmark.png') }); report.he.push('he-wordmark')
  for (const id of ['learn', 'founders', 'webinar', 'register']) {
    const ok = await shotById(hp, id, `he-${id}.png`); report.he.push(`he-${id}:${ok}`)
  }
  // pillars + testimonials by index (no fixed id) + footer
  await hp.evaluate(() => { const s = document.querySelectorAll('main section'); });
  await hp.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(1000)
  await hp.screenshot({ path: resolve(QA, 'he-footer.png') }); report.he.push('he-footer')
  await hp.screenshot({ path: resolve(QA, 'he-full.png'), fullPage: true }); report.he.push('he-full')
  await he.close()

  // ── ENGLISH (LTR) ──
  const en = await browser.newContext({ viewport: VP, deviceScaleFactor: 2, locale: 'en-US' })
  const ep = await en.newPage()
  ep.on('pageerror', (e) => report.pageErrors.push('EN:' + e.message))
  await ep.addInitScript(() => localStorage.setItem('bonim-lang', 'en'))
  await ep.goto(URL, { waitUntil: 'networkidle', timeout: 45000 })
  await sleep(1800)
  report.enDir = await ep.evaluate(() => document.documentElement.dir)
  await ep.screenshot({ path: resolve(QA, 'en-hero.png') }); report.en.push('en-hero')
  await shotById(ep, 'learn', 'en-learn.png'); report.en.push('en-learn')
  await ep.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(1000)
  await ep.screenshot({ path: resolve(QA, 'en-footer.png') }); report.en.push('en-footer')
  await en.close()
} catch (e) {
  report.pageErrors.push('FATAL:' + e.message)
} finally {
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
