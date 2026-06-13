---
date: 2026-06-13
from: ceo (session ceo-1-1781364202)
to: next team (QA + visual-polish)
project: find-landing (Bonim Atid / בונים עתיד landing page)
status: functional, bilingual, building-green — needs craft/UX/UI/layout polish to awwwards grade
benchmark: https://findrealestate.com/
---

# HANDOFF — Bonim Atid landing page (`find-landing/`)

## 1. What this is
An awwwards-grade, **bilingual (Hebrew-default / RTL, English toggle)** marketing site for **בונים עתיד (Bonim Atid)** — an Israeli real-estate investment-advisory firm (founders **עידן פלג / Idan Peleg** & **רועי פישמן / Roey Fishman**) that runs a free apartment-buying webinar (Mon 22.06.26, 20:30, Zoom). It began as a faithful recreation of the FIND Real Estate site (the visual benchmark) and was rebranded to Bonim Atid with real company content.

**Location:** `/Users/adamks/VibeCoding/realestate/.worktrees/ceo-1-1781364202/find-landing`
**Branch:** `ceo-1-1781364202` (NOT merged to main — QA gate + founder sign-off required before merge).

## 2. Stack & architecture
- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind v4.
- Motion: **GSAP + ScrollTrigger**, **Lenis** smooth scroll (`components/providers/SmoothScrollProvider.tsx`), **R3F был replaced** — clouds are now CSS/DOM layered transparent PNGs (`components/sections/HeroClouds.tsx`).
- i18n: `components/providers/LanguageProvider.tsx` → `useLang()` `{lang,setLang,dir}` + `useContent()` → `content[lang]`. **Hebrew is default**, persisted to `localStorage('bonim-lang')`, `dir=rtl` on `<html>`. All copy lives in `data/content.ts` (`content.he` / `content.en`).
- Fonts: Latin = Onest + Hanken Grotesk; **Hebrew = Assistant** (`--font-hebrew`), exposed via `next/font`. Hebrew type rules in `app/globals.css` (`[dir='rtl']` — opened tracking, 1.7 line-height).
- Section order (`app/page.tsx`): Nav → Hero → Stats → RewiredSteps(מה תלמדו, `#learn`) → ChevronStrip(זה לא רק דירה) → OwnYourCareer(המנחים, `#founders`) → Partners → Services(pillars לקנות/לזהות/להרוויח) → Testimonials → BuyerGroups(`#buyer-groups`) → Hitech → SupportBeyond(webinar "Pass", `#webinar`) → CtaFooter(register `#register` + footer wordmark).

## 3. Key assets (DO NOT revert)
- **Hero building = the NEW glass tower** at `public/images/hero-tower.png` (transparent cutout) + `hero-tower-fill.jpg` (opaque fill for the clip-mask wordmark). ⚠️ An earlier golden-brick building was cached by the Next image optimizer; we cache-busted with fresh filenames. **Keep the glass tower — do not use `hero-building*.jpg/png`.**
- Real founder photos: `public/images/idan-peleg.webp`, `roey-fishman.webp`.
- Buyer-group cards (pre-designed, text baked in — render AS-IS, no overlay): `public/images/buyer-{holon,haifa,telaviv,herzliya}.png`.
- Clouds: 7 transparent PNGs `public/images/clouds/cloud-1..7.png` (pngimg.com, **CC BY-NC** — swap to CC0 before any commercial launch).

## 4. The signature hero (current behavior)
At rest: glass tower bottom-anchored & centered (top ~40% of viewport), cycling slot-roll headline (3 Hebrew sentences) + subhead + CTA centered above, soft clouds. On scroll (pinned): building **scales up from a bottom anchor** (never floats — two-layer wrapper: outer centers, inner scales) revealing more of it → **instant** switch from light outline → building-image-filled **"בונים עתיד"** wordmark (`BrandWordmarkMask` in `components/layout/Logo.tsx`) → a **cloud screen** ramps to full cover and bridges into the next section. Foreground cloud layer (`HeroClouds variant="front"`) drifts over the building/wordmark.

