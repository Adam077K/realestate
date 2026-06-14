'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'
import SectionLabel from '@/components/ui/SectionLabel'

/**
 * Partners — id="partners".
 *
 * A light band that names the firms Bonim Atid works alongside, rendered as a row
 * of tracked, muted text logos (no raster assets — the brand list is text-native).
 * Bilingual via `c.partners`; RTL-aware (the flex row mirrors with `dir`).
 *
 * Reveal: heading + logos fade/rise on scroll, gated on motionOk with a static
 * fallback. Each logo lifts to full ink on hover for a tactile, premium feel.
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

        <ul className="partners-row flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-14 lg:gap-x-16">
          {c.partners.logos.map((logo) => (
            <li
              key={logo}
              className="partner-logo font-[var(--font-display)] text-base md:text-lg lg:text-xl font-medium uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-ink)] select-none"
              style={{ willChange: 'transform, opacity' }}
            >
              {logo}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
