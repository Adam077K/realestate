'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'

/**
 * Hitech — id="hitech".
 *
 * Social proof: a heading plus a strip of tech-company names (text logos) that
 * Bonim Atid clients work at. When motion is allowed the strip auto-scrolls as a
 * seamless, dir-neutral marquee (the list is duplicated and translated by 50%).
 * When reduced motion is requested it falls back to a centered, wrapped static
 * row — no animation, full legibility.
 *
 * Bilingual via `c.hitech`. The marquee uses a GPU transform (translateX) only.
 */
export default function Hitech() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const { motionOk } = useSmoothScroll()
  const c = useContent()
  const { hitech } = c

  // Duplicate the logo list so a -50% translate produces a seamless loop.
  const marqueeLogos = motionOk ? [...hitech.logos, ...hitech.logos] : hitech.logos

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      gsap.from('.hitech-heading', {
        y: 16,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.hitech-heading', start: 'top 88%' },
      })

      const track = trackRef.current
      if (track) {
        // Loop across exactly one copy's width (the list is doubled).
        gsap.to(track, {
          xPercent: -50,
          duration: 26,
          ease: 'none',
          repeat: -1,
        })
      }
    },
    [motionOk]
  )

  return (
    <section
      ref={sectionRef}
      id="hitech"
      className="bg-[var(--color-dark)] text-[var(--color-paper)] w-full overflow-hidden"
      aria-label={hitech.heading}
    >
      <div className="w-full px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <p className="hitech-heading text-center text-[rgba(255,255,255,0.6)] text-sm md:text-base font-medium mb-10 md:mb-12 max-w-2xl mx-auto">
          {hitech.heading}
        </p>

        <div
          className="relative"
          style={
            motionOk
              ? {
                  WebkitMaskImage:
                    'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
                  maskImage:
                    'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
                }
              : undefined
          }
        >
          <ul
            ref={trackRef}
            className={
              motionOk
                ? 'flex w-max items-center gap-12 md:gap-16 will-change-transform'
                : 'flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16'
            }
          >
            {marqueeLogos.map((logo, i) => (
              <li
                key={`${logo}-${i}`}
                aria-hidden={motionOk && i >= hitech.logos.length ? true : undefined}
                className="font-[var(--font-display)] text-lg md:text-xl lg:text-2xl font-medium tracking-[0.02em] text-[rgba(255,255,255,0.7)] whitespace-nowrap select-none"
              >
                {logo}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
