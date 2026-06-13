'use client'

/**
 * Hero — Signature pinned scroll experience for FIND Real Estate.
 *
 * Reference arc (docs/reference-video-screenshots):
 *   frame_003  REST    — building is LARGE, anchored to the BOTTOM of the viewport,
 *                         its upper mass filling the lower half. Headline on top,
 *                         clouds wrapping the base.
 *   frame_005/008      — building has RISEN so the WHOLE building is visible; a thin
 *                         WHITE OUTLINE of the "FIND / Real Estate" wordmark is
 *                         overlaid on the building; clouds at the base.
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
 *   4. Wordmark OUTLINE — thin white stroke of "FIND / Real Estate" overlaid on the
 *      risen building (frames 5/8)
 *   5. Wordmark FILL — the opaque building image clipped to the letterforms
 *      (frames 9/11), the end-state
 *   6. Headline block ("Find What Moves You" + subhead + pill CTA)
 *
 * Scroll timeline (pinned +=340%, scrub 1.1):
 *   p 0.00-0.08  static hold (frame_003) — building bottom-anchored, headline up top
 *   p 0.08-0.40  headline lifts+fades; building RISES (translateY up) + scales a touch
 *                so the whole building is revealed (frame_005/008)
 *   p 0.34-0.52  wordmark OUTLINE strokes on over the risen building (frame_005/008)
 *   p 0.50-0.68  the building image FILLS the letters: fill fades in, outline + the
 *                full building cross-dissolve out (frame_009/011)
 *   p 0.68-0.86  FIND BEAT — image-filled wordmark held in the clouds, micro breath
 *   p 0.86-1.00  wordmark drifts up + fades -> pin releases -> Why FIND flows in
 *
 * Fallbacks:
 *   !motionOk  -> static composed end-state (sky + building-FILL wordmark + clouds),
 *                 no pin; clouds render statically (visible, no motion)
 */

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'

import Pill from '@/components/ui/Pill'
import { FIND_GLYPH_PATHS } from '@/components/layout/Logo'
import { hero, images } from '@/data/content'
import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'

// ─── Dynamic import: HeroClouds (CSS/DOM) only runs client-side ───────────────

const HeroClouds = dynamic(() => import('./HeroClouds'), { ssr: false })

// ─── SVG wordmark dimensions ──────────────────────────────────────────────────
// Glyph paths occupy roughly x:4→182, y:4→56 in a 200×60 space; the canonical
// FIND_GLYPH_PATHS box is 186 wide. We add room below for "Real Estate" text —
// total logical height = 88.
const MASK_VB_W = 186
const MASK_VB_H = 88

// Glyph bounding box inside the viewBox (used so the clip-mask <image> covers the
// ENTIRE union of the four letterforms — no empty F/D).
const GLYPH_X = 2
const GLYPH_Y = 2
const GLYPH_W = 184 // 2 → 186
const GLYPH_H = 58 // 2 → 60

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { motionOk } = useSmoothScroll()

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

      // p 0.68-0.86  FIND BEAT — image-filled wordmark held in the clouds, micro breath
      tl.to(wordmark, { scale: 1.04, duration: 0.18, ease: 'sine.inOut' }, 0.68)

      // p 0.86-1.00  wordmark drifts up + fades; clouds lift (HeroClouds reacts to the
      // same progress) -> the pin releases and Why FIND flows in beneath. Seamless
      // hand-off, no hard cut.
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
        <div className="relative z-10 flex flex-col items-center px-4">
          {/* End-state uses the OPAQUE fill so every letter is filled. */}
          <FindWordmarkSVG buildingSrc={images.heroBuildingFill} showFill showText />
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
            frames 5/8) then FILL (opaque building image clipped to the glyphs,
            frames 9/11). Both share one transform group so they stay co-located. */}
      <div
        ref={wordmarkRef}
        className="absolute inset-0 z-[3] flex items-center justify-center px-4"
        style={{ transformOrigin: 'center center' }}
        aria-hidden="true"
      >
        <div className="relative w-full" style={{ maxWidth: 'clamp(340px, 82vw, 1100px)' }}>
          {/* Outline (white stroke) — sits over the risen building */}
          <div ref={outlineRef} className="absolute inset-0">
            <FindWordmarkSVG showOutline showText textOutline />
          </div>
          {/* Fill (opaque building image inside the letters) */}
          <div ref={fillRef}>
            <FindWordmarkSVG buildingSrc={images.heroBuildingFill} showFill showText />
          </div>
        </div>
      </div>

      {/* 6. Headline block — fades + lifts as scroll begins */}
      <div
        ref={headlineRef}
        className="absolute inset-x-0 z-[4] flex flex-col items-center px-6 text-center"
        style={{ top: '50%', transform: 'translateY(-58%)' }}
      >
        <h1
          className="font-[var(--font-display)] font-bold text-[var(--color-ink)] leading-[0.95]"
          style={{
            fontSize: 'clamp(3rem, 9vw, 9rem)',
            letterSpacing: '-0.025em',
          }}
        >
          {hero.title}
        </h1>

        <p
          className="mt-5 max-w-lg font-[var(--font-body)] font-light text-[var(--color-ink)]"
          style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
            lineHeight: 1.6,
            opacity: 0.72,
          }}
        >
          Expert agents.{' '}
          <strong className="font-semibold text-[var(--color-ink)] opacity-100">
            Real guidance.
          </strong>{' '}
          A clear path to find what&apos;s next.
        </p>

        <div className="mt-8">
          <Pill variant="dark" href="/search" withArrow>
            {hero.cta}
          </Pill>
        </div>
      </div>

      {/* Scroll nudge — visible at rest only */}
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

