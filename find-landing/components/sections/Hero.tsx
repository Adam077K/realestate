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
 * Motion timeline (scrub: true, pin +=290%):
 *   p 0.00       REST: building low (roofline ~50vh), sky open above, headline/subhead/CTA visible
 *   p 0.00–0.45  building HOLDS near rest — micro-drift only (~4% of panPx ≈ 1–2vh)
 *                → ALL 3 headline states (p 0.06–0.42) remain over bright clouds
 *   p 0.06–0.42  headline slot-roll cycles 3 sentences with plateau holds per sentence
 *   p 0.38–0.46  subhead+CTA fade+lift out
 *   p 0.43–0.52  headline fade+lift out (fully gone by 0.52)
 *   p 0.44–0.52  scroll nudge fades
 *   p 0.45–0.72  building PAN REVEAL — rushes to full -panPx after headlines gone
 *   p 0.52–0.55  dead zone: building mid-pan, no text
 *   p 0.55–0.63  CROSS-DISSOLVE begins: outline draws in (building still visible / mid-pan)
 *   p 0.57–0.67  building IMAGE fades out
 *   p 0.62–0.72  fill fades in; outline fades as fill lands (p 0.67–0.72)
 *   p 0.72–0.78  brand micro-breath (pan complete)
 *   p 0.40–0.90  cloud bloom (driven by HeroClouds progressRef)
 *   p 0.40–0.85  nav fades out, restores after
 *   p 0.78–0.88  wordmark lifts into cloud bloom + fades
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
          end: '+=290%',
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      // BUILDING PAN — two-phase schedule:
      //
      //   p 0.00–0.45  HOLD near rest position. The headline cycle runs p 0.06–0.42 and
      //                the headline fades completely by p 0.52. We must keep the building
      //                LOW (roofline at ~50vh) so all 3 slot-roll states read over bright
      //                clouds, not over the grey concrete facade.
      //                A gentle drift of ≤ 2.5vh is allowed as a subtle parallax feel but
      //                the building top MUST NOT rise into the copy zone (≤ 24vh paddingTop
      //                + headline height ≈ up to ~40vh).
      //
      //   p 0.45–0.72  PAN REVEAL. After the last headline is gone (p 0.52) and during
      //                the cross-dissolve sequence (outline in p 0.55, building fade p 0.57),
      //                the building executes its full upward pan. The pan overlaps the
      //                wordmark cross-dissolve which is fine — by then the building has
      //                filled the frame and is transitioning to the wordmark.
      //
      // Implementation: two tweens — a micro-drift hold, then the reveal.

      // Phase 1: micro-drift (barely perceptible parallax while headlines are visible).
      // Building moves only ~2-3% of its eventual pan — enough to feel alive, not enough
      // to bring the roofline close to the copy zone.
      const microDrift = panPx * 0.04   // ≈ 1–2vh — well below any copy
      tl.to(
        buildingWrap,
        { y: -microDrift, duration: 0.45, ease: 'power1.in' },
        0
      )

      // Phase 2: full pan reveal (p 0.45–0.72). Building rushes upward after headlines
      // are gone, with a strong ease-out so it decelerates into the wordmark frame.
      // Duration = 0.27 in timeline units (0.72 - 0.45).
      tl.to(
        buildingWrap,
        { y: -panPx, duration: 0.27, ease: 'power2.out' },
        0.45
      )

      // Slot-roll cycling headline — comfortable readable cycle p 0.06–0.42.
      // Each of the 3 sentences holds for a "breath" before transitioning to the next.
      // The modifier maps raw GSAP progress → slot position with per-sentence plateaus.
      const lineCount = cycle.length
      if (lineCount > 1) {
        const totalSlots = lineCount - 1
        const endY = -(slotHeightPx * totalSlots)

        tl.fromTo(
          slotTrack,
          { y: 0 },
          {
            y: endY,
            duration: 0.36,  // spans p 0.06–0.42 — long, readable, with plateau holds
            ease: 'none',
            modifiers: {
              y: (raw: string) => {
                // Map raw linear progress (0→1) to slot position with plateau holds.
                // For 3 sentences (2 transitions): each sentence holds for ~1/3 of the
                // cycle, with a brief cross-fade window between them.
                // Plateau scheme (totalSlots=2):
                //   0.00–0.18  sentence 0 (hold)
                //   0.18–0.32  transition 0→1
                //   0.32–0.68  sentence 1 (hold)
                //   0.68–0.82  transition 1→2
                //   0.82–1.00  sentence 2 (hold)
                const rawPx = parseFloat(raw)
                const rawProgress = rawPx / endY   // 0→1 over the tween
                let slotPos: number

                if (totalSlots === 1) {
                  // 2 sentences: 0→hold→1
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
                  // 3 sentences (totalSlots=2): hold → transition → hold → transition → hold
                  const holds = [0.18, 0.50]   // progress thresholds where holds end
                  const transitions = [[0.18, 0.32], [0.68, 0.82]]
                  const holdEnds = [0.32, 1.00]

                  if (rawProgress < holds[0]) {
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

                  // Suppress unused variable warning for holdEnds
                  void holdEnds
                }

                const resultPx = -(slotPos * slotHeightPx)
                return `${resultPx}px`
              },
            },
          },
          0.06
        )
      }

      // p 0.38–0.46  subhead+CTA: exits — fully gone at 0.46.
      tl.to(subCta, { opacity: 0, y: -50, duration: 0.08, ease: 'power3.in' }, 0.38)

      // p 0.43–0.52  headline: fade+lift complete by 0.52.
      tl.to(headline, { opacity: 0, y: -60, duration: 0.09, ease: 'power3.in' }, 0.43)

      // p 0.44–0.52  Scroll nudge fades.
      if (scrollNudge) {
        tl.to(scrollNudge, { opacity: 0, duration: 0.08, ease: 'power2.in' }, 0.44)
      }

      // p 0.55–0.68  CINEMATIC CROSS-DISSOLVE: outline draws in, building fades, fill lands.
      // (a) Wordmark position: reset to centered, starting invisible at p 0.55
      tl.set(wordmark, { scale: 1, y: 0 }, 0.55)
      // (b) Outline DRAWS IN over p 0.55–0.63 (while building still partly visible)
      tl.to(outline, { opacity: 1, duration: 0.08, ease: 'power2.inOut' }, 0.55)
      // (c) Building IMAGE cross-FADES OUT over p 0.57–0.67
      tl.to(buildingImg, { opacity: 0, duration: 0.10, ease: 'sine.inOut' }, 0.57)
      // (d) Fill FADES IN over p 0.62–0.72, outline fades as fill lands p 0.67–0.72
      tl.to(fill,    { opacity: 1, duration: 0.10, ease: 'power2.inOut' }, 0.62)
      tl.to(outline, { opacity: 0, duration: 0.05, ease: 'power2.in' },   0.67)

      // p 0.72–0.78  brand micro-breath: settle with spring feel
      tl.to(wordmark, { scale: 1.04, duration: 0.03, ease: 'power2.out' }, 0.72)
      tl.to(wordmark, { scale: 1.02, duration: 0.03, ease: 'back.out(1.2)' }, 0.75)

      // p 0.78–0.88  wordmark lifts into the cloud bloom + fades
      tl.to(
        wordmark,
        { y: '-20%', scale: 1.08, opacity: 0, duration: 0.10, ease: 'power2.in' },
        0.78
      )

      // p 0.40–0.85  Nav fades out before wordmark era, restores after.
      const nav = document.querySelector<HTMLElement>('nav, header[role="banner"]') ??
                  document.querySelector<HTMLElement>('[data-hero-nav]')
      if (nav) {
        tl.to(nav, { opacity: 0, duration: 0.14, ease: 'power2.in' }, 0.40)
        tl.to(nav, { opacity: 1, duration: 0.08, ease: 'power2.out' }, 0.85)
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

      {/* 7. Text stack — vertically + horizontally centred.
          v3 rest framing: building roofline at ~46vh (approach b), sky occupies top ~46%.
          paddingTop reduced to ~10vh (approach a) so the copy block sits higher in the sky.
          Stack bottom: 10vh + headline ~13vh + gap 4.5vh + subhead 3.5vh + gap 4vh + CTA 5.5vh
          ≈ 40-41vh — gives 5-6vh of clear sky between CTA bottom and the roofline at 46vh.
          Mobile (390×844): paddingTop 8vh, headline ~3.7vh, all gaps/text ≈ 27vh total.
          Roofline clamp min = 34vh → 7vh breathing room on mobile. Both clear. */}
      <div
        className="absolute inset-0 z-[4] flex flex-col items-center justify-start px-6 text-center"
        style={{ paddingTop: 'clamp(18vh, 21vh, 24vh)' }}
      >
        {/* Cycling headline */}
        <div ref={headlineRef} className="flex w-full flex-col items-center">
          <SlotRollHeadline
            ref={slotTrackRef}
            lines={cycle}
            onSlotHeight={handleSlotHeight}
          />
        </div>

        {/* Subhead + CTA — tighter gaps (FIND-style compact upper-middle block) */}
        <div
          ref={subCtaRef}
          className="flex w-full flex-col items-center"
          style={{ marginTop: 'clamp(0.75rem, 2vh, 1.5rem)' }}
        >
          <p
            className="font-light"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              lineHeight: 1.6,
              maxWidth: '640px',
              color: 'rgba(225,235,248,0.90)',
            }}
          >
            {c.hero.subhead}
          </p>
          {/* CTA — tighter gap below subhead */}
          <div style={{ marginTop: 'clamp(1rem, 2.5vh, 1.75rem)' }}>
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
                // Black→gray gradient text — premium editorial feel.
                // background-clip:text clips the gradient to the glyph shapes.
                // drop-shadow (not textShadow — that paints the bounding box, not glyphs)
                // adds a faint white halo that lifts the dark text off bright cloud mass.
                background: 'linear-gradient(180deg, #111111 0%, #6b6b6b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                filter: 'drop-shadow(0 1px 8px rgba(255,255,255,0.60))',
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
