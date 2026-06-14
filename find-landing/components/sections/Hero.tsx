'use client'

/**
 * Hero — Signature pinned scroll experience for בונים עתיד (Bonim Atid).
 *
 * v2 — FOUNDER DIRECTION CHANGES:
 *
 * 1. BUILDING — WIDER, HALF AT REST.
 *    Rendered at min(125vw, 1800px) wide so it bleeds off BOTH side edges.
 *    Positioned with top: 0 so the UPPER HALF of the building (penthouse,
 *    upper terraces) is visible at rest, with the lower half extending below
 *    the viewport fold.
 *
 * 2. BUILDING MOTION — CONSTANT-SIZE VERTICAL PAN (not a zoom).
 *    No scale animation. On scroll, the building translates UPWARD (negative Y)
 *    at fixed size — reveals progressively lower floors. Reads as "camera
 *    descending the facade". Pan range: 0 → ~-45vh.
 *
 * 3. SPACING — headline / subhead / CTA rhythm balanced.
 *    Generous, intentional gaps: headline → subhead → CTA.
 *
 * 4. CLOUDS — PERSIST + COLOR-BRIDGE INTO NEXT SECTION.
 *    Cloud veil STAYS at peak opacity (no thin-out at end). Stats section
 *    gets a cloud-white gradient top so the seam is invisible.
 *
 * Architecture unchanged:
 *   - progressRef (plain useRef<number>) — zero React re-renders per tick.
 *   - Single rAF in HeroClouds, cancelled on unmount.
 *   - GSAP context revert on cleanup.
 *   - @ts-expect-error CSS-var pattern preserved.
 *   - Reduced-motion: static composed end-state (persistent veil look, no pin/rAF).
 *   - RTL: fully centered — reads identically in dir=rtl and dir=ltr.
 *   - GPU: transform/opacity only; will-change toggled around pin.
 *
 * Two-layer building wrapper (CRITICAL — DO NOT COLLAPSE):
 *   OUTER  — absolute top-0 left-1/2, translateX(-50%). NEVER touched by GSAP.
 *   INNER  — buildingWrapRef. GSAP animates translateY ONLY.
 *
 * Motion timeline (scrub: true, pin +=230%):
 *   p 0.00       REST: building at pan start (top half visible), headline/subhead/CTA visible
 *   p 0.00–0.46  building pans UP (translateY 0 → -45vh), constant width/scale
 *   p 0.00–0.28  headline slot-roll cycles 3 Hebrew sentences
 *   p 0.14–0.22  subhead+CTA fade+lift out
 *   p 0.18–0.28  headline fade+lift out
 *   p 0.28–0.30  scroll nudge fades
 *   p 0.40–0.48  outline wordmark strokes in
 *   p ~0.50      HARD CUT: outline→0, fill→1
 *   p 0.50–0.58  brand micro-breath
 *   p 0.40–0.90  cloud bloom (driven by HeroClouds progressRef)
 *   p 0.55–0.75  nav fades out over cloud veil
 *   p 0.58–0.72  wordmark lifts into cloud bloom + fades
 *   p 0.72–1.00  veil STAYS at peak (no thin-out) — bridges into next section
 */

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { forwardRef, useRef, useState, useEffect, useCallback } from 'react'

import Pill from '@/components/ui/Pill'
import { BrandWordmarkMask } from '@/components/layout/Logo'
import { images } from '@/data/content'
import { useContent } from '@/components/providers/LanguageProvider'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'

// Dynamic import — HeroClouds (CSS/DOM) is client-only
const HeroClouds = dynamic(() => import('./HeroClouds'), { ssr: false })

// ─── Tuning constants ──────────────────────────────────────────────────────────
// Building is rendered at constant size — no scale animation.
// Pan range in vh: building translates from 0 → -BUILDING_PAN_VH on scroll.
// This reveals progressively lower floors as if the camera descends the facade.
const BUILDING_PAN_VH = 48  // desktop pan range in viewport-height units
const BUILDING_PAN_VH_MOBILE = 35  // mobile: smaller pan range (building is taller relative to viewport)

