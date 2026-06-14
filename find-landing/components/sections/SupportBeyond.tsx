'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useLang, useContent } from '@/components/providers/LanguageProvider'
import Pill from '@/components/ui/Pill'

/**
 * Webinar details - id="webinar". "The Pass" concept.
 *
 * Motion language:
 * - Section rises as a unit
 * - Eyebrow + title fade-rise together
 * - Ghost numeral parallax drift (scrub — kept on ScrollTrigger)
 * - Hero date: clip-reveal + scale settle (directional wipe, RTL-aware)
 * - Rail hairline draws top→bottom
 * - Rows cascade in with stagger
 * - CTA pill bounces in last
 *
 * One-shot reveals use IntersectionObserver (via useScrollReveal), immune to
 * the Hero pin-spacer math. The ghost numeral parallax scrub stays on
 * ScrollTrigger because it is a continuous, not one-shot, tween.
 */
export default function SupportBeyond() {
  const sectionRef = useRef<HTMLElement>(null)
  const { motionOk } = useSmoothScroll()
  const { dir } = useLang()
  const c = useContent()
  const w = c.webinar
  const isHebrew = c.register.fields.name === 'שם מלא'

  const dateDigits = w.date.match(/(\d{1,2})\.(\d{1,2})/)
  const bigDate = dateDigits ? `${dateDigits[1]}.${dateDigits[2]}` : w.date
  const yearMatch = w.date.match(/\d{1,2}\.\d{1,2}\.(\d{2,4})/)
  const bigYear = yearMatch ? `'${yearMatch[1]}` : ''
  const weekday = w.date.split(',')[0]?.trim() ?? w.date

  const rows = [
    { key: 'day', caption: isHebrew ? 'יום' : 'Day', value: weekday },
    { key: 'time', caption: isHebrew ? 'שעה' : 'Time', value: w.time },
    { key: 'duration', caption: isHebrew ? 'משך' : 'Duration', value: w.duration },
    { key: 'platform', caption: isHebrew ? 'איפה' : 'Where', value: w.platform },
  ] as const

  const reserveLabel = c.nav.cta

  // Scrub-based parallax on the ghost numeral — continuous, not a one-shot reveal.
  // Keep on ScrollTrigger (IO doesn't support scrub).
  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      gsap.fromTo(
        '.wb-ghost',
        { yPercent: -6, opacity: 0 },
        {
          yPercent: 6,
          opacity: 1,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.wb-stage',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      )
    },
    [motionOk]
  )

  // One-shot reveals — use IntersectionObserver, immune to pin-spacer position math.
  useScrollReveal(
    sectionRef,
    [
      // Section entrance: dark block drifts up as a unit
      {
        trigger: sectionRef.current,
        revealAt: 0.08, // 'top 92%'
        build: () =>
          gsap.fromTo(
            sectionRef.current,
            { opacity: 0, y: 36 },
            { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', paused: true }
          ),
      },
      // Eyebrow + section title fade-rise
      {
        trigger: '.wb-stage',
        revealAt: 0.18, // 'top 82%'
        build: () =>
          gsap.fromTo(
            '.wb-intro > *',
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.09,
              duration: 0.75,
              ease: 'power3.out',
              paused: true,
            }
          ),
      },
      // Hero date clip-reveals (directional wipe, RTL-aware) + scale settle
      {
        trigger: '.wb-bigdate',
        revealAt: 0.15, // 'top 85%'
        build: () => {
          const wipeFrom = dir === 'rtl' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'
          return gsap.fromTo(
            '.wb-bigdate',
            { clipPath: wipeFrom, scale: 1.05 },
            {
              clipPath: 'inset(0 0% 0 0%)',
              scale: 1,
              duration: 1.3,
              ease: 'power3.inOut',
              paused: true,
            }
          )
        },
      },
      // Year fade-rise after bigdate
      {
        trigger: '.wb-bigdate',
        revealAt: 0.2, // 'top 80%'
        build: () =>
          gsap.fromTo(
            '.wb-year',
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', paused: true }
          ),
      },
      // Rail hairline draws top→bottom
      {
        trigger: '.wb-rail',
        revealAt: 0.2, // 'top 80%'
        build: () =>
          gsap.fromTo(
            '.wb-rail-line',
            { scaleY: 0, transformOrigin: 'top center' },
            { scaleY: 1, duration: 1.1, ease: 'power3.inOut', paused: true }
          ),
      },
      // Perforation draw
      {
        trigger: '.wb-rail',
        revealAt: 0.18, // 'top 82%'
        build: () =>
          gsap.fromTo(
            '.wb-perf',
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.85, ease: 'power3.out', paused: true }
          ),
      },
      // Rows stagger in
      {
        trigger: '.wb-rail',
        revealAt: 0.22, // 'top 78%'
        build: () =>
          gsap.fromTo(
            '.wb-row',
            { y: 26, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.1,
              duration: 0.7,
              ease: 'power3.out',
              paused: true,
            }
          ),
      },
      // CTA: scale + rise
      {
        trigger: '.wb-rail',
        revealAt: 0.3, // 'top 70%'
        build: () =>
          gsap.fromTo(
            '.wb-cta',
            { y: 18, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out', paused: true }
          ),
      },
    ],
    [dir]
  )

  return (
    <section
      ref={sectionRef}
      id="webinar"
      className="relative w-full overflow-hidden bg-[var(--color-dark)] text-[var(--color-paper)]"
      aria-labelledby="webinar-heading"
    >
      {/* Atmospheric neutral glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            dir === 'rtl'
              ? 'radial-gradient(120% 90% at 88% 28%, rgba(255,255,255,0.08), transparent 58%)'
              : 'radial-gradient(120% 90% at 12% 28%, rgba(255,255,255,0.08), transparent 58%)',
        }}
      />

      <div className="wb-stage relative w-full px-6 md:px-12 lg:px-20 pt-24 pb-24 md:pt-32 md:pb-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* ── Hero date ── */}
          <div className="relative">
            {/* Faded ghost numeral for depth */}
            <span
              aria-hidden="true"
              className="wb-ghost pointer-events-none absolute -top-10 select-none font-[var(--font-hebrew-display)] font-extrabold leading-none tracking-[-0.04em] text-white/[0.04] md:-top-16"
              style={{
                fontSize: 'clamp(9rem, 26vw, 22rem)',
                insetInlineStart: '-0.06em',
              }}
            >
              {bigDate}
            </span>

            <div className="wb-intro relative">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[rgba(255,255,255,0.5)]">
                {w.label}
              </p>
              <h2
                id="webinar-heading"
                className="mt-4 max-w-md font-[var(--font-display)] text-lg font-medium leading-snug text-[rgba(255,255,255,0.82)] md:text-xl"
              >
                {isHebrew ? 'שמרו את התאריך' : 'Save the date'}
                <span className="sr-only">{` - ${w.date} ${w.time}`}</span>
              </h2>
            </div>

            {/* The colossal date - gradient-filled, clip-revealed. */}
            <div className="relative mt-6 md:mt-8">
              <span
                className="wb-bigdate block select-none font-[var(--font-hebrew-display)] font-extrabold leading-[0.82] tracking-[-0.05em]"
                style={{
                  fontSize: 'clamp(5.5rem, 19vw, 16rem)',
                  backgroundImage:
                    'linear-gradient(135deg, #ffffff 0%, #d4d4d4 48%, #8a8a8a 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                  willChange: 'clip-path, transform',
                }}
              >
                {bigDate}
              </span>
              {bigYear ? (
                <span className="wb-year mt-3 inline-block font-[var(--font-display)] text-2xl font-semibold tracking-[0.04em] text-[rgba(255,255,255,0.55)] md:text-3xl">
                  {bigYear}
                </span>
              ) : null}
            </div>
          </div>

          {/* ── Boarding-pass rail ── */}
          <div className="wb-rail relative">
            <div className="relative ps-7 md:ps-9">
              {/* The drawn hairline */}
              <span
                aria-hidden="true"
                className="wb-rail-line absolute inset-y-1 start-0 w-px bg-gradient-to-b from-[rgba(255,255,255,0.55)] via-[rgba(255,255,255,0.22)] to-transparent"
                style={{ willChange: 'transform' }}
              />

              <ul className="flex flex-col">
                {rows.map((row, i) => (
                  <li
                    key={row.key}
                    className="wb-row relative flex flex-col gap-1.5 py-5 md:py-6"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {/* Node dot on the rail */}
                    <span
                      aria-hidden="true"
                      className="absolute top-7 h-1.5 w-1.5 rounded-full bg-[rgba(255,255,255,0.6)] md:top-8"
                      style={{ insetInlineStart: 'calc(-1.75rem - 3px)' }}
                    />
                    <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[rgba(255,255,255,0.42)]">
                      {row.caption}
                    </span>
                    <span className="font-[var(--font-display)] text-xl font-semibold leading-tight text-white md:text-2xl">
                      {row.value}
                    </span>
                    {i < rows.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 start-0 end-0 h-px bg-[rgba(255,255,255,0.08)]"
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            {/* Perforated edge */}
            <span
              aria-hidden="true"
              className="wb-perf mt-8 block h-px w-full"
              style={{
                transformOrigin: dir === 'rtl' ? 'right center' : 'left center',
                backgroundImage:
                  'repeating-linear-gradient(to right, rgba(255,255,255,0.32) 0 6px, transparent 6px 14px)',
              }}
            />

            <div className="wb-cta mt-8">
              <Pill
                href="#register"
                variant="ghost"
                withArrow
                className="bg-white text-[var(--color-ink)] border border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white px-7 py-3.5"
                aria-label={reserveLabel}
              >
                {reserveLabel}
              </Pill>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
