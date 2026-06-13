'use client'

import { Fragment, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import Pill from '@/components/ui/Pill'
import { rewiredSteps } from '@/data/content'

export default function RewiredSteps() {
  const sectionRef = useRef<HTMLElement>(null)
  const dividerRefs = useRef<(HTMLSpanElement | null)[]>([])
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])
  const { motionOk } = useSmoothScroll()

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      // Intro paragraph words
      const introWords = sectionRef.current?.querySelectorAll('.intro-words .tt-word')
      if (introWords && introWords.length > 0) {
        gsap.from(introWords, {
          yPercent: 110,
          opacity: 0,
          stagger: 0.03,
          ease: 'power3.out',
          duration: 0.75,
          scrollTrigger: {
            trigger: '.intro-words',
            start: 'top 82%',
          },
        })
      }

      // Big heading words
      const headingWords = sectionRef.current?.querySelectorAll('.rewired-heading .tt-word')
      if (headingWords && headingWords.length > 0) {
        gsap.from(headingWords, {
          yPercent: 110,
          opacity: 0,
          stagger: 0.04,
          ease: 'power3.out',
          duration: 0.9,
          scrollTrigger: {
            trigger: '.rewired-heading',
            start: 'top 80%',
          },
        })
      }

      // Steps: dividers scaleX 0 → 1 then row fades in
      const steps = stepRefs.current.filter(Boolean) as HTMLLIElement[]
      const dividers = dividerRefs.current.filter(Boolean) as HTMLSpanElement[]

      steps.forEach((step, i) => {
        const divider = dividers[i]

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: 'top 82%',
          },
        })

        if (divider) {
          tl.fromTo(
            divider,
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.5, ease: 'power2.out' }
          )
        }

        tl.from(
          step.querySelectorAll('.step-content'),
          {
            opacity: 0,
            y: 12,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.2'
        )
      })
    },
    [motionOk]
  )

  return (
    <section
      id="rewired-steps"
      ref={sectionRef}
      className="bg-[var(--color-paper)] px-6 md:px-12 lg:px-20 py-24 md:py-32"
      aria-label="Real Estate Rewired"
    >
      {/* Centered intro paragraph */}
      <div className="max-w-3xl mx-auto text-center mb-20 md:mb-28">
        <p className="intro-words font-[var(--font-display)] text-[clamp(1.125rem,2.5vw,1.5rem)] leading-[1.45] tracking-[-0.01em]">
          <span className="text-[var(--color-ink)]">
            {/* Word spans for GSAP — replicate TwoToneHeading pattern inline */}
            {rewiredSteps.intro.lead.split(' ').map((word, i, arr) => (
              <Fragment key={`lead-${i}`}>
                <span className="word-clip">
                  <span className="word-inner tt-word">{word}</span>
                </span>
                {i < arr.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </span>
          {' '}
          <span className="text-[var(--color-muted)]">
            {rewiredSteps.intro.tail.split(' ').map((word, i, arr) => (
              <Fragment key={`tail-${i}`}>
                <span className="word-clip">
                  <span className="word-inner tt-word">{word}</span>
                </span>
                {i < arr.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </span>
        </p>
      </div>

      {/* Two-column block */}
      <div className="flex flex-col md:flex-row md:gap-16 lg:gap-24 max-w-7xl mx-auto">
        {/* LEFT: giant stacked heading + CTA */}
        <div className="md:w-5/12 lg:w-[42%] mb-16 md:mb-0 flex flex-col justify-start">
          <div className="rewired-heading">
            <TwoToneHeading
              lead={rewiredSteps.title.lead}
              tail={rewiredSteps.title.tail}
              as="h2"
              stacked
              className="text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.0]"
            />
          </div>
          <div className="mt-10">
            <Pill variant="dark" href="/search" withArrow>
              {rewiredSteps.cta}
            </Pill>
          </div>
        </div>

        {/* RIGHT: steps list */}
        <div className="md:w-7/12 lg:w-[58%]">
          {/* "Steps:" label */}
          <p className="text-[var(--color-ink)] text-sm font-medium tracking-wide mb-4">
            Steps:
          </p>

          <ol aria-label="How FIND works — three steps">
            {rewiredSteps.steps.map((step, i) => (
              <li
                key={step.n}
                ref={(el) => { stepRefs.current[i] = el }}
                className="relative"
              >
                {/* Hairline divider — animates scaleX 0→1 */}
                <span
                  ref={(el) => { dividerRefs.current[i] = el }}
                  className="block h-px bg-[rgba(17,17,17,0.15)]"
                  style={{ transformOrigin: 'left center', transform: motionOk ? 'scaleX(0)' : 'scaleX(1)' }}
                  aria-hidden="true"
                />

                {/* Row content */}
                <div className="step-content flex items-start gap-4 md:gap-6 py-8 md:py-10">
                  {/* Step number */}
                  <span className="shrink-0 text-xs font-mono text-[var(--color-muted)] pt-1 w-6 text-right select-none">
                    {step.n}
                  </span>

                  {/* Step text */}
                  <p className="text-[clamp(1.125rem,2.2vw,1.5rem)] leading-[1.35] tracking-[-0.01em]">
                    <strong className="font-semibold text-[var(--color-ink)]">
                      {step.lead}
                    </strong>{' '}
                    <span className="text-[var(--color-muted)] font-normal">
                      {step.tail}
                    </span>
                  </p>
                </div>
              </li>
            ))}

            {/* Bottom hairline */}
            <li aria-hidden="true">
              <span className="block h-px bg-[rgba(17,17,17,0.15)]" />
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
