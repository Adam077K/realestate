'use client'

/**
 * Hero - Signature pinned scroll experience for בונים עתיד (Bonim Atid).
 *
 * BATCH 7 REWRITE - reference arc (findrealestate.com style):
 *
 * 1. REST: building top-flush at bottom; ONE static headline + subhead + CTA
 *    centered over the sky. No cycling.
 *
 * 2. RISE: building pans UP (power2.inOut). Headline+subhead+CTA fade out as
 *    the rising building covers them.
 *
 * 3. OUTLINE (LONG HOLD): "בונים עתיד / וובינר" outline strokes in over the
 *    risen building and holds - this beat is deliberately long.
 *
 * 4. IMAGE-FILL: building image fades; outline fades; fill wordmark fades in.
 *    The image-filled wordmark floats in sky/clouds.
 *
 * 5. WHITE MASK RISES: cloud-edged white veil climbs from BOTTOM upward,
 *    covers the wordmark, and flows continuously into RewiredSteps below.
 *
 * Architecture:
 *   - progressRef (plain useRef<number>) - zero React re-renders per tick.
 *   - Single rAF in HeroClouds, cancelled on unmount.
 *   - GSAP context revert on cleanup.
 *   - Reduced-motion: single static headline + subhead + CTA + building. No stats.
 *   - RTL: fully centered - reads identically in dir=rtl and dir=ltr.
 *   - GPU: transform/opacity only; will-change toggled around pin.
 *
 * Two-layer building wrapper (CRITICAL - DO NOT COLLAPSE):
 *   OUTER  - absolute left-1/2, translateX(-50%). NEVER touched by GSAP.
 *   INNER  - buildingWrapRef. GSAP animates translateY ONLY.
 *
 * Motion timeline (scrub: 0.8, pin +=1000%, constant-velocity LINEAR scrub):
 *   p 0.00–0.06  scroll nudge fades (ease:none)
 *   p 0.06–0.44  building pans up -panPx (ease:none = LINEAR, even velocity)
 *   p 0.10–0.24  headline+subhead+CTA group fades out (ease:none)
 *   p 0.40–0.50  wordmark settles scale→1 y→0 (ease:none)
 *   p 0.44–0.54  outline fades in + strokes draw (ease:none, stretched)
 *   p 0.54–0.68  cross-dissolve: buildingImg 1→0; outline 1→0; fill 0→1 (ease:none, 0.14 wide)
 *   p 0.66–0.90  wordmark presence - slow drift y:'-3%' scale:1.035 (ease:none, ~40% longer beat)
 *   p 0.90–1.00  release into white: wordmark fades+lifts; veil rises y:40vh→0 (power1.in)
 *
 * HeroClouds front veil: bloom starts p≈0.90 (synced in HeroClouds.tsx)
 * Cloud veil starts at y:'40vh' (pushed below frame) and pans to y:0 across
 * p0.86–1.0, driven by GSAP on cloudFrontVeilRef. This makes the white mask
 * appear to RISE from the bottom into the wordmark.
 */

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRef, useState, useEffect, type RefObject } from 'react'

import Pill from '@/components/ui/Pill'
import { BrandWordmarkMask } from '@/components/layout/Logo'
import { images } from '@/data/content'
import { useContent } from '@/components/providers/LanguageProvider'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'

// Dynamic import - HeroClouds (CSS/DOM) is client-only
const HeroClouds = dynamic(() => import('./HeroClouds'), { ssr: false })

// ─── Tuning constants ──────────────────────────────────────────────────────────
const BUILDING_PAN_VH = 92
const BUILDING_PAN_VH_MOBILE = 48