function getBuildingPanVH(): number {
  if (typeof window === 'undefined') return BUILDING_PAN_VH
  return window.innerWidth >= 1024 ? BUILDING_PAN_VH : BUILDING_PAN_VH_MOBILE
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  // 3-sentence slot-roll cycle. Guard against empty content.
  const cycle: readonly string[] =
    c.hero.cycle && c.hero.cycle.length > 0 ? c.hero.cycle : [c.hero.title]

  const sectionRef = useRef<HTMLElement>(null)
  // buildingWrapRef — GSAP animates translateY only (pan motion).
  const buildingWrapRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const slotTrackRef = useRef<HTMLDivElement>(null)
  const subCtaRef = useRef<HTMLDivElement>(null)
  const buildingImgRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const scrollNudgeRef = useRef<HTMLDivElement>(null)
  const buildingOuterRef = useRef<HTMLDivElement>(null)

  // Shared scroll progress — written by ScrollTrigger onUpdate, read by HeroClouds' rAF.
  // Plain ref: zero React re-renders per scroll tick.
  const progressRef = useRef<number>(0)

  // Slot height in pixels — measured by SlotRollHeadline's ResizeObserver.
  const [slotHeightPx, setSlotHeightPx] = useState<number>(0)

  // Client-side mount gate
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const handleSlotHeight = useCallback((px: number) => {
    setSlotHeightPx(px)
  }, [])

  // ── Pinned, scrubbed master timeline (motionOk only) ─────────────────────
  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk || !mounted) return

      const buildingWrap = buildingWrapRef.current
      const headline = headlineRef.current
      const slotTrack = slotTrackRef.current
      const subCta = subCtaRef.current
      const buildingImg = buildingImgRef.current
      const wordmark = wordmarkRef.current
      const outline = outlineRef.current
      const fill = fillRef.current
      const scrollNudge = scrollNudgeRef.current

      if (
        !buildingWrap || !headline || !slotTrack || !subCta ||
        !buildingImg || !wordmark || !outline || !fill
      ) return

      if (slotHeightPx === 0) return

      // ── REST state (p = 0) ───────────────────────────────────────────────
      // Building starts at translateY(0) — top of building aligned to top of viewport.
      // Top half of building visible; lower half extends below fold.
      gsap.set(buildingWrap, { y: 0 })
      gsap.set(buildingImg, { opacity: 1 })
      gsap.set(wordmark, { opacity: 1, scale: 0.96, y: 20 })
      gsap.set(outline, { opacity: 0 })
      // Hard cut — no CSS transition on fill.
      gsap.set(fill, { opacity: 0 })
      gsap.set(slotTrack, { yPercent: 0 })
      gsap.set([headline, subCta], { opacity: 1, y: 0 })
      if (scrollNudge) gsap.set(scrollNudge, { opacity: 0.45 })

      // Enable GPU compositing during the pin
      gsap.set(
        [buildingWrap, headline, slotTrack, subCta, wordmark, outline, fill],
        { willChange: 'transform, opacity' }
      )

      // Responsive pan range
      const panVH = getBuildingPanVH()
      const panPx = (window.innerHeight * panVH) / 100

      // ── Master scrubbed timeline ─────────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=230%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      // p 0.00–0.50  BUILDING PANS UP — constant size, translateY 0 → -panPx.
      // Extended to 0.50 (was 0.46) so wordmark emerges mid-pan — fills narrative void.
      tl.to(
        buildingWrap,
        { y: -panPx, duration: 0.50, ease: 'power2.out' },
        0
      )

      // Slot-roll cycling headline
      const lineCount = cycle.length
      if (lineCount > 1) {
        const totalSlots = lineCount - 1
        const endY = -(slotHeightPx * totalSlots)

        tl.fromTo(
          slotTrack,
          { y: 0 },
          {
            y: endY,
            duration: 0.24,  // spans p 0.04–0.28
            ease: 'none',
            modifiers: {
              y: (raw: string) => {
                const rawPx = parseFloat(raw)
                const progress = rawPx / endY
                const pos = progress * totalSlots
                const idx = Math.min(Math.floor(pos), totalSlots - 1)
                const frac = pos - idx
                const eased =
                  frac < 0.5
                    ? 4 * frac * frac * frac
                    : 1 - Math.pow(-2 * frac + 2, 3) / 2
                const resultPx = -((idx + eased) * slotHeightPx)
                return `${resultPx}px`
              },
            },
          },
          0.04
        )
      }

      // p 0.14–0.22  subhead+CTA: exits earlier — fully gone at 0.22.
      tl.to(subCta, { opacity: 0, y: -50, duration: 0.08, ease: 'power3.in' }, 0.14)

      // p 0.18–0.28  headline: fade+lift complete by ~p 0.28.
      tl.to(headline, { opacity: 0, y: -60, duration: 0.10, ease: 'power3.in' }, 0.18)

      // p 0.22–0.30  Scroll nudge fades with headline.
      if (scrollNudge) {
        tl.to(scrollNudge, { opacity: 0, duration: 0.08, ease: 'power2.in' }, 0.22)
      }

      // p 0.32–0.40  outline wordmark strokes in — moved from 0.40 to 0.32 to overlap
      // the building pan, filling the narrative dead zone and creating "wordmark emerges from building"
      tl.set(wordmark, { scale: 1, y: 0 }, 0.32)
      tl.to(outline, { opacity: 1, duration: 0.08, ease: 'power1.out' }, 0.32)

      // p ~0.50  HARD CUT: fill→1, outline→0, buildingImg→0 (steps(1)).
      tl.to(fill,        { opacity: 1, duration: 0.015, ease: 'steps(1)' }, 0.50)
      tl.to(outline,     { opacity: 0, duration: 0.015, ease: 'steps(1)' }, 0.50)
      tl.to(buildingImg, { opacity: 0, duration: 0.015, ease: 'steps(1)' }, 0.50)

      // p 0.50–0.58  brand micro-breath: 1 → 1.04 → settle with spring feel
      tl.to(wordmark, { scale: 1.04, duration: 0.04, ease: 'power2.out' }, 0.50)
      tl.to(wordmark, { scale: 1.02, duration: 0.04, ease: 'back.out(1.2)' }, 0.54)

      // p 0.58–0.72  wordmark lifts into the cloud bloom + fades
      tl.to(
        wordmark,
        { y: '-20%', scale: 1.08, opacity: 0, duration: 0.14, ease: 'power2.in' },
        0.58
      )

      // p 0.30–0.75  Nav fades out early — before building dominates the frame (moved from 0.55→0.30).
      // Also restore after pin. Contrast issue solved by fading nav away sooner.
      const nav = document.querySelector<HTMLElement>('nav, header[role="banner"]') ??
                  document.querySelector<HTMLElement>('[data-hero-nav]')
      if (nav) {
        tl.to(nav, { opacity: 0, duration: 0.20, ease: 'power2.in' }, 0.30)
        tl.to(nav, { opacity: 1, duration: 0.10, ease: 'power2.out' }, 0.75)
      }

      // Clean up will-change after the pin completes
      return () => {
        gsap.set(
          [buildingWrap, headline, slotTrack, subCta, wordmark, outline, fill],
          { willChange: 'auto' }
        )
        if (nav) gsap.set(nav, { opacity: 1 })
      }
    },
    [motionOk, mounted, cycle.length, slotHeightPx]
  )

  // ── Reduced-motion: clean composed fallback ──────────────────────────────
  // Sky gradient + soft cloud veil + headline + subhead + CTA. No animation.
  // White veil separates building from copy so neither layer collides visually.
  if (!motionOk) {
    return (
      <section
        id="hero"
        aria-label="Hero"
        className="relative flex min-h-screen w-full flex-col items-center overflow-hidden"
        style={{ paddingTop: 'clamp(10vh, 14vh, 18vh)' }}
      >
        <SkyGradient />
        {/* Building — pushed lower so sky is open above */}
        <div
          className="absolute left-1/2 z-[2]"
          style={{
            top: 'clamp(46vh, 52vh, 58vh)',
            width: 'min(125vw, 1800px)',
            transform: 'translateX(-50%)',
            backgroundColor: '#e8c49a',
            position: 'absolute',
          }}
          aria-hidden="true"
        >
          {/* Same warm-filter treatment as animated path for visual consistency */}
          <div style={{ display: 'block', lineHeight: 0, fontSize: 0, position: 'relative', zIndex: 1 }}>
            <Image
              src={images.heroBuildingCutout}
              alt="Modern glass residential tower with green terraces"
              width={1024}
              height={946}
              priority
              quality={90}
              className="block h-auto w-full select-none"
              style={{
                verticalAlign: 'top',
                display: 'block',
                filter: 'saturate(1.08) brightness(1.03) sepia(0.16) hue-rotate(-8deg) contrast(1.02)',
              }}
              sizes="(max-width: 768px) 125vw, 1800px"
            />
          </div>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background: 'linear-gradient(to top, rgba(255,165,80,0.42) 0%, rgba(255,190,110,0.28) 28%, rgba(255,210,140,0.10) 55%, transparent 78%)',
              WebkitMaskImage: `url(${images.heroBuildingCutout})`,
              WebkitMaskSize: '100% auto',
              WebkitMaskPosition: 'top center',
              WebkitMaskRepeat: 'no-repeat',
              maskImage: `url(${images.heroBuildingCutout})`,
              maskSize: '100% auto',
              maskPosition: 'top center',
              maskRepeat: 'no-repeat',
              mixBlendMode: 'soft-light' as const,
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              background: 'linear-gradient(to top, rgba(248,220,175,0.55) 0%, rgba(252,230,190,0.28) 12%, rgba(255,240,210,0.08) 28%, transparent 42%)',
              WebkitMaskImage: `url(${images.heroBuildingCutout})`,
              WebkitMaskSize: '100% auto',
              WebkitMaskPosition: 'top center',
              WebkitMaskRepeat: 'no-repeat',
              maskImage: `url(${images.heroBuildingCutout})`,
              maskSize: '100% auto',
              maskPosition: 'top center',
              maskRepeat: 'no-repeat',
              pointerEvents: 'none',
            }}
          />
        </div>
        {/* Cloud layer behind the veil */}
        {mounted && (
          <div className="absolute inset-0 z-[1]" aria-hidden="true">
            <HeroClouds progressRef={progressRef} active={false} />
          </div>
        )}
        {/* White veil — separates building + clouds from readable copy */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.80)' }}
        />
        {/* Copy stack — headline + subhead + CTA fully over sky */}
        <div className="relative z-[4] flex w-full flex-col items-center px-6 text-center gap-6">
          <h1
            className="font-bold text-[var(--color-ink)] leading-[0.95]"
            style={{
              fontFamily: 'var(--font-hebrew-display)',
              fontSize: 'clamp(2.25rem, 7vw, 6rem)',
              letterSpacing: '-0.02em',
            }}
          >
            {cycle[0]}
          </h1>
          <p
            className="font-light text-[var(--color-ink)]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              lineHeight: 1.6,
              opacity: 0.78,
              maxWidth: '640px',
            }}
          >
            {c.hero.subhead}
          </p>
          <div>
            <Pill variant="dark" href="#register" withArrow>
              {c.hero.cta}
            </Pill>
          </div>
        </div>
      </section>
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
      {/* 1. Sky gradient — zero JS, instant LCP */}
      <SkyGradient />

      {/* 2. HeroClouds BACK — behind building + wordmark. Visible throughout pin. */}
      {mounted && (
        <div className="absolute inset-0 z-[1]" aria-hidden="true">
          <HeroClouds progressRef={progressRef} active={motionOk} variant="back" />
        </div>
      )}

      {/* 3. Building — WIDER/PAN VERSION.
          OUTER: centering only (translateX(-50%)). top: ~46vh positions the building's
          ROOFLINE at ~46% from the viewport top, leaving the UPPER ~46% as OPEN SKY.
          The building fills the lower ~54% at rest; lower half extends well below fold.
          On scroll the INNER pans UP (GSAP translateY), revealing progressively lower floors.
          Width: min(125vw, 1800px) — bleeds off both side edges at all viewport sizes.
          Aspect ratio 1024:946 → height ≈ 0.924 × width.
          At 1800px wide: height ≈ 1662px ≈ 1.85× a 900px viewport.
          Rest: 0.46×900 = 414px from top. Bottom at 414+1662=2076px → entirely below fold.
          Pan –48vh: reveals mid-section and approaches ground-level base.
          Sky band ~46vh clears the full copy stack (paddingTop 10vh + headline ~13vh +
          gaps 4.5+4vh + subhead 3.5vh + CTA 5.5vh ≈ 40-41vh) with ~5-6vh breathing room. */}
      <div
        ref={buildingOuterRef}
        className="absolute left-1/2 z-[2]"
        style={{
          top: 'clamp(46vh, 52vh, 58vh)',
          width: 'min(125vw, 1800px)',
          transform: 'translateX(-50%)',
          margin: 0,
          padding: 0,
          // P1-D: fill warm sky color below the building during pan so no gap shows on mobile
          backgroundColor: '#e8c49a',
        }}
        aria-hidden="true"
      >
        {/* INNER: GSAP pan target — translateY only, no scale.
            ALL tint/glow/haze layers live INSIDE this div so they pan and are clipped
            with the building — they NEVER reach the sky above the outer wrapper. */}
        <div
          ref={buildingWrapRef}
          style={{ transformOrigin: 'center top', position: 'relative' }}
        >
          {/* Building image — warm filter tints only the opaque pixel of the PNG.
              CSS filter on <img> touches rendered pixels, NOT the transparent alpha channel,
              so the sky gradient behind is completely unaffected.
              saturate(1.08)  — lift colour vividness slightly
              brightness(1.03) — slight lift so warm cast reads bright, not muddy
              sepia(0.16)     — push grey concrete toward warm beige/amber
              hue-rotate(-8deg) — rotate remaining hues toward orange-peach
              contrast(1.02)  — micro-boost to keep shadow depth */}
          <div ref={buildingImgRef} style={{ display: 'block', lineHeight: 0, fontSize: 0, position: 'relative', zIndex: 1 }}>
            <Image
              src={images.heroBuildingCutout}
              alt="Modern glass residential tower with green terraces"
              width={1024}
              height={946}
              priority
              quality={90}
              className="block h-auto w-full select-none"
              style={{
                verticalAlign: 'top',
                display: 'block',
                filter: 'saturate(1.08) brightness(1.03) sepia(0.16) hue-rotate(-8deg) contrast(1.02)',
              }}
              sizes="(max-width: 768px) 125vw, 1800px"
            />
          </div>

          {/* Directional warm glow — soft-light amber gradient masked to the building silhouette.
              mask-image alpha-clips the gradient so it ONLY paints onto opaque building pixels.
              Gradient runs from warm amber at bottom (where sun rakes the facade) to transparent
              ~60% up, giving a natural low-angle golden-hour light direction.
              mix-blend-mode: soft-light warms the underlying facade without over-saturating.
              Lives inside buildingWrapRef → pans with building, clipped by outer wrapper → sky safe. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background:
                'linear-gradient(to top, rgba(255,165,80,0.42) 0%, rgba(255,190,110,0.28) 28%, rgba(255,210,140,0.10) 55%, transparent 78%)',
              WebkitMaskImage: `url(${images.heroBuildingCutout})`,
              WebkitMaskSize: '100% auto',
              WebkitMaskPosition: 'top center',
              WebkitMaskRepeat: 'no-repeat',
              maskImage: `url(${images.heroBuildingCutout})`,
              maskSize: '100% auto',
              maskPosition: 'top center',
              maskRepeat: 'no-repeat',
              mixBlendMode: 'soft-light' as const,
              pointerEvents: 'none',
            }}
          />

          {/* Base haze — warm atmospheric mist where building meets the bottom of frame.
              Reads as ground-level ambient glow / soft mist dissolving the base.
              Same mask as above → only touches building pixels, never the sky.
              No mix-blend-mode here — straight warm white dissolve for mist effect. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              background:
                'linear-gradient(to top, rgba(248,220,175,0.55) 0%, rgba(252,230,190,0.28) 12%, rgba(255,240,210,0.08) 28%, transparent 42%)',
              WebkitMaskImage: `url(${images.heroBuildingCutout})`,
              WebkitMaskSize: '100% auto',
              WebkitMaskPosition: 'top center',
              WebkitMaskRepeat: 'no-repeat',
              maskImage: `url(${images.heroBuildingCutout})`,
              maskSize: '100% auto',
              maskPosition: 'top center',
              maskRepeat: 'no-repeat',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* 4 + 5. Wordmark group — OUTLINE (p 0.40–0.50) then FILL (p 0.50+). */}
      <div
        ref={wordmarkRef}
        className="absolute inset-0 z-[3] flex items-center justify-center"
        style={{ transformOrigin: 'center center', textAlign: 'center' }}
        aria-hidden="true"
      >
        <div
          className="relative mx-auto w-full"
          style={{
            maxWidth: 'clamp(520px, 94vw, 1380px)',
            paddingLeft: 'clamp(8px, 1.5vw, 24px)',
            paddingRight: 'clamp(8px, 1.5vw, 24px)',
            // P2-G: nudge wordmark up slightly so it reads mid-sky, not low-building
            marginTop: '-5vh',
          }}
        >
          {/* Outline — thin white stroke over the panned building */}
          <div ref={outlineRef} className="absolute inset-0">
            <BrandWordmarkOutline />
          </div>
          {/* Fill — building image clipped to Hebrew letters.
              No CSS transition — hard cut via GSAP steps(1). */}
          <div ref={fillRef} style={{ transition: 'none' }}>
            <BrandWordmarkMask
              fillSrc={images.heroBuildingFill}
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>

      {/* 6. HeroClouds FRONT — blooms in over building + wordmark (p 0.45+).
          z-[3] overlaps wordmark group; under headline z-[4].
          Near-invisible at rest — headline fully legible. Stays at peak — no fade-out. */}
      {mounted && (
        <div className="absolute inset-0 z-[3]" aria-hidden="true">
          <HeroClouds progressRef={progressRef} active={motionOk} variant="front" />
        </div>
      )}

      {/* 7. Text stack — vertically + horizontally centred.
          v3 rest framing: building roofline at ~46vh (approach b), sky occupies top ~46%.
          paddingTop reduced to ~10vh (approach a) so the copy block sits higher in the sky.
          Stack bottom: 10vh + headline ~13vh + gap 4.5vh + subhead 3.5vh + gap 4vh + CTA 5.5vh
          ≈ 40-41vh — gives 5-6vh of clear sky between CTA bottom and the roofline at 46vh.
          Mobile (390×844): paddingTop 8vh, headline ~3.7vh, all gaps/text ≈ 27vh total.
          Roofline clamp min = 34vh → 7vh breathing room on mobile. Both clear. */}
      <div
        className="absolute inset-0 z-[4] flex flex-col items-center justify-start px-6 text-center"
        style={{ paddingTop: 'clamp(10vh, 14vh, 18vh)' }}
      >
        {/* Cycling headline */}
        <div ref={headlineRef} className="flex w-full flex-col items-center">
          <SlotRollHeadline
            ref={slotTrackRef}
            lines={cycle}
            onSlotHeight={handleSlotHeight}
          />
        </div>

        {/* Subhead + CTA — generous breathing room below headline */}
        <div
          ref={subCtaRef}
          className="flex w-full flex-col items-center"
          style={{ marginTop: 'clamp(2rem, 4.5vh, 3.5rem)' }}
        >
          <p
            className="font-light text-[var(--color-ink)]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              lineHeight: 1.6,
              opacity: 0.78,
              maxWidth: '640px',
            }}
          >
            {c.hero.subhead}
          </p>
          {/* CTA — comfortable gap below subhead */}
          <div style={{ marginTop: 'clamp(1.75rem, 4vh, 3rem)' }}>
            <Pill variant="dark" href="#register" withArrow>
              {c.hero.cta}
            </Pill>
          </div>
        </div>
      </div>

      {/* Scroll nudge — fades out with headline (gone by p~0.30).
          Positioned with explicit inline style for RTL-safe centering (P3-A).
          English "Scroll" label removed — vertical line alone reads clearly (P3-E). */}
      <div
        ref={scrollNudgeRef}
        className="pointer-events-none z-[4] flex flex-col items-center gap-2"
        aria-hidden="true"
        style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.45 }}
      >
        <div className="w-px h-8 bg-[var(--color-ink)] opacity-50" />
      </div>
    </section>
  )
}

