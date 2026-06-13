'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import SectionLabel from '@/components/ui/SectionLabel'
import { images } from '@/data/content'

/**
 * "The Hosts" — id="founders".
 *
 * Meet-the-two-hosts block. The previous asymmetric-image layout is repurposed:
 * a label + heading + intro at the top, then TWO host blocks, each with a
 * portrait, display name, muted role, and bio. The two blocks are vertically
 * offset (the second sits lower) to keep the editorial asymmetry.
 *
 * RTL-correct: text uses text-start; the offset spacer and grid order mirror via
 * `dir` on <html>. Reveal uses GPU transforms (opacity + clip-path + y) and is
 * gated on motionOk, with a static fallback (full opacity, no clip) when off.
 */

// Tasteful portrait-ish imagery for each host. agentPortrait reads as a person;
// chevron[0] is the agent panel from the strip — both portrait-leaning frames.
const HOST_IMAGES = [images.agentPortrait, images.chevron[0]] as const

export default function OwnYourCareer() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const personRefs = useRef<(HTMLDivElement | null)[]>([])
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      // Heading word reveal
      const headingWords = headingRef.current?.querySelectorAll('.tt-word')
      if (headingWords && headingWords.length > 0) {
        gsap.from(headingWords, {
          yPercent: 110,
          opacity: 0,
          stagger: 0.04,
          ease: 'power3.out',
          duration: 0.85,
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 82%',
          },
        })
      }

      // Intro — fade up
      const intro = introRef.current
      if (intro) {
        gsap.from(intro, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: intro,
            start: 'top 85%',
          },
        })
      }

      // Each host block — image clip-path reveal + text rise
      const people = personRefs.current.filter(Boolean) as HTMLDivElement[]
      people.forEach((person, i) => {
        const imageWrap = person.querySelector('.host-image')
        const textBlock = person.querySelectorAll('.host-text')

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: person,
            start: 'top 80%',
          },
          delay: i * 0.08,
        })

        if (imageWrap) {
          tl.fromTo(
            imageWrap,
            { clipPath: 'inset(100% 0 0 0)' },
            { clipPath: 'inset(0% 0 0 0)', duration: 1.0, ease: 'power3.out' }
          )
        }

        tl.from(
          textBlock,
          { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out' },
          '-=0.55'
        )
      })
    },
    [motionOk]
  )

  return (
    <section
      id="founders"
      ref={sectionRef}
      className="bg-[var(--color-paper)] px-6 md:px-12 lg:px-20 py-24 md:py-32 overflow-hidden"
      aria-label={`${c.founders.heading.lead} ${c.founders.heading.tail}`}
    >
      {/* Top row: label upper-start, heading spans the rest */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10 md:mb-14">
        <div className="md:w-1/4 pt-2 shrink-0">
          <SectionLabel>{c.founders.heading.lead}</SectionLabel>
        </div>

        <div className="md:w-3/4" ref={headingRef}>
          <TwoToneHeading
            lead={c.founders.heading.lead}
            tail={c.founders.heading.tail}
            as="h2"
          />
        </div>
      </div>

      {/* Intro */}
      <p
        ref={introRef}
        className="text-[var(--color-muted)] text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed max-w-2xl mb-16 md:mb-24 text-start"
      >
        {c.founders.intro}
      </p>

      {/* Two host blocks — second offset lower for editorial asymmetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 max-w-6xl mx-auto">
        {c.founders.people.map((person, i) => (
          <div
            key={person.name}
            ref={(el) => {
              personRefs.current[i] = el
            }}
            className={i === 1 ? 'md:mt-24 lg:mt-32' : undefined}
          >
            {/* Portrait */}
            <div
              className="host-image relative overflow-hidden rounded-sm"
              style={{
                clipPath: motionOk ? 'inset(100% 0 0 0)' : undefined,
                aspectRatio: '3/4',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HOST_IMAGES[i] ?? HOST_IMAGES[0]}
                alt={`${person.name} — ${person.role}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Name + role + bio */}
            <h3 className="host-text font-[var(--font-display)] text-[clamp(1.5rem,3vw,2.25rem)] leading-tight tracking-[-0.02em] text-[var(--color-ink)] mt-6 text-start">
              {person.name}
            </h3>
            <p className="host-text text-xs md:text-sm font-medium tracking-wide uppercase text-[var(--color-muted)] mt-2 text-start">
              {person.role}
            </p>
            <p className="host-text text-[var(--color-ink)]/80 text-[clamp(0.95rem,1.4vw,1.0625rem)] leading-relaxed mt-4 max-w-md text-start">
              {person.bio}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
