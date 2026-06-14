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
      className="relative w-full"
      style={{
        // Cloud-white / soft-sky background — same coloring as the hero's persistent
        // veil. The section reads as a continuation of the hero cloud atmosphere.
        // Slight warm-cool sky tint: #eef2f7 (soft blue-white, matching the cloud veil).
        background: '#eef2f7',
      }}
      aria-label={c.stats.map((s) => `${s.value} ${s.label}`).join(', ')}
    >
      {/*
        Cloud-bridge reinforcement: the top of this section already matches the
        hero veil coloring, so the seam is invisible. This subtle gradient just
        softens the very top edge further — a gentle atmospheric continuation.
        Starts cloud-white (matching the veil) → fades to transparent.
        Much lighter than v1 (was dark bg → gradient was covering a big jump).
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '120px',
          background:
            'linear-gradient(to bottom, rgba(240,247,255,0.85) 0%, rgba(238,242,247,0) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div className="relative z-[2] w-full px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <ul className="stats-grid grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(17,17,17,0.10)]">
          {c.stats.map((stat) => (
            <li
              key={stat.value}
              className="stat-item flex flex-col items-center text-center gap-3 px-4 py-8 sm:py-2"
              style={{ willChange: 'transform, opacity' }}
            >
              {/* Large display number — dark on light for WCAG contrast */}
              <span
                className="font-[var(--font-display)] font-light leading-none tracking-[-0.03em] text-[clamp(2.75rem,7vw,5rem)] tabular-nums"
                style={{ color: 'var(--color-ink)' }}
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
