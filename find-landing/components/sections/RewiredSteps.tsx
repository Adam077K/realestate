'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
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
 */
export default function RewiredSteps() {
  const sectionRef = useRef<HTMLElement>(null)
  const dividerRefs = useRef<(HTMLSpanElement | null)[]>([])
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const { motionOk } = useSmoothScroll()
  const { dir } = useLang()
  const c = useContent()

  const dividerOrigin = dir === 'rtl' ? 'right center' : 'left center'

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      // Section entrance: the whole section rises first
      // immediateRender:false → GSAP does NOT snapshot the "from" state at creation time.
      // Without this, if the trigger fires at page-load (before pin-spacer is accounted for),
      // GSAP sets opacity:0 immediately and then clearProps leaves it visible—arms never re-fire.
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 92%' },
        }
      )

      // Heading words: masked word-clip stagger reveal with strong yPercent
      const headingWords = sectionRef.current?.querySelectorAll('.learn-heading .tt-word')
      if (headingWords && headingWords.length > 0) {
        gsap.fromTo(
          headingWords,
          { yPercent: 115, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            stagger: 0.05,
            ease: 'power3.out',
            duration: 0.95,
            immediateRender: false,
            scrollTrigger: {
              trigger: '.learn-heading',
              start: 'top 82%',
            },
          }
        )
      }

      // Items: dividers scaleX 0→1 then row fades in
      const items = itemRefs.current.filter(Boolean) as HTMLLIElement[]
      const dividers = dividerRefs.current.filter(Boolean) as HTMLSpanElement[]

      items.forEach((item, i) => {
        const divider = dividers[i]

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 82%',
          },
        })

        if (divider) {
          tl.fromTo(
            divider,
            { scaleX: 0, transformOrigin: dividerOrigin },
            {
              scaleX: 1,
              duration: 0.6,
              ease: 'power3.out',
              immediateRender: false,
            }
          )
        }

        // Row number + content rise together, slightly offset from divider
        tl.fromTo(
          item.querySelectorAll('.item-content'),
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            immediateRender: false,
          },
          '-=0.25'
        )
      })
    },
    [motionOk, dividerOrigin]
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
                    transform: motionOk ? 'scaleX(0)' : 'scaleX(1)',
                  }}
                  aria-hidden="true"
                />

                {/* Row content */}
                <div className="item-content flex items-start gap-4 md:gap-6 py-8 md:py-10">
                  {/* Index */}
                  <span className="shrink-0 text-xs font-mono text-[var(--color-muted)] pt-1 w-6 text-end select-none">
                    {item.n}
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
