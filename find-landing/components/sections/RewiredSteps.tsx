'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useLang, useContent } from '@/components/providers/LanguageProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'

/**
 * "What you'll learn" - id="learn".
 *
 * Editorial numbered list. Motion language:
 * - Section block rises as a unit (strong entrance)
 * - Heading words stagger-reveal with overflow-hidden clip
 * - Dividers scaleX 0→1 from reading-start
 * - Each row cascades in with a stagger (opacity + translateY)
 * - clearProps on all onComplete so elements are never left hidden
 *
 * Reveals use IntersectionObserver (via useScrollReveal) so they are immune
 * to the Hero pin-spacer position math that causes ScrollTrigger one-shot
 * reveals to mis-fire at page load.
 */
export default function RewiredSteps() {
  const sectionRef = useRef<HTMLElement>(null)
  const dividerRefs = useRef<(HTMLSpanElement | null)[]>([])
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const { dir } = useLang()
  const c = useContent()

  const dividerOrigin = dir === 'rtl' ? 'right center' : 'left center'

  useScrollReveal(
    sectionRef,
    [
      // Section entrance: the whole section rises first
      {
        trigger: sectionRef.current,
        revealAt: 0.08, // 'top 92%'
        build: () =>
          gsap.fromTo(
            sectionRef.current,
            { opacity: 0, y: 44 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', paused: true }
          ),
      },
      // Heading words: masked word-clip stagger reveal
      {
        trigger: '.learn-heading',
        revealAt: 0.18, // 'top 82%'
        build: () => {
          const headingWords = sectionRef.current?.querySelectorAll('.learn-heading .tt-word')
          return gsap.fromTo(
            headingWords ? Array.from(headingWords) : [],
            { yPercent: 115, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.05,
              ease: 'power3.out',
              duration: 0.95,
              paused: true,
            }
          )
        },
      },
    ],
    [dividerOrigin]
  )

  // Per-item reveals: each item's divider + row content
  useScrollReveal(
    sectionRef,
    (itemRefs.current.filter(Boolean) as HTMLLIElement[]).map((item, i) => ({
      trigger: item,
      revealAt: 0.18, // 'top 82%'
      build: () => {
        const divider = dividerRefs.current[i]
        const tl = gsap.timeline({ paused: true })

        if (divider) {
          tl.fromTo(
            divider,
            { scaleX: 0, transformOrigin: dividerOrigin },
            { scaleX: 1, duration: 0.6, ease: 'power3.out' }
          )
        }

        tl.fromTo(
          item.querySelectorAll('.item-content'),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.25'
        )

        return tl
      },
    })),
    [dividerOrigin]
  )

  return (
    <section
      id="learn"
      ref={sectionRef}
      className="bg-[var(--color-paper)] px-6 md:px-12 lg:px-20 py-24 md:py-32"
      aria-label={`${c.learn.heading.lead} ${c.learn.heading.tail}`}
    >
      <div className="flex flex-col md:flex-row md:gap-16 lg:gap-24 max-w-7xl mx-auto">
        {/* HEADING */}
        <div className="md:w-5/12 lg:w-[42%] mb-16 md:mb-0 flex flex-col justify-start">
          <div className="learn-heading">
            <TwoToneHeading
              lead={c.learn.heading.lead}
              tail={c.learn.heading.tail}
              as="h2"
              stacked
              className="text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.0]"
            />
          </div>
        </div>

        {/* TOPICS - numbered editorial list */}
        <div className="md:w-7/12 lg:w-[58%]">
          <ol aria-label={`${c.learn.heading.lead} ${c.learn.heading.tail}`}>
            {c.learn.items.map((item, i) => (
              <li
                key={item.n}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                className="relative"
              >
                {/* Hairline divider */}
                <span
                  ref={(el) => {
                    dividerRefs.current[i] = el
                  }}
                  className="block h-px bg-[rgba(17,17,17,0.15)]"
                  style={{
                    transformOrigin: dividerOrigin,
                    transform: 'scaleX(0)',
                  }}
                  aria-hidden="true"
                />

                {/* Row content */}
                <div className="item-content flex items-center gap-4 md:gap-6 py-8 md:py-10">
                  {/* Branded numbered circle */}
                  <span
                    aria-hidden="true"
                    className="shrink-0 rounded-full flex items-center justify-center select-none"
                    style={{
                      width: 'clamp(44px, 5.2vw, 58px)',
                      height: 'clamp(44px, 5.2vw, 58px)',
                      border: '1.5px solid #5f9d91',
                      color: '#5f9d91',
                      fontFamily: 'var(--font-display, var(--font-hebrew))',
                      fontSize: 'clamp(1.05rem, 2vw, 1.5rem)',
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </span>

                  {/* Topic text */}
                  <p className="text-[clamp(1.125rem,2.2vw,1.5rem)] leading-[1.35] tracking-[-0.01em] text-start">
                    <strong className="font-semibold text-[var(--color-ink)]">
                      {item.lead}
                    </strong>{' '}
                    <span className="text-[var(--color-muted)] font-normal">
                      {item.tail}
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