// ─── "FIND / Real Estate" SVG wordmark ────────────────────────────────────────
// Three render modes, controllable independently so the Hero can cross-dissolve
// between the OUTLINE beat (frames 5/8) and the image-FILL beat (frames 9/11):
//
//   showOutline  — thin white stroke of the glyphs (no fill). Used over the building.
//   showFill     — the OPAQUE, content-trimmed building image (heroBuildingFill)
//                  clipped to the union of all four glyphs. Because the image is opaque
//                  and `xMidYMid slice` covers the ENTIRE glyph bbox, every letter
//                  (F, I-chevron, N, D) is fully filled — fixing the empty-letter bug
//                  that the transparent cutout caused.
//   showText     — render "Real Estate" sub-line (filled or outlined per `textOutline`).
interface FindWordmarkSVGProps {
  buildingSrc?: string
  showOutline?: boolean
  showFill?: boolean
  showText?: boolean
  /** When true, "Real Estate" renders as a white stroke (matches the outline beat). */
  textOutline?: boolean
}

function FindWordmarkSVG({
  buildingSrc,
  showOutline = false,
  showFill = false,
  showText = false,
  textOutline = false,
}: FindWordmarkSVGProps) {
  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${MASK_VB_W} ${MASK_VB_H}`}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        role="img"
        aria-label="FIND Real Estate"
        className="w-full h-auto block"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Clip region: the union of the FIND glyph paths defines the visible
              window for the building photo. */}
          <clipPath id="findMask">
            {FIND_GLYPH_PATHS.map((p) => (
              <path key={p.id} d={p.d} fillRule="evenodd" />
            ))}
          </clipPath>
        </defs>

        {/* FILL beat — opaque building image clipped to the letterforms. The <image>
            box spans the ENTIRE glyph bounding box so no letter is left empty, and
            `xMidYMid slice` keeps the building filling every glyph. */}
        {showFill && buildingSrc && (
          <image
            href={buildingSrc}
            x={GLYPH_X}
            y={GLYPH_Y}
            width={GLYPH_W}
            height={GLYPH_H}
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#findMask)"
            style={{ filter: 'brightness(1.08) contrast(1.04) saturate(1.06)' }}
          />
        )}

        {/* OUTLINE beat — thin white stroke of the glyphs, no fill (frames 5/8). */}
        {showOutline &&
          FIND_GLYPH_PATHS.map((p) => (
            <path
              key={p.id}
              d={p.d}
              fill="none"
              fillRule="evenodd"
              stroke="#ffffff"
              strokeWidth={0.9}
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 0.4px rgba(0,0,0,0.25))' }}
            />
          ))}

        {/* "Real Estate" sub-line */}
        {showText && (
          <text
            x={MASK_VB_W / 2}
            y={82}
            textAnchor="middle"
            dominantBaseline="auto"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontWeight={700}
            fontSize={20}
            letterSpacing="0.06em"
            fill={textOutline ? 'none' : 'var(--color-ink)'}
            stroke={textOutline ? '#ffffff' : 'none'}
            strokeWidth={textOutline ? 0.6 : 0}
          >
            Real Estate
          </text>
        )}
      </svg>
    </div>
  )
}
