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
 * Motion language:
 * - Section rises as a unit
 * - Header words stagger
 * - Each row: number ring draws, giant word wipes in, body fades up
 * - Closing line words stagger
 * - CTA pill bounces in
 * - All onComplete clearProps for safety
 */
export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const motionOk = !useReducedMotion()
  const { dir } = useLang()
  const c = useContent()
  const { pillars } = c

  const isRtl = dir === 'rtl'

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      // Section entrance: dark block rises into place
      // All animations use fromTo + immediateRender:false to prevent premature firing
      // (the hero pin-spacer can throw off trigger positions until ScrollTrigger.refresh runs)
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      )

      // Header section label + heading words stagger
      gsap.fromTo(
        '.services-label',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: { trigger: '.services-header', start: 'top 82%' },
        }
      )

      gsap.fromTo(
        '.services-heading .tt-word',
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.045,
          duration: 0.85,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.services-heading',
            start: 'top 80%',
          },
        }
      )

      // Each row: giant word wipes in + number ring draws + body rises
      pillars.rows.forEach((_row, i) => {
        const rowEl = `.service-row-${i}`

        // Giant word: clip-path wipe from the inline-end → inline-start
        const hiddenClip = 'inset(0 0 0 100%)'
        const fromX = isRtl ? -40 : 40

        gsap.fromTo(
          `${rowEl} .service-giant-word`,
          { clipPath: hiddenClip, x: fromX, opacity: 0 },
          {
            clipPath: 'inset(0 0% 0 0)',
            x: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: rowEl,
              start: 'top 76%',
            },
          }
        )

        // Number circle stroke draw
        gsap.fromTo(
          `${rowEl} .service-ring`,
          { strokeDashoffset: 100 },
          {
            strokeDashoffset: 0,
            duration: 0.9,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: rowEl,
              start: 'top 76%',
            },
          }
        )

        // Number label fade
        gsap.fromTo(
          `${rowEl} .service-num-label`,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            delay: 0.35,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: rowEl,
              start: 'top 76%',
            },
          }
        )

        // Body text blur-fade up
        gsap.fromTo(
          `${rowEl} .service-body`,
          { yPercent: 22, opacity: 0, filter: 'blur(3px)' },
          {
            yPercent: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.75,
            delay: 0.18,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: rowEl,
              start: 'top 76%',
            },
          }
        )
      })

      // Closing line words
      gsap.fromTo(
        '.services-closing .tt-word',
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.85,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.services-closing',
            start: 'top 84%',
          },
        }
      )

      // CTA pill: scale + fade
      gsap.fromTo(
        '.services-cta',
        { y: 22, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.65,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.services-cta',
            start: 'top 90%',
          },
        }
      )
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
      <div className="services-header w-full px-6 md:px-12 lg:px-20 pt-20 pb-16 md:pt-28 md:pb-20">
        <SectionLabel variant="light" className="services-label mb-6 block">
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

      {/* Pillar rows */}
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
                <span className="service-num-label relative text-xs font-light text-[rgba(255,255,255,0.65)] select-none tabular-nums">
                  {row.n}
                </span>
              </div>

              {/* Body paragraph */}
              <p className="service-body text-sm md:text-base text-[rgba(255,255,255,0.5)] leading-relaxed font-light max-w-[280px]">
                {row.body}
              </p>
            </div>

            {/* Col 2: Giant word - hidden on small screens */}
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
