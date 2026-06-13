/**
 * Enhanced visual QA capture script for motion mode hero animation.
 * Captures hero scroll states during pinned animation (320vh pin).
 * ESM — run with: node tests/visual-capture-motion.mjs
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

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const report = {
    screenshots: [],
    console_errors: [],
    page_errors: [],
    any_runtime_failure: false,
    notes_on_hero_states: [],
  };

  const browser = await chromium.launch({ headless: true });

  try {
    // Motion mode: capture hero at scroll position 0 (rest state)
    console.log('\n[Motion Mode] Capturing hero at scroll 0 (rest state)');
    const ctx1 = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: SCALE,
    });
    const page1 = await ctx1.newPage();

    page1.on('console', msg => {
      if (msg.type() === 'error') {
        report.console_errors.push('[console.error] ' + msg.text());
      }
    });
    page1.on('pageerror', err => {
      report.page_errors.push('[pageerror] ' + err.message);
      report.any_runtime_failure = true;
    });

    try {
      await page1.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      report.notes_on_hero_states.push('Page load failed: ' + e.message);
      report.any_runtime_failure = true;
    }

    // Wait for fonts, GSAP, Lenis to load
    await wait(1500);

    // Capture at scroll 0 (hero at rest)
    const heroRestPath = resolve(QA_DIR, '01-hero-rest.png');
    await page1.screenshot({ path: heroRestPath });
    report.screenshots.push(heroRestPath);
    console.log('  Saved:', heroRestPath);

    // Attempt to scroll and capture hero pin states during motion mode
    // Hero pins for ~320vh (3.2x viewport height = 2880px)
    // Capture at incremental scroll positions
    const scrollSteps = [
      { label: 'scroll 900px (1x viewport)', y: 900 },
      { label: 'scroll 1800px (2x viewport)', y: 1800 },
      { label: 'scroll 2700px (3x viewport)', y: 2700 },
    ];

    for (const step of scrollSteps) {
      try {
        console.log('  Scrolling to', step.label);
        await page1.evaluate(
          function(scrollY) {
            window.scrollTo({ top: scrollY, behavior: 'auto' });
          },
          step.y
        );
        await wait(800);

        const filename = 'hero-scroll-' + step.y + '.png';
        const shotPath = resolve(QA_DIR, filename);
        await page1.screenshot({ path: shotPath });
        report.screenshots.push(shotPath);
        console.log('    Saved:', shotPath);
        report.notes_on_hero_states.push('Captured hero pin state at scroll ' + step.y);
      } catch (e) {
        report.notes_on_hero_states.push('Failed to capture scroll state ' + step.y + ': ' + e.message);
      }
    }

    await ctx1.close();

    // Chevron strip section: capture in reduced-motion mode for determinism
    console.log('\n[Reduced-Motion Mode] Capturing chevron strip');
    const ctx2 = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: SCALE,
      reducedMotion: 'reduce',
    });
    const page2 = await ctx2.newPage();

    page2.on('console', msg => {
      if (msg.type() === 'error') {
        const text = '[console.error/reduced] ' + msg.text();
        if (!report.console_errors.includes(text)) {
          report.console_errors.push(text);
        }
      }
    });
    page2.on('pageerror', err => {
      const text = '[pageerror/reduced] ' + err.message;
      if (!report.page_errors.includes(text)) {
        report.page_errors.push(text);
      }
      report.any_runtime_failure = true;
    });

    try {
      await page2.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      report.notes_on_hero_states.push('Reduced-motion page load failed: ' + e.message);
      report.any_runtime_failure = true;
    }

    await wait(1200);

    // Scroll to chevron strip
    try {
      await page2.evaluate(function() {
        const el = document.getElementById('chevron-strip');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
      await wait(700);

      const chevronPath = resolve(QA_DIR, '04-chevronStrip.png');
      await page2.screenshot({ path: chevronPath });
      report.screenshots.push(chevronPath);
      console.log('  Saved:', chevronPath);
      report.notes_on_hero_states.push('Chevron strip captured in reduced-motion mode');
    } catch (e) {
      report.notes_on_hero_states.push('Failed to capture chevron strip: ' + e.message);
    }

    await ctx2.close();
  } catch (topLevelError) {
    report.any_runtime_failure = true;
    report.notes_on_hero_states.push('TOP-LEVEL FATAL: ' + topLevelError.message);
    console.error('Fatal error:', topLevelError);
  } finally {
    await browser.close();
  }

  console.log('\n\n======= VISUAL QA REPORT =======');
  console.log(JSON.stringify(report, null, 2));
  console.log('=================================\n');

  return report;
}

run().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
