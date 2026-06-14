'use client'

/**
 * Hero — Signature pinned scroll experience for בונים עתיד (Bonim Atid).
 *
 * BATCH 4 CHANGES:
 *
 * 1. HEADLINE CYCLE LONGER — cycle span widened to p0.06–0.55 with plateau holds
 *    at [0.22–0.38] and [0.72–0.88] within the tween so each sentence stays still
 *    much longer. Pin extended from +=400% → +=560% (re-budgeted so total feels
 *    deliberate, not endless).
 *
 * 2. SKY LIGHTER BLUE — upper/mid stops lifted: top ~#2e4878 (was #1e2d4a),
 *    mid transitions raised throughout for a brighter, lighter dusk.
 *
 * 3. HEADLINE BIGGER — fontSize clamp(2.4rem,6.5vw,6rem) (was clamp(2rem,5vw,4.5rem)).
 *
 * 4. COPY STARTS CENTERED — paddingTop removed; layout uses flexbox justify-center.
 *    No scroll drift tween. Copy is centered from rest through cycle then fades.
 *
 * 5. BUILDING ~30% LOWER — outer top clamp(62vh,66vh,70vh) (was clamp(44vh,50vh,56vh))
 *    so more open sky frames the centered copy at rest.
 *
 * 6. COMBINED RISE ~30% LONGER — building pans p0.10–0.72 (was p0.10–0.55), re-budgeted
 *    in the longer +=560% pin window.
 *
 * 7. WORDMARK ~50% LONGER AGAIN — cross-dissolve now p0.73–0.94 + lift at p0.95–0.99.
 *    Veil bloom delayed to p0.63–0.97.
 *
 * 8+9. STATS ON CLOUD SCREEN — stats numbers + labels overlaid on the front cloud
 *      veil, revealed p0.88–1.0 (after wordmark lifts). Cloud veil (carrying stats)
 *      pans upward via translateY: +15vh → 0 across p0.90–1.0, creating a rising-
 *      through-clouds feel. Seamless light→white into RewiredSteps.
 *      Reduced-motion: static stats fallback rendered inside hero.
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
 * Motion timeline (scrub: true, pin +=560%):
 *   p 0.00       REST: building low (62–70vh), copy centered, text #050505 + white halo
 *   p 0.06–0.55  headline slot-roll cycles 3 sentences with long plateau holds
 *   p 0.10–0.72  building pans up concurrently (-panPx, power2.inOut)
 *   p 0.12–0.20  text color #050505→#ffffff, halo→dark-shadow (building behind copy)
 *   p 0.38–0.46  subhead+CTA fade+lift out
 *   p 0.48–0.57  headline fade+lift out
 *   p 0.49–0.57  scroll nudge fades
 *   p 0.60–0.67  wordmark settles to rest position
 *   p 0.73–0.87  Building: 1→0; Outline: 0→1→0; Fill: 0→1 (cross-dissolve)
 *   p 0.95–0.99  wordmark lifts + fades
 *   p 0.63–0.97  cloud bloom (delayed — doesn't wash wordmark early)
 *   p 0.88–1.00  stats overlay fades in (over full cloud veil)
 *   p 0.90–1.00  cloud veil pans up +15vh→0 (rising-through-clouds feel)
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
      if (textColor) gsap.set(textColor, { color: '#050505' })
      if (subheadEl) gsap.set(subheadEl, { color: '#050505' })
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

      // ── Master scrubbed timeline (pin +=560%) ───────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=560%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      // CHANGE #6 — COMBINED RISE ~30% LONGER.
      // Building pans p0.10–0.72 (was 0.10–0.55) within the longer pin.
      tl.to(buildingWrap, { y: -panPx, duration: 0.62, ease: 'power2.inOut' }, 0.10)

      // TEXT COLOR SWAP — black → white (p0.12–0.20 unchanged).
      if (textColor) {
        tl.to(textColor, {
          color: '#ffffff',
          filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.40))',
          duration: 0.08,
          ease: 'power1.inOut',
        }, 0.12)
      }
      if (subheadEl) {
        tl.to(subheadEl, {
          color: '#ffffff',
          duration: 0.08,
          ease: 'power1.inOut',
        }, 0.12)
      }

      // CHANGE #1 — HEADLINE CYCLE LONGER.
      // Slot-roll spans p0.06–0.55 (was 0.06–0.42), plateau holds at
      // [0.22–0.38] and [0.72–0.88] within the tween's own progress.
      const lineCount = cycle.length
      if (lineCount > 1) {
        const totalSlots = lineCount - 1
        const endY = -(slotHeightPx * totalSlots)

        tl.fromTo(
          slotTrack,
          { y: 0 },
          {
            y: endY,
            duration: 0.49,   // p0.06–0.55 span
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
                  // Longer holds: [0.22–0.38] and [0.72–0.88]
                  // Sentence 0 shows p0.00–0.22, transitions 0.22–0.38 → sentence 1
                  // Sentence 1 holds 0.38–0.72, transitions 0.72–0.88 → sentence 2
                  // Sentence 2 holds 0.88–1.00
                  const transitions = [[0.22, 0.38], [0.72, 0.88]] as const

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
          0.06
        )
      }

      // p 0.38–0.46  subhead+CTA exits.
      tl.to(subCta, { opacity: 0, y: -50, duration: 0.08, ease: 'power3.in' }, 0.38)

      // p 0.48–0.57  headline fade+lift.
      tl.to(headline, { opacity: 0, y: -60, duration: 0.09, ease: 'power3.in' }, 0.48)

      // p 0.49–0.57  Scroll nudge fades.
      if (scrollNudge) {
        tl.to(scrollNudge, { opacity: 0, duration: 0.08, ease: 'power2.in' }, 0.49)
      }

      // p 0.60–0.67  Wordmark settles to rest position.
      tl.to(wordmark, { scale: 1, y: 0, duration: 0.07, ease: 'power1.out' }, 0.60)

      // CHANGE #7 — WORDMARK ~50% LONGER AGAIN.
      // Cross-dissolve p0.73–0.94; lift p0.95–0.99.
      // HeroClouds frontVeilIntensity bloom now p0.63–0.97 (updated below).
      //
      //   p 0.73–0.87  Building image:  1→0  (sine.inOut)
      //   p 0.73–0.86  White outline:   0→1  (power1.inOut)
      //   p 0.84–0.94  White outline:   1→0  (power1.inOut)
      //   p 0.82–0.94  Image fill:      0→1  (power1.inOut) — holds until lift
      tl.to(buildingImg, { opacity: 0, duration: 0.14, ease: 'sine.inOut' }, 0.73)
      tl.to(outline, { opacity: 1, duration: 0.13, ease: 'power1.inOut' }, 0.73)
      tl.to(outline, { opacity: 0, duration: 0.10, ease: 'power1.inOut' }, 0.84)
      tl.to(fill, { opacity: 1, duration: 0.12, ease: 'power1.inOut' }, 0.82)

      // p 0.95–0.99  Wordmark lifts into cloud bloom + fades.
      tl.to(wordmark, { y: '-20%', scale: 1.08, opacity: 0, duration: 0.04, ease: 'power2.in' }, 0.95)

      // CHANGES #8+9 — STATS OVERLAY + CLOUD PAN UP.
      // Stats fade in p0.88–1.0 (after wordmark lift clears screen space).
      if (statsOverlay) {
        tl.to(statsOverlay, { opacity: 1, duration: 0.12, ease: 'power2.out' }, 0.88)
      }

      // Cloud veil pans up: starts at y=+15vh → y=0 across p0.90–1.0.
      // This creates a "rising through clouds" feel as the hero pin releases
      // into the white RewiredSteps below. The veil carries the stats with it.
      if (cloudVeil) {
        tl.to(cloudVeil, { y: '0vh', duration: 0.10, ease: 'power2.inOut' }, 0.90)
      }

      // Clean up will-change after pin
      return () => {
        gsap.set(willChangeTargets.filter(Boolean) as Element[], { willChange: 'auto' })
        if (textColor) gsap.set(textColor, { color: '#050505', filter: '' })
        if (subheadEl) gsap.set(subheadEl, { color: '#050505' })
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
              fontSize: 'clamp(2.4rem, 6.5vw, 6rem)',
              letterSpacing: '-0.03em',
              color: '#050505',
              filter: 'drop-shadow(0 1px 10px rgba(255,255,255,0.65))',
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
              color: '#050505',
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
        <div className="w-full max-w-4xl px-6 md:px-12">
          <ul className="grid grid-cols-3 divide-x divide-[rgba(17,17,17,0.15)]">
            {c.stats.map((stat) => (
              <li
                key={stat.value}
                className="flex flex-col items-center text-center gap-2 px-4 sm:px-8"
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                    fontSize: 'clamp(2.4rem, 6.5vw, 5.5rem)',
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
                    fontSize: 'clamp(0.75rem, 1.2vw, 0.95rem)',
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
              color: '#050505',
              filter: 'drop-shadow(0 1px 10px rgba(255,255,255,0.65))',
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
                color: '#050505',
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
      <ul className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(17,17,17,0.10)] max-w-4xl mx-auto px-6">
        {stats.map((stat) => (
          <li
            key={stat.value}
            className="flex flex-col items-center text-center gap-2 px-4 py-6 sm:py-2"
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(2.4rem, 6.5vw, 5.5rem)',
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
                fontSize: 'clamp(0.75rem, 1.2vw, 0.95rem)',
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
                // CHANGE #3 — BIGGER HEADLINE
                minHeight: 'clamp(2.4rem, 6.5vw, 6rem)',
                fontFamily: 'var(--font-hebrew-display)',
                fontSize: 'clamp(2.4rem, 6.5vw, 6rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
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
