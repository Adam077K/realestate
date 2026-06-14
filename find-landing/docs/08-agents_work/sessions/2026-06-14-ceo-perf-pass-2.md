---
date: 2026-06-14
role: ceo
task: performance pass 2 (load speed)
branch: feat/hero-rebuild
tier: lite
qa_verdict: PASS
deployed: https://bonimatid.pages.dev (deploy 60eeea17, main @ 66aa292)
---

# Performance pass 2 — load speed (mobile/4G)

## Measured problem (Playwright, mobile 390, ~4G throttle)
- `load` event = **8.7s**; FCP fine (496ms). Cause: the Preloader warmed the ENTIRE image
  manifest (`new Image()` ×~18) on mount → ~3.9MB pulled before load → saturated 4G.

## Fixes (commits 687fc3f, 66aa292)
- **Images** (`public/images/`, sharp): founder faces roey/idan re-encoded ≤900px q82 (365KB→28KB,
  259KB→17KB — simple portraits on plain bg, verified clean, no artifacts); aerial-forest/blog/
  city-street/service-* resized+recompressed (e.g. aerial 398→203, blog-1 172→58). Large clouds 4–7
  palette-quantized in place (PNG kept — webp is BIGGER for soft alpha; verified no banding in hero):
  cloud-5 324→194, 7 284→90, 4 197→83, 6 173→118. Clouds 1–3 left (already optimal).
- **Preloader** (`Preloader.tsx`): removed the eager mount-time warm of the whole manifest. Now warms
  only the nearest ~8 below-fold images, AFTER the hero is ready (inside startFade), via
  requestIdleCallback in batches of 2 — never competes with the critical hero load. Rest rely on
  native `loading="lazy"`.

## Result (re-measured, same throttle)
- load event **8.7s → 3.9s** (−55%); images at load **3.9MB → 1.5MB**; FCP 448ms; resource count 53→39.
- Hero clouds smooth (no quantization banding); founder faces clean; building still loads first.

## Note on webp vs png for clouds
Confirmed (again): soft-alpha cloud PNGs do NOT compress smaller as webp — webp was larger for most.
The win for clouds is dimension-resize + palette quantization in PNG, not format conversion.

## Pending
Registration form still has no backend. Possible further perf: subset the Hebrew font; lazy-mount
heavy below-fold sections; consider AVIF for the photos (not clouds).