function getBuildingPanVH(): number {
  if (typeof window === 'undefined') return BUILDING_PAN_VH
  return window.innerWidth >= 1024 ? BUILDING_PAN_VH : BUILDING_PAN_VH_MOBILE
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  const sectionRef       = useRef<HTMLElement>(null)
  const buildingWrapRef  = useRef<HTMLDivElement>(null)
  const buildingOuterRef = useRef<HTMLDivElement>(null)
  const buildingImgRef   = useRef<HTMLDivElement>(null)
  const copyGroupRef     = useRef<HTMLDivElement>(null)   // headline + subhead + CTA as one unit
  const wordmarkRef      = useRef<HTMLDivElement>(null)
  // fillGroupRef — targets the <g className="wm-fill-group"> inside BrandWordmarkMask.
  // GSAP tweens its opacity 0→1 during the cross-dissolve beat.
  const fillGroupRef     = useRef<SVGGElement>(null)
  // outlineRef — targets the <g className="wm-outline-group"> inside BrandWordmarkMask.
  // GSAP animates the clip-path wipe draw-in, then fades opacity 1→0 after fill.
  const outlineRef       = useRef<SVGGElement>(null)
  const scrollNudgeRef   = useRef<HTMLDivElement>(null)
  // cloudFrontVeilRef - forwarded to HeroClouds front-variant veil div.
  // GSAP animates translateY: 40vh→0 for the rising white mask effect.
  const cloudFrontVeilRef = useRef<HTMLDivElement>(null)

  // Shared scroll progress - plain ref, zero React re-renders per scroll tick.
  const progressRef = useRef<number>(0)

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // ── Building-float fix: measure rendered building height and clamp outer top ─
  // Guarantees buildingTop + buildingHeight >= viewportHeight at every viewport
  // (including tall/narrow phones where the 1:1 image is short relative to vh).
  useEffect(() => {
    const outer = buildingOuterRef.current
    const img   = outer?.querySelector('img') as HTMLImageElement | null
    if (!outer || !img) return

    const compute = () => {
      const vhPx        = window.innerHeight
      // restTopPx mirrors the CSS clamp(55vh,59vh,63vh)
      const restTopPx   = Math.min(0.63 * vhPx, Math.max(0.55 * vhPx, 0.59 * vhPx))
      const buildingH   = img.getBoundingClientRect().height
      // Push outer DOWN when the (short, width-sized) building wouldn't otherwise
      // reach the bottom — so the base is ALWAYS at/below the viewport bottom (no float).
      // max(): on desktop vhPx-buildingH is negative so restTop governs (only crown shows);
      // on tall/narrow viewports it pushes the building down until its base meets the bottom.
      const clampedTop  = Math.max(restTopPx, vhPx - buildingH)
      outer.style.top   = `${clampedTop}px`
    }

    // Wait for image to be fully laid out before measuring
    if (img.complete) {
      compute()
    } else {
      img.addEventListener('load', compute, { once: true })
    }

    // Re-compute on resize (debounced via rAF)
    let rafId = 0
    const onResize = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        compute()
        // Refresh GSAP ScrollTrigger so pin recalculates with new outer top
        import('@/lib/gsap').then(({ ScrollTrigger }) => {
          ScrollTrigger.refresh()
        }).catch(() => {})
      })
    }

    window.addEventListener('resize', onResize)
    // Mobile browsers change window.innerHeight when the address bar shows/hides
    // without firing a normal 'resize' event. visualViewport fires 'resize' for this.
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onResize)
    }
    return () => {
      window.removeEventListener('resize', onResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onResize)
      }
      cancelAnimationFrame(rafId)
    }
  }, [mounted]) // re-run once mounted so ref is available

  // ── Pinned, scrubbed master timeline (motionOk only) ─────────────────────
  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk || !mounted) return

      const buildingWrap = buildingWrapRef.current
      const copyGroup    = copyGroupRef.current
      const buildingImg  = buildingImgRef.current
      const wordmark     = wordmarkRef.current
      const fillGroup    = fillGroupRef.current
      const outline      = outlineRef.current
      const scrollNudge  = scrollNudgeRef.current
      const cloudVeil    = cloudFrontVeilRef.current

      if (!buildingWrap || !copyGroup || !buildingImg || !wordmark) return

      // ── REST state (p = 0) ───────────────────────────────────────────────
      gsap.set(buildingWrap, { y: 0 })
      gsap.set(buildingImg,  { opacity: 1 })
      // fillGroup starts transparent — outline shows through transparent interiors.
      if (fillGroup) gsap.set(fillGroup, { opacity: 0 })
      // outlineGroup starts with clip-path fully concealing it (draw-in starts at p0.42).
      // inset(0 0 0 100%) = fully clipped from left side → reveal right-to-left (RTL reading start).
      if (outline) gsap.set(outline, { clipPath: 'inset(0 0 0 100%)', opacity: 1 })
      gsap.set(copyGroup,    { opacity: 1, y: 0 })
      // Wordmark (entire SVG container) starts hidden at rest; appears at p0.42
      gsap.set(wordmark,     { opacity: 0, scale: 0.96, y: 20 })
      if (scrollNudge) gsap.set(scrollNudge, { opacity: 0.45 })
      // Cloud veil starts pushed BELOW the frame (40vh down). GSAP pans it up p0.90–1.0.
      if (cloudVeil) gsap.set(cloudVeil, { y: '40vh' })

      // Enable GPU compositing during the pin
      const willChangeTargets: (Element | null)[] = [
        buildingWrap, copyGroup, wordmark,
      ]
      if (fillGroup) willChangeTargets.push(fillGroup as unknown as Element)
      if (outline) willChangeTargets.push(outline as unknown as Element)
      if (cloudVeil) willChangeTargets.push(cloudVeil)
      gsap.set(willChangeTargets.filter(Boolean) as Element[], { willChange: 'transform, opacity' })

      // ── GROUNDED pan distance (fixes "building floats in mid-air") ──────────
      // The building must rise ONLY until its base reaches the viewport bottom —
      // a fully-revealed, GROUNDED tower. A fixed vh-based pan overshot and lifted
      // the base off the bottom, leaving sky beneath it (the float bug). Derive the
      // pan from the real building geometry (same math as the rest-position clamp)
      // and never lift past base-at-bottom. GROUND_BLEED keeps the base a hair below
      // the fold so sub-pixel rounding can never reopen a gap.
      const GROUND_BLEED = 22
      const vhNow      = window.innerHeight
      const bImgEl     = buildingImg.querySelector('img') as HTMLImageElement | null
      const bH         = bImgEl ? bImgEl.getBoundingClientRect().height : vhNow
      const restTopNow = Math.min(0.63 * vhNow, Math.max(0.55 * vhNow, 0.59 * vhNow))
      const baseAtRest = Math.max(restTopNow, vhNow - bH) + bH // matches compute() clamp
      // On short (phone) viewports baseAtRest≈vh → pan≈0 (building stays grounded, no float).
      // On desktop the building is taller than vh → pan lifts the base up to the bottom.
      const panPx      = Math.max(0, baseAtRest - vhNow - GROUND_BLEED)

      // ── Master scrubbed timeline (pin +=1000%) ──────────────────────────
      // P4: scrub:0.8 → scrub:true — removes GSAP's internal smoothing loop that
      // was fighting Lenis's lerp (double-smoothing = laggy tail). Timeline eases
      // are already ease:'none' so the motion curve is unchanged.
      // refreshPriority: 1 → this pinned trigger MUST refresh before all other triggers
      // so the pin-spacer (10×vh tall) is accounted for when sibling section triggers
      // compute their start positions. Without this every section below the fold
      // thinks it's already in view on load (they fire immediately and clearProps
      // leaves them permanently visible).
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=1000%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          refreshPriority: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      // ── CONSTANT-VELOCITY BEAT TABLE (all ease:'none' — even velocity, one smooth flow) ──

      // p 0.00–0.06  Scroll nudge fades immediately on first scroll input
      if (scrollNudge) {
        tl.to(scrollNudge, { opacity: 0, duration: 0.06, ease: 'none' }, 0.00)
      }

      // p 0.06–0.42  BUILDING PANS UP - LINEAR (even velocity, no slow-fast-slow)
      tl.to(buildingWrap, { y: -panPx, duration: 0.36, ease: 'none' }, 0.06)

      // p 0.10–0.24  COPY GROUP FADES OUT - fades as building rises over it
      tl.to(copyGroup, { opacity: 0, y: -40, duration: 0.14, ease: 'none' }, 0.10)

      // ~p 0.42  Wordmark container appears (quick settle) and outline begins drawing
      tl.to(wordmark, { opacity: 1, scale: 1, y: 0, duration: 0.04, ease: 'none' }, 0.42)

      // p 0.42–0.56  OUTLINE DRAWS IN - clip-path wipe reveals right→left (RTL reading direction)
      //   The stroked hollow text sweeps in from the right side (reading start in RTL).
      //   fillGroup stays at opacity:0 → letter interiors are transparent, building shows through.
      //   This is the "pen drawing" effect: a clean premium line-draw reveal.
      if (outline) {
        // Animate from inset(0 0 0 100%) → inset(0 0 0 0%): sweeps open left→right revealing RTL text
        // from the right side (Hebrew reading start) first.
        tl.to(outline, { clipPath: 'inset(0 0 0 0%)', duration: 0.14, ease: 'none' }, 0.42)
      }

      // p 0.56–0.70  IMAGE FILLS + BUILDING FADES:
      //   fillGroup: 0→1  (building texture floods letter interiors)
      //   buildingImg: 1→0  (building photo behind fades — letters float in open sky)
      tl.to(buildingImg, { opacity: 0, duration: 0.14, ease: 'none' }, 0.56)
      if (fillGroup) {
        tl.to(fillGroup, { opacity: 1, duration: 0.14, ease: 'none' }, 0.56)
      }

      // p 0.66–0.74  REMOVE OUTLINE — white stroke fades once interiors are mostly filled.
      //   Clean image-filled letters with NO white rim: the premium settled state.
      if (outline) {
        tl.to(outline, { opacity: 0, duration: 0.08, ease: 'none' }, 0.66)
      }

      // p 0.74–0.90  WORDMARK PRESENCE - slow continuous drift.
      //   Every scroll tick changes something (wordmark slowly drifts + scale-creep).
      tl.to(wordmark, { y: '-3%', scale: 1.035, duration: 0.16, ease: 'none' }, 0.74)

      // p 0.90–1.00  RELEASE INTO WHITE:
      //   cloudVeil → y:'0vh' (power1.in - ONE eased beat so white arrives decisively)
      //   wordmark  → opacity:0, y:'-10%', scale:1.06 (ease:'none')
      // Veil must be FULLY covering screen at p=1.0.
      tl.to(wordmark, { opacity: 0, y: '-10%', scale: 1.06, duration: 0.10, ease: 'none' }, 0.90)
      if (cloudVeil) {
        tl.to(cloudVeil, { y: '0vh', duration: 0.10, ease: 'power1.in' }, 0.90)
      }

      // Clean up will-change after pin
      return () => {
        gsap.set(willChangeTargets.filter(Boolean) as Element[], { willChange: 'auto' })
        if (cloudVeil) gsap.set(cloudVeil, { y: '0vh' })
      }
    },
    [motionOk, mounted]  // eslint-disable-line react-hooks/exhaustive-deps
  )

  // ── Reduced-motion: single static headline + subhead + CTA + building ───
  if (!motionOk) {
    return (
      <ReducedMotionHero
        mounted={mounted}
        progressRef={progressRef}
        c={c}
      />
    )
  }

  // ── Full animated experience ──────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Hero"
      className="relative w-full overflow-hidden"
      style={{ height: '100svh' }}
    >
      {/* 1. Sky gradient */}
      <SkyGradient />

      {/* 2. HeroClouds BACK - FAR + MID bands, behind building. */}
      {mounted && (
        <div className="absolute inset-0 z-[1]" aria-hidden="true">
          <HeroClouds progressRef={progressRef} active={motionOk} variant="back" />
        </div>
      )}

      {/* 3. Building - two-layer wrapper (CRITICAL: outer centering-only, inner GSAP pan target).
          Building starts with only its TOP visible (bottom-flush to viewport bottom at rest).
          z-[3] so it occludes the copy group (z-[2]) as it rises (A7).
          NOTE: top is set by JS (applyBuildingTop) after mount to guarantee
          buildingTop + buildingHeight >= viewportHeight at every viewport. The CSS
          clamp is the SSR/fallback value; JS overrides it once the image is measured. */}
      <div
        ref={buildingOuterRef}
        className="absolute left-1/2 z-[3] w-[112vw] max-w-none md:w-[min(78vw,1140px)]"
        style={{
          top: 'clamp(55vh, 59vh, 63vh)',
          transform: 'translateX(-50%)',
          margin: 0,
          padding: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <div
          ref={buildingWrapRef}
          style={{ transformOrigin: 'center top', position: 'relative' }}
        >
          <div ref={buildingImgRef} style={{ display: 'block', lineHeight: 0, fontSize: 0, position: 'relative', zIndex: 1 }}>
            <Image
              src={images.heroBuildingCutout}
              alt="Modern residential tower at golden hour"
              width={1024}
              height={1024}
              priority
              quality={90}
              className="block h-auto w-full select-none"
              style={{
                verticalAlign: 'top',
                display: 'block',
                filter: 'saturate(1.02) contrast(1.02)',
              }}
              sizes="(max-width: 767px) 112vw, 1140px"
            />
          </div>

        </div>
      </div>

      {/* 4. Wordmark group - z-[5], centered (above building z-[3], below veil z-[6]).
          Single BrandWordmarkMask — white rim is always rendered in the SVG.
          fillGroupRef targets the inner <g> whose opacity GSAP tweens 0→1.
          Stage 1 (p0.44–0.54): container fades in → white rim visible, interiors transparent.
          Stage 2 (p0.54–0.68): fillGroup fades to opacity 1 → building texture fills letters.
          White rim never moves → no shift, no misalign. */}
      <div
        ref={wordmarkRef}
        className="absolute inset-0 z-[5] flex items-center justify-center"
        style={{ transformOrigin: 'center center', textAlign: 'center' }}
        aria-hidden="true"
      >
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: 'clamp(350px, 64vw, 915px)',
            paddingLeft: 'clamp(8px, 1.5vw, 24px)',
            paddingRight: 'clamp(8px, 1.5vw, 24px)',
          }}
        >
          <BrandWordmarkMask
            fillSrc={images.heroBuildingFill}
            subWord="וובינר"
            fillGroupRef={fillGroupRef}
            outlineRef={outlineRef}
            fillImageOpacity={0}
            className="block h-auto w-full"
          />
        </div>
      </div>

      {/* 5. HeroClouds FRONT - white mask that rises from the bottom at p≈0.86.
          veilRef forwarded so GSAP can drive y:40vh→0 (mask rises into frame).
          z-[6] above wordmark z-[5] - veil fully covers it as it rises. */}
      {mounted && (
        <div className="absolute inset-0 z-[6]" aria-hidden="true">
          <HeroClouds
            progressRef={progressRef}
            active={motionOk}
            variant="front"
            veilRef={cloudFrontVeilRef}
          />
        </div>
      )}

      {/* 6. Copy group - headline + subhead + CTA centered over the sky at rest.
          z-[2] so the rising building (z-[3]) occludes it as it pans up (A7).
          paddingBottom shifts copy above dead-center (A6).
          GSAP fades the whole group out (opacity→0, y→-40) as the building rises. */}
      <div
        className="absolute inset-0 z-[2] flex flex-col items-center justify-center px-6 text-center pointer-events-none"
        style={{ paddingBottom: 'clamp(10vh, 14vh, 18vh)' }}
      >
        <div ref={copyGroupRef} className="w-full flex flex-col items-center pointer-events-auto">
          {/* Editorial eyebrow — flanked hairlines, ink, spaced caps */}
          <div
            className="flex items-center gap-3 mb-4"
            aria-hidden="true"
          >
            <span style={{ display: 'block', width: 40, height: 1, background: 'rgba(0,0,0,0.3)' }} />
            <span
              style={{
                fontFamily: 'var(--font-hebrew)',
                fontSize: 'clamp(1.05rem, 1.9vw, 1.3rem)',
                fontWeight: 600,
                letterSpacing: '0.22em',
                color: '#111',
                textShadow: '0 1px 8px rgba(255,255,255,0.5)',
                lineHeight: 1,
              }}
            >
              וובינר
            </span>
            <span style={{ display: 'block', width: 40, height: 1, background: 'rgba(0,0,0,0.3)' }} />
          </div>
          <h1
            className="font-bold"
            style={{
              fontFamily: 'var(--font-hebrew-display)',
              fontSize: 'clamp(2.35rem, 8.5vw, 5.6rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: '#000000',
              whiteSpace: 'pre-line',
              textWrap: 'balance',
              textShadow: '0 1px 12px rgba(255,255,255,0.6)',
            }}
          >
            {c.hero.title}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(0.82rem, 2.2vw, 1.4rem)',
              fontWeight: 300,
              lineHeight: 1.65,
              letterSpacing: '0.005em',
              whiteSpace: 'normal',
              maxWidth: 'clamp(280px, 72vw, 860px)',
              color: '#000000',
              textAlign: 'center',
              marginTop: 'clamp(0.6rem, 1.6vh, 1.2rem)',
              textShadow: '0 1px 8px rgba(255,255,255,0.55)',
            }}
          >
            {c.hero.subhead}
          </p>

          <div style={{ marginTop: 'clamp(1rem, 2.5vh, 1.75rem)' }} className="flex items-center justify-center gap-3">
            <Pill variant="dark" href="#register" className="text-sm px-5 py-3 min-h-[42px] !bg-black text-white">
              {c.hero.cta}
            </Pill>
            <span aria-hidden="true" className="shrink-0 inline-flex items-center justify-center rounded-full overflow-hidden h-[46px] w-[46px] ring-1 ring-black/10 shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
              <Image src="/images/logos/zoom.png" alt="" width={46} height={46} className="h-full w-full object-cover scale-[1.14]" />
            </span>
          </div>
        </div>
      </div>

      {/* Scroll nudge - z-[6] matches veil level so it never gets buried */}
      <div
        ref={scrollNudgeRef}
        className="pointer-events-none z-[6] flex flex-col items-center gap-2"
        aria-hidden="true"
        style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.45 }}
      >
        <div className="w-px h-8 bg-black/40" />
      </div>

      {/* A9 - Thin high cloud line: always-visible wispy cirrus strip near top of viewport.
          z-[4]: above back-clouds (z-[1]), below wordmark (z-[5]). GPU: opacity + transform only. */}
      <div className="absolute inset-0 z-[4] pointer-events-none" aria-hidden="true">
        {/* Wisp A - drifts slowly left */}
        <img
          src="/images/clouds/cloud-7.png"
          alt=""
          role="presentation"
          draggable={false}
          style={{
            position: 'absolute',
            top: '3%',
            left: '-10%',
            width: 'clamp(480px, 70vw, 1100px)',
            height: 'auto',
            opacity: 0.28,
            // Reverted: screen blend mode required — grayscale wisps over a light
            // sky with 'normal' blend cast a grey wash over the building below.
            mixBlendMode: 'screen',
            filter: 'saturate(0) brightness(1.6)',
            animation: 'hc-drift-a 137s ease-in-out -22s infinite',
            willChange: 'transform',
            // @ts-expect-error CSS custom props
            '--cov-scale': '1',
            '--cov-ty': '0vh',
            '--cov-tx': '0vw',
          }}
        />
        {/* Wisp B - drifts slowly right, slightly higher */}
        <img
          src="/images/clouds/cloud-7.png"
          alt=""
          role="presentation"
          draggable={false}
          style={{
            position: 'absolute',
            top: '6%',
            left: '38%',
            width: 'clamp(400px, 58vw, 900px)',
            height: 'auto',
            opacity: 0.22,
            // Reverted: screen blend mode required for wisp B — same grey-wash
            // issue as wisp A; grayscale images must use screen over the building.
            mixBlendMode: 'screen',
            filter: 'saturate(0) brightness(1.7) scaleX(-1)',
            transform: 'scaleX(-1)',
            animation: 'hc-drift-b 151s ease-in-out -68s infinite',
            willChange: 'transform',
            // @ts-expect-error CSS custom props
            '--cov-scale': '1',
            '--cov-ty': '0vh',
            '--cov-tx': '0vw',
          }}
        />
      </div>
    </section>
  )
}