// ─── Slot-roll headline ──────────────────────────────────────────────────────
// Clean masked vertical roll. See full comment in v1.

interface SlotRollHeadlineProps {
  lines: readonly string[]
  onSlotHeight?: (px: number) => void
}

const SlotRollHeadline = forwardRef<HTMLDivElement, SlotRollHeadlineProps>(
  function SlotRollHeadline({ lines, onSlotHeight }, trackRef) {
    const clipRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<Array<HTMLSpanElement | null>>([])
    const [clipPx, setClipPx] = useState<number | null>(null)

    const measureSlots = useCallback(() => {
      let max = 0
      for (const el of itemRefs.current) {
        if (!el) continue
        const h = el.scrollHeight
        if (h > max) max = h
      }
      if (max > 0) {
        setClipPx(max)
        onSlotHeight?.(max)
      }
    }, [onSlotHeight])

    useEffect(() => {
      measureSlots()
      const ro = new ResizeObserver(measureSlots)
      if (clipRef.current) ro.observe(clipRef.current)
      return () => ro.disconnect()
    }, [measureSlots])

    return (
      <div
        ref={clipRef}
        className="w-full overflow-hidden"
        style={clipPx != null ? { height: clipPx } : undefined}
        aria-label={lines[0]}
      >
        <div ref={trackRef} className="flex flex-col will-change-transform">
          {lines.map((line, i) => (
            <span
              key={`${i}-${line}`}
              ref={(node) => { itemRefs.current[i] = node }}
              aria-hidden={i === 0 ? undefined : 'true'}
              className="flex shrink-0 items-center justify-center font-bold text-[var(--color-ink)] w-full text-center"
              style={{
                height: clipPx != null ? clipPx : 'auto',
                minHeight: 'clamp(2.5rem, 8vw, 7.5rem)',
                fontFamily: 'var(--font-hebrew-display)',
                fontSize: 'clamp(2.5rem, 8vw, 7.5rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                paddingTop: '0.15em',
                paddingBottom: '0.15em',
                boxSizing: 'border-box',
                // P2-E: soft white halo lifts headline off building facade
                textShadow: '0 2px 14px rgba(255,255,255,0.50)',
              }}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
    )
  }
)

// ─── Sky gradient ─────────────────────────────────────────────────────────────
// Cinematic late-afternoon sky. Warm amber/peach band pushed into 44-75% range
// so warmth reads ABOVE the roofline, not hidden under the building.
function SkyGradient() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0"
      style={{
        background:
          'linear-gradient(to bottom, #8cb4cf 0%, #a5c3dc 14%, #bdd1e4 28%, #c4b5a8 44%, #d4a07a 60%, #e0b28a 75%, #ecbf94 88%, #f2c89e 100%)',
      }}
    />
  )
}

// ─── "בונים עתיד" outline wordmark ──────────────────────────────────────────
function BrandWordmarkOutline() {
  return (
    <svg
      viewBox="0 0 720 175"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="בונים עתיד"
      className="block h-auto w-full"
      overflow="visible"
      preserveAspectRatio="xMidYMid meet"
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        direction="rtl"
        fontFamily="var(--font-hebrew), system-ui, sans-serif"
        fontWeight="800"
        fontSize="138"
        letterSpacing="-2"
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.5}
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.4))' }}
      >
        בונים עתיד
      </text>
    </svg>
  )
}
