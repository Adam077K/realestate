# HANDOFF — Bonim Atid (בונים עתיד) awwwards landing page

**Paste this whole file as the opening prompt for the next session.** You are the CEO/orchestrator continuing an
in-flight awwwards-grade Hebrew/RTL real-estate webinar landing page. Read it fully before acting.

---

## 0. FIRST ACTIONS (do these before anything else)
1. **Check git state** — a background designer agent was mid-refactor at handoff:
   ```
   cd /Users/adamks/VibeCoding/realestate/.worktrees/hero-rebuild/find-landing
   git log --oneline -10
   git status --short          # Logo.tsx + Hero.tsx were UNCOMMITTED (wordmark refactor in progress)
   npx tsc --noEmit            # confirm the tree compiles before building on top of it
   ```
   If `Logo.tsx`/`Hero.tsx` are still uncommitted, the wordmark refactor (see §4.2) may be half-done — review the
   diff, finish or commit it, and verify before continuing.
2. **Start the dev server** if needed: `PORT=3000 npm run dev` (from `find-landing/`). Hard-refresh to test.
3. Set identity: `/color gold` + `/name ceo-bonim-landing`.

## 1. WHERE EVERYTHING IS
- **Worktree (work + commit here, do NOT create a new one):**
  `/Users/adamks/VibeCoding/realestate/.worktrees/hero-rebuild/find-landing`
- **Branch:** `feat/hero-rebuild`. **Repo:** github.com/Adam077K/realestate. The app lives in the `find-landing/`
  subdirectory.
- **Stack:** Next 16 (App Router, **static export** `output:'export'` + `images.unoptimized:true`), React 19, TS
  strict, Tailwind, GSAP + ScrollTrigger (`@/lib/gsap`), **Lenis** smooth scroll
  (`components/providers/SmoothScrollProvider.tsx`), `useGsapContext` hook. RTL Hebrew default + EN toggle.