// ─── Sky gradient ─────────────────────────────────────────────────────────────
function SkyGradient() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0"
      style={{
        background:
          'linear-gradient(to bottom, #2e4878 0%, #3d5a8a 8%, #4d6e9c 18%, #7a90b4 30%, #9aaec6 42%, #b4c6d8 54%, #c6d4e4 66%, #d4dded 78%, #dde6f0 88%, #e6eef5 100%)',
      }}
    />
  )
}

// ─── Reduced-motion hero ──────────────────────────────────────────────────────
interface ReducedMotionHeroProps {
  mounted: boolean
  progressRef: RefObject<number>
  c: ReturnType<typeof useContent>
}

function ReducedMotionHero({ mounted, progressRef, c }: ReducedMotionHeroProps) {
  const buildingOuterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = buildingOuterRef.current
    if (!outer) return
    const img = outer.querySelector('img') as HTMLImageElement | null
    if (!img) return

    const compute = () => {
      const vhPx      = window.innerHeight
      const restTopPx = Math.min(0.63 * vhPx, Math.max(0.55 * vhPx, 0.59 * vhPx))
      const buildingH = img.getBoundingClientRect().height
      const clampedTop = Math.max(restTopPx, vhPx - buildingH)
      outer.style.top = `${clampedTop}px`
    }

    if (img.complete) {
      compute()
    } else {
      img.addEventListener('load', compute, { once: true })
    }

    let rafId = 0
    const onResize = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(compute)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
      style={{ paddingTop: 'clamp(8vh, 10vh, 14vh)' }}
    >
      <SkyGradient />
      {/* Building */}
      <div
        ref={buildingOuterRef}
        className="absolute left-1/2 z-[2] w-[112vw] max-w-none md:w-[min(78vw,1140px)]"
        style={{
          top: 'clamp(55vh, 59vh, 63vh)',
          transform: 'translateX(-50%)',
        }}
        aria-hidden="true"
      >
        <div style={{ display: 'block', lineHeight: 0, fontSize: 0, position: 'relative', zIndex: 1 }}>
          <Image
            src={images.heroBuildingCutout}
            alt="Modern residential tower at golden hour"
            width={1024}
            height={1024}
            priority
            quality={90}
            className="block h-auto w-full select-none"
            style={{
              verticalAlign: 'top',
              display: 'block',
              filter: 'saturate(1.02) contrast(1.02)',
            }}
            sizes="(max-width: 767px) 112vw, 1140px"
          />
        </div>
        {/* Warm rim light */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'linear-gradient(to bottom, rgba(255,220,180,0.18) 0%, rgba(255,230,190,0.10) 30%, transparent 60%)',
            WebkitMaskImage: `url(${images.heroBuildingCutout})`,
            WebkitMaskSize: '100% auto', WebkitMaskPosition: 'top center', WebkitMaskRepeat: 'no-repeat',
            maskImage: `url(${images.heroBuildingCutout})`,
            maskSize: '100% auto', maskPosition: 'top center', maskRepeat: 'no-repeat',
            mixBlendMode: 'soft-light' as const, pointerEvents: 'none',
          }}
        />
      </div>
      {/* Cloud layer */}
      {mounted && (
        <div className="absolute inset-0 z-[1]" aria-hidden="true">
          <HeroClouds progressRef={progressRef} active={false} />
        </div>
      )}
      {/* Cool dusk veil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{ background: 'rgba(228,235,246,0.82)' }}
      />
      {/* Copy stack - upward-biased via paddingBottom */}
      <div
        className="relative z-[4] flex w-full flex-col items-center px-6 text-center gap-6"
        style={{ paddingBottom: 'clamp(10vh, 14vh, 18vh)' }}
      >
        {/* Editorial eyebrow — reduced-motion path */}
        <div className="flex items-center gap-3" aria-hidden="true">
          <span style={{ display: 'block', width: 40, height: 1, background: 'rgba(0,0,0,0.3)' }} />
          <span
            style={{
              fontFamily: 'var(--font-hebrew)',
              fontSize: 'clamp(1.05rem, 1.9vw, 1.3rem)',
              fontWeight: 600,
              letterSpacing: '0.22em',
              color: '#111',
              textShadow: '0 1px 8px rgba(255,255,255,0.5)',
              lineHeight: 1,
            }}
          >
            וובינר
          </span>
          <span style={{ display: 'block', width: 40, height: 1, background: 'rgba(0,0,0,0.3)' }} />
        </div>
        <h1
          className="font-bold leading-[0.95]"
          style={{
            fontFamily: 'var(--font-hebrew-display)',
            fontSize: 'clamp(2.35rem, 8.5vw, 5.6rem)',
            letterSpacing: '-0.03em',
            color: '#000000',
            whiteSpace: 'pre-line',
            textWrap: 'balance',
            textShadow: '0 1px 12px rgba(255,255,255,0.6)',
          }}
        >
          {c.hero.title}
        </h1>
        <p
          className="font-light"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.82rem, 2.2vw, 1.4rem)',
            lineHeight: 1.65,
            color: '#000000',
            whiteSpace: 'normal',
            maxWidth: 'clamp(280px, 72vw, 860px)',
            textShadow: '0 1px 8px rgba(255,255,255,0.55)',
          }}
        >
          {c.hero.subhead}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Pill variant="dark" href="#register" className="text-sm px-5 py-3 min-h-[42px] !bg-black text-white">
            {c.hero.cta}
          </Pill>
          <span aria-hidden="true" className="shrink-0 inline-flex items-center justify-center rounded-full overflow-hidden h-[46px] w-[46px] ring-1 ring-black/10 shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
            <Image src="/images/logos/zoom.png" alt="" width={46} height={46} className="h-full w-full object-cover scale-[1.14]" />
          </span>
        </div>
      </div>
    </section>
  )
}

