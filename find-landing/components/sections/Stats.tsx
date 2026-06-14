'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'

/**
 * Stats - id="stats". Mid-page standalone band.
 *
 * One-shot reveals use IntersectionObserver (via useScrollReveal), immune to
 * the Hero pin-spacer math.
 */
export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null)
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  // One-shot reveals via IntersectionObserver — immune to pin-spacer position math.
  useScrollReveal(
    sectionRef,
    [
      // Section entrance: the whole band rises as a unit
      {
        trigger: sectionRef.current,
        revealAt: 0.18, // 'top 82%'
        build: () =>
          gsap.fromTo(
            sectionRef.current,
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', paused: true }
          ),
      },
      // Stat items - stagger rise + scale settle
      {
        trigger: '.stats-grid',
        revealAt: 0.2, // 'top 80%'
        build: () =>
          gsap.fromTo(
            '.stat-item',
            { y: 48, opacity: 0, scale: 0.92 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              stagger: 0.14,
              duration: 1.0,
              ease: 'power3.out',
              paused: true,
            }
          ),
      },
      // Numbers themselves: blur-rise for extra drama
      {
        trigger: '.stats-grid',
        revealAt: 0.2, // 'top 80%'
        build: () =>
          gsap.fromTo(
            '.stat-number',
            { yPercent: 18, opacity: 0, filter: 'blur(8px)' },
            {
              yPercent: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1.1,
              stagger: 0.14,
              ease: 'power3.out',
              paused: true,
            }
          ),
      },
      // Label lines fade up after numbers
      {
        trigger: '.stats-grid',
        revealAt: 0.2, // 'top 80%'
        build: () =>
          gsap.fromTo(
            '.stat-label',
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.14,
              duration: 0.7,
              delay: 0.22,
              ease: 'power2.out',
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
      id="stats"
      className="relative w-full bg-[var(--color-dark)]"
      aria-label={c.stats.map((s) => `${s.value} ${s.label}`).join(', ')}
    >
      <div className="w-full px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <ul className="stats-grid grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(255,255,255,0.12)]">
          {c.stats.map((stat) => (
            <li
              key={stat.value}
              className="stat-item flex flex-col items-center text-center gap-4 px-6 py-12 sm:py-6"
              style={{ willChange: 'transform, opacity' }}
            >
              <span
                className="stat-number font-[var(--font-display)] font-light leading-none tracking-[-0.04em] text-[var(--color-paper)] tabular-nums"
                style={{
                  fontSize: 'clamp(3rem,8vw,5.5rem)',
                  willChange: 'transform, opacity, filter',
                }}
              >
                {stat.value}
              </span>
              <span
                className="block w-8 h-px bg-[rgba(255,255,255,0.2)]"
                aria-hidden="true"
              />
              <span className="stat-label text-sm md:text-base leading-snug max-w-[22ch] text-[rgba(255,255,255,0.5)]">
                {stat.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
