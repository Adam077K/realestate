'use client'

/**
 * Hero — Signature pinned scroll experience for FIND Real Estate.
 *
 * Layers (back → front):
 *   1. Painted sky (CSS gradient, zero JS dependency — instant LCP)
 *   2. HeroClouds R3F canvas (dynamic import, client-only, skipped on mobile / no-WebGL / !motionOk)
 *   3. Building photo (next/image, rises + scales on scrub)
 *   4. Masked "FIND / Real Estate" SVG wordmark (building photo fills the letterforms)
 *   5. Headline block ("Find What Moves You" + subhead + pill CTA)
 *
 * Scroll timeline (pinned +=300%, scrub 1.1):
 *   p 0.00–0.08  static hold, frame_001 look
 *   p 0.08–0.30  clouds drift; building rises+scales; headline fades up + lifts
 *   p 0.30–0.55  cross-dissolve: real building opacity→0, masked SVG opacity→1 (frame_011)
 *   p 0.55–0.80  wordmark holds, micro scale 1→1.05
 *   p 0.80–1.00  wordmark + clouds drift up + fade → unpin, next section revealed
 *
 * Fallbacks:
 *   !motionOk  → static composed end-state (sky + masked wordmark), no pin, no canvas
 *   mobile     → skip R3F canvas; simplified GSAP cross-fade still runs
 *   no-WebGL   → skip R3F canvas only; GSAP timeline still runs
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

// ─── Dynamic import: HeroClouds only runs client-side ────────────────────────

const HeroClouds = dynamic(() => import('./HeroClouds'), { ssr: false })

// ─── WebGL detection ─────────────────────────────────────────────────────────

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    )
  } catch {
    return false
  }
}

// ─── SVG clip-mask wordmark dimensions ───────────────────────────────────────
// Glyph paths occupy a 186×60 box (the FIND_GLYPH_PATHS coordinate space).
// We add 28px below for "Real Estate" text — total logical height = 88.
const MASK_VB_W = 186
const MASK_VB_H = 88

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { motionOk } = useSmoothScroll()

  const sectionRef = useRef<HTMLElement>(null)
  const buildingWrapRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const buildingImgRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)

  // Shared progress value written by ScrollTrigger onUpdate, read by R3F each frame.
  // A plain ref avoids React re-renders on every scroll tick.
  const progressRef = useRef<number>(0)

  // Client-side feature gates — set after first hydration.
  const [isDesktop, setIsDesktop] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDesktop(window.innerWidth >= 768)
    setHasWebGL(detectWebGL())

    const mq = window.matchMedia('(min-width: 768px)')
    const onMqChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', onMqChange)
    return () => mq.removeEventListener('change', onMqChange)
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
      if (!buildingWrap || !headline || !buildingImg || !wordmark) return

      // Initialise animated layers to their resting state.
      gsap.set(wordmark, { opacity: 0 })
      gsap.set(buildingImg, { opacity: 1 })

      // Enable GPU compositing hints.
      gsap.set([buildingWrap, headline, wordmark], { willChange: 'transform, opacity' })
      gsap.set(buildingImg, { willChange: 'opacity' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1.1,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      // p 0–0.08  static hold (frame_001 look)
      tl.to({}, { duration: 0.08 })

      // p 0.08–0.30  headline fades + lifts; building rises and scales
      tl.to(
        headline,
        { opacity: 0, y: -56, duration: 0.22, ease: 'power2.in' },
        '<'
      )
      tl.to(
        buildingWrap,
        { y: '-14%', scale: 1.25, duration: 0.22, ease: 'power1.inOut' },
        '<'
      )

      // p 0.30–0.55  cross-dissolve: real building → masked wordmark (frame_011)
      tl.to(buildingImg, { opacity: 0, duration: 0.25, ease: 'power1.in' }, 0.30)
      tl.to(wordmark, { opacity: 1, duration: 0.25, ease: 'power1.out' }, 0.30)

      // p 0.55–0.80  wordmark holds, micro-scale breath
      tl.to(wordmark, { scale: 1.05, duration: 0.25, ease: 'sine.inOut' }, 0.55)

      // p 0.80–1.00  everything drifts up and fades; unpins automatically
      tl.to(
        [wordmark, buildingWrap],
        { y: '-22%', opacity: 0, duration: 0.20, ease: 'power2.in' },
        0.80
      )

      // Clean up will-change after pin completes.
      return () => {
        gsap.set([buildingWrap, headline, wordmark, buildingImg], { willChange: 'auto' })
      }
    },
    // Re-run when motionOk or mounted resolves — both are set once, so this only fires twice max.
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
        <div className="relative z-10 flex flex-col items-center px-4">
          <FindWordmarkSVG buildingSrc={images.heroBuilding} />
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

      {/* 2. HeroClouds R3F canvas — only when: desktop + WebGL + motionOk */}
      {mounted && (
        <div className="absolute inset-0 z-[1]" aria-hidden="true">
          <HeroClouds
            progressRef={progressRef}
            active={isDesktop && hasWebGL && motionOk}
          />
        </div>
      )}

      {/* 3. Building image wrapper — rises + scales on scrub */}
      <div
        ref={buildingWrapRef}
        className="absolute bottom-0 left-1/2 z-[2] w-full max-w-3xl -translate-x-1/2"
        style={{ transformOrigin: 'center bottom' }}
      >
        {/* Inner wrapper holds opacity for the cross-dissolve */}
        <div ref={buildingImgRef} aria-hidden="true">
          <Image
            src={images.heroBuilding}
            alt="Luxury penthouse building at dusk"
            width={1200}
            height={900}
            priority
            quality={90}
            className="w-full h-auto object-cover object-top select-none"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </div>
      </div>

      {/* 4. Masked "FIND / Real Estate" SVG wordmark — fades in at mid-scroll */}
      <div
        ref={wordmarkRef}
        className="absolute inset-0 z-[3] flex items-center justify-center px-4"
        aria-hidden="true"
      >
        <FindWordmarkSVG buildingSrc={images.heroBuilding} />
      </div>

      {/* 5. Headline block — fades + lifts as scroll begins */}
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
        <span
          className="text-[var(--color-ink)] text-[0.6rem] tracking-[0.25em] uppercase font-light"
        >
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

