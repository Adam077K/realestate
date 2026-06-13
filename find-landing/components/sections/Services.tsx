'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import SectionLabel from '@/components/ui/SectionLabel'
import Pill from '@/components/ui/Pill'
import { services } from '@/data/content'

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const motionOk = !useReducedMotion()

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

      // Each row: giant word wipes in from right + number ring draws
      services.rows.forEach((_row, i) => {
        const rowEl = `.service-row-${i}`

        // Giant word: clip-path wipe from right
        gsap.fromTo(
          `${rowEl} .service-giant-word`,
          { clipPath: 'inset(0 100% 0 0)', x: 40, opacity: 0 },
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
    [motionOk]
  )

  return (
    <section
      ref={sectionRef}
      id="services"
      className="bg-[var(--color-dark)] text-[var(--color-paper)] w-full"
      aria-label="Services"
    >
      {/* Header row */}
      <div className="w-full px-6 md:px-12 lg:px-20 pt-20 pb-16 md:pt-28 md:pb-20">
        <SectionLabel variant="light" className="mb-6 block">
          {services.label}
        </SectionLabel>
        <TwoToneHeading
          as="h2"
          lead={services.heading.lead}
          tail={services.heading.tail}
          stacked
          leadClassName="text-white"
          tailClassName="text-white/45"
          className="services-heading max-w-2xl"
        />
      </div>

      {/* Service rows — full-width hairline dividers */}
      <div className="w-full">
        {services.rows.map((row, i) => (
          <div
            key={row.n}
            className={`service-row-${i} border-t border-[rgba(255,255,255,0.1)] w-full px-6 md:px-12 lg:px-20 py-10 md:py-14 grid grid-cols-[44px_1fr] md:grid-cols-[56px_minmax(0,280px)_1fr] items-center gap-6 md:gap-12 lg:gap-16`}
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
            <p className="service-body text-sm md:text-base text-[rgba(255,255,255,0.5)] leading-relaxed font-light">
              {row.body}
            </p>

            {/* Giant word — hidden on small screens, visible md+ */}
            <div className="hidden md:flex justify-end">
              <span
                className="service-giant-word font-[var(--font-display)] font-light text-white select-none"
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
          lead={services.closing.lead}
          tail={services.closing.tail}
          stacked={false}
          leadClassName="text-white"
          tailClassName="text-white/45"
          className="services-closing max-w-2xl mb-10"
        />
        <div className="services-cta">
          <Pill
            variant="ghost"
            href="/search"
            withArrow
            className="border border-white text-white hover:bg-white hover:text-[var(--color-ink)]"
          >
            {services.cta}
          </Pill>
        </div>
      </div>
    </section>
  )
}
