'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'
import SectionLabel from '@/components/ui/SectionLabel'

/**
 * Partners — id="partners".
 *
 * Real-estate / investment partner logos rendered as images (grayscale by default,
 * full-color on hover). Bilingual via `c.partners`; RTL-aware.
 *
 * Reveal: heading + logos fade/rise on scroll, gated on motionOk with a static
 * fallback. Each logo lifts to full-color on hover for a tactile, premium feel.
 */
export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null)
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      gsap.from('.partners-heading', {
        y: 18,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.partners-heading', start: 'top 88%' },
      })

      gsap.from('.partner-logo', {
        y: 16,
        opacity: 0,
        stagger: 0.06,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.partners-row', start: 'top 88%' },
      })
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
                  transition: 'filter 0.3s ease',
                }}
                className="group-hover:[filter:grayscale(0)_opacity(1)] motion-reduce:transition-none"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
