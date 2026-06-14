---
date: 2026-06-14
role: ceo
session: ceo-1-1781412896
task: hero-rebuild (Bonim Atid / בונים עתיד landing page)
tier: full
qa_verdict: PASS
branch: feat/hero-rebuild
status: QA-PASSED — awaiting founder sign-off + merge
---

# Session — Hero Section Rebuild (Bonim Atid)

## Goal
Delete and rebuild the signature hero of `find-landing/` faithful to the FIND reference (frames 1-6) but at awwwards craft, with a NEW building image, refined realistic clouds, and a more premium scroll feel.

## Locked decisions (founder)
- Clouds = refined CSS/DOM PNG layers (not WebGL).
- Building = fully replace with new image (`hero-building-cutou.png`).
- Motion = faithful to the 6-frame arc, better-crafted.

## Orchestration (T3 wave)
1. **Research** — 2× researcher (parallel): cloud-realism (depth banding, `mix-blend-mode: screen` + sky-tint, non-looping prime-period drift, uncanny-line guardrails, perf caps) + scroll-feel (scrub vs Lenis double-smoothing, per-beat easing, 15-35% overlap, anticipation/settle).
2. **Asset prep** — frontend-engineer: `hero-tower-v2.png` (cache-bust filename) + derived opaque `hero-tower-fill-v2.jpg` (sharp trim+flatten over #dfe9f3); manifest repointed. `ed9a8fe`.
3. **Rebuild** — frontend-engineer: rewrote `Hero.tsx` + `HeroClouds.tsx` (banded clouds, square-building retune, tuned timeline). `1d5d63f`.
4. **Critique→polish loop** — design-critic (Playwright vs reference frames, 3 P1 / 5 P2 / 3 P3) → design-polisher: `1462b9b` (desktop rest framing, warm sky, centered wordmark, instant fill-cut, earlier cloud bloom, mid-scroll fade, nav/scroll fade), then `f88fa54` (slot-roll → measured pixel vertical roll, mobile flush).
5. **QA gate (Full)** — QA-Lead PASS.

## What shipped
- New green-terraced glass tower, bottom-anchored, scales up on a pinned ScrollTrigger (scrub:true + Lenis).
- Banded DOM/PNG clouds (6 back + 5 front = 11 nodes), `screen` blend + sunset sky-tint + non-looping drift; bloom overlaps the building scale and bridges into the next section as a soft veil.
- Slot-roll Hebrew headline (clean single-sentence settle), fades by mid-scroll; outline wordmark → instant image-fill hard-cut; warm pastel sunset sky.
- Reduced-motion static end-state preserved; GPU-only transforms; GSAP context revert + single rAF cancelled on unmount.

## QA-Lead verdict (binding): PASS — Full tier
tsc zero · build green · reduced-motion correct · RTL correct · no horizontal overflow (1440 & 390) · building resolves to hero-tower-v2.png · CtaFooter shared fill OK · nav opacity restores after pin · security clean. **Clear to merge.**

### Follow-ups (non-blocking)
- P2: nav captured via `document.querySelector` inside the GSAP context (`Hero.tsx:277`) — fine for this single-page landing; pass a ref before any multi-page adoption.
- P3: mobile building nudge uses `window.innerWidth` keyed on `[mounted]` — won't re-fire on orientation change; prefer a CSS media query.
- P3: QA harness `tests/hero-rebuild-qa.mjs:72` building-img selector matches a cloud PNG (test cosmetic bug; live build confirmed correct).

### Accepted residuals (cosmetic)
- 1-2px transparent-PNG gap below the building base on some mobile sizes (source-asset; crop PNG to fully close).
- Slot-roll transition shows two spatially-separated sentences (the slot idiom — not glyph collision).
- Pre-existing moderate postcss CVE in Next 16 transitive dep (not introduced here).

## Commits (branch feat/hero-rebuild, from base ea75c7a)
- ed9a8fe asset swap + wordmark fill + manifest (v2 filenames)
- 1d5d63f hero + clouds rebuild
- 1462b9b polish pass 1 (critic P1/P2/P3)
- f88fa54 polish pass 2 (slot-roll vertical roll + mobile flush)

## Next step
Founder sign-off → merge `feat/hero-rebuild` to `main`. Optional follow-up ticket for the P3 housekeeping + cropping the building PNG to close the mobile gap.
