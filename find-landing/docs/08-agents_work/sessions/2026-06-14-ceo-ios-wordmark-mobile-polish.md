---
date: 2026-06-14
role: ceo
task: ios-wordmark-mirror + mobile polish + cloud cover + zoom badge
branch: feat/hero-rebuild
tier: full
qa_verdict: PASS
deployed: https://bonimatid.pages.dev (deploy ab79def3, main @ e66be91)
---

# iOS wordmark mirror fix + mobile polish + cloud cover + Zoom badge

## KEY FIX — Hebrew wordmark rendered MIRRORED on iOS/WebKit (commit b10b459)
Founder's iPhone showed "בונים עתיד / וובינר" reversed ("דיתע םינוב"). Chromium rendered it
correctly, which is why earlier headless-Chromium verification MISSED it.
- Root cause: **WebKit/iOS does not apply Hebrew RTL bidi to SVG `<text>`** — it lays the
  codepoints LTR (mirrored). Confirmed by reproducing in Playwright **webkit**. Neither
  `direction="rtl"` nor `unicode-bidi: bidi-override` fixes it (verified — both still mirror).
- Fix (`Logo.tsx` BrandWordmarkMask): bypass bidi entirely — render glyphs REVERSED + forced LTR.
  Added `rtlText = (s) => [...s].reverse().join('')`; set `style:{direction:'ltr',
  unicodeBidi:'bidi-override'}` on the text attrs; reversed the content of ALL FOUR text nodes
  (2 clipPath + 2 outline-group). Both engines now lay the reversed glyphs LTR → identical,
  correct "בונים עתיד". `aria-label` kept as the original (non-reversed) for a11y. Fixes the
  footer wordmark too (same component).
- VERIFIED in BOTH webkit AND chromium via a dual-engine Playwright harness — both correct, no mirror.
- **Lesson:** for RTL/SVG-text or any iOS-specific rendering, verify in Playwright **webkit**, not just chromium.

## Mobile polish (founder iPhone feedback)
- Headline too small on phone → `clamp(1.8rem,5.6vw,5.6rem)` → `clamp(2.35rem,8.5vw,5.6rem)` (both
  paths) so it's bigger and the lines span ~the subline width (7ecc134).
- Services ("black section") CTA not centered on phone → `services-cta` `justify-end` →
  `justify-center md:justify-end` (4a42355).
- "וובינר" eyebrow: enlarged + made BLACK, then bumped again to `clamp(1.05rem,1.9vw,1.3rem)`
  (4c84179, f0f77da, e66be91).

## Earlier in this wave
- Cloud end-veil now reads as CLOUDS not flat white: cloud-7.png composited into the front veil +
  near-layer bloom raised to 0.78 peak; smooth seam into #learn (8682e9b).
- Zoom badge beside the hero CTA (blue circle only, white corners cropped via object-cover scale),
  CTA+badge centered as a group (f0f77da).

## Verification (CEO)
tsc clean; build green. Wordmark correct in webkit + chromium. Mobile 390: bigger headline + black
eyebrow, Services CTA centered, building still grounded, Zoom badge blue-only. All deployed.

## Pending
Registration form still has no backend (CtaFooter just setSubmitted) — wire to a 3rd-party endpoint
before real traffic.
