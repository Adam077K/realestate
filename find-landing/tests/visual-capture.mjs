/**
 * Visual QA capture script for the Find landing page.
 * ESM — run with: node tests/visual-capture.mjs
 *
 * Strategy:
 *   1. Motion mode   → hero at rest screenshot + console/page error collection
 *   2. Reduced-motion → section-by-section scrollIntoView screenshots (Lenis disabled)
 *   3. Full-page      → single fullPage:true screenshot in reduced-motion mode
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

// Section IDs found in the codebase (in DOM order)
const SECTION_IDS = [
  'hero',
  'why-find',
  'chevron-strip',
  'rewired-steps',
  'own-your-career',
  'testimonials',
  'services',
  'support-beyond',
  'blog',
  'cta-footer',
];

const SECTION_NAMES = {
  'hero':           '02-hero-end-state',
  'why-find':       '03-whyFind',
  'chevron-strip':  '04-chevronStrip',
  'rewired-steps':  '05-rewiredSteps',
  'own-your-career':'06-ownYourCareer',
  'testimonials':   '07-testimonials',
  'services':       '08-services',
  'support-beyond': '09-supportBeyond',
  'blog':           '10-blog',
  'cta-footer':     '11-ctaFooter',
};

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const report = {
    screenshots: [],
    console_errors: [],
    page_errors: [],
    sections_detected: [],
    notes: [],
    any_runtime_failure: false,
  };

  const browser = await chromium.launch({ headless: true });

  try {
    // -----------------------------------------------------------------
    // PASS 1 — Motion mode: hero at rest + error collection
    // -----------------------------------------------------------------
    console.log('\n[Pass 1] Motion mode — hero at rest + error collection');

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
      report.notes.push('Page load warning (motion): ' + e.message);
      report.any_runtime_failure = true;
    }

    await wait(1500);

    const heroPath = resolve(QA_DIR, '01-hero-rest.png');
    await page1.screenshot({ path: heroPath });
    report.screenshots.push(heroPath);
    console.log('  Saved:', heroPath);

    await ctx1.close();

    // -----------------------------------------------------------------
    // PASS 2 — Reduced-motion: section-by-section + full page
    // -----------------------------------------------------------------
    console.log('\n[Pass 2] Reduced-motion — section-by-section');

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
      report.notes.push('Page load warning (reduced): ' + e.message);
      report.any_runtime_failure = true;
    }

    await wait(1200);

    const detectedIds = await page2.$$eval(
      'section, [data-section]',
      els => els.map(el => el.id || el.dataset.section || el.className.split(' ')[0])
    );
    report.sections_detected = detectedIds;
    console.log('  Sections detected in DOM:', detectedIds);

    const availableIds = SECTION_IDS.filter(id => detectedIds.includes(id));
    const missingIds = SECTION_IDS.filter(id => !detectedIds.includes(id));
    if (missingIds.length > 0) {
      report.notes.push('Section IDs not found in DOM: ' + missingIds.join(', ') + ' — falling back to viewport-step scroll');
    }

    if (availableIds.length > 0) {
      for (const id of availableIds) {
        try {
          await page2.evaluate(
            function(sectionId) {
              var el = document.getElementById(sectionId);
              if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
            },
            id
          );
          await wait(700);

          const filename = (SECTION_NAMES[id] || id) + '.png';
          const shotPath = resolve(QA_DIR, filename);
          await page2.screenshot({ path: shotPath });
          report.screenshots.push(shotPath);
          console.log('  Saved:', shotPath);
        } catch (e) {
          report.notes.push('Failed to screenshot section #' + id + ': ' + e.message);
        }
      }
    }

    if (missingIds.length > 0) {
      report.notes.push('Performing viewport-step fallback for missing sections');
      await page2.evaluate(() => window.scrollTo(0, 0));
      await wait(400);

      const pageHeight = await page2.evaluate(() => document.documentElement.scrollHeight);
      const steps = Math.ceil(pageHeight / VIEWPORT.height);

      for (let i = 0; i <= steps; i++) {
        try {
          await page2.evaluate(
            function(scrollY) { window.scrollTo({ top: scrollY, behavior: 'instant' }); },
            i * VIEWPORT.height
          );
          await wait(500);
          const filename = 'scroll-' + String(i).padStart(2, '0') + '.png';
          const shotPath = resolve(QA_DIR, filename);
          await page2.screenshot({ path: shotPath });
          report.screenshots.push(shotPath);
          console.log('  Saved:', shotPath);
        } catch (e) {
          report.notes.push('Scroll step ' + i + ' failed: ' + e.message);
        }
      }
    }

    console.log('\n[Pass 2] Full-page screenshot');
    try {
      await page2.evaluate(() => window.scrollTo(0, 0));
      await wait(300);

      const fullPath = resolve(QA_DIR, 'full-page.png');
      await page2.screenshot({ path: fullPath, fullPage: true });
      report.screenshots.push(fullPath);
      console.log('  Saved:', fullPath);
    } catch (e) {
      report.notes.push('Full-page screenshot failed: ' + e.message);
    }

    await ctx2.close();
  } catch (topLevelError) {
    report.any_runtime_failure = true;
    report.notes.push('TOP-LEVEL FATAL: ' + topLevelError.message);
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
