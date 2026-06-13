'use client'

/**
 * Hero — Signature pinned scroll experience for בונים עתיד (Bonim Atid).
 *
 * Reference arc (docs/reference-video-screenshots-2):
 *   frame_001  REST    — only the UPPER portion of the building is visible, sitting
 *                         FLUSH at the very bottom of the viewport. The cycling
 *                         headline sits ABOVE the building. Clouds wrap the base.
 *   frame_004  scroll  — the building has GROWN bigger (more of it visible), still
 *                         flush to the bottom, starting to reach the headline.
 *   frame_007  scroll  — the building fills most of the frame; the "בונים עתיד"
 *                         wordmark OUTLINE strokes on over it.
 *   frame_010  end     — the building IMAGE FILLS the wordmark letters, floating in
 *                         the clouds (image-inside-text via <BrandWordmarkMask>).
 *
 * CRITICAL anchoring rule (Adam's repeated complaint — "it floats mid-air with a gap"):
 *   The building GROWS IN PLACE from a BOTTOM anchor. It is positioned
 *   `bottom:0; left:50%; transform-origin:center bottom` inside an `overflow:hidden`
 *   section. We animate SCALE ONLY (≈0.62 → ≈1.35) — never translateY upward. Its
 *   base always sits at (or clipped below) the viewport bottom, so there is ALWAYS
 *   zero gap between the building base and the bottom of the screen. The growth itself
 *   is the "rising" that reaches up to cover the headline.
 *
 * Layers (back -> front):
 *   1. Painted sky (CSS gradient, zero JS dependency — instant LCP)
 *   2. HeroClouds — pure CSS/DOM puffs; visible through the ENTIRE pin (the wordmark
 *      beat floats IN the clouds). UNTOUCHED here — driven by the shared progressRef.
 *   3. Building CUTOUT (transparent PNG) — bottom-anchored; scales UP from the bottom
 *      so it grows to cover the headline, then cross-dissolves out as the wordmark fills
 *   4. Wordmark OUTLINE — thin white stroke of "בונים עתיד" over the grown building
 *   5. Wordmark FILL — the building image clipped to the Hebrew letters (end-state)
 *   6. Headline block — a CYCLING slot-roll headline (3 sentences from c.hero.cycle)
 *      + subhead + pill CTA. Bilingual via useContent(), centered, RTL/LTR-correct.
 *
 * Scroll timeline (pinned +=340%, scrub 1.1):
 *   p 0.00-0.30  the building grows (scale up, bottom-anchored) while the headline
 *                CYCLES through its 3 sentences via a vertical slot-roll (≈one per 0.1).
 *                Subhead + CTA hold, then begin to fade.
 *   p 0.30-0.48  building keeps growing to cover the headline; headline + subhead +
 *                CTA fade out as the building rises over them.
 *   p 0.42-0.58  wordmark OUTLINE strokes on over the grown building (frame_007).
 *   p 0.56-0.72  the building image FILLS the letters: fill fades in while the outline
 *                + the full building cross-dissolve out (frame_010).
 *   p 0.72-0.88  BRAND BEAT — image-filled wordmark held in the clouds, micro breath.
 *   p 0.88-1.00  wordmark drifts up + fades -> pin releases -> next section flows in.
 *
 * Fallbacks:
 *   !motionOk  -> static composed end-state (sky + BrandWordmarkMask + clouds); the
 *                 headline shows only the FIRST sentence statically; no pin/cycle.
 *
 * RTL: the hero is fully centered, so it reads identically in dir=rtl and dir=ltr.
 * The slot-roll track translates vertically (direction-agnostic) and each line is
 * center-aligned, so it is correct in both Hebrew (RTL) and English (LTR).
 *
 * GPU: transform/opacity only; will-change toggled around the pin; clouds untouched.
 */

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { forwardRef, useRef, useState, useEffect } from 'react'

import Pill from '@/components/ui/Pill'
import { BrandWordmarkMask } from '@/components/layout/Logo'
import { images } from '@/data/content'
import { useContent } from '@/components/providers/LanguageProvider'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'

