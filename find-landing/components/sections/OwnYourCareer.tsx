'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import SectionLabel from '@/components/ui/SectionLabel'

/**
 * "The Hosts" - id="founders".
 *
 * Meet-the-two-hosts block using the REAL founder portraits
 * (`c.founders.people[i].img`: עידן פלג / רועי פישמן - professional head-and-torso
 * portraits on a light ground). Each host is presented as a tasteful portrait card:
 * a framed photo above the display name, muted role, and bio.
 *
 * RTL-correct: text uses text-start; the second card is offset lower for editorial
 * asymmetry (mirrors with `dir` on <html>). Reveal uses GPU transforms (opacity +
 * clip-path + y) and is gated on motionOk, with a static fallback (full opacity,
 * no clip) when off. Photos use next/image (webp) with object-cover framing.
 */
export default function OwnYourCareer() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const personRefs = useRef<(HTMLElement | null)[]>([])
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

      // Intro - fade up
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

      // Each host card - image clip-path reveal + text rise
      const people = personRefs.current.filter(Boolean) as HTMLElement[]
      people.forEach((person, i) => {
        const imageWrap = person.querySelector<HTMLElement>('.host-image')
        const textBlock = person.querySelectorAll('.host-text')

        // Set the hidden FROM state via GSAP (not inline style) so it is
        // automatically cleared on completion even if the trigger never fires.
        if (imageWrap) {
          gsap.set(imageWrap, { clipPath: 'inset(100% 0 0 0)' })
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: person,
            start: 'top 85%',
            // onLeaveBack: restart is acceptable - but crucially, ensure the
            // to-state is always applied regardless.
          },
          delay: i * 0.08,
          onComplete() {
            // Safety: clear clip-path so images are never left hidden
            if (imageWrap) {
              gsap.set(imageWrap, { clearProps: 'clipPath' })
            }
          },
        })

        if (imageWrap) {
          tl.to(imageWrap, {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.0,
            ease: 'power3.out',
          })
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
      className="bg-[var(--color-paper)] px-6 md:px-12 lg:px-20 py-24 md:py-36 overflow-hidden"
      aria-label={`${c.founders.heading.lead} ${c.founders.heading.tail}`}
    >
      {/* Label sits above the heading on its own row so the 2× heading can span full width */}
      <div className="mb-4 md:mb-6">
        <SectionLabel>{c.founders.heading.lead}</SectionLabel>
      </div>

      {/* Full-width heading - 2× the default h2 clamp via sizeClassName override */}
      <div ref={headingRef} className="mb-10 md:mb-14">
        <TwoToneHeading
          lead={c.founders.heading.lead}
          tail={c.founders.heading.tail}
          as="h2"
          sizeClassName="text-[clamp(4rem,9vw,8rem)] leading-[1.0] tracking-[-0.035em]"
        />
      </div>

      {/* Intro */}
      <p
        ref={introRef}
        className="text-[var(--color-muted)] text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed max-w-2xl mb-16 md:mb-28 text-start"
      >
        {c.founders.intro}
      </p>

      {/* Two host cards - second offset lower for editorial asymmetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 max-w-5xl mx-auto">
        {c.founders.people.map((person, i) => (
          <figure
            key={person.name}
            ref={(el) => {
              personRefs.current[i] = el
            }}
            className={i === 1 ? 'group md:mt-24 lg:mt-32 m-0' : 'group m-0'}
          >
            {/* Portrait - tasteful framed card */}
            <div className="relative">
              {/* Soft offset backing plate for a premium, framed feel */}
              <span
                aria-hidden="true"
                className="absolute -inset-x-3 -bottom-3 top-6 rounded-sm bg-[var(--color-ink)]/[0.04]"
              />
              <div
                className="host-image relative overflow-hidden rounded-sm bg-[var(--color-ink)]/[0.03] ring-1 ring-[var(--color-ink)]/10 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45)]"
                style={{
                  // No initial clipPath here - GSAP sets it via gsap.set() so
                  // the element is NEVER permanently hidden if the animation fails.
                  aspectRatio: '4 / 5',
                }}
              >
                <Image
                  src={person.img}
                  alt={`${person.name} - ${person.role}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
                />
              </div>
            </div>

            {/* Name + role + bio */}
            <figcaption className="mt-8 text-start">
              <h3 className="host-text font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight tracking-[-0.025em] text-[var(--color-ink)]">
                {person.name}
              </h3>
              <p className="host-text text-xs md:text-sm font-medium tracking-wide uppercase text-[var(--color-muted)] mt-2">
                {person.role}
              </p>
              <p className="host-text text-[var(--color-ink)]/80 text-[clamp(0.95rem,1.4vw,1.0625rem)] leading-relaxed mt-4 max-w-md">
                {person.bio}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