## 5. What was done this session (chronological highlights)
- Built the full FIND recreation (10 sections, GSAP/Lenis/clouds, design system, 16 images), then **rebranded to Bonim Atid** with i18n (HE/EN, RTL) and real company content (stats 16+/46M+/2,000+, founders, partners, buyer groups, hi-tech clients).
- Hero iterations: clip-mask wordmark (Hebrew בונים עתיד), building anchoring fixes (scale-from-bottom, centered, no float gap), persistent + denser realistic clouds + foreground coverage, instant outline→fill switch, cloud-screen bridge, slot-roll cycling headline, building sized to founder's reference.
- Chevron arrows fixed to 4 equal `❯` (frame_018). Webinar section redesigned to a minimal **B&W "Pass"** (giant 22.06 + boarding-pass rail). Registration section upgraded (split layout + frosted form + urgency). Pillars made RTL-native (giant word on the right in Hebrew). Buyer-groups = moving marquee carousel of the city cards as-is. Hebrew font Rubik → **Assistant** with tuned metrics. Removed Advantages + "How it works" sections per founder.
- Verified each step with a Playwright capture harness: `find-landing/tests/capture-bonim.mjs` (HE+EN) and `tests/cap-spot.mjs` (hero scroll states). Outputs to `find-landing/qa-screens/` (gitignored).

## 6. YOUR MISSION (next team)
Take this from "functional & on-brand" to **awwwards-winning**, benchmarked against **https://findrealestate.com/**.

1. **Spin up QA + visual reviewers using the Playwright MCP** (browse the live site at `http://localhost:3000` — start it with `cd find-landing && npm run dev`). Drive the page in BOTH languages (toggle EN/עב in the nav; set `localStorage('bonim-lang','en')`), scroll every section slowly, capture screenshots, and **take detailed notes** comparing craft against findrealestate.com.
2. **Improve, iterate, re-verify** until the quality bar is met — loop: review → prioritized findings (P1/P2/P3) → fix → re-screenshot → compare. Use the design-critic → design-polisher loop.
3. **Focus areas the founder called out:**
   - **UX** — scroll feel, section pacing/length (the page is long; tighten flow), nav usability, the hero handoff timing, mobile experience, reduced-motion.
   - **UI craft** in several components — spacing/rhythm, type scale, hierarchy, hover/focus states, color/contrast, the Stats/Partners/Hitech strips, Testimonials, the webinar "Pass", the register form.
   - **Layout** — needs work: section composition, alignment, whitespace, responsive breakpoints (tablet/mobile), RTL correctness in every section (verify nothing mirrors wrong).
4. **Hard constraints / don'ts:**
   - Keep the **new glass-tower** building (don't revert to golden brick).
   - Keep **Hebrew default / RTL** and the EN toggle working; verify all copy comes from `data/content.ts` via `useContent()` (no hardcoded strings).
   - Keep `tsc --noEmit` + `npm run build` green; GSAP/Lenis cleanup intact; GPU-only transforms; reduced-motion fallbacks.
   - Don't break the i18n contract or the section anchors (`#learn,#founders,#webinar,#register,#buyer-groups`).

## 7. How to run / verify
```
cd find-landing
npm install && npm run dev          # http://localhost:3000
npm run build                       # must stay green (tsc strict + build)
node tests/capture-bonim.mjs        # HE+EN screenshots → qa-screens/
node tests/cap-spot.mjs             # hero scroll-state screenshots
```
Reference frames: `docs/reference-video-screenshots/` (full walkthrough) and `docs/reference-video-screenshots-2/` (closer hero/intro). Founder's real-content reference: their old site `https://bonimatid-re.com/` (behind a bot wall) + the webinar page `https://lp.vp4.me/io9b`.

## 8. Known follow-ups / debt
- Cloud PNGs are CC-BY-NC (swap to CC0 for commercial use).
- Founder card captions (name/role/bio) — verify they render cleanly under the new photos.
- `npm run lint` is broken repo-wide (script calls removed `next lint`; no eslint config) — does not affect tsc/build; wire a real ESLint config if desired.
- Multi-lockfile Turbopack workspace-root warning (harmless) — set `turbopack.root` to silence.
- The "instant" outline→fill hero switch + cloud-screen timing are tuned but worth a fresh eye for polish.

## QA gate
This is a **Full**-tier change set (new app, large LOC; no auth/DB/billing → not Irreversible). No merge to `main` without QA-Lead PASS + founder sign-off.
