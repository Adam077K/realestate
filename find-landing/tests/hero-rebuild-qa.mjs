/**
 * Hero rebuild QA — captures hero at 8 scroll depths corresponding to
 * timeline progress p=0.0, 0.22, 0.46, 0.49, 0.51, 0.65, 0.85, 1.0.
 *
 * Pin = +=230% => at viewport 900px tall, that's 2070px of scroll space.
 * scrollY for progress p = Math.round(p * 2070).
 *
 * Viewport: 1440×900, DPR 2, dir=rtl (default).
 * Saves to find-landing/qa-screens/.
 *
 * Run:
 *   node tests/hero-rebuild-qa.mjs
 * (requires dev server at http://localhost:3000)
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const QA_DIR = resolve(ROOT, 'qa-screens');
mkdirSync(QA_DIR, { recursive: true });

const BASE_URL = 'http://localhost:3000';
const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;
// pin = 230% of 900 = 2070px scroll space
const PIN_PX = 2070;

const CAPTURES = [
  { p: 0.00, label: 'p0.00-rest' },
  { p: 0.22, label: 'p0.22-headline-fading' },
  { p: 0.46, label: 'p0.46-building-grown' },
  { p: 0.49, label: 'p0.49-pre-cut' },
  { p: 0.51, label: 'p0.51-post-cut' },
  { p: 0.65, label: 'p0.65-wordmark-lifting' },
  { p: 0.85, label: 'p0.85-near-full-veil' },
  { p: 1.00, label: 'p1.00-bridge' },
];

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  const report = {
    screenshots: [],
    console_errors: [],
    page_errors: [],
    checks: {},
  };

  const browser = await chromium.launch({ headless: true });

  // ── Motion mode captures ────────────────────────────────────────────────
  console.log('[Hero Rebuild QA] Starting motion captures…');
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    // RTL is set via the <html dir="rtl"> in the page itself
  });
  const page = await ctx.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      report.console_errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    report.page_errors.push(err.message);
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  // Wait for GSAP + Lenis to fully initialise + fonts to load
  await wait(2000);

  // Verify building src is hero-tower-v2.png
  const buildingImgSrc = await page.evaluate(() => {
    const img = document.querySelector('#hero img');
    return img ? img.getAttribute('src') : null;
  });
  report.checks.buildingImgSrc = buildingImgSrc;
  console.log('  Building img src:', buildingImgSrc);

  // Check no horizontal scrollbar
  const hasHorizScroll = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  report.checks.noHorizScrollbar = !hasHorizScroll;
  console.log('  Horizontal scrollbar:', hasHorizScroll ? 'YES (BAD)' : 'none (good)');

  for (const cap of CAPTURES) {
    const scrollY = Math.round(cap.p * PIN_PX);
    console.log(`  Scrolling to p=${cap.p} (scrollY=${scrollY})…`);

    await page.evaluate((y) => {
      window.scrollTo({ top: y, behavior: 'instant' });
    }, scrollY);
    // Give Lenis + GSAP scrub time to settle
    await wait(600);

    const filename = `hero-${cap.label}.png`;
    const shotPath = resolve(QA_DIR, filename);
    await page.screenshot({ path: shotPath, fullPage: false });
    report.screenshots.push(shotPath);
    console.log('    Saved:', filename);

    // Check building bottom-flush (no visible gap) at this depth
    // by measuring bounding rect of the hero section bottom vs viewport bottom
    const heroFlushCheck = await page.evaluate(() => {
      const hero = document.getElementById('hero');
      if (!hero) return null;
      const rect = hero.getBoundingClientRect();
      // The section should occupy the full viewport height (it's pinned)
      return {
        heroBottom: Math.round(rect.bottom),
        viewportH: window.innerHeight,
      };
    });
    report.checks[`flush_${cap.label}`] = heroFlushCheck;
  }

  await ctx.close();

  // ── Reduced-motion static end-state capture ─────────────────────────────
  console.log('\n[Hero Rebuild QA] Reduced-motion static end-state…');
  const ctxRM = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    reducedMotion: 'reduce',
  });
  const pageRM = await ctxRM.newPage();
  await pageRM.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(1500);

  const rmPath = resolve(QA_DIR, 'hero-reduced-motion-static.png');
  await pageRM.screenshot({ path: rmPath, fullPage: false });
  report.screenshots.push(rmPath);
  console.log('  Saved: hero-reduced-motion-static.png');

  await ctxRM.close();
  await browser.close();

  // ── Report ───────────────────────────────────────────────────────────────
  console.log('\n======= HERO REBUILD QA REPORT =======');
  console.log('Screenshots saved:');
  report.screenshots.forEach(s => console.log(' ', s));
  console.log('\nChecks:');
  console.log('  buildingImgSrc:', report.checks.buildingImgSrc);
  console.log('  noHorizScrollbar:', report.checks.noHorizScrollbar);
  if (report.console_errors.length) {
    console.warn('\nConsole errors:', report.console_errors);
  }
  if (report.page_errors.length) {
    console.warn('\nPage errors:', report.page_errors);
  }
  console.log('======================================\n');

  return report;
}

run().catch(err => {
  console.error('QA script failed:', err);
  process.exit(1);
});
