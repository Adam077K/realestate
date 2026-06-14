'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'

/**
 * Hitech - id="hitech".
 *
 * One-shot reveals use IntersectionObserver (via useScrollReveal), immune to
 * the Hero pin-spacer math. The infinite marquee loop stays in useGsapContext
 * because it is a continuous repeat:-1 tween, not a one-shot reveal.
 * The heading word-split innerHTML runs inside the reveal spec's build()
 * closure before the gsap.fromTo targeting .hitech-word-inner.
 */
export default function Hitech() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const { motionOk, reducedMotion } = useSmoothScroll()
  const c = useContent()
  const { hitech } = c

  // Duplicate the logo list so a -50% translate produces a seamless loop.
  const marqueeLogos = !reducedMotion ? [...hitech.logos, ...hitech.logos] : hitech.logos

  // Continuous marquee loop — gated on reducedMotion, stays on GSAP (not IO).
  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      const track = trackRef.current
      if (track && !reducedMotion) {
        gsap.to(track, {
          xPercent: -50,
          duration: 26,
          ease: 'none',
          repeat: -1,
        })
      }
    },
    [motionOk, reducedMotion]
  )

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
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', paused: true }
          ),
      },
      // Heading: word-by-word stagger reveal — split innerHTML inside build()
      {
        trigger: '.hitech-heading',
        revealAt: 0.14, // 'top 86%'
        build: () => {
          const headingEl = sectionRef.current?.querySelector('.hitech-heading')
          if (headingEl) {
            const text = headingEl.textContent ?? ''
            const words = text.split(/\s+/).filter(Boolean)
            headingEl.innerHTML = words
              .map(
                (w) =>
                  `<span class="hitech-word-clip" style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="hitech-word-inner" style="display:inline-block">${w}</span></span>`
              )
              .join(' ')
          }
          return gsap.fromTo(
            '.hitech-word-inner',
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.045,
              duration: 0.75,
              ease: 'power3.out',
              paused: true,
            }
          )
        },
      },
      // Marquee track: fade in once it's moving
      {
        trigger: sectionRef.current,
        revealAt: 0.2, // 'top 80%'
        build: () =>
          gsap.fromTo(
            trackRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.8, delay: 0.2, ease: 'power2.out', paused: true }
          ),
      },
    ],
    [motionOk, reducedMotion]
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
            !reducedMotion
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
              !reducedMotion
                ? 'flex w-max items-center gap-12 md:gap-16 will-change-transform'
                : 'flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-16'
            }
          >
            {marqueeLogos.map((logo, i) => (
              <li
                key={`${logo.name}-${i}`}
                aria-hidden={!reducedMotion && i >= hitech.logos.length ? true : undefined}
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
                    filter: 'brightness(0) invert(1) opacity(0.75)',
                    transition:
                      'filter 0.4s cubic-bezier(0.32, 0.72, 0, 1), transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                  className="group-hover:[filter:brightness(0)_invert(1)_opacity(1)] group-hover:-translate-y-[3px] motion-reduce:transition-none motion-reduce:transform-none"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
