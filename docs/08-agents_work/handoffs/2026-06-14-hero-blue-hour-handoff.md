---
date: 2026-06-14
from: ceo (session ceo-1-1781412896)
to: next session / next team (CONTINUE — founder still iterating)
project: find-landing — Bonim Atid (בונים עתיד) hero rebuild
branch: feat/hero-rebuild  (PUSHED to origin, NOT merged to main)
latest_commit: a84d4b6
status: IN PROGRESS — founder NOT done yet. Saved to GitHub for continuation. NO merge, NO final QA yet.
worktree: /Users/adamks/VibeCoding/realestate/.worktrees/hero-rebuild/find-landing
dev: cd find-landing && PORT=3000 npm run dev   → http://localhost:3000  (Hebrew default / RTL)
---

# HANDOFF — Bonim Atid signature hero (blue-hour version)

## 0. Read this first
The founder is iterating the signature hero **live, screenshot-by-screenshot** in many small batches. He is **not finished** — expect more refinement requests. Do NOT merge to main and do NOT treat this as final. The branch is pushed to GitHub purely to save progress so the conversation can be compacted. The work bar is **awwwards-winning**, benchmarked against findrealestate.com (reference frames in `docs/reference-video-screenshots/`).

## 1. How the hero works NOW (at a84d4b6)
A pinned GSAP ScrollTrigger (`end:'+=560%'`, `scrub:true`, Lenis smooth scroll) over a **cool blue-hour dusk** scene. Scroll arc:
1. **Rest:** lighter-blue dusk sky + the **blue clouds the founder loves** (DO NOT re-tint), a **green-glass tower** (`hero-tower-v3.png`) sitting **low** (~66vh top), and the **centered** copy block (headline + subhead + CTA) over open sky — headline **deep black `#050505`**, sized `clamp(2.4rem,6.5vw,6rem)`.
2. **On scroll (combined):** the 3-state Hebrew **slot-roll headline cycles WHILE the building rises** (constant-size pan up). At the **first headline change** the copy tweens **black → white** (`#ffffff` + dark shadow) so it stays readable over the rising building. Each of the 3 headings **holds** long enough to read.
3. **Wordmark:** smooth **fade** (no pop) — building cross-fades out as the **white outline** of "בונים עתיד" + smaller "וובינר" (50%) fades in, then the **image-fill** wordmark reveals; it **holds** (extended), then lifts.
4. **End / bridge:** the **cloud screen** blooms full; the **3 stat numbers** (+2,000 / 46M+ / 16+, from `c.stats`) appear **ON the cloud** (no separate Stats section stripe). The cloud screen **pans up** (`translateY 15vh→0` over p0.90–1.0) and the pin releases **continuously** into the white `RewiredSteps` section — "rising through clouds."

## 2. Current timeline map (Hero.tsx @ a84d4b6) — tune from here
- Pin: `start:'top top'`, `end:'+=560%'`, `pin:true`, `scrub:true`, `onUpdate → progressRef`.
- Building pan: `tl.to(buildingWrap,{y:-panPx, dur:0.62, ease:'power2.inOut'},0.10)` → p0.10–0.72. `BUILDING_PAN_VH` 48vh desktop / 35vh mobile. Outer `top: clamp(62vh,66vh,70vh)`. Two-layer wrapper (outer centers via translateX(-50%), inner = buildingWrapRef translateY only, never scale). Cool `<img>` filter `saturate(0.96) brightness(0.97) hue-rotate(6deg) contrast(1.03)` + masked rim-light + masked base-haze (all inside inner wrapper, never tint sky).
- Slot-roll cycle: p0.06–0.55, holds [0.22–0.38] & [0.72–0.88]. 3 sentences from `content.he.hero.cycle`.
- Text color tween black→white at `p0.12` (`textColor` wrapper div; spans inherit).
- Copy block: **flex justify-center** (centered at rest, NO drift tween — copyBlockRef/centerShiftPx removed).
- Wordmark cross-dissolve: buildingImg out 0.73–0.87, outline in 0.73–0.86, outline out 0.84–0.94, fill in 0.82–0.94, lift 0.95–0.99.
- Stats overlay: `statsOverlayRef` (z-[4], absolute, justify-end, paddingBottom ~8vh), fades in p0.88–1.0. Reuses `c.stats` + 3-up grid w/ divide-x hairlines.
- Cloud veil pan: `cloudFrontVeilRef` passed to HeroClouds as `veilRef` prop; `gsap.set(...{y:'15vh'})` at rest, `tl.to(...{y:'0vh'},0.90)`.
- Nav-fade GSAP was **removed** (BonimNavbar self-manages).
- Sky gradient (lighter blue): top `#2e4878` → … → `#e2eaf3` (`SkyGradient()` in Hero.tsx).

