'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'

/**
 * Hitech - id="hitech".
 *
 * Social proof: a heading plus a strip of tech-company logo images that
 * Bonim Atid clients work at. On the dark background logos are rendered as
 * bright marks using `brightness(0) invert(1)` so they appear uniformly white.
 *
 * When motion is allowed the strip auto-scrolls as a seamless, dir-neutral
 * marquee (list is duplicated and translated by 50%). When reduced motion is
 * requested it falls back to a centered wrapped static row.
 *
 * Bilingual via `c.hitech`. GPU transform only (translateX).
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
                : 'flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-16'
            }
          >
            {marqueeLogos.map((logo, i) => (
              <li
                key={`${logo.name}-${i}`}
                aria-hidden={motionOk && i >= hitech.logos.length ? true : undefined}
                className="group flex items-center justify-center"
              >
                <Image
                  src={logo.img}
                  alt={logo.name}
                  width={140}
                  height={40}
                  style={{
                    height: '30px',
                    width: 'auto',
                    maxWidth: '130px',
                    objectFit: 'contain',
                    // Render as uniform white light marks on the dark background.
                    // On hover: brighten to full opacity for a tactile, premium reveal.
                    filter: 'brightness(0) invert(1) opacity(0.75)',
                    transition: 'filter 0.4s cubic-bezier(0.32, 0.72, 0, 1), transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                  className="group-hover:[filter:brightness(0)_invert(1)_opacity(1)] group-hover:-translate-y-[2px] motion-reduce:transition-none motion-reduce:transform-none"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