// ─── Dynamic import: HeroClouds (CSS/DOM) only runs client-side ───────────────

const HeroClouds = dynamic(() => import('./HeroClouds'), { ssr: false })

// ─── Tuning constants ──────────────────────────────────────────────────────────
// Building scale: at rest only the UPPER portion shows (frame_001 — small);
// on scroll it grows to cover the headline (frame_004 -> 007). transform-origin is
// center-bottom so the base never leaves the viewport bottom (zero floating gap).
const BUILDING_REST_SCALE = 0.62
const BUILDING_GROWN_SCALE = 1.35

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  // 3-sentence cycle for the headline slot-roll. Guard length so the component is
  // resilient even if content is trimmed (always falls back to the title).
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
      const slotTrack = slotTrackRef.current
      const subCta = subCtaRef.current
      const buildingImg = buildingImgRef.current
      const wordmark = wordmarkRef.current
      const outline = outlineRef.current
      const fill = fillRef.current
      if (
        !buildingWrap ||
        !headline ||
        !slotTrack ||
        !subCta ||
        !buildingImg ||
        !wordmark ||
        !outline ||
        !fill
      ) {
        return
      }

      // Initialise animated layers to their resting state (frame_001).
      // The building sits SMALL + bottom-anchored (only upper portion visible);
      // the wordmark group is hidden; the slot-roll shows the FIRST sentence.
      gsap.set(wordmark, { opacity: 1, scale: 0.96, y: 18 })
      gsap.set(outline, { opacity: 0 })
      gsap.set(fill, { opacity: 0 })
      gsap.set(buildingImg, { opacity: 1 })
      // SCALE ONLY from the bottom anchor — no translateY (that caused the float).
      gsap.set(buildingWrap, { scale: BUILDING_REST_SCALE })
      gsap.set(slotTrack, { yPercent: 0 })
      gsap.set([headline, subCta], { opacity: 1, y: 0 })

      // Enable GPU compositing hints.
      gsap.set([buildingWrap, headline, slotTrack, subCta, wordmark, outline, fill], {
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

      // p 0.00-0.48  building GROWS in place (scale up, bottom-anchored). The growth
      // is the "rising" — its base stays flush at the viewport bottom the whole time,
      // and it reaches up to cover the headline. No translateY → zero floating gap.
      tl.fromTo(
        buildingWrap,
        { scale: BUILDING_REST_SCALE },
        { scale: BUILDING_GROWN_SCALE, duration: 0.48, ease: 'power1.in' },
        0
      )

      // p 0.00-0.30  CYCLING headline slot-roll. The track holds N stacked lines; we
      // step yPercent so each sentence rolls up and the next rolls in. One sentence
      // per ≈0.10 of progress. With M lines the track moves -100*(M-1)/M to land on
      // the last line. Each line occupies 1/M of the track height.
      const lineCount = cycle.length
      if (lineCount > 1) {
        const endYPercent = -100 * ((lineCount - 1) / lineCount)
        tl.fromTo(
          slotTrack,
          { yPercent: 0 },
          {
            yPercent: endYPercent,
            duration: 0.1 * (lineCount - 1),
            ease: 'none',
            // Snap-roll feel: hold each line, then a quick premium roll to the next.
            modifiers: {
              yPercent: (raw: string) => {
                // Map raw continuous yPercent to a stepped + eased "dice roll":
                // segment within [0, lineCount-1], ease the fractional part so each
                // sentence settles with a tactile slot/dice resolve.
                const m = lineCount
                const total = m - 1
                const pos = (parseFloat(raw) / endYPercent) * total // 0..total
                const idx = Math.min(Math.floor(pos), total - 1)
                const frac = pos - idx
                const eased =
                  frac < 0.5
                    ? 4 * frac * frac * frac
                    : 1 - Math.pow(-2 * frac + 2, 3) / 2
                const stepped = (idx + eased) / total // 0..1
                return `${stepped * endYPercent}`
              },
            },
          },
          0
        )
      }

      // p 0.28-0.44  headline group fades + lifts as the building covers it.
      tl.to(headline, { opacity: 0, y: -64, duration: 0.16, ease: 'power2.in' }, 0.28)

      // p 0.22-0.40  subhead + CTA fade out a touch earlier (they sit lower, the
      // growing building reaches them first).
      tl.to(subCta, { opacity: 0, y: -40, duration: 0.18, ease: 'power2.in' }, 0.22)

      // p 0.42-0.58  wordmark OUTLINE strokes on over the grown building (frame_007).
      tl.to(wordmark, { scale: 1, y: 0, duration: 0.16, ease: 'power2.out' }, 0.42)
      tl.to(outline, { opacity: 1, duration: 0.16, ease: 'power1.out' }, 0.42)

      // p 0.56-0.72  the building image FILLS the letters: fill fades in while the
      // outline + the full building cross-dissolve out (frame_010).
      tl.to(fill, { opacity: 1, duration: 0.16, ease: 'power1.inOut' }, 0.56)
      tl.to(outline, { opacity: 0, duration: 0.14, ease: 'power1.in' }, 0.58)
      tl.to(buildingImg, { opacity: 0, duration: 0.18, ease: 'power1.in' }, 0.56)

      // p 0.72-0.88  BRAND BEAT — image-filled wordmark held in the clouds, micro breath
      tl.to(wordmark, { scale: 1.04, duration: 0.16, ease: 'sine.inOut' }, 0.72)

      // p 0.88-1.00  wordmark drifts up + fades; clouds lift (HeroClouds reacts to the
      // same progress) -> the pin releases and the next section flows in beneath.
      tl.to(
        wordmark,
        { y: '-22%', scale: 1.1, opacity: 0, duration: 0.12, ease: 'power2.in' },
        0.88
      )

      // Clean up will-change after pin completes.
      return () => {
        gsap.set([buildingWrap, headline, slotTrack, subCta, wordmark, outline, fill], {
          willChange: 'auto',
        })
      }
    },
    // Re-run when motionOk or mounted resolves — both set once, so this fires twice max.
    [motionOk, mounted, cycle.length]
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
          {/* Static first sentence above the end-state wordmark. */}
          <h1
            className="mb-8 text-center font-bold text-[var(--color-ink)] leading-[0.95]"
            style={{
              fontFamily: 'var(--font-hebrew-display)',
              fontSize: 'clamp(2.25rem, 7vw, 6rem)',
              letterSpacing: '-0.02em',
            }}
          >
            {cycle[0]}
          </h1>
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
            the clouds). `active` gates drift + scroll parallax only. UNTOUCHED. */}
      {mounted && (
        <div className="absolute inset-0 z-[1]" aria-hidden="true">
          <HeroClouds progressRef={progressRef} active={motionOk} />
        </div>
      )}

      {/* 3. Building CUTOUT (transparent PNG) — BOTTOM-ANCHORED, scales from the bottom.
            At rest (BUILDING_REST_SCALE) only its upper portion shows at the very bottom
            (frame_001). On scroll it GROWS (scale up, transform-origin center bottom) so
            it rises to cover the headline (frame_004 -> 007) — its base never leaves the
            viewport bottom (the section clips it), so there is zero floating gap. Then it
            cross-dissolves out as the wordmark fills.

            TWO-LAYER wrapper pattern to avoid GSAP clobbering the CSS centering:
            - OUTER: owns left/translateX centering — never touched by GSAP.
            - INNER (buildingWrapRef): owns scale via GSAP — transform-origin center bottom.
            GSAP only sets `scale` on the inner element, so the outer `translateX(-50%)`
            is never overwritten. */}
      {/* Outer: centering only — no GSAP ref, no transform to clobber */}
      <div
        className="absolute bottom-0 left-1/2 z-[2]"
        style={{
          width: 'min(95vw, 1100px)',
          transform: 'translateX(-50%)',
        }}
        aria-hidden="true"
      >
        {/* Inner: GSAP scale target — transform-origin center bottom keeps the base
            flush as the building grows. Initial scale matches BUILDING_REST_SCALE so
            there is no full-size flash before GSAP initialises. */}
        <div
          ref={buildingWrapRef}
          style={{
            transformOrigin: 'center bottom',
            transform: `scale(${BUILDING_REST_SCALE})`,
          }}
        >
          {/* Opacity wrapper for the cross-dissolve */}
          <div ref={buildingImgRef}>
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
      </div>

      {/* 4 + 5. Wordmark group — OUTLINE (thin white stroke over the building,
            frame_007) then FILL (building image clipped to the בונים עתיד glyphs via
            <BrandWordmarkMask>, frame_010). Both share one transform group so they stay
            co-located through the cross-dissolve. */}
      <div
        ref={wordmarkRef}
        className="absolute inset-0 z-[3] flex items-center justify-center px-4"
        style={{ transformOrigin: 'center center' }}
        aria-hidden="true"
      >
        <div className="relative w-full" style={{ maxWidth: 'clamp(360px, 86vw, 1100px)' }}>
          {/* Outline (white stroke) — sits over the grown building */}
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

      {/* 6. Text stack — CYCLING slot-roll headline -> subhead -> CTA pill, as a single
            clean vertical FLOW in the UPPER-CENTER of the hero (above the building's
            resting top). Each piece reserves its own space (no absolute stacking on top of
            each other), so there is NO overlap at rest. headlineRef and subCtaRef stay as
            separate children so the timeline can fade the subhead/CTA slightly earlier than
            the headline as the building rises. Centered -> correct in RTL (he) and LTR (en);
            the slot-roll track is direction-agnostic. */}
      <div
        className="absolute inset-x-0 z-[4] flex flex-col items-center px-6 text-center"
        style={{ top: 'clamp(4.5rem, 11vh, 8.5rem)' }}
      >
        {/* Cycling headline. The SlotRollHeadline clip window is exactly one line tall and
            occupies real flow height, so the subhead + CTA sit cleanly below it. */}
        <div ref={headlineRef} className="flex w-full flex-col items-center">
          <SlotRollHeadline ref={slotTrackRef} lines={cycle} />
        </div>

        {/* Subhead + CTA — separate group, fades slightly earlier than the headline. */}
        <div ref={subCtaRef} className="mt-5 flex w-full flex-col items-center sm:mt-7">
          <p
            className="max-w-xl font-[var(--font-body)] font-light text-[var(--color-ink)]"
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              lineHeight: 1.6,
              opacity: 0.78,
            }}
          >
            {c.hero.subhead}
          </p>

          <div className="mt-7 sm:mt-8">
            <Pill variant="dark" href="#register" withArrow>
              {c.hero.cta}
            </Pill>
          </div>
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

