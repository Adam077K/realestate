'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'

/**
 * Advantages - id="advantages".
 *
 * "Discover our advantages" - the five reasons to work with Bonim Atid. Rendered
 * as an intentional, non-generic grid: the first card spans wide as a lead card,
 * the remaining four sit in a 2-up rhythm beneath it. Each card carries a mono
 * index, a display title and a muted description, on a hairline-bordered surface.
 *
 * Bilingual via `c.advantages`; RTL-aware (text-start + dir-driven grid order).
 * Reveal: heading words stagger; cards rise + fade, gated on motionOk.
 */
export default function Advantages() {
  const sectionRef = useRef<HTMLElement>(null)
  const { motionOk } = useSmoothScroll()
  const c = useContent()
  const { advantages } = c

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      gsap.from('.adv-heading .tt-word', {
        yPercent: 110,
        opacity: 0,
        stagger: 0.04,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.adv-heading', start: 'top 82%' },
      })

      gsap.from('.adv-card', {
        y: 32,
        opacity: 0,
        stagger: 0.09,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.adv-grid', start: 'top 82%' },
      })
    },
    [motionOk]
  )

  return (
    <section
      ref={sectionRef}
      id="advantages"
      className="bg-[var(--color-paper)] px-6 md:px-12 lg:px-20 py-24 md:py-32"
      aria-label={`${advantages.heading.lead} ${advantages.heading.tail}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="adv-heading mb-14 md:mb-20 max-w-3xl">
          <TwoToneHeading
            as="h2"
            lead={advantages.heading.lead}
            tail={advantages.heading.tail}
            className="text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05]"
          />
        </div>

        <ul className="adv-grid grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgba(17,17,17,0.1)] rounded-2xl overflow-hidden">
          {advantages.items.map((item, i) => (
            <li
              key={item.title}
              className={[
                'adv-card group bg-[var(--color-paper)] p-7 md:p-9 flex flex-col gap-4 text-start',
                'transition-[background-color,transform,box-shadow] duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]',
                'hover:bg-[var(--color-paper-warm)] hover:-translate-y-[2px] hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.12)]',
                'motion-reduce:transition-none motion-reduce:transform-none',
                i === 0 ? 'md:col-span-2' : '',
              ].join(' ')}
              style={{ willChange: 'transform, opacity' }}
            >
              <span className="text-xs font-mono text-[var(--color-muted)] tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-[var(--font-display)] text-[clamp(1.25rem,2.4vw,1.75rem)] leading-tight tracking-[-0.02em] text-[var(--color-ink)]">
                {item.title}
              </h3>
              <p className="text-[var(--color-muted)] text-[clamp(0.95rem,1.3vw,1.0625rem)] leading-relaxed max-w-prose">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
