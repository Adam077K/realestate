'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'

/**
 * Process — id="process".
 *
 * "How it works" — a five-step vertical timeline. Each step sits to the
 * reading-start side of a hairline spine: a numbered node, a display title and a
 * muted description. The spine and nodes hug the inline-start edge (right in RTL,
 * left in LTR) using logical `ps-*` padding + a positioned absolute spine, so the
 * whole timeline mirrors with `dir` on <html>.
 *
 * Reveal: heading words stagger; the spine grows from the top, and each step
 * fades up with its node scaling in. Gated on motionOk with a static fallback.
 */
export default function Process() {
  const sectionRef = useRef<HTMLElement>(null)
  const { motionOk } = useSmoothScroll()
  const c = useContent()
  const { process } = c

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      gsap.from('.process-heading .tt-word', {
        yPercent: 110,
        opacity: 0,
        stagger: 0.04,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.process-heading', start: 'top 82%' },
      })

      gsap.fromTo(
        '.process-spine',
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          duration: 1.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.process-list', start: 'top 78%' },
        }
      )

      gsap.utils.toArray<HTMLElement>('.process-step').forEach((step) => {
        const node = step.querySelector('.process-node')
        const body = step.querySelectorAll('.process-body')

        const tl = gsap.timeline({
          scrollTrigger: { trigger: step, start: 'top 84%' },
        })

        if (node) {
          tl.fromTo(
            node,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
          )
        }

        tl.from(
          body,
          { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.25'
        )
      })
    },
    [motionOk]
  )

  return (
    <section
      ref={sectionRef}
      id="process"
      className="bg-[var(--color-paper-warm)] px-6 md:px-12 lg:px-20 py-24 md:py-32"
      aria-label={`${process.heading.lead} ${process.heading.tail}`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="process-heading mb-16 md:mb-20 text-start">
          <TwoToneHeading
            as="h2"
            lead={process.heading.lead}
            tail={process.heading.tail}
            className="text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05]"
          />
        </div>

        {/* Timeline: spine pinned to the inline-start edge; steps padded off it. */}
        <ol className="process-list relative ps-14 md:ps-20">
          {/* Vertical spine — start-anchored, mirrors with dir via inset-inline-start */}
          <span
            className="process-spine absolute top-3 bottom-3 w-px bg-[rgba(17,17,17,0.18)]"
            style={{
              insetInlineStart: '1rem',
              transform: motionOk ? 'scaleY(0)' : 'scaleY(1)',
              transformOrigin: 'top center',
            }}
            aria-hidden="true"
          />

          {process.steps.map((step) => (
            <li key={step.n} className="process-step relative pb-12 md:pb-16 last:pb-0">
              {/* Numbered node, centered on the spine */}
              <span
                className="process-node absolute top-0 -translate-y-1 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-paper)] text-xs font-mono font-medium text-[var(--color-ink)] tabular-nums"
                style={{
                  insetInlineStart: '-3.5rem',
                  willChange: 'transform, opacity',
                }}
                aria-hidden="true"
              >
                {step.n}
              </span>

              <div className="text-start">
                <h3 className="process-body font-[var(--font-display)] text-[clamp(1.25rem,2.6vw,1.875rem)] leading-tight tracking-[-0.02em] text-[var(--color-ink)]">
                  {step.title}
                </h3>
                <p className="process-body text-[var(--color-muted)] text-[clamp(0.95rem,1.4vw,1.0625rem)] leading-relaxed mt-3 max-w-xl">
                  {step.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
