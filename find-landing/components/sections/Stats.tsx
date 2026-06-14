'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'

/**
 * Stats — id="stats".
 *
 * v2: LIGHT CLOUD-WHITE background — continues the hero's persistent cloud veil
 * seamlessly. Same soft-sky coloring; dark text on light for WCAG contrast.
 * The cloud-bridge gradient at the top of this section is now a reinforcement
 * overlay (since bg and veil are the same coloring, the seam is invisible).
 *
 * Three large display numbers + muted labels, separated by hairline rules.
 * Bilingual via `c.stats`; RTL-aware.
 * Reveal: numbers rise + fade with stagger (motionOk); static fallback otherwise.
 * Next section (RewiredSteps) is bg-[var(--color-paper)] (#ffffff) — soft light→light
 * handoff, no jarring jump.
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
      className="relative w-full"
      style={{
        // Full-section vertical gradient.
        // TOP (#e4ebf6): exact composited render color at the hero→stats boundary.
        //   Hero sky at 100% stop = #e2eaf3 (rgb 226,234,243).
        //   Hero veil = rgba(228,235,246,0.82) layered over it.
        //   Composite: r≈228, g≈235, b≈246 → #e4ebf6.
        //   This IS the same as rgba(228,235,246,1) — single source of truth.
        //   If a seam is visible it's from the cloud bloom layer; the gradient color is correct.
        // BOTTOM (#ffffff): matches RewiredSteps var(--color-paper) — no jarring jump.
        background: 'linear-gradient(to bottom, #f7fafd 0%, #f9fbfe 40%, #ffffff 100%)',
      }}
      aria-label={c.stats.map((s) => `${s.value} ${s.label}`).join(', ')}
    >
      {/* No separate bridge overlay needed — the section bg gradient handles the blend. */}
      <div className="relative w-full px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <ul className="stats-grid grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(17,17,17,0.10)]">
          {c.stats.map((stat) => (
            <li
              key={stat.value}
              className="stat-item flex flex-col items-center text-center gap-3 px-4 py-8 sm:py-2"
              style={{ willChange: 'transform, opacity' }}
            >
              {/* Large display number — dark on light for WCAG contrast */}
              <span
                className="font-[var(--font-display)] font-light leading-none tracking-[-0.03em]"
                style={{
                  color: 'var(--color-ink)',
                  fontSize: 'clamp(3.5rem,9vw,6.5rem)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {stat.value}
              </span>
              {/* Muted label — dark/55% on light */}
              <span
                className="text-sm md:text-base leading-snug max-w-[18ch]"
                style={{ color: 'rgba(17,17,17,0.55)' }}
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
