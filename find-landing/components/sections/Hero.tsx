'use client'

/**
 * Hero — Signature pinned scroll experience for בונים עתיד (Bonim Atid).
 *
 * Building: hero-tower-v2.png — SQUARE 1024×1024 green-terraced glass tower.
 * Because the image is square (not portrait), we render it at min(78vw, 880px)
 * wide so the upper terraces show flush at viewport bottom at rest. REST_SCALE 0.57
 * (desktop) / 0.80 (mobile) means at 1440px the building base is flush to the
 * bottom and roofline sits ~65% from top, leaving clean sky for the headline.
 * GROWN_SCALE 1.9 lets the building dominate.
 *
 * Two-layer building wrapper (CRITICAL — DO NOT COLLAPSE):
 *   OUTER  — absolute bottom-0 left-1/2, translateX(-50%). NEVER touched by GSAP.
 *   INNER  — buildingWrapRef. GSAP animates SCALE ONLY via transform-origin center
 *            bottom. Never translateY → base always flush to viewport bottom.
 *
 * progressRef: plain useRef<number>, written by ScrollTrigger onUpdate, read by
 * HeroClouds' rAF loop. Zero React re-renders per scroll tick.
 *
 * Motion timeline (scrub: true, pin +=230%):
 *   p 0.00       REST: building REST_SCALE, headline/subhead/CTA visible
 *   p 0.00–0.46  building grows REST→GROWN (power2.out)
 *   p 0.00–0.28  headline slot-roll cycles 3 Hebrew sentences (dice-roll modifier);
 *                first sentence stable for ~800ms (settle delay via clamp)
 *   p 0.14–0.28  subhead+CTA fade+lift out (power3.in) — earlier than headline
 *   p 0.18–0.28  headline fade+lift out (power3.in) — fully gone by p~0.28
 *   p 0.28–0.30  SCROLL nudge fades with headline
 *   p 0.40–0.48  outline wordmark strokes in (power1.out)
 *   p ~0.50      HARD CUT: outline→0, fill→1, building→0 (steps(1), dur 0.015)
 *   p 0.50–0.58  brand micro-breath scale 1→1.04→settle (back.out)
 *   p 0.40–0.90  cloud bloom (driven by HeroClouds progressRef) overlaps grow+swap
 *   p 0.55–0.75  nav fades out over cloud veil
 *   p 0.58–0.72  wordmark lifts into cloud bloom + fades (power2.in)
 *   p 0.78–1.00  veil thins to residual ~0.18 — bridge to next section
 *
 * Reduced motion: static composed end-state — sky + static clouds + first headline
 * sentence + image-filled wordmark. No pin, no rAF.
 *
 * RTL: hero is fully centered → reads identically in dir=rtl and dir=ltr.
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

// Dynamic import — HeroClouds (CSS/DOM) is client-only
const HeroClouds = dynamic(() => import('./HeroClouds'), { ssr: false })

// ─── Tuning constants ──────────────────────────────────────────────────────────
// Square 1024×1024 image rendered at min(78vw, 880px) wide.
// REST_SCALE desktop 0.57: at 1440px roofline sits ~65% from top, leaving clean sky.
// REST_SCALE mobile 0.80: mobile was nearly right — preserve that framing.
// GROWN_SCALE 1.9: building swells to dominate the frame.
// Desktop rest is smaller so the headline has clear sky above the building.

// Responsive rest scale: detect desktop (≥1024px) at runtime, set before GSAP init.
// We store as a getter so the timeline reads correct value after mount.
function getBuildingRestScale(): number {
  if (typeof window === 'undefined') return 0.80
  return window.innerWidth >= 1024 ? 0.57 : 0.80
}

const BUILDING_GROWN_SCALE = 1.9

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  // 3-sentence slot-roll cycle. Guard against empty content.
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

  // Shared scroll progress — written by ScrollTrigger onUpdate, read by HeroClouds' rAF.
  // Plain ref: zero React re-renders per scroll tick.
  const progressRef = useRef<number>(0)

  // Client-side mount gate — set after first hydration
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

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

      // Responsive rest scale: lower at desktop so headline has clean sky above.
      const restScale = getBuildingRestScale()

      // ── REST state (p = 0) ───────────────────────────────────────────────
      gsap.set(buildingWrap, { scale: restScale })
      gsap.set(buildingImg, { opacity: 1 })
      gsap.set(wordmark, { opacity: 1, scale: 0.96, y: 20 })
      gsap.set(outline, { opacity: 0 })
      // P2.2 — fill is an instant hard cut, no CSS transition on it.
      gsap.set(fill, { opacity: 0 })
      gsap.set(slotTrack, { yPercent: 0 })
      gsap.set([headline, subCta], { opacity: 1, y: 0 })
      if (scrollNudge) gsap.set(scrollNudge, { opacity: 0.45 })

      // Enable GPU compositing during the pin
      gsap.set(
        [buildingWrap, headline, slotTrack, subCta, wordmark, outline, fill],
        { willChange: 'transform, opacity' }
      )

      // ── Master scrubbed timeline ─────────────────────────────────────────
      // scrub: true — Lenis already smooth-scrolls position; stacking scrub:1+
      // double-smooths and makes the scroll feel laggy on trackpad.
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

      // p 0.00–0.46  BUILDING GROWS restScale → 1.9, origin center-bottom.
      // Scale-only: base stays flush to viewport bottom. No translateY → no float.
      tl.to(
        buildingWrap,
        { scale: BUILDING_GROWN_SCALE, duration: 0.46, ease: 'power2.out' },
        0
      )

      // P1.2 — Headline slot-roll settle window.
      // Slot cycling starts at p≈0.04 so first sentence is stable for ~first 800ms
      // of pin (scrub maps ~3.5% pin to the settle delay at normal scroll speed).
      // Dice-roll step modifier for tactile slot resolve.
      const lineCount = cycle.length
      if (lineCount > 1) {
        const endYPercent = -100 * ((lineCount - 1) / lineCount)
        // Delay slot start to ~p 0.04 so sentence 1 reads cleanly at rest.
        tl.fromTo(
          slotTrack,
          { yPercent: 0 },
          {
            yPercent: endYPercent,
            duration: 0.24,  // spans p 0.04–0.28
            ease: 'none',
            modifiers: {
              yPercent: (raw: string) => {
                const m = lineCount
                const total = m - 1
                const pos = (parseFloat(raw) / endYPercent) * total // 0..total
                const idx = Math.min(Math.floor(pos), total - 1)
                const frac = pos - idx
                // Cubic ease-in-out per slot
                const eased =
                  frac < 0.5
                    ? 4 * frac * frac * frac
                    : 1 - Math.pow(-2 * frac + 2, 3) / 2
                const stepped = (idx + eased) / total
                return `${stepped * endYPercent}`
              },
            },
          },
          0.04  // settle window: first sentence stable from p=0 to p=0.04
        )
      }

      // P2.4 — subhead+CTA: exits earlier (p 0.14–0.22) — fully gone at 0.22.
      tl.to(subCta, { opacity: 0, y: -50, duration: 0.08, ease: 'power3.in' }, 0.14)

      // P2.4 — headline: fade+lift complete by ~p 0.28.
      tl.to(headline, { opacity: 0, y: -60, duration: 0.10, ease: 'power3.in' }, 0.18)

      // P3.1 — SCROLL nudge fades with headline (gone by p~0.30).
      if (scrollNudge) {
        tl.to(scrollNudge, { opacity: 0, duration: 0.08, ease: 'power2.in' }, 0.22)
      }

      // p 0.40–0.48  outline wordmark strokes in over grown building
      tl.set(wordmark, { scale: 1, y: 0 }, 0.40)
      tl.to(outline, { opacity: 1, duration: 0.08, ease: 'power1.out' }, 0.40)

      // P2.2 — HARD CUT: fill→1 is instant steps(1), no lerp.
      // outline fades fast (≤0.015 = ~100ms equivalent at scrub rate).
      // buildingImg hard-cuts simultaneously.
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

      // P3.3 — Nav fades out over the cloud veil (p 0.55–0.75), restores after pin.
      // Scoped via CSS class selector; doesn't break shared layout.
      const nav = document.querySelector<HTMLElement>('nav, header[role="banner"]') ??
                  document.querySelector<HTMLElement>('[data-hero-nav]')
      if (nav) {
        tl.to(nav, { opacity: 0, duration: 0.20, ease: 'power2.in' }, 0.55)
        tl.to(nav, { opacity: 1, duration: 0.10, ease: 'power2.out' }, 0.75)
      }

      // Clean up will-change after the pin completes
      return () => {
        gsap.set(
          [buildingWrap, headline, slotTrack, subCta, wordmark, outline, fill],
          { willChange: 'auto' }
        )
        // Restore nav opacity if component unmounts mid-animation
        if (nav) gsap.set(nav, { opacity: 1 })
      }
    },
    // Re-run when motionOk or mounted resolves — both set once, fires twice max.
    [motionOk, mounted, cycle.length]
  )

  // ── Reduced-motion: static composed end-state ─────────────────────────────
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
      {/* 1. Sky gradient — zero JS, instant LCP */}
      <SkyGradient />

      {/* 2. HeroClouds BACK — behind building + wordmark. Visible throughout pin. */}
      {mounted && (
        <div className="absolute inset-0 z-[1]" aria-hidden="true">
          <HeroClouds progressRef={progressRef} active={motionOk} variant="back" />
        </div>
      )}

      {/* 3. Building CUTOUT — BOTTOM-ANCHORED, SCALE-only animation.
          TWO-LAYER wrapper: OUTER centres (GSAP never touches it);
          INNER (buildingWrapRef) is the GSAP scale target, transform-origin center bottom.
          Desktop REST_SCALE 0.57: roofline ~65% from top, headline has clean sky.
          Mobile REST_SCALE 0.80: mobile framing preserved.
          GROWING to 1.9 pulls the lower floors up into view.
          No translateY → zero floating gap at all times.
          P2.5: bottom-0, no padding/margin on outer. object-bottom on img. */}
      {/* OUTER: centering only. bottom-0 + no bottom spacing = flush base.
          P2.5: translateY(2px) nudges down to kill any sub-pixel gap from transparent
          PNG bottom pixels (the building base may not fill all of the 1024×1024 frame). */}
      <div
        className="absolute bottom-0 left-1/2 z-[2]"
        style={{
          width: 'min(78vw, 880px)',
          transform: 'translateX(-50%) translateY(4px)',
          margin: 0,
          padding: 0,
        }}
        aria-hidden="true"
      >
        {/* INNER: GSAP scale target. transform-origin center bottom keeps base flush.
            Initial scale set here as fallback; GSAP overwrites on mount. */}
        <div
          ref={buildingWrapRef}
          style={{
            transformOrigin: 'center bottom',
          }}
        >
          {/* Opacity wrapper for the hard-cut cross-dissolve.
              display:block on inner removes inline baseline gap (P2.5). */}
          <div ref={buildingImgRef} style={{ display: 'block', lineHeight: 0, fontSize: 0 }}>
            <Image
              src={images.heroBuildingCutout}
              alt="Modern glass residential tower with green terraces"
              width={1024}
              height={1024}
              priority
              quality={90}
              className="block h-auto w-full select-none"
              style={{ verticalAlign: 'bottom', display: 'block' }}
              sizes="(max-width: 768px) 78vw, 880px"
            />
          </div>
        </div>
      </div>

      {/* 4 + 5. Wordmark group — OUTLINE (p 0.40–0.50) then FILL (p 0.50+).
          P1.3: wrapper is full-width text-align center so wordmark never clips.
          overflow-hidden on the pinned section (below) kills edge bleed.
          Both share one transform container so they co-locate through the
          cross-dissolve, micro-breath, and lift-into-clouds beats. */}
      <div
        ref={wordmarkRef}
        className="absolute inset-0 z-[3] flex items-center justify-center"
        style={{ transformOrigin: 'center center', textAlign: 'center' }}
        aria-hidden="true"
      >
        {/* P1.3: width 100%, margin auto, generous px so letterforms never hit edge. */}
        <div
          className="relative mx-auto w-full"
          style={{
            maxWidth: 'clamp(320px, 80vw, 1000px)',
            paddingLeft: 'clamp(16px, 4vw, 64px)',
            paddingRight: 'clamp(16px, 4vw, 64px)',
          }}
        >
          {/* Outline — thin white stroke over the grown building */}
          <div ref={outlineRef} className="absolute inset-0">
            <BrandWordmarkOutline />
          </div>
          {/* Fill — building image clipped to Hebrew letters.
              P2.2: no CSS transition on this element — hard cut via GSAP steps(1). */}
          <div ref={fillRef} style={{ transition: 'none' }}>
            <BrandWordmarkMask
              fillSrc={images.heroBuildingFill}
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>

      {/* 6. HeroClouds FRONT — blooms in over building + wordmark (p 0.45+).
          z-[3] overlaps wordmark group; stays under headline z-[4].
          Near-invisible at rest — headline fully legible. */}
      {mounted && (
        <div className="absolute inset-0 z-[3]" aria-hidden="true">
          <HeroClouds progressRef={progressRef} active={motionOk} variant="front" />
        </div>
      )}

      {/* 7. Text stack — vertically + horizontally centred. Direction-agnostic RTL. */}
      <div className="absolute inset-0 z-[4] flex flex-col items-center justify-center px-6 text-center">
        {/* Cycling headline */}
        <div ref={headlineRef} className="flex w-full flex-col items-center">
          <SlotRollHeadline ref={slotTrackRef} lines={cycle} />
        </div>

        {/* Subhead + CTA — fades slightly earlier than headline */}
        <div ref={subCtaRef} className="mt-5 flex w-full flex-col items-center sm:mt-7">
          <p
            className="max-w-xl font-light text-[var(--color-ink)]"
            style={{
              fontFamily: 'var(--font-body)',
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

      {/* P3.1 — Scroll nudge fades out with headline (gone by p~0.30). */}
      <div
        ref={scrollNudgeRef}
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
// Fixed-height viewport clips a vertical track of N stacked sentences.
// Center-aligned and direction-agnostic — correct in RTL (Hebrew) and LTR (English).

interface SlotRollHeadlineProps {
  lines: readonly string[]
}

const SlotRollHeadline = forwardRef<HTMLDivElement, SlotRollHeadlineProps>(
  function SlotRollHeadline({ lines }, trackRef) {
    const lineHeightCss = 'clamp(2.5rem, 8vw, 7.5rem)'

    return (
      <div
        className="w-full overflow-hidden"
        style={{ height: lineHeightCss }}
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
// P2.3 — Warmed bottom half toward peach so clouds read backlit.
// Top: cool blue (#B8CEDF) → mid neutral (#D4C4B0) → bottom warm peach (#E8C49A).
// Tasteful pastel — not garish. The lower warm band pairs with the building base.
function SkyGradient() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0"
      style={{
        background:
          'linear-gradient(to bottom, #b8cedf 0%, #cad9e8 15%, #dde6ee 30%, #d4c4b0 55%, #ddb998 75%, #e8c49a 100%)',
      }}
    />
  )
}

// ─── "בונים עתיד" outline wordmark ──────────────────────────────────────────
// P3.2 — stroke-width increased to 2.5 + faint legible halo drop-shadow.
// Shares the same viewBox + metrics as BrandWordmarkMask so both letterforms
// register exactly during the cross-dissolve.
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
        strokeWidth={2.5}
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.4))' }}
      >
        בונים עתיד
      </text>
    </svg>
  )
}
