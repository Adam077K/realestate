'use client'

/**
 * Hero — Signature pinned scroll experience for בונים עתיד (Bonim Atid).
 *
 * BATCH 5 CHANGES:
 *
 * 1+2. INSTANT/SIMULTANEOUS SCROLL + FULL-RISE CYCLE — building pan starts at p0.0
 *      (was 0.10), slot-roll cycle starts at p0.0 (was 0.06), both span ~0.60–0.62.
 *      The 3-state headline completes across the full building-rise window. Internal
 *      transition map re-budgeted: sentence holds evenly spread so each reads clearly.
 *
 * 3.   HEADLINE + SUBHEAD ALWAYS WHITE — no black→white tween; pure white at rest,
 *      no drop-shadow filter. Color tween block removed from timeline.
 *
 * 3b.  RESPONSIVE HEADLINE — mobile floor lowered: clamp(1.85rem,6.2vw,6rem) +
 *      textWrap:'balance' on headline span for even wrapping on 390px screens.
 *
 * 4.   WEBINAR CTA white fill + black outline (SupportBeyond.tsx only).
 *
 * 5.   WORDMARK LONGER HOLD (DELAYED CLOUD VEIL) — veil bloom delayed to p0.80–0.98
 *      in HeroClouds.tsx. Wordmark beats: cross-dissolve p0.70–0.82 (build→fill),
 *      fill fully on by ~p0.82, holds until lift at p0.94. Stats overlay at p0.92.
 *      Pin widened: +=560% → +=640%.
 *
 * 6.   STATS STRIPE SIZING — number clamp(1.6rem,5.5vw,5rem) fits 3-up on mobile.
 *      Column padding px-3 sm:px-8. Label clamp(0.7rem,1.1vw,0.95rem). Same fix
 *      applied to StatsFallback.
 *
 * Architecture:
 *   - progressRef (plain useRef<number>) — zero React re-renders per tick.
 *   - Single rAF in HeroClouds, cancelled on unmount.
 *   - GSAP context revert on cleanup.
 *   - Reduced-motion: static composed end-state with static stats visible.
 *   - RTL: fully centered — reads identically in dir=rtl and dir=ltr.
 *   - GPU: transform/opacity only; will-change toggled around pin.
 *
 * Two-layer building wrapper (CRITICAL — DO NOT COLLAPSE):
 *   OUTER  — absolute left-1/2, translateX(-50%). NEVER touched by GSAP.
 *   INNER  — buildingWrapRef. GSAP animates translateY ONLY.
 *
 * Motion timeline (scrub: true, pin +=640%):
 *   p 0.00       REST: building low (62–70vh), copy centered, text #ffffff (always)
 *   p 0.00–0.60  headline slot-roll cycles 3 sentences simultaneously with building
 *   p 0.00–0.62  building pans up concurrently (-panPx, power2.inOut) — INSTANT start
 *   p 0.54–0.62  subhead+CTA fade+lift out
 *   p 0.62–0.70  headline fade+lift out
 *   p 0.10–0.18  scroll nudge fades (disappears early in scroll)
 *   p 0.60–0.67  wordmark settles to rest position
 *   p 0.70–0.84  Building: 1→0; Outline: 0→1→0; Fill: 0→1 (cross-dissolve)
 *   p 0.94–0.98  wordmark lifts + fades
 *   p 0.80–0.98  cloud bloom (very delayed — wordmark holds fully visible)
 *   p 0.92–1.00  stats overlay fades in (over full cloud veil)
 *   p 0.92–1.00  cloud veil pans up +15vh→0 (rising-through-clouds feel)
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
const BUILDING_PAN_VH = 48
const BUILDING_PAN_VH_MOBILE = 35

function getBuildingPanVH(): number {
  if (typeof window === 'undefined') return BUILDING_PAN_VH
  return window.innerWidth >= 1024 ? BUILDING_PAN_VH : BUILDING_PAN_VH_MOBILE
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  const cycle: readonly string[] =
    c.hero.cycle && c.hero.cycle.length > 0 ? c.hero.cycle : [c.hero.title]

  const sectionRef = useRef<HTMLElement>(null)
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
  // textColorRef + subheadRef — GSAP tweens color + filter for black→white swap
  const textColorRef = useRef<HTMLDivElement>(null)
  const subheadRef = useRef<HTMLParagraphElement>(null)
  // statsOverlayRef — fades in p0.88–1.0 after wordmark lifts
  const statsOverlayRef = useRef<HTMLDivElement>(null)
  // cloudFrontVeilRef — forwarded to HeroClouds front-variant veil div.
  // GSAP animates translateY for the cloud-pans-up effect p0.90–1.0.
  const cloudFrontVeilRef = useRef<HTMLDivElement>(null)

  // Shared scroll progress — plain ref, zero React re-renders per scroll tick.
  const progressRef = useRef<number>(0)

  const [slotHeightPx, setSlotHeightPx] = useState<number>(0)
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
      const textColor = textColorRef.current
      const subheadEl = subheadRef.current
      const statsOverlay = statsOverlayRef.current
      const cloudVeil = cloudFrontVeilRef.current

      if (
        !buildingWrap || !headline || !slotTrack || !subCta ||
        !buildingImg || !wordmark || !outline || !fill
      ) return

      if (slotHeightPx === 0) return

      // ── REST state (p = 0) ───────────────────────────────────────────────
      gsap.set(buildingWrap, { y: 0 })
      gsap.set(buildingImg, { opacity: 1 })
      gsap.set(wordmark, { opacity: 1, scale: 0.96, y: 20 })
      gsap.set(outline, { opacity: 0 })
      gsap.set(fill, { opacity: 0 })
      gsap.set(slotTrack, { yPercent: 0 })
      gsap.set([headline, subCta], { opacity: 1, y: 0 })
      if (scrollNudge) gsap.set(scrollNudge, { opacity: 0.45 })
      if (textColor) gsap.set(textColor, { color: '#ffffff' })
      if (subheadEl) gsap.set(subheadEl, { color: '#ffffff' })
      if (statsOverlay) gsap.set(statsOverlay, { opacity: 0 })
      // Cloud veil starts translated down (+15vh) at rest; pans up as pin ends
      if (cloudVeil) gsap.set(cloudVeil, { y: '15vh' })

      // Enable GPU compositing during the pin
      const willChangeTargets: (Element | null)[] = [
        buildingWrap, headline, slotTrack, subCta, wordmark, outline, fill,
      ]
      if (statsOverlay) willChangeTargets.push(statsOverlay)
      if (cloudVeil) willChangeTargets.push(cloudVeil)
      gsap.set(willChangeTargets.filter(Boolean) as Element[], { willChange: 'transform, opacity' })

      const panVH = getBuildingPanVH()
      const panPx = (window.innerHeight * panVH) / 100

      // ── Master scrubbed timeline (pin +=640%) ───────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=640%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      // BATCH 5 — INSTANT BUILD RISE: starts at p0.00 (was 0.10). Duration 0.62 so
      // building tops out at ~p0.62 simultaneously with the headline cycle end.
      tl.to(buildingWrap, { y: -panPx, duration: 0.62, ease: 'power2.inOut' }, 0.0)

      // BATCH 5 — no color tween: headline + subhead are always white from rest.
      // Color tween block removed (Change 3).

      // BATCH 5 — HEADLINE CYCLE SPANS FULL BUILDING RISE.
      // BATCH 5 — FULL-RISE CYCLE: starts at p0.0 (was 0.06), spans 0.60 (was 0.49).
      // Internal transitions re-budgeted so 3 sentences are evenly spread and each
      // holds long enough to read. Sentence 3 settles near end of span (raw ~0.88–1.0).
      const lineCount = cycle.length
      if (lineCount > 1) {
        const totalSlots = lineCount - 1
        const endY = -(slotHeightPx * totalSlots)

        tl.fromTo(
          slotTrack,
          { y: 0 },
          {
            y: endY,
            duration: 0.60,   // p0.0–0.60 span
            ease: 'none',
            modifiers: {
              y: (raw: string) => {
                const rawPx = parseFloat(raw)
                const rawProgress = rawPx / endY
                let slotPos: number

                if (totalSlots === 1) {
                  // Single transition: hold 0→move→hold 1
                  if (rawProgress < 0.30) {
                    slotPos = 0
                  } else if (rawProgress < 0.70) {
                    const t = (rawProgress - 0.30) / 0.40
                    const eased = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2
                    slotPos = eased
                  } else {
                    slotPos = 1
                  }
                } else {
                  // Even spread: sentence 0 holds 0.00–0.26, transitions 0.26–0.40 → s1.
                  // Sentence 1 holds 0.40–0.72, transitions 0.72–0.86 → s2.
                  // Sentence 2 holds 0.86–1.00 (settles near end of span).
                  const transitions = [[0.26, 0.40], [0.72, 0.86]] as const

                  if (rawProgress < transitions[0][0]) {
                    slotPos = 0
                  } else if (rawProgress < transitions[0][1]) {
                    const t = (rawProgress - transitions[0][0]) / (transitions[0][1] - transitions[0][0])
                    const eased = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2
                    slotPos = eased
                  } else if (rawProgress < transitions[1][0]) {
                    slotPos = 1
                  } else if (rawProgress < transitions[1][1]) {
                    const t = (rawProgress - transitions[1][0]) / (transitions[1][1] - transitions[1][0])
                    const eased = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2
                    slotPos = 1 + eased
                  } else {
                    slotPos = 2
                  }
                }

                return `${-(slotPos * slotHeightPx)}px`
              },
            },
          },
          0.0
        )
      }

      // p 0.54–0.62  subhead+CTA exits (after building has mostly risen).
      tl.to(subCta, { opacity: 0, y: -50, duration: 0.08, ease: 'power3.in' }, 0.54)

      // p 0.62–0.70  headline fade+lift (after sentence 3 has held, as cloud mask begins).
      tl.to(headline, { opacity: 0, y: -60, duration: 0.08, ease: 'power3.in' }, 0.62)

      // p 0.10–0.18  Scroll nudge fades shortly after scroll begins (clearly scrolling).
      if (scrollNudge) {
        tl.to(scrollNudge, { opacity: 0, duration: 0.08, ease: 'power2.in' }, 0.10)
      }

      // p 0.60–0.67  Wordmark settles to rest position.
      tl.to(wordmark, { scale: 1, y: 0, duration: 0.07, ease: 'power1.out' }, 0.60)

      // BATCH 5 — WORDMARK LONGER HOLD. Cloud veil bloom delayed to p0.80–0.98
      // (HeroClouds updated separately), so fill is fully on by ~p0.82 and HOLDS.
      //
      //   p 0.70–0.84  Building image:  1→0  (sine.inOut)
      //   p 0.70–0.83  White outline:   0→1  (power1.inOut)
      //   p 0.78–0.88  White outline:   1→0  (power1.inOut)
      //   p 0.78–0.90  Image fill:      0→1  (power1.inOut) — holds ~p0.82–0.94
      tl.to(buildingImg, { opacity: 0, duration: 0.14, ease: 'sine.inOut' }, 0.70)
      tl.to(outline, { opacity: 1, duration: 0.13, ease: 'power1.inOut' }, 0.70)
      tl.to(outline, { opacity: 0, duration: 0.10, ease: 'power1.inOut' }, 0.78)
      tl.to(fill, { opacity: 1, duration: 0.12, ease: 'power1.inOut' }, 0.78)

      // p 0.94–0.98  Wordmark lifts into cloud bloom + fades.
      tl.to(wordmark, { y: '-20%', scale: 1.08, opacity: 0, duration: 0.04, ease: 'power2.in' }, 0.94)

      // STATS OVERLAY + CLOUD PAN UP.
      // Stats fade in p0.92–1.0 (after veil + wordmark lift).
      if (statsOverlay) {
        tl.to(statsOverlay, { opacity: 1, duration: 0.08, ease: 'power2.out' }, 0.92)
      }

      // Cloud veil pans up: starts at y=+15vh → y=0 across p0.92–1.0.
      if (cloudVeil) {
        tl.to(cloudVeil, { y: '0vh', duration: 0.08, ease: 'power2.inOut' }, 0.92)
      }

      // Clean up will-change after pin
      return () => {
        gsap.set(willChangeTargets.filter(Boolean) as Element[], { willChange: 'auto' })
        // Reset to white (not black) — re-init must not flash dark text.
        if (textColor) gsap.set(textColor, { color: '#ffffff' })
        if (subheadEl) gsap.set(subheadEl, { color: '#ffffff' })
        if (cloudVeil) gsap.set(cloudVeil, { y: '0vh' })
      }
    },
    [motionOk, mounted, cycle.length, slotHeightPx]  // eslint-disable-line react-hooks/exhaustive-deps
  )

  // ── Reduced-motion: clean composed fallback ──────────────────────────────
  // Shows copy + building + static stats below (change #9 fallback).
  if (!motionOk) {
    return (
      <section
        id="hero"
        aria-label="Hero"
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
        style={{ paddingTop: 'clamp(8vh, 10vh, 14vh)' }}
      >
        <SkyGradient />
        {/* Building — lower rest position */}
        <div
          className="absolute left-1/2 z-[2]"
          style={{
            top: 'clamp(62vh, 66vh, 70vh)',
            width: 'min(87.5vw, 1260px)',
            transform: 'translateX(-50%)',
          }}
          aria-hidden="true"
        >
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
                filter: 'saturate(0.96) brightness(0.97) hue-rotate(6deg) contrast(1.03)',
              }}
              sizes="(max-width: 768px) 88vw, 1260px"
            />
          </div>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background: 'linear-gradient(to bottom, rgba(100,140,195,0.28) 0%, rgba(120,155,205,0.18) 30%, rgba(140,170,210,0.08) 60%, transparent 85%)',
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
              background: 'linear-gradient(to top, rgba(200,215,235,0.52) 0%, rgba(210,222,240,0.28) 12%, rgba(220,230,245,0.08) 28%, transparent 42%)',
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
        {/* Copy stack — centered */}
        <div className="relative z-[4] flex w-full flex-col items-center px-6 text-center gap-6">
          <h1
            className="font-bold leading-[0.95]"
            style={{
              fontFamily: 'var(--font-hebrew-display)',
              fontSize: 'clamp(1.85rem, 6.2vw, 6rem)',
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            {cycle[0]}
          </h1>
          <p
            className="font-light"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1.15rem, 2vw, 1.6rem)',
              lineHeight: 1.65,
              color: '#ffffff',
              maxWidth: '560px',
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
        {/* CHANGE #9 — Static stats fallback (reduced-motion) */}
        <StatsFallback stats={c.stats} />
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
      {/* 1. Sky gradient */}
      <SkyGradient />

      {/* 2. HeroClouds BACK — FAR + MID bands, behind building. */}
      {mounted && (
        <div className="absolute inset-0 z-[1]" aria-hidden="true">
          <HeroClouds progressRef={progressRef} active={motionOk} variant="back" />
        </div>
      )}

      {/* 3. Building — LOWER at rest (clamp(62vh,66vh,70vh)).
          OUTER: centering only (translateX(-50%)). The higher top means more open sky
          frames the centered copy at rest. INNER: GSAP pan target. */}
      <div
        ref={buildingOuterRef}
        className="absolute left-1/2 z-[2]"
        style={{
          top: 'clamp(62vh, 66vh, 70vh)',
          width: 'min(87.5vw, 1260px)',
          transform: 'translateX(-50%)',
          margin: 0,
          padding: 0,
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
              alt="Modern glass residential tower with green terraces"
              width={1024}
              height={946}
              priority
              quality={90}
              className="block h-auto w-full select-none"
              style={{
                verticalAlign: 'top',
                display: 'block',
                filter: 'saturate(0.96) brightness(0.97) hue-rotate(6deg) contrast(1.03)',
              }}
              sizes="(max-width: 768px) 88vw, 1260px"
            />
          </div>

          {/* Cool rim light on glass faces */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background:
                'linear-gradient(to bottom, rgba(100,140,195,0.28) 0%, rgba(120,155,205,0.18) 30%, rgba(140,170,210,0.08) 60%, transparent 85%)',
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

          {/* Cool base haze */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              background:
                'linear-gradient(to top, rgba(200,215,235,0.52) 0%, rgba(210,222,240,0.28) 12%, rgba(220,230,245,0.08) 28%, transparent 42%)',
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

      {/* Global cool atmosphere wash */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background:
            'radial-gradient(ellipse 110% 55% at 50% 100%, rgba(60,90,150,0.14) 0%, rgba(80,110,165,0.07) 30%, transparent 55%)',
          mixBlendMode: 'soft-light' as const,
          pointerEvents: 'none',
        }}
      />

      {/* 4 + 5. Wordmark group — OUTLINE draws in, then CROSS-DISSOLVE to FILL. */}
      <div
        ref={wordmarkRef}
        className="absolute inset-0 z-[3] flex items-center justify-center"
        style={{ transformOrigin: 'center center', textAlign: 'center' }}
        aria-hidden="true"
      >
        <div
          className="relative mx-auto w-full"
          style={{
            maxWidth: 'clamp(420px, 78vw, 1100px)',
            paddingLeft: 'clamp(8px, 1.5vw, 24px)',
            paddingRight: 'clamp(8px, 1.5vw, 24px)',
          }}
        >
          {/* Outline — white stroke */}
          <div ref={outlineRef} className="absolute inset-0">
            <BrandWordmarkOutline subWord="וובינר" />
          </div>
          {/* Fill — building image clipped to Hebrew letters. */}
          <div ref={fillRef} style={{ transition: 'none' }}>
            <BrandWordmarkMask
              fillSrc={images.heroBuildingFill}
              subWord="וובינר"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>

      {/* 6. HeroClouds FRONT — blooms in over building + wordmark (p 0.63+).
          z-[3] overlaps wordmark group; under stats overlay z-[4] and copy z-[5].
          veilRef forwarded so GSAP can pan it upward for rising-through-clouds effect. */}
      {mounted && (
        <div className="absolute inset-0 z-[3]" aria-hidden="true">
          <HeroClouds
            progressRef={progressRef}
            active={motionOk}
            variant="front"
            veilRef={cloudFrontVeilRef}
          />
        </div>
      )}

      {/* CHANGE #8 — STATS OVERLAY on the cloud screen.
          Revealed p0.88–1.0 after the wordmark lifts. Sits on top of the cloud veil
          but below the copy zone. Dark text on near-white veil for contrast.
          The veil (z-[3]) + these stats (z-[4]) pan up together via GSAP on cloudFrontVeilRef —
          since the veil div is inside HeroClouds we animate the front veil translateY,
          and the stats independently fade in over it. */}
      <div
        ref={statsOverlayRef}
        className="absolute inset-0 z-[4] flex flex-col items-center justify-end pointer-events-none"
        style={{
          opacity: 0,
          paddingBottom: 'clamp(5vh, 8vh, 12vh)',
        }}
        aria-label={c.stats.map((s) => `${s.value} ${s.label}`).join(', ')}
      >
        <div className="w-full max-w-4xl px-4 md:px-12">
          <ul className="grid grid-cols-3 divide-x divide-[rgba(17,17,17,0.15)]">
            {c.stats.map((stat) => (
              <li
                key={stat.value}
                className="flex flex-col items-center text-center gap-2 px-3 sm:px-8"
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                    // BATCH 5 — CHANGE 6: reduced clamp so 3-up fits at 390px.
                    fontSize: 'clamp(1.6rem, 5.5vw, 5rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                    color: 'rgba(17,17,17,0.88)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(0.7rem, 1.1vw, 0.95rem)',
                    lineHeight: 1.4,
                    color: 'rgba(17,17,17,0.55)',
                    maxWidth: '14ch',
                    textAlign: 'center',
                  }}
                >
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 7. Text stack — CHANGE #4: copy starts centered (justify-center, no paddingTop).
          No scroll drift tween. Copy is at vertical center from rest through cycle then fades. */}
      <div
        className="absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 text-center pointer-events-none"
      >
        <div className="w-full flex flex-col items-center pointer-events-auto">
          {/* Cycling headline — textColorRef receives GSAP color tween */}
          <div
            ref={textColorRef}
            className="w-full flex flex-col items-center"
            style={{
              color: '#ffffff',
            }}
          >
            <div ref={headlineRef} className="flex w-full flex-col items-center">
              <SlotRollHeadline
                ref={slotTrackRef}
                lines={cycle}
                onSlotHeight={handleSlotHeight}
              />
            </div>
          </div>

          {/* Subhead + CTA */}
          <div
            ref={subCtaRef}
            className="flex w-full flex-col items-center"
            style={{ marginTop: 'clamp(0.6rem, 1.6vh, 1.2rem)' }}
          >
            <p
              ref={subheadRef}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(1.15rem, 2vw, 1.6rem)',
                fontWeight: 300,
                lineHeight: 1.65,
                letterSpacing: '0.005em',
                maxWidth: '560px',
                color: '#ffffff',
                textAlign: 'center',
              }}
            >
              {c.hero.subhead}
            </p>
            <div style={{ marginTop: 'clamp(1rem, 2.5vh, 1.75rem)' }}>
              <Pill variant="dark" href="#register" withArrow>
                {c.hero.cta}
              </Pill>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll nudge */}
      <div
        ref={scrollNudgeRef}
        className="pointer-events-none z-[5] flex flex-col items-center gap-2"
        aria-hidden="true"
        style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.45 }}
      >
        <div className="w-px h-8 bg-white opacity-60" />
      </div>
    </section>
  )
}

