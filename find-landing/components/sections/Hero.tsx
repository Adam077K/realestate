'use client'

/**
 * Hero — Signature pinned scroll experience for בונים עתיד (Bonim Atid).
 *
 * Reference arc (docs/reference-video-screenshots):
 *   frame_003  REST    — building is LARGE, anchored to the BOTTOM of the viewport,
 *                         its upper mass filling the lower half. Headline on top,
 *                         clouds wrapping the base.
 *   frame_005/008      — building has RISEN so the WHOLE building is visible; a thin
 *                         WHITE OUTLINE of the "בונים עתיד" wordmark is overlaid on
 *                         the building; clouds at the base.
 *   frame_009/011      — the building IMAGE FILLS the wordmark letters (image-inside-
 *                         text) floating in the clouds.
 *
 * Layers (back -> front):
 *   1. Painted sky (CSS gradient, zero JS dependency — instant LCP)
 *   2. HeroClouds — pure CSS/DOM puffs; visible through the ENTIRE pin (the wordmark
 *      beat floats IN the clouds, frames 8-11)
 *   3. Building CUTOUT (transparent PNG) — bottom-anchored, LARGE; rises up + scales
 *      slightly on scroll so all of it is revealed, then cross-dissolves out as the
 *      wordmark fills
 *   4. Wordmark OUTLINE — thin white stroke of "בונים עתיד" overlaid on the risen
 *      building (frames 5/8)
 *   5. Wordmark FILL — the building image clipped to the Hebrew letterforms via
 *      <BrandWordmarkMask> (frames 9/11), the end-state
 *   6. Headline block (Hebrew hero title + subhead + pill CTA) — bilingual via useContent()
 *
 * Scroll timeline (pinned +=340%, scrub 1.1):
 *   p 0.00-0.08  static hold (frame_003) — building bottom-anchored, headline up top
 *   p 0.08-0.40  headline lifts+fades; building RISES (translateY up) + scales a touch
 *                so the whole building is revealed (frame_005/008)
 *   p 0.34-0.52  wordmark OUTLINE strokes on over the risen building (frame_005/008)
 *   p 0.50-0.68  the building image FILLS the letters: fill fades in, outline + the
 *                full building cross-dissolve out (frame_009/011)
 *   p 0.68-0.86  BRAND BEAT — image-filled wordmark held in the clouds, micro breath
 *   p 0.86-1.00  wordmark drifts up + fades -> pin releases -> next section flows in
 *
 * Fallbacks:
 *   !motionOk  -> static composed end-state (sky + BrandWordmarkMask + clouds),
 *                 no pin; clouds render statically (visible, no motion)
 *
 * RTL: the hero is fully centered, so it reads identically in dir=rtl and dir=ltr.
 * The Hebrew wordmark renders direction:rtl inside <BrandWordmarkMask>; the scroll
 * nudge and headline block are centered and direction-agnostic.
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

// ─── Dynamic import: HeroClouds (CSS/DOM) only runs client-side ───────────────

const HeroClouds = dynamic(() => import('./HeroClouds'), { ssr: false })

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  const sectionRef = useRef<HTMLElement>(null)
  const buildingWrapRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const buildingImgRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)

  // Shared progress value written by ScrollTrigger onUpdate, read by HeroClouds
  // each frame. A plain ref avoids React re-renders on every scroll tick.
  const progressRef = useRef<number>(0)

  // Client-side mount gate — set after first hydration.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ── Pinned, scrubbed master timeline (motionOk only) ─────────────────────
  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk || !mounted) return

      const buildingWrap = buildingWrapRef.current
      const headline = headlineRef.current
      const buildingImg = buildingImgRef.current
      const wordmark = wordmarkRef.current
      const outline = outlineRef.current
      const fill = fillRef.current
      if (!buildingWrap || !headline || !buildingImg || !wordmark || !outline || !fill) return

      // Initialise animated layers to their resting state (frame_003).
      // The building sits LARGE and bottom-anchored; the wordmark group is hidden.
      gsap.set(wordmark, { opacity: 1, scale: 0.96, y: 18 })
      gsap.set(outline, { opacity: 0 })
      gsap.set(fill, { opacity: 0 })
      gsap.set(buildingImg, { opacity: 1 })
      gsap.set(buildingWrap, { y: '0%', scale: 1 })

      // Enable GPU compositing hints.
      gsap.set([buildingWrap, headline, wordmark, outline, fill], {
        willChange: 'transform, opacity',
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=340%',
          pin: true,
          scrub: 1.1,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      // p 0-0.08  static hold (frame_003 look) — building large + bottom-anchored
      tl.to({}, { duration: 0.08 })

      // p 0.08-0.40  headline lifts + fades; building RISES (translateY upward) and
      // scales slightly so the WHOLE building is progressively revealed (frame_005/008).
      // It stays bottom-anchored as it rises — the upward translate reveals more of it,
      // it never detaches into mid-air.
      tl.to(headline, { opacity: 0, y: -72, duration: 0.30, ease: 'power2.in' }, '<')
      tl.to(
        buildingWrap,
        { y: '-30%', scale: 1.06, duration: 0.32, ease: 'power1.inOut' },
        '<'
      )

      // p 0.34-0.52  wordmark OUTLINE strokes on over the risen building (frame_005/008).
      // The wordmark group settles to its resting transform as the outline fades up.
      tl.to(wordmark, { scale: 1, y: 0, duration: 0.18, ease: 'power2.out' }, 0.34)
      tl.to(outline, { opacity: 1, duration: 0.18, ease: 'power1.out' }, 0.34)

      // p 0.50-0.68  the building image FILLS the letters: fill fades in while the
      // outline + the full-bleed building cross-dissolve out, leaving the image-filled
      // wordmark floating in the clouds (frame_009/011).
      tl.to(fill, { opacity: 1, duration: 0.16, ease: 'power1.inOut' }, 0.50)
      tl.to(outline, { opacity: 0, duration: 0.14, ease: 'power1.in' }, 0.52)
      tl.to(buildingImg, { opacity: 0, duration: 0.18, ease: 'power1.in' }, 0.50)
      tl.to(
        buildingWrap,
        { y: '-34%', scale: 1.0, duration: 0.18, ease: 'power1.inOut' },
        0.50
      )

      // p 0.68-0.86  BRAND BEAT — image-filled wordmark held in the clouds, micro breath
      tl.to(wordmark, { scale: 1.04, duration: 0.18, ease: 'sine.inOut' }, 0.68)

      // p 0.86-1.00  wordmark drifts up + fades; clouds lift (HeroClouds reacts to the
      // same progress) -> the pin releases and the next section flows in beneath.
      // Seamless hand-off, no hard cut.
      tl.to(
        wordmark,
        { y: '-22%', scale: 1.1, opacity: 0, duration: 0.14, ease: 'power2.in' },
        0.86
      )

      // Clean up will-change after pin completes.
      return () => {
        gsap.set([buildingWrap, headline, wordmark, outline, fill], {
          willChange: 'auto',
        })
      }
    },
    // Re-run when motionOk or mounted resolves — both set once, so this fires twice max.
    [motionOk, mounted]
  )

  // ── Reduced-motion fallback: static composed end-state ───────────────────
  if (!motionOk) {
    return (
      <section
        id="hero"
        aria-label="Hero"
        className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      >
        <SkyGradient />
        {mounted && (
          <div className="absolute inset-0 z-[1]" aria-hidden="true">
            <HeroClouds progressRef={progressRef} active={false} />
          </div>
        )}
        <div className="relative z-10 flex w-full flex-col items-center px-4">
          {/* End-state: the בונים עתיד wordmark filled with the golden building. */}
          <BrandWordmarkMask
            fillSrc={images.heroBuildingFill}
            className="block h-auto w-full max-w-[clamp(360px,86vw,1100px)]"
          />
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
      {/* 1. Sky gradient — zero JS, instant paint (contributes to LCP) */}
      <SkyGradient />

      {/* 2. HeroClouds — visible through the ENTIRE pin (the wordmark beat floats IN
            the clouds). `active` gates drift + scroll parallax only. */}
      {mounted && (
        <div className="absolute inset-0 z-[1]" aria-hidden="true">
          <HeroClouds progressRef={progressRef} active={motionOk} />
        </div>
      )}

      {/* 3. Building CUTOUT (transparent PNG) — LARGE + bottom-anchored. At rest its
            upper mass fills the lower half (frame_003). On scroll it rises so the whole
            building is revealed, then cross-dissolves out as the wordmark fills. */}
      <div
        ref={buildingWrapRef}
        className="absolute bottom-0 left-1/2 z-[2] -translate-x-1/2"
        style={{
          width: 'min(95vw, 1100px)',
          transformOrigin: 'center bottom',
        }}
      >
        {/* Inner wrapper holds opacity for the cross-dissolve */}
        <div ref={buildingImgRef} aria-hidden="true">
          <Image
            src={images.heroBuildingCutout}
            alt="Golden-hour residential building"
            width={1998}
            height={1338}
            priority
            quality={90}
            className="h-auto w-full select-none object-contain"
            sizes="(max-width: 768px) 95vw, 1100px"
          />
        </div>
      </div>

      {/* 4 + 5. Wordmark group — OUTLINE (thin white stroke over the building,
            frames 5/8) then FILL (building image clipped to the בונים עתיד glyphs
            via <BrandWordmarkMask>, frames 9/11). Both share one transform group so
            they stay co-located through the cross-dissolve. */}
      <div
        ref={wordmarkRef}
        className="absolute inset-0 z-[3] flex items-center justify-center px-4"
        style={{ transformOrigin: 'center center' }}
        aria-hidden="true"
      >
        <div className="relative w-full" style={{ maxWidth: 'clamp(360px, 86vw, 1100px)' }}>
          {/* Outline (white stroke) — sits over the risen building */}
          <div ref={outlineRef} className="absolute inset-0">
            <BrandWordmarkOutline />
          </div>
          {/* Fill (building image inside the Hebrew letters) */}
          <div ref={fillRef}>
            <BrandWordmarkMask
              fillSrc={images.heroBuildingFill}
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>

      {/* 6. Headline block — fades + lifts as scroll begins. Bilingual via useContent();
            centered so it reads correctly in both RTL (he) and LTR (en). */}
      <div
        ref={headlineRef}
        className="absolute inset-x-0 z-[4] flex flex-col items-center px-6 text-center"
        style={{ top: '50%', transform: 'translateY(-58%)' }}
      >
        <h1
          className="font-[var(--font-display)] font-bold text-[var(--color-ink)] leading-[0.95]"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 7.5rem)',
            letterSpacing: '-0.02em',
          }}
        >
          {c.hero.title}
        </h1>

        <p
          className="mt-5 max-w-xl font-[var(--font-body)] font-light text-[var(--color-ink)]"
          style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
            lineHeight: 1.6,
            opacity: 0.78,
          }}
        >
          {c.hero.subhead}
        </p>

        <div className="mt-8">
          <Pill variant="dark" href="#register" withArrow>
            {c.hero.cta}
          </Pill>
        </div>
      </div>

      {/* Scroll nudge — visible at rest only. Direction-agnostic (centered). */}
      <div
        className="pointer-events-none absolute bottom-8 left-1/2 z-[4] -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
        style={{ opacity: 0.45 }}
      >
        <span className="text-[var(--color-ink)] text-[0.6rem] tracking-[0.25em] uppercase font-light">
          Scroll
        </span>
        <div className="w-px h-8 bg-[var(--color-ink)] opacity-50" />
      </div>
    </section>
  )
}

// ─── Sky gradient ─────────────────────────────────────────────────────────────
// Matches frame_001: pale blue upper, soft cream/warm peach lower horizon.
// Inline stops — does NOT reference the over-saturated sunset CSS vars.
function SkyGradient() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0"
      style={{
        background:
          'linear-gradient(to bottom, #aecbe8 0%, #c8ddf0 18%, #dfe9f3 38%, #eef3f6 55%, #f5ede3 75%, #f3d9c4 100%)',
      }}
    />
  )
}

// ─── "בונים עתיד" outline beat ──────────────────────────────────────────────────
// Thin white stroke of the Hebrew wordmark, no fill (frames 5/8). Shares the same
// viewBox + type metrics as <BrandWordmarkMask> so the outline and the image-fill
// occupy the same letterforms and cross-dissolve cleanly. RTL via direction="rtl".
function BrandWordmarkOutline() {
  return (
    <svg
      viewBox="0 0 600 160"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="בונים עתיד"
      className="block h-auto w-full"
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
        fontSize="130"
        letterSpacing="-2"
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.4}
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 0.6px rgba(0,0,0,0.25))' }}
      >
        בונים עתיד
      </text>
    </svg>
  )
}