// ─── Building-filled "FIND / Real Estate" SVG wordmark ────────────────────────
// The hero building photo is rendered inside an SVG <image> element and clipped to
// the "FIND" glyph letterforms via a <clipPath>. "Real Estate" is plain dark text below.
interface FindWordmarkSVGProps {
  buildingSrc: string
}

function FindWordmarkSVG({ buildingSrc }: FindWordmarkSVGProps) {
  return (
    <div
      className="w-full"
      style={{ maxWidth: 'clamp(340px, 82vw, 1100px)' }}
    >
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
          {/* Clip region: the FIND glyph paths define the visible window for the photo */}
          <clipPath id="findMask">
            {FIND_GLYPH_PATHS.map((p) => (
              <path key={p.id} d={p.d} fillRule="evenodd" />
            ))}
          </clipPath>
        </defs>

        {/* Building photo clipped to the FIND letterforms.
            xMidYMax favours the warm-lit brick + window band (brighter than the
            dark roofline); the filter lifts brightness/contrast so the letterforms
            read with high contrast against the pale sky (frame_011). */}
        <image
          href={buildingSrc}
          x={0}
          y={0}
          width={MASK_VB_W}
          height={60}
          preserveAspectRatio="xMidYMax slice"
          clipPath="url(#findMask)"
          style={{ filter: 'brightness(1.18) contrast(1.08) saturate(1.12)' }}
        />

        {/* "Real Estate" sub-line in display font, dark, below the glyphs */}
        <text
          x={MASK_VB_W / 2}
          y={82}
          textAnchor="middle"
          dominantBaseline="auto"
          fontFamily="var(--font-display), system-ui, sans-serif"
          fontWeight={700}
          fontSize={20}
          letterSpacing="0.06em"
          fill="var(--color-ink)"
        >
          Real Estate
        </text>
      </svg>
    </div>
  )
}
