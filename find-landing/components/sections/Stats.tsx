'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'

/**
 * Stats — id="stats".
 *
 * A strong dark band of three large display numbers + muted labels, separated by
 * hairline rules. Bilingual via `c.stats`; RTL-aware (dir on <html> mirrors the
 * row order and the dividers use logical/border classes that flip automatically).
 *
 * Reveal: numbers rise + fade with a stagger, gated on motionOk (static fallback
 * when reduced motion is requested). GPU transforms only (y + opacity).
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
        stagger: 0.12,
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
      className="bg-[var(--color-dark)] text-[var(--color-paper)] w-full"
      aria-label={c.stats.map((s) => `${s.value} ${s.label}`).join(', ')}
    >
      <div className="w-full px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <ul className="stats-grid grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(255,255,255,0.12)]">
          {c.stats.map((stat) => (
            <li
              key={stat.value}
              className="stat-item flex flex-col items-center text-center gap-3 px-4 py-8 sm:py-2"
              style={{ willChange: 'transform, opacity' }}
            >
              <span className="font-[var(--font-display)] font-light leading-none tracking-[-0.03em] text-white text-[clamp(2.75rem,7vw,5rem)] tabular-nums">
                {stat.value}
              </span>
              <span className="text-[rgba(255,255,255,0.5)] text-sm md:text-base leading-snug max-w-[18ch]">
                {stat.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