## 3. Key files
- `components/sections/Hero.tsx` — the whole pinned hero, timeline, building, copy, wordmark (`BrandWordmarkOutline` local), stats overlay, sky.
- `components/sections/HeroClouds.tsx` — banded PNG clouds (FAR/MID back + FRONT veil), `frontVeilIntensity` bloom p0.63–0.97, accepts `veilRef` prop for the pan. **Blue clouds — do not re-tint.**
- `components/layout/Logo.tsx` — `BrandWordmarkMask` (fill clip-mask, optional `subWord` prop → "וובינר" at 50%; shared with CtaFooter which passes NO subWord).
- `components/layout/BonimNavbar.tsx` — the new approved navbar (transparent+white top over a **dark scrim**, white bar + color logo at scrollY>60, RTL logo-right/CTA-left/links-centered). Mounted in `app/page.tsx`. Old `Nav.tsx` removed from render (file still exists).
- `components/sections/Stats.tsx` — **no longer rendered** (stats moved into the hero overlay). File intact; safe to delete in cleanup.
- `app/page.tsx` — section order: `Hero → RewiredSteps → ChevronStrip → …` (Stats removed).
- `data/content.ts` — `content.he/en.hero` (cycle/subhead/cta), `c.stats`, images manifest (`heroBuildingCutout:/images/hero-tower-v3.png`, `heroBuildingFill:/images/hero-tower-fill-v3.jpg`).
- `next.config.ts` — `images.qualities:[75,85,90]`.

## 4. Assets
`public/images/`: `hero-tower-v3.png` (cropped flush building cutout), `hero-tower-fill-v3.jpg` (opaque wordmark fill), `clouds/cloud-1..7.png`, `bonim-logo.png` (594×209, navbar). Earlier `hero-tower(-v2).*` left as safety nets.

## 5. Done so far (chronological batches)
Rebuild → warm golden-hour (rejected: building too cool) → **flipped to cohesive blue-hour dusk** → fixed band-seam + headline/wordmark overlap → smaller building + black/gray copy + slower 290% + smooth wordmark + וובינר sub-word + stats gradient → deep-black text + copy-centers-on-scroll + 400% + fade-not-pop + stats `#f7fafd` → new BonimNavbar + scrim + combined cycle/rise + white-after-first-change + prettier text → **(latest)** longer cycle/holds + lighter sky + bigger headline + copy centered at rest + building 30% lower + cycle/rise 30% longer + wordmark 50% longer + **stats-on-cloud + cloud pans up into next section (560% pin)**.

## 6. Open threads / where the founder may push next
- Founder said he's "not happy yet" (no specific item given at handoff time). Re-confirm what to refine on resume.
- **Cloud-pan is currently subtle** (15vh over p0.90–1.0) — founder may want the "rising through clouds" feel more pronounced (increase translateY range / widen the progress window).
- The stats overlay fades in at a fixed bottom anchor while the veil pans behind it (they don't pan as one element) — if founder wants the stats to physically rise WITH the cloud, move the stats inside the panning veil container.
- General awwwards-grade craft polish (spacing, micro-interactions, mobile fine-tuning) not yet through a formal design-critic pass on this latest state.

## 7. How to work it (the loop that worked)
1. Make edits via a **design-polisher / frontend-engineer** in this worktree (do NOT spawn a new worktree). These agents reliably do tsc+build but **truncate at the Playwright step** — instruct them to **skip Playwright + just commit**; the CEO captures/verifies.
2. **CEO captures via Playwright** with `qa-screens/capture-iter.mjs` (+ `cap-*.mjs` helpers there) — DPR2, 1440×900 + 390×844, RTL default + EN. Restart dev on :3000 if down (`PORT=3000 npm run dev`; check `/tmp/hero-dev2.log`). Note: pin is 560% so end-states are deep (scrollY ~4400–5200 on a 900px viewport).
3. design-critic reads the captured PNGs (give it the file paths — it truncates if it runs Playwright itself).
4. Founder reviews live → next batch.

## 8. Quality gates still owed before any merge
- Formal **Full-tier QA gate** (QA-Lead PASS) on the final state — NOT yet run.
- tsc + `npm run build` currently **green**; no horizontal overflow at 1440/390; reduced-motion composed state present (copy + static stats fallback); RTL/EN parity.
- Founder sign-off on "final." Then merge `feat/hero-rebuild` → main + push.

## 9. Constraints (do not regress)
Blue clouds untouched · constant-size building pan (never scale) · two-layer building wrapper · white-text-after-first-change · BonimNavbar behavior + dark scrim · reduced-motion composed state · RTL Hebrew default + EN toggle · GPU-only transforms · `progressRef` (no per-frame re-renders) · single rAF cancel on unmount · GSAP `ctx.revert()` cleanup · tsc strict (`@ts-expect-error` for CSS custom props).
