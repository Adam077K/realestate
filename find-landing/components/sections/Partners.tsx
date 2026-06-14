'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'
import SectionLabel from '@/components/ui/SectionLabel'

/**
 * Partners - id="partners".
 *
 * Real-estate / investment partner logos rendered as images (grayscale by default,
 * full-color on hover). Bilingual via `c.partners`; RTL-aware.
 *
 * Reveal: section rises as a unit, then heading, then logos cascade in with a
 * clip-path wipe from below + stagger. Each logo lifts to full-color on hover.
 */
export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null)
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      // Section entrance: whole band drifts up
      // fromTo + immediateRender:false prevents pin-spacer false triggers
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 82%' },
        }
      )

      // Heading subtle rise
      gsap.fromTo(
        '.partners-heading',
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: '.partners-heading', start: 'top 86%' },
        }
      )

      // Logos: clip-path wipe from below, staggered cascade
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
          immediateRender: false,
          scrollTrigger: { trigger: '.partners-row', start: 'top 86%' },
        }
      )
    },
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