- **Single source of truth for copy/images:** `data/content.ts` (`images` manifest + bilingual he/en).
- **Page order** (`app/page.tsx`): Hero → RewiredSteps(#learn) → SupportBeyond(#webinar) → Countdown → ChevronStrip
  → OwnYourCareer(#founders) → Partners → Services → Testimonials → Stats → BuyerGroups → Hitech → CtaFooter(#register).

## 2. LIVE DEPLOY (Cloudflare Pages — already set up)
- **Live:** https://bonimatid.pages.dev (project `bonimatid`, production branch `main`, account
  `c4db0e145efe3b50715aac8490b5da76`). Founder already ran `wrangler login`.
- **Redeploy:** from `find-landing/`: `npm run build` → `npx wrangler pages deploy out --project-name bonimatid
  --branch main --commit-dirty=true` (needs `dangerouslyDisableSandbox:true` for network in Bash).
- **Merge to main:** the local `main` worktree is DIRTY (founder's raw dropped assets) — do NOT merge locally.
  Instead fast-forward the remote: `git -C <worktree> push origin feat/hero-rebuild` then
  `git -C <worktree> push origin feat/hero-rebuild:main`.

## 3. DONE & DEPLOYED (don't redo)
- **Motion gate decoupled** — `motionOk` is always true (scroll choreography always runs); only marquees/autoplay/
  ambient-drift respect a separate `reducedMotion` flag from `SmoothScrollProvider`. (Founder's macOS has Reduce
  Motion ON; this was why the whole site looked static.)
- **Hero building grounded pan** — building rises ONLY until its base meets the viewport bottom (geometry-based pan
  in Hero.tsx timeline), never floats mid-air. Verified at 390/768/1024/1280/1440/1920.
- **Hero even-flow** — constant-velocity linear scrub, no dead holds, wordmark beat ~40% longer, pin `+=1000%`,
  releases into a white veil so it doesn't fly past the next sections.
- **Wordmark inner-counter lines removed** — `BrandWordmarkMask` uses `feMorphology` outer-silhouette outline + drop
  shadow.
- **Performance** — all heavy rasters converted to WebP via `scripts/optimize-images.mjs` (raster **18.5MB → 4.4MB**;
  building 2MB→110KB; chevron-family 1.9MB→82KB). **Clouds kept as PNG** (webp was bigger for soft alpha). Below-fold
  images lazy-load. To re-optimize after adding images: `node scripts/optimize-images.mjs` then swap refs to `.webp`.
- **Reveal-fires-at-load bug FIXED** (commit `1e8f885`) — section reveals were firing at page-load (the giant hero
  pin offset ScrollTrigger's position math) then freezing visible. Fix = `refreshPriority:1` on the hero pin +
  robust `ScrollTrigger.refresh()` schedule + converting some sections to `fromTo`+`immediateRender:false`.

## 4. IN-FLIGHT / NEXT WORK (prioritized)
### 4.1 VERIFY the reveal fix is real (HIGHEST — this is the founder's #1 recurring complaint)
The founder has said "no animations" repeatedly. The fix is committed but **must be verified visually + by an
arming test**: park each of ['services','stats','founders'] just below the viewport → its heading must be
opacity≈0 (ARMED), then scroll in → animates to 1. If ANY section still reports opacity 1 below the fold, convert
its `gsap.from(...{clearProps})` reveals to `gsap.fromTo(hidden, shown, {immediateRender:false})` (no clearProps) —
ChevronStrip/BuyerGroups already show the pattern. Don't declare it fixed until you SEE reveals on a fresh load.

### 4.2 Wordmark single-SVG (was in progress at handoff)
Founder wants: white outline sits on the building → building fades → letters fill with the building image, with the
**white outline never moving** (no muddy cross-dissolve middle). `Logo.tsx`'s `BrandWordmarkMask` is already
refactored (props `fillImageOpacity` + `fillGroupRef`; white rims render behind a unified `<g class="wm-fill-group">`).
**Remaining:** wire Hero.tsx to use ONE `BrandWordmarkMask` (pass `fillGroupRef` + `fillImageOpacity={0}`), DELETE
`BrandWordmarkOutline` + `outlineRef`, and in the timeline use TWO opacity controls: wordmark container opacity 0→1
at p0.44–0.54 (white rim appears over the risen building) and `fillGroupRef` opacity 0→1 at p0.54–0.68 (interior
fills while the building fades). Verify by screenshotting the hero at scrollY ≈ 0.5×10×vh and 0.66×10×vh.

### 4.3 Awwwards-grade reveal polish
Make reveals clearly VISIBLE/premium: masked per-word heading stagger (consider `npm i splittype`), blur(6px)→0 on
body copy, clip-path + scale + parallax on images. Tasteful but obvious — the founder must immediately see motion.

### 4.4 Mobile layout (founder: "phone is broken")
- **Hero building on mobile:** founder chose "size it up to fill the screen" (grounded, no float). Square image can't
  exceed a tall phone viewport without heavy zoom — make it bigger/fuller (~100–112vw width, grounded) OR wire a
  portrait mobile asset if the founder provides one.
- **ChevronStrip:** 4 wide panels are squished on phones — reflow to a 2×2 grid (or horizontal scroll) under ~640px.
- **Section headings get clipped** under the sticky navbar when scrolled to — add `scroll-margin-top` / top padding.
- Lighten HeroClouds layer count / blend on mobile for perf.

### 4.5 Branded preloader (founder requested)
Full-screen branded screen (company logo, `bonim-logo.webp`) that fades out when `document.fonts.ready` + the hero
building image are loaded, capped ~1.5s; reduced-motion safe; mount in `app/page.tsx`/layout. It masks initial load
(does NOT replace the real perf work, which is done).

### 4.6 Registration form has NO backend
`CtaFooter.tsx` `handleRegister` just `setSubmitted(true)` — leads go nowhere. Before real traffic, wire it to
Resend/Formspree/a Google Sheet/a Cloudflare Function. (Static export = no API routes, so use a 3rd-party endpoint.)

## 5. CRITICAL GOTCHAS / LESSONS
- **Worker subagents truncate constantly** mid-run (frontend-engineer, design-lead). Pattern that works: give tight
  briefs, tell them to **commit after EACH step**, then the CEO checks `git status`/`git log`, runs `tsc`+`build`,
  and finishes/commits whatever truncated. Don't trust a worker's "done" — verify git.
- **Playwright (headless) cannot reproduce mobile-toolbar float** (no svh/lvh dynamics) — reason about it, and test
  the real phone. The building float was a *mid-scroll* pan overshoot, NOT a rest-position issue — verify by
  scrolling, not just at rest.
- **Verify animations under `reducedMotion:'reduce'`** in tests (that's the founder's real machine state). Old diags
  forced `no-preference` and hid the bug.
- **Don't edit shared `Pill.tsx` / `TwoToneHeading` defaults.** Building PANS never scales; two-layer wrapper (outer
  centering, inner GSAP translateY). Keep `#register` form. GPU-only transforms. `progressRef` (no per-tick
  re-renders). tsc strict.
- **Memory:** project deploy facts saved at `~/.claude/projects/-Users-adamks-VibeCoding-realestate/memory/`
  (`bonim-atid-deploy.md`).

## 6. SUGGESTED OPENING MOVE FOR THE NEXT SESSION
"Continue the Bonim Atid landing page on `feat/hero-rebuild`. First check git state + finish/verify the in-flight
wordmark refactor (§4.2) and PROVE the reveal-on-scroll fix works (§4.1) with a fresh-load arming test. Then do the
mobile layout fixes (§4.4) and the preloader (§4.5), redeploy to bonimatid.pages.dev, and report. Dispatch workers
for code; verify their git output yourself because they truncate."
