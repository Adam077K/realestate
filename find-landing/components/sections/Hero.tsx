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
 * Motion timeline (scrub: true, pin +=400% — slower / heavier hero):
 *   p 0.00       REST: building low, copy upper-middle (deep black text), all visible
 *   p 0.00–0.15  copy block drifts DOWN to vertical-center
 *   p 0.06–0.42  headline slot-roll cycles 3 sentences with plateau holds
 *   p 0.10–0.55  building PANS UP concurrently with cycle (combined motion)
 *   p 0.12–0.20  text color #050505 → #ffffff, halo white→dark (building behind copy)
 *   p 0.38–0.46  subhead+CTA fade+lift out
 *   p 0.43–0.52  headline fade+lift out
 *   p 0.44–0.52  scroll nudge fades
 *   p 0.50–0.55  wordmark drifts to rest position
 *   p 0.55–0.88  PURE CROSS-FADE: building 1→0, outline 0→1→0, fill 0→1 (EXTENDED 50%)
 *   p 0.90–0.98  wordmark lifts into cloud bloom + fades (DELAYED for longer linger)
 *   p 0.50–0.95  cloud bloom (delayed — doesn't wash wordmark early)
 *   p 0.88–1.00  veil STAYS at peak (no thin-out) — bridges into next section
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
  // copyBlockRef — inner shift wrapper. GSAP translates Y to drift copy toward
  // vertical center after the first scroll beat, then holds centered for the full cycle.
  const copyBlockRef = useRef<HTMLDivElement>(null)
  // textColorRef + subheadRef — GSAP tweens color + filter for black→white swap
  // when building rises behind copy (~p0.12–0.18).
  const textColorRef = useRef<HTMLDivElement>(null)
  const subheadRef = useRef<HTMLParagraphElement>(null)

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

      const copyBlock = copyBlockRef.current
      const textColor = textColorRef.current
      const subheadEl = subheadRef.current

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
      if (copyBlock) gsap.set(copyBlock, { y: 0 })
      if (scrollNudge) gsap.set(scrollNudge, { opacity: 0.45 })
      // Text starts deep black with white halo (state 1: over bright clouds)
      if (textColor) gsap.set(textColor, { color: '#050505' })
      if (subheadEl) gsap.set(subheadEl, { color: '#050505' })

      // Enable GPU compositing during the pin
      const willChangeTargets: (Element | null)[] = [buildingWrap, headline, slotTrack, subCta, wordmark, outline, fill]
      if (copyBlock) willChangeTargets.push(copyBlock)
      gsap.set(willChangeTargets.filter(Boolean) as Element[], { willChange: 'transform, opacity' })

      // Responsive pan range
      const panVH = getBuildingPanVH()
      const panPx = (window.innerHeight * panVH) / 100

      // Copy centering shift: ~14vh to sit at high-center over the clouds.
      const centerShiftPx = (window.innerHeight * 14) / 100

      // ── Master scrubbed timeline ─────────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=400%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      // BUILDING PAN — CONCURRENT WITH SLOT-ROLL CYCLE (change #1).
      // Building rises p0.10–0.55 overlapping the headline cycle (p0.06–0.42).
      // Text turns white at p0.12–0.18 (change #2) so it stays readable on the
      // rising building facade. Both effects together feel like a camera pull-back
      // revealing the building as the message changes.
      tl.to(buildingWrap, { y: -panPx, duration: 0.45, ease: 'power2.inOut' }, 0.10)

      // COPY BLOCK DRIFT → CENTER (p 0.00–0.15).
      if (copyBlock) {
        tl.to(copyBlock, { y: centerShiftPx, duration: 0.15, ease: 'power2.out' }, 0)
      }

      // TEXT COLOR SWAP — black → white (change #2).
      // At p0.12 the building starts rising noticeably behind the copy zone.
      // Tween headline (via textColorRef wrapper) and subhead to #ffffff over
      // p0.12–0.20, and swap the drop-shadow halo from white-glow → dark shadow.
      // This keeps text legible against the grey concrete/glass facade.
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

      // Slot-roll cycling headline — readable cycle p 0.06–0.42.
      const lineCount = cycle.length
      if (lineCount > 1) {
        const totalSlots = lineCount - 1
        const endY = -(slotHeightPx * totalSlots)

        tl.fromTo(
          slotTrack,
          { y: 0 },
          {
            y: endY,
            duration: 0.36,
            ease: 'none',
            modifiers: {
              y: (raw: string) => {
                const rawPx = parseFloat(raw)
                const rawProgress = rawPx / endY
                let slotPos: number

                if (totalSlots === 1) {
                  if (rawProgress < 0.25) {
                    slotPos = 0
                  } else if (rawProgress < 0.75) {
                    const t = (rawProgress - 0.25) / 0.50
                    const eased = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2
                    slotPos = eased
                  } else {
                    slotPos = 1
                  }
                } else {
                  const transitions = [[0.18, 0.32], [0.68, 0.82]] as const

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

      // p 0.43–0.52  headline fade+lift.
      tl.to(headline, { opacity: 0, y: -60, duration: 0.09, ease: 'power3.in' }, 0.43)

      // p 0.44–0.52  Scroll nudge fades.
      if (scrollNudge) {
        tl.to(scrollNudge, { opacity: 0, duration: 0.08, ease: 'power2.in' }, 0.44)
      }

      // p 0.50–0.55  Wordmark settles to rest position.
      tl.to(wordmark, { scale: 1, y: 0, duration: 0.05, ease: 'power1.out' }, 0.50)

      // p 0.55–0.88  PURE SCRUBBED CROSS-FADE — building dissolves into wordmark.
      // EXTENDED by 50%: was 0.55–0.82, now 0.55–0.88 + fill holds until 0.90 (change #5).
      // Overlap windows at every stage ensure no visual hole.
      //
      //   p 0.55–0.72  Building image:  1 → 0  (sine.inOut)
      //   p 0.55–0.70  White outline:   0 → 1  (power1.inOut)
      //   p 0.70–0.84  White outline:   1 → 0  (power1.inOut)
      //   p 0.67–0.88  Image fill:      0 → 1  (power1.inOut) — HOLD at 1 until p0.90

      tl.to(buildingImg, { opacity: 0, duration: 0.17, ease: 'sine.inOut' }, 0.55)
      tl.to(outline, { opacity: 1, duration: 0.15, ease: 'power1.inOut' }, 0.55)
      tl.to(outline, { opacity: 0, duration: 0.14, ease: 'power1.inOut' }, 0.70)
      tl.to(fill, { opacity: 1, duration: 0.21, ease: 'power1.inOut' }, 0.67)

      // p 0.90–0.98  Wordmark lifts into the cloud bloom + fades (was 0.78–0.88).
      // Delayed so the filled wordmark lingers noticeably longer before departure.
      tl.to(wordmark, { y: '-20%', scale: 1.08, opacity: 0, duration: 0.08, ease: 'power2.in' }, 0.90)

      // ── Nav fade REMOVED (change #6e): BonimNavbar self-manages its scroll state.
      // An external opacity tween conflicts with the navbar's own transparency logic.

      // Clean up will-change after the pin completes
      return () => {
        gsap.set(willChangeTargets.filter(Boolean) as Element[], { willChange: 'auto' })
        // Restore text color to black for any reduced-motion / back-nav scenario
        if (textColor) gsap.set(textColor, { color: '#050505', filter: '' })
        if (subheadEl) gsap.set(subheadEl, { color: '#050505' })
      }
    },
    [motionOk, mounted, cycle.length, slotHeightPx]  // eslint-disable-line react-hooks/exhaustive-deps
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
            top: 'clamp(44vh, 50vh, 56vh)',
            width: 'min(87.5vw, 1260px)',
            transform: 'translateX(-50%)',
            position: 'absolute',
            // No background-color — sky gradient is continuous behind building (no seam)
          }}
          aria-hidden="true"
        >
          {/* Same cool-dusk treatment as animated path for visual consistency */}
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
          {/* Cool rim light on glass faces */}
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
          {/* Cool base haze */}
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
        {/* Cloud layer behind the veil */}
        {mounted && (
          <div className="absolute inset-0 z-[1]" aria-hidden="true">
            <HeroClouds progressRef={progressRef} active={false} />
          </div>
        )}
        {/* Cool dusk veil — separates building + clouds from readable copy.
            Slightly cool-tinted blue-white so the veil feels part of the palette.
            Dark ink text is fully legible on this near-white surface. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{ background: 'rgba(228,235,246,0.82)' }}
        />
        {/* Copy stack — headline + subhead + CTA fully over sky */}
        <div className="relative z-[4] flex w-full flex-col items-center px-6 text-center gap-6">
          <h1
            className="font-bold leading-[0.95]"
            style={{
              fontFamily: 'var(--font-hebrew-display)',
              fontSize: 'clamp(2.25rem, 7vw, 6rem)',
              letterSpacing: '-0.02em',
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
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              lineHeight: 1.6,
              color: '#050505',
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

      {/* 3. Building — SMALLER (87.5vw/1260px) PAN VERSION.
          OUTER: centering only (translateX(-50%)). top: clamp(44vh,50vh,56vh) positions
          the building's ROOFLINE at ~50vh at rest — open sky occupies the top ~50%.
          Copy sits in clamp(18vh,21vh,24vh) paddingTop zone; full copy stack ends ~40vh.
          Sky gap between copy bottom (~40vh) and roofline (~50vh) = ~10vh at rest.
          BUILDING HOLDS NEAR REST THROUGH p0.45 (micro-drift ≤2vh) so all 3 slot-roll
          headlines read over bright clouds, not over the building facade.
          PAN REVEALS p0.45–0.72 — building rises the full panPx after headlines are gone. */}
      <div
        ref={buildingOuterRef}
        className="absolute left-1/2 z-[2]"
        style={{
          top: 'clamp(44vh, 50vh, 56vh)',
          width: 'min(87.5vw, 1260px)',
          transform: 'translateX(-50%)',
          margin: 0,
          padding: 0,
          // 30% smaller than before (was min(125vw,1800px)) — building is now centered
          // with visible sky on both sides. No background-color — sky gradient continuous.
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
          {/* Building image — cool blue-hour grade. The building is naturally grey concrete +
              glass, which already reads as cool. A subtle filter shifts it into dusk cohesion:
              hue-rotate(+6deg) nudges residual warm tones slightly toward blue-steel,
              saturate(0.96) desaturates slightly for a twilight feel,
              brightness(0.97) drops it a touch to sit naturally in fading light,
              contrast(1.03) keeps structural depth in the glass/facade details.
              CSS filter on <img> touches rendered pixels, NOT the transparent alpha channel,
              so the sky gradient behind is completely unaffected. */}
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

          {/* Cool rim light — faint blue-steel glow on the building's upper glass faces.
              Simulates ambient sky light reflecting off the glazing at dusk.
              Low opacity (0.28 at base) keeps it tasteful — a sheen, not a tint.
              mix-blend-mode: soft-light so it interacts with the actual building tones
              rather than painting flat colour over them.
              mask-image alpha-clips to building silhouette — sky stays clean. */}
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

          {/* Cool base haze — blue-white atmospheric mist dissolving the building base.
              Reads as ground fog or reflected sky light at the building's foundation.
              rgba(200,215,235) is a cool steel-blue-white — cohesive with the dusk sky.
              No blend mode needed here — straight cool-white dissolve for mist. */}
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

      {/* Global cool atmosphere — subtle blue-indigo depth wash from the lower scene.
          Reinforces the blue-hour dusk feel across building base + cumulus.
          Very low opacity (0.14 at base) — purely atmospheric, no muddying.
          Sits above building/clouds (z-[2]) but below wordmark (z-[3]) and copy (z-[4]).
          Fades to zero by 55% height so headline zone is completely unaffected. */}
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
            // Taller viewBox (720×285 with subWord) so the container proportions match.
            // No marginTop nudge — vertically centered in the section.
          }}
        >
          {/* Outline — white stroke, draws in while building is still visible */}
          <div ref={outlineRef} className="absolute inset-0">
            <BrandWordmarkOutline subWord="וובינר" />
          </div>
          {/* Fill — building image clipped to Hebrew letters.
              Fades in during cross-dissolve; outline fades as fill lands. */}
          <div ref={fillRef} style={{ transition: 'none' }}>
            <BrandWordmarkMask
              fillSrc={images.heroBuildingFill}
              subWord="וובינר"
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

      {/* 7. Text stack — outer wrapper is absolute-inset, inner ref receives Y shift.
          At rest copy is upper-middle (paddingTop clamp(18vh,21vh,24vh)).
          GSAP translates copyBlockRef downward ~14vh by p0.15 so all 3 slot states
          read at vertical center. GPU-safe: translateY only, willChange managed above. */}
      <div
        className="absolute inset-0 z-[4] flex flex-col items-center justify-start px-6 text-center pointer-events-none"
        style={{ paddingTop: 'clamp(18vh, 21vh, 24vh)' }}
      >
        {/* Inner ref — receives the scroll-driven Y shift toward vertical center */}
        <div ref={copyBlockRef} className="w-full flex flex-col items-center pointer-events-auto">
          {/* Cycling headline — textColorRef wrapper receives GSAP color tween (#2) */}
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
            {/* CTA */}
            <div style={{ marginTop: 'clamp(1rem, 2.5vh, 1.75rem)' }}>
              <Pill variant="dark" href="#register" withArrow>
                {c.hero.cta}
              </Pill>
            </div>
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
        <div className="w-px h-8 bg-white opacity-60" />
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
              className="flex shrink-0 items-center justify-center font-bold w-full text-center"
              style={{
                height: clipPx != null ? clipPx : 'auto',
                minHeight: 'clamp(2rem, 5vw, 4.5rem)',
                fontFamily: 'var(--font-hebrew-display)',
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                paddingTop: '0.12em',
                paddingBottom: '0.12em',
                boxSizing: 'border-box',
                // Color + filter inherited from textColorRef wrapper div.
                // GSAP tweens the wrapper to switch black→white when the
                // building rises behind the copy zone (~p0.12–0.20).
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
// Blue-hour dusk — calm deep indigo at zenith, graduating through periwinkle steel
// into a pale cool dove-grey at the horizon. The copy sits in the 10-40vh zone
// which maps to roughly 0-40% of the gradient — we keep those stops in the lighter
// periwinkle/steel range (#b8cce0 → #ccd8e8) so dark ink stays legible without
// switching text color. Deepest indigo (#1e2d4a) is at very top where no copy lives.
function SkyGradient() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0"
      style={{
        background:
          'linear-gradient(to bottom, #1e2d4a 0%, #2e4268 8%, #3d587f 18%, #6b82a6 30%, #8da3be 42%, #a8bdd4 54%, #beccdf 66%, #ccd8e8 78%, #d8e2ee 88%, #e2eaf3 100%)',
      }}
    />
  )
}

// ─── "בונים עתיד" outline wordmark ──────────────────────────────────────────
// Mirrors the BrandWordmarkMask viewBox exactly (720×285 when subWord present).
// Sub-word "וובינר" strokes in at 50% font size alongside the main word.
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
      {/* Main word — white stroke outline */}
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
      {/* Sub-word at 50% scale — matches BrandWordmarkMask sub-word position */}
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