// ─── Static stats fallback for reduced-motion ────────────────────────────────
// Rendered inside the reduced-motion hero after the CTA. Shows the same 3-up grid
// with dividers on a semi-transparent light surface.
interface StatsItem { value: string; label: string }

function StatsFallback({ stats }: { stats: readonly StatsItem[] }) {
  return (
    <div
      className="relative z-[4] w-full mt-12"
      style={{
        borderTop: '1px solid rgba(17,17,17,0.10)',
        paddingTop: 'clamp(1.5rem, 3vh, 2.5rem)',
      }}
    >
      <ul className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(17,17,17,0.10)] max-w-4xl mx-auto px-4">
        {stats.map((stat) => (
          <li
            key={stat.value}
            className="flex flex-col items-center text-center gap-2 px-3 sm:px-8 py-6 sm:py-2"
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                // BATCH 5 — CHANGE 6: match animated overlay sizing.
                fontSize: 'clamp(1.6rem, 5.5vw, 5rem)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: 'rgba(17,17,17,0.88)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(0.7rem, 1.1vw, 0.95rem)',
                lineHeight: 1.4,
                color: 'rgba(17,17,17,0.55)',
                maxWidth: '14ch',
              }}
            >
              {stat.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Slot-roll headline ──────────────────────────────────────────────────────

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
              className="flex shrink-0 items-center justify-center font-bold w-full text-center"
              style={{
                height: clipPx != null ? clipPx : 'auto',
                // BATCH 5 — CHANGE 3b: mobile floor lowered to 1.85rem; textWrap:balance
                // for even wrapping on 390px. Keeps lineHeight + letterSpacing intact.
                minHeight: 'clamp(1.85rem, 6.2vw, 6rem)',
                fontFamily: 'var(--font-hebrew-display)',
                fontSize: 'clamp(1.85rem, 6.2vw, 6rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                textWrap: 'balance',
                paddingTop: '0.12em',
                paddingBottom: '0.12em',
                boxSizing: 'border-box',
                // Color inherits from textColorRef wrapper.
                color: 'inherit',
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
// CHANGE #2 — LIGHTER BLUE SKY.
// Upper/mid stops lifted: top #2e4878 (was #1e2d4a), transitions raised throughout.
// Keeps the cool dusk cohesion but opens up the sky above the centered copy.
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

// ─── "בונים עתיד" outline wordmark ──────────────────────────────────────────
interface BrandWordmarkOutlineProps {
  subWord?: string
}

function BrandWordmarkOutline({ subWord }: BrandWordmarkOutlineProps) {
  const viewBoxH = subWord ? 285 : 175
  const mainY = subWord ? '38%' : '50%'

  return (
    <svg
      viewBox={`0 0 720 ${viewBoxH}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={subWord ? `בונים עתיד — ${subWord}` : 'בונים עתיד'}
      className="block h-auto w-full"
      overflow="visible"
      preserveAspectRatio="xMidYMid meet"
    >
      <text
        x="50%"
        y={mainY}
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
      {subWord && (
        <text
          x="50%"
          y="80%"
          dominantBaseline="central"
          textAnchor="middle"
          direction="rtl"
          fontFamily="var(--font-hebrew), system-ui, sans-serif"
          fontWeight="800"
          fontSize="69"
          letterSpacing="-1"
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.5}
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.35))' }}
        >
          {subWord}
        </text>
      )}
    </svg>
  )
}
