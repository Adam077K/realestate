---
date: 2026-06-14
role: ceo
task: mobile-layout
branch: feat/hero-rebuild
tier: lite
qa_verdict: PASS
deployed: pending founder authorization (branch pushed, main push awaiting OK)
---

# P2 — Mobile layout fixes ("phone is broken")

## Items (4 commits, frontend-engineer, CEO-verified)
- **M1 ChevronStrip** (542419a): 4 panels overflowed a 358px row (4×180px, clipped). Now a 2×2 grid
  under 640px (no negative-margin overlap); the overlapped horizontal row kept at sm+. globals.css
  `.chevron-panel` carries the sm+ clamp sizing (Tailwind can't express responsive arbitrary clamp inline).
- **M2 heading clip** (fd29b5f): added `scroll-margin-top` so anchored sections (#learn/#webinar/#founders/
  #register) land below the sticky navbar.
- **M3 HeroClouds** (717bc92): on phones, skip the heaviest/redundant cloud layers (far-1/2, mid-3/4,
  near-4/5) — perf only; veil bloom + frontVeilIntensity intact.
- **M4 Hero building fill** (dd63f0f): building rest width now ~112vw on phones (was 78vw≈300px),
  78vw/max-1140px on desktop, applied to BOTH render paths. Pan timeline, grounded clamp, GROUND_BLEED,
  BUILDING_PAN_VH*, two-layer wrapper, aspect, visualViewport listener all UNTOUCHED.

## Verification (CEO — Playwright, mobile emulation, reduce-motion, production build)
At 360/390/414:
- Building width 403/437/464px (bigger, fills screen).
- Float: gapBelow (viewportBottom − buildingBase) always negative — REST −75/−91/−96, worst-during-scroll
  −31/−34/−35 → base ALWAYS at/below the fold = GROUNDED, no float at rest or mid-pan. Matches the
  width-independent geometry (base always lands at vh+GROUND_BLEED). VERDICT GROUNDED.
- Horizontal overflow 0px at all widths (chevron reflow good).
- `npx tsc --noEmit` clean; `npm run build` green.

## Pending
Branded preloader (P3); wordmark visual verify (345ac1e); awwwards reveal polish; registration form backend.
Deploy of this batch awaiting founder authorization (production main-push is guarded).
