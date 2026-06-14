'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'

/**
 * Stats — id="stats". Mid-page standalone band.
 *
 * Sits between Testimonials (light warm) and BuyerGroups (light), so this uses
 * the dark brand surface for strong contrast. Three large display numbers on a
 * `bg-[var(--color-dark)]` ground with light text.
 *
 * Layout: 3-up grid, hairline dividers (divide-x desktop / divide-y mobile),
 * centered text, generous vertical padding.
 * Reveal: numbers rise + fade with stagger (motionOk); static fallback otherwise.
 */
export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null)
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      gsap.from('.stat-item', {
        y: 28,
        opacity: 0,
        stagger: 0.18,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.stats-grid', start: 'top 85%' },
      })
    },
    [motionOk]
  )

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="relative w-full bg-[var(--color-dark)]"
      aria-label={c.stats.map((s) => `${s.value} ${s.label}`).join(', ')}
    >
      <div className="w-full px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <ul className="stats-grid grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(255,255,255,0.12)]">
          {c.stats.map((stat) => (
            <li
              key={stat.value}
              className="stat-item flex flex-col items-center text-center gap-3 px-6 py-10 sm:py-4"
              style={{ willChange: 'transform, opacity' }}
            >
              {/* Large display number — white on dark */}
              <span
                className="font-[var(--font-display)] font-light leading-none tracking-[-0.03em] text-[var(--color-paper)] tabular-nums"
                style={{
                  fontSize: 'clamp(2.75rem,7vw,5rem)',
                }}
              >
                {stat.value}
              </span>
              {/* Muted label */}
              <span
                className="text-sm md:text-base leading-snug max-w-[22ch] text-[rgba(255,255,255,0.5)]"
              >
                {stat.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
