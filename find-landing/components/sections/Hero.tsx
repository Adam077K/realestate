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
 * Motion timeline (scrub: true, pin +=560%):
 *   p 0.00–0.12  REST hold - no motion yet
 *   p 0.12–0.44  building pans up -panPx (power2.inOut)
 *   p 0.18–0.34  headline+subhead+CTA group fades out (opacity→0, y→-40)
 *   p 0.10–0.18  scroll nudge fades
 *   p 0.44–0.52  wordmark outline fades IN (0→1)
 *   p 0.52–0.66  OUTLINE HOLDS - long beat; subtle scale 1→1.02
 *   p 0.66–0.78  cross-dissolve: buildingImg 1→0; outline 1→0; fill 0→1
 *   p 0.78–0.88  image-filled wordmark HOLDS
 *   p 0.86–1.00  wordmark lifts+fades; white mask rises from bottom (veil y:40vh→0)
 *
 * HeroClouds front veil: bloom starts p≈0.86 (re-timed in HeroClouds.tsx)
 * Cloud veil starts at y:'40vh' (pushed below frame) and pans to y:0 across
 * p0.86–1.0, driven by GSAP on cloudFrontVeilRef. This makes the white mask
 * appear to RISE from the bottom into the wordmark.
 */

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'

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
  const outlineRef       = useRef<HTMLDivElement>(null)
  const fillRef          = useRef<HTMLDivElement>(null)
  const scrollNudgeRef   = useRef<HTMLDivElement>(null)
  // cloudFrontVeilRef - forwarded to HeroClouds front-variant veil div.
  // GSAP animates translateY: 40vh→0 for the rising white mask effect.
  const cloudFrontVeilRef = useRef<HTMLDivElement>(null)

  // Shared scroll progress - plain ref, zero React re-renders per scroll tick.
  const progressRef = useRef<number>(0)

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // ── Pinned, scrubbed master timeline (motionOk only) ─────────────────────
  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk || !mounted) return

      const buildingWrap = buildingWrapRef.current
      const copyGroup    = copyGroupRef.current
      const buildingImg  = buildingImgRef.current
      const wordmark     = wordmarkRef.current
      const outline      = outlineRef.current
      const fill         = fillRef.current
      const scrollNudge  = scrollNudgeRef.current
      const cloudVeil    = cloudFrontVeilRef.current

      if (!buildingWrap || !copyGroup || !buildingImg || !wordmark || !outline || !fill) return

      // ── REST state (p = 0) ───────────────────────────────────────────────
      gsap.set(buildingWrap, { y: 0 })
      gsap.set(buildingImg,  { opacity: 1 })
      gsap.set(outline,      { opacity: 0 })
      gsap.set(fill,         { opacity: 0 })
      gsap.set(copyGroup,    { opacity: 1, y: 0 })
      // Wordmark sits at rest: slightly scaled down, slightly down - settles during rise
      gsap.set(wordmark,     { opacity: 1, scale: 0.96, y: 20 })
      if (scrollNudge) gsap.set(scrollNudge, { opacity: 0.45 })
      // Cloud veil starts pushed BELOW the frame (40vh down). GSAP pans it up p0.86–1.0.
      if (cloudVeil) gsap.set(cloudVeil, { y: '40vh' })

      // Enable GPU compositing during the pin
      const willChangeTargets: (Element | null)[] = [
        buildingWrap, copyGroup, wordmark, outline, fill,
      ]
      if (cloudVeil) willChangeTargets.push(cloudVeil)
      gsap.set(willChangeTargets.filter(Boolean) as Element[], { willChange: 'transform, opacity' })

      const panVH = getBuildingPanVH()
      const panPx = (window.innerHeight * panVH) / 100

      // ── Master scrubbed timeline (pin +=560%) ───────────────────────────
      // A12: scrub: 0.8 for smoother premium feel
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=720%',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      // p 0.04–0.52  BUILDING PANS UP - starts almost immediately (short rest hold),
      // longer rise (92vh) reveals ~80-90% of building by p≈0.52
      tl.to(buildingWrap, { y: -panPx, duration: 0.48, ease: 'power2.inOut' }, 0.04)

      // p 0.10–0.28  COPY GROUP FADES OUT - headline+subhead+CTA together, as building rises over them
      tl.to(copyGroup, { opacity: 0, y: -40, duration: 0.18, ease: 'power3.in' }, 0.10)

      // p 0.02–0.10  Scroll nudge fades almost immediately on first scroll input
      if (scrollNudge) {
        tl.to(scrollNudge, { opacity: 0, duration: 0.08, ease: 'power2.in' }, 0.02)
      }

      // p 0.50–0.54  Wordmark settles to final position as building tops out
      tl.to(wordmark, { scale: 1, y: 0, duration: 0.04, ease: 'power1.out' }, 0.50)

      // A8 - OUTLINE DRAW + HOLD WINDOW:
      // p 0.54–0.60  outline fades in + stroke draws (strokeDashoffset 1→0)
      // Building is FULLY revealed (base in view) and holding BEFORE this fires
      tl.to(outline, { opacity: 1, duration: 0.05, ease: 'power2.out' }, 0.54)
      if (outline) {
        tl.to(outline.querySelectorAll('.wordmark-outline-text'), {
          strokeDashoffset: 0,
          duration: 0.08,
          ease: 'power2.inOut',
          stagger: 0.01,
        }, 0.54)
      }

      // p 0.60–0.62  OUTLINE HOLDS. Very subtle scale.
      tl.to(outline, { scale: 1.02, duration: 0.02, ease: 'power1.inOut' }, 0.60)

      // p 0.64–0.70  CROSS-DISSOLVE:
      //   buildingImg: 1→0  (building photo fades - held fully revealed until now)
      //   outline:     scale back + 1→0
      //   fill:        0→1  (image inside the letters appears)
      tl.to(buildingImg, { opacity: 0, duration: 0.06, ease: 'sine.inOut' }, 0.64)
      tl.to(outline,     { opacity: 0, scale: 1,       duration: 0.06, ease: 'power1.inOut' }, 0.64)
      tl.to(fill,        { opacity: 1,                 duration: 0.06, ease: 'power1.inOut' }, 0.66)

      // p 0.70–0.86  IMAGE-FILL WORDMARK HOLDS - long defining beat (A8: extended hold)

      // p 0.86–0.94  WORDMARK LIFTS + FADES into the rising white mask
      tl.to(wordmark, { y: '-18%', scale: 1.06, opacity: 0, duration: 0.08, ease: 'power2.in' }, 0.86)

      // p 0.86–1.00  WHITE MASK RISES FROM BOTTOM:
      // Cloud veil translates from y=40vh (below frame) → y=0 (covering screen).
      // bloom is also timed here (frontVeilIntensity re-timed in HeroClouds.tsx to start p≈0.86).
      if (cloudVeil) {
        tl.to(cloudVeil, { y: '0vh', duration: 0.14, ease: 'power2.inOut' }, 0.86)
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
      <section
        id="hero"
        aria-label="Hero"
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
        style={{ paddingTop: 'clamp(8vh, 10vh, 14vh)' }}
      >
        <SkyGradient />
        {/* Building */}
        <div
          className="absolute left-1/2 z-[2]"
          style={{
            top: 'clamp(55vh, 59vh, 63vh)',
            width: 'min(78vw, 1140px)',
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
              sizes="(max-width: 768px) 78vw, 1140px"
            />
          </div>
          {/* Warm rim light - replaces the old cool blue cast */}
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
          <h1
            className="font-bold leading-[0.95]"
            style={{
              fontFamily: 'var(--font-hebrew-display)',
              fontSize: 'clamp(2.1rem, 7vw, 7rem)',
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
              fontSize: 'clamp(0.58rem, 2.6vw, 1.4rem)',
              lineHeight: 1.65,
              color: '#000000',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 8px rgba(255,255,255,0.55)',
            }}
          >
            {c.hero.subhead}
          </p>
          <div>
            <Pill variant="dark" href="#register" withArrow className="text-xs px-5 py-2.5 min-h-[36px] !bg-black text-white">
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
          z-[3] so it occludes the copy group (z-[2]) as it rises (A7). */}
      <div
        ref={buildingOuterRef}
        className="absolute left-1/2 z-[3]"
        style={{
          top: 'clamp(55vh, 59vh, 63vh)',
          width: 'min(78vw, 1140px)',
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
              sizes="(max-width: 768px) 78vw, 1140px"
            />
          </div>

          {/* Warm rim light - golden glow on the tower crown */}
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
      </div>

      {/* 4. Wordmark group - z-[5], centered (above building z-[3], below veil z-[6]).
          OUTLINE strokes in (long hold), then cross-dissolves to FILL. */}
      <div
        ref={wordmarkRef}
        className="absolute inset-0 z-[5] flex items-center justify-center"
        style={{ transformOrigin: 'center center', textAlign: 'center' }}
        aria-hidden="true"
      >
        <div
          className="relative mx-auto w-full"
          style={{
            maxWidth: 'clamp(350px, 64vw, 915px)',
            paddingLeft: 'clamp(8px, 1.5vw, 24px)',
            paddingRight: 'clamp(8px, 1.5vw, 24px)',
          }}
        >
          {/* Outline - white stroke, holds then dissolves */}
          <div ref={outlineRef} style={{ position: 'absolute', inset: 0 }}>
            <BrandWordmarkOutline subWord="וובינר" />
          </div>
          {/* Fill - building image clipped to Hebrew letters */}
          <div ref={fillRef} style={{ transition: 'none' }}>
            <BrandWordmarkMask
              fillSrc={images.heroBuildingFill}
              subWord="וובינר"
              className="block h-auto w-full"
            />
          </div>
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
          <h1
            className="font-bold"
            style={{
              fontFamily: 'var(--font-hebrew-display)',
              fontSize: 'clamp(2.1rem, 7vw, 7rem)',
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
              fontSize: 'clamp(0.58rem, 2.6vw, 1.4rem)',
              fontWeight: 300,
              lineHeight: 1.65,
              letterSpacing: '0.005em',
              whiteSpace: 'nowrap',
              color: '#000000',
              textAlign: 'center',
              marginTop: 'clamp(0.6rem, 1.6vh, 1.2rem)',
              textShadow: '0 1px 8px rgba(255,255,255,0.55)',
            }}
          >
            {c.hero.subhead}
          </p>

          <div style={{ marginTop: 'clamp(1rem, 2.5vh, 1.75rem)' }}>
            <Pill variant="dark" href="#register" withArrow className="text-xs px-5 py-2.5 min-h-[36px] !bg-black text-white">
              {c.hero.cta}
            </Pill>
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
      aria-label={subWord ? `בונים עתיד - ${subWord}` : 'בונים עתיד'}
      className="block h-auto w-full"
      overflow="visible"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* A8: strokeDasharray/strokeDashoffset on both text nodes enables draw animation via GSAP */}
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
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1}
        className="wordmark-outline-text"
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
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1}
          className="wordmark-outline-text"
          style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.35))' }}
        >
          {subWord}
        </text>
      )}
    </svg>
  )
}