// ─── Slot-roll headline ──────────────────────────────────────────────────────
// A fixed-height viewport that clips a vertical track of N stacked sentences. The
// track is animated (yPercent) by the parent timeline so each line rolls up and the
// next rolls in. Center-aligned + direction-agnostic → correct in RTL and LTR.

interface SlotRollHeadlineProps {
  lines: readonly string[]
}

const SlotRollHeadline = forwardRef<HTMLDivElement, SlotRollHeadlineProps>(
  function SlotRollHeadline({ lines }, trackRef) {
    // One display line height drives the slot window. clamp keeps it responsive.
    const lineHeightCss = 'clamp(2.5rem, 8vw, 7.5rem)'

    return (
      <div
        className="w-full overflow-hidden"
        style={{ height: lineHeightCss }}
        // The full first sentence is announced to AT; visual cycling is decorative.
        aria-label={lines[0]}
      >
        <div ref={trackRef} className="flex flex-col will-change-transform">
          {lines.map((line, i) => (
            <span
              key={`${i}-${line}`}
              aria-hidden={i === 0 ? undefined : 'true'}
              className="flex shrink-0 items-center justify-center font-bold text-[var(--color-ink)]"
              style={{
                height: lineHeightCss,
                fontFamily: 'var(--font-hebrew-display)',
                fontSize: 'clamp(2.5rem, 8vw, 7.5rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
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
// Thin white stroke of the Hebrew wordmark, no fill (frame_007). Shares the same
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
