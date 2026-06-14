'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useLang, useContent } from '@/components/providers/LanguageProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import SectionLabel from '@/components/ui/SectionLabel'
import Pill from '@/components/ui/Pill'

/**
 * Services → "How Bonim Atid helps you" - dark giant-type pillars.
 *
 * Bilingual + RTL aware. Content comes from `c.pillars` (he/en).
 * Layout: an ENORMOUS thin display word on one side, number + body on the other.
 * The giant word sits on the READING-START side so the eye lands on it first:
 *   - RTL (Hebrew): giant word on the RIGHT, number + body on the LEFT.
 *   - LTR (English): giant word on the RIGHT as well (matches the reference), number
 *     + body on the LEFT.
 * The row is laid out with an explicit, direction-aware flex template
 * (`flex-row` vs `flex-row-reverse`) so the sides read naturally regardless of the
 * implicit inline-flow mirroring. The clip-path wipe origin follows reading order so
 * the word emerges from its resting (right) edge.
 */
export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const motionOk = !useReducedMotion()
  const { dir } = useLang()
  const c = useContent()
  const { pillars } = c

  const isRtl = dir === 'rtl'

  // The giant word always rests against the RIGHT edge of the section. In RTL that is
  // the reading-start side; in LTR it matches the reference. The number + body cluster
  // sits on the LEFT. We achieve "giant word on the right" by reversing the row's flex
  // direction in RTL (whose default inline start is the right) and keeping the natural
  // order in LTR (whose default inline start is the left).

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      // Stagger heading words on entry
      gsap.from('.services-heading .tt-word', {
        yPercent: 110,
        opacity: 0,
        stagger: 0.04,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.services-heading',
          start: 'top 80%',
        },
      })

      // Each row: giant word wipes in + number ring draws
      pillars.rows.forEach((_row, i) => {
        const rowEl = `.service-row-${i}`

        // Giant word: clip-path wipe. The word rests against the right edge, so it
        // reveals from the right - the right side stays anchored while the left side
        // opens up (inset left 100% → 0).
        const hiddenClip = 'inset(0 0 0 100%)'
        const fromX = isRtl ? -40 : 40

        gsap.fromTo(
          `${rowEl} .service-giant-word`,
          { clipPath: hiddenClip, x: fromX, opacity: 0 },
          {
            clipPath: 'inset(0 0% 0 0)',
            x: 0,
            opacity: 1,
            duration: 1.0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: rowEl,
              start: 'top 75%',
            },
          }
        )

        // Number circle stroke draw
        gsap.fromTo(
          `${rowEl} .service-ring`,
          { strokeDashoffset: 100 },
          {
            strokeDashoffset: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: rowEl,
              start: 'top 75%',
            },
          }
        )

        // Body text fade up
        gsap.from(`${rowEl} .service-body`, {
          yPercent: 20,
          opacity: 0,
          duration: 0.7,
          delay: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: rowEl,
            start: 'top 75%',
          },
        })
      })

      // Closing line words
      gsap.from('.services-closing .tt-word', {
        yPercent: 110,
        opacity: 0,
        stagger: 0.03,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.services-closing',
          start: 'top 85%',
        },
      })

      // CTA pill fade up
      gsap.from('.services-cta', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.services-cta',
          start: 'top 90%',
        },
      })
    },
    [motionOk, isRtl]
  )

  return (
    <section
      ref={sectionRef}
      id="services"
      className="bg-[var(--color-dark)] text-[var(--color-paper)] w-full"
      aria-label={pillars.heading.lead}
    >
      {/* Header row */}
      <div className="w-full px-6 md:px-12 lg:px-20 pt-20 pb-16 md:pt-28 md:pb-20">
        <SectionLabel variant="light" className="mb-6 block">
          {pillars.heading.lead}
        </SectionLabel>
        <TwoToneHeading
          as="h2"
          lead={pillars.heading.lead}
          tail={pillars.heading.tail}
          stacked
          leadClassName="text-white"
          tailClassName="text-white/45"
          className="services-heading max-w-2xl"
        />
      </div>

      {/* Pillar rows - full-width hairline dividers.
          Each row is a CSS grid: [1fr auto].
          Col 1 (inline-start): number ring + body paragraph.
          Col 2 (inline-end): the giant display word.
          CSS Grid respects writing-mode so the word is always at the inline-end
          (right in RTL = reading-start, right in LTR = reading-end). This ensures
          the word's inline-end edge is flush with the section-heading's inline-end
          edge - both are bounded by the same `px-6 md:px-12 lg:px-20` padding. */}
      <div className="w-full">
        {pillars.rows.map((row, i) => (
          <div
            key={row.n}
            className={`service-row-${i} border-t border-[rgba(255,255,255,0.1)] w-full px-6 md:px-12 lg:px-20 py-10 md:py-14 grid grid-cols-[1fr_auto] items-center gap-6 md:gap-12 lg:gap-16`}
          >
            {/* Col 1: number ring + body. */}
            <div
              className={`flex min-w-0 ${
                isRtl ? 'flex-row-reverse' : 'flex-row'
              } items-center gap-6 md:gap-12 lg:gap-16`}
            >
              {/* Number circle */}
              <div className="flex-shrink-0 w-11 h-11 relative flex items-center justify-center">
                <svg
                  viewBox="0 0 44 44"
                  className="absolute inset-0 w-full h-full"
                  aria-hidden="true"
                >
                  <circle
                    cx="22"
                    cy="22"
                    r="15"
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1"
                    className="service-ring"
                    strokeDasharray="100"
                    strokeDashoffset={motionOk ? 100 : 0}
                  />
                </svg>
                <span className="relative text-xs font-light text-[rgba(255,255,255,0.65)] select-none tabular-nums">
                  {row.n}
                </span>
              </div>

              {/* Body paragraph */}
              <p className="service-body text-sm md:text-base text-[rgba(255,255,255,0.5)] leading-relaxed font-light max-w-[280px]">
                {row.body}
              </p>
            </div>

            {/* Col 2: Giant word - hidden on small screens, visible md+.
                Sits at the inline-end of the grid column, flush with the section
                heading's inline-end edge (same padding boundary). */}
            <div className="hidden md:block">
              <span
                className="service-giant-word block font-[var(--font-display)] font-light text-white select-none whitespace-nowrap leading-none"
                style={{
                  fontSize: 'clamp(4rem, 12vw, 11rem)',
                  lineHeight: 0.88,
                  letterSpacing: '-0.03em',
                  willChange: 'transform, opacity, clip-path',
                }}
                aria-hidden="true"
              >
                {row.word}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Closing + CTA */}
      <div className="border-t border-[rgba(255,255,255,0.1)] w-full px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <TwoToneHeading
          as="h3"
          lead={pillars.closing.lead}
          tail={pillars.closing.tail}
          stacked={false}
          leadClassName="text-white"
          tailClassName="text-white/45"
          className="services-closing max-w-2xl mb-10"
        />
        {/* CTA sits on the reading-END side (left in RTL, right in LTR).
            `justify-end` resolves to the inline-end edge: left in RTL, right in LTR. */}
        <div className="services-cta flex justify-end">
          <Pill
            variant="ghost"
            href="#register"
            withArrow
            className="border border-white text-white hover:bg-white hover:text-[var(--color-ink)]"
          >
            {pillars.cta}
          </Pill>
        </div>
      </div>
    </section>
  )
}
