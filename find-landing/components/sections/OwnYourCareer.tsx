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
 * Meet-the-two-hosts block. Motion language:
 * - Section rises as a unit (strong entrance)
 * - Heading words stagger-reveal
 * - Intro paragraph fades up with blur
 * - Each portrait: clip-path wipe from bottom + subtle scale settle
 * - Portrait inner image gets a slow parallax drift on scroll
 * - Text rises after the portrait with overlap
 * - clearProps on all onComplete for safety
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

      // Section entrance: whole block rises
      gsap.from(sectionRef.current, {
        opacity: 0,
        y: 44,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
        onComplete() {
          gsap.set(sectionRef.current, { clearProps: 'opacity,transform' })
        },
      })

      // Heading word reveal
      const headingWords = headingRef.current?.querySelectorAll('.tt-word')
      if (headingWords && headingWords.length > 0) {
        gsap.from(headingWords, {
          yPercent: 115,
          opacity: 0,
          stagger: 0.05,
          ease: 'power3.out',
          duration: 0.9,
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 82%',
          },
          onComplete() {
            gsap.set(headingWords, { clearProps: 'yPercent,opacity' })
          },
        })
      }

      // Intro: blur-fade rise
      const intro = introRef.current
      if (intro) {
        gsap.from(intro, {
          opacity: 0,
          y: 22,
          filter: 'blur(4px)',
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: intro,
            start: 'top 85%',
          },
          onComplete() {
            gsap.set(intro, { clearProps: 'opacity,transform,filter' })
          },
        })
      }

      // Each host card - image clip-path reveal + subtle scale settle + text rise
      const people = personRefs.current.filter(Boolean) as HTMLElement[]
      people.forEach((person, i) => {
        const imageWrap = person.querySelector<HTMLElement>('.host-image')
        const imageInner = person.querySelector<HTMLElement>('.host-image-inner')
        const textBlock = person.querySelectorAll('.host-text')

        // GSAP sets the hidden FROM state (never inline style) so clearProps
        // on complete always restores visibility even if the trigger misfires.
        if (imageWrap) {
          gsap.set(imageWrap, { clipPath: 'inset(100% 0 0 0)' })
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: person,
            start: 'top 84%',
          },
          delay: i * 0.1,
          onComplete() {
            // Safety: always clear so images are never permanently hidden
            if (imageWrap) gsap.set(imageWrap, { clearProps: 'clipPath' })
          },
        })

        if (imageWrap) {
          tl.to(imageWrap, {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.1,
            ease: 'power3.out',
          })
        }

        // Scale settle on inner image during the reveal
        if (imageInner) {
          tl.from(
            imageInner,
            { scale: 1.06, ease: 'power3.out', duration: 1.1 },
            '<'
          )
        }

        tl.from(
          textBlock,
          {
            opacity: 0,
            y: 28,
            duration: 0.75,
            ease: 'power3.out',
            stagger: 0.06,
            onComplete() {
              gsap.set(textBlock, { clearProps: 'opacity,transform' })
            },
          },
          '-=0.65'
        )

        // Subtle scroll parallax on portrait inner image
        if (imageInner) {
          gsap.fromTo(
            imageInner,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: 'none',
              scrollTrigger: {
                trigger: imageWrap ?? person,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            }
          )
        }
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
      {/* Label */}
      <div className="mb-4 md:mb-6">
        <SectionLabel>{c.founders.heading.lead}</SectionLabel>
      </div>

      {/* Full-width heading */}
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

      {/* Two host cards */}
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
                  // GSAP sets clipPath; no inline style so element is never
                  // permanently hidden if the trigger fires late or not at all.
                  aspectRatio: '4 / 5',
                }}
              >
                {/* Extra wrapper for parallax + scale without breaking clip-path */}
                <div
                  className="host-image-inner absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <Image
                    src={person.img}
                    alt={`${person.name} - ${person.role}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="object-cover object-top"
                  />
                </div>
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
