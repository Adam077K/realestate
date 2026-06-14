'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'
import SectionLabel from '@/components/ui/SectionLabel'

/**
 * Partners - id="partners".
 *
 * One-shot reveals use IntersectionObserver (via useScrollReveal), immune to
 * the Hero pin-spacer math.
 */
export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null)
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  // One-shot reveals via IntersectionObserver — immune to pin-spacer position math.
  useScrollReveal(
    sectionRef,
    [
      // Section entrance: whole band drifts up
      {
        trigger: sectionRef.current,
        revealAt: 0.18, // 'top 82%'
        build: () =>
          gsap.fromTo(
            sectionRef.current,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', paused: true }
          ),
      },
      // Heading subtle rise
      {
        trigger: '.partners-heading',
        revealAt: 0.14, // 'top 86%'
        build: () =>
          gsap.fromTo(
            '.partners-heading',
            { y: 22, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', paused: true }
          ),
      },
      // Logos: clip-path wipe from below, staggered cascade
      {
        trigger: '.partners-row',
        revealAt: 0.14, // 'top 86%'
        build: () =>
          gsap.fromTo(
            '.partner-logo',
            { clipPath: 'inset(100% 0 0 0)', opacity: 0, y: 8 },
            {
              clipPath: 'inset(0% 0 0 0)',
              opacity: 1,
              y: 0,
              stagger: 0.055,
              duration: 0.65,
              ease: 'power3.out',
              paused: true,
            }
          ),
      },
    ],
    [motionOk]
  )

  return (
    <section
      ref={sectionRef}
      id="partners"
      className="bg-[var(--color-paper-warm)] w-full"
      aria-label={c.partners.heading}
    >
      <div className="w-full px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="partners-heading mb-10 md:mb-12 text-center">
          <SectionLabel>{c.partners.heading}</SectionLabel>
        </div>

        <ul className="partners-row flex flex-wrap items-center justify-center gap-x-8 gap-y-8 md:gap-x-12 lg:gap-x-14">
          {c.partners.logos.map((logo) => (
            <li
              key={logo.name}
              className="partner-logo group flex items-center justify-center"
              style={{ willChange: 'transform, opacity' }}
            >
              <Image
                src={logo.img}
                alt={logo.name}
                width={160}
                height={48}
                style={{
                  height: '36px',
                  width: 'auto',
                  maxWidth: '140px',
                  objectFit: 'contain',
                  filter: 'grayscale(1) opacity(0.55)',
                  transition:
                    'filter 0.45s cubic-bezier(0.32, 0.72, 0, 1), transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                }}
                className="group-hover:[filter:grayscale(0)_opacity(1)] group-hover:-translate-y-[3px] motion-reduce:transition-none motion-reduce:transform-none"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
