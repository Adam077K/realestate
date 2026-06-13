'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import Pill from '@/components/ui/Pill'
import { supportBeyond } from '@/data/content'

export default function SupportBeyond() {
  const sectionRef = useRef<HTMLElement>(null)
  const motionOk = !useReducedMotion()

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      // Heading words stagger
      gsap.from('.sb-heading .tt-word', {
        yPercent: 110,
        opacity: 0,
        stagger: 0.04,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.sb-heading',
          start: 'top 80%',
        },
      })

      // Intro + CTA fade up
      gsap.from('.sb-intro', {
        y: 20,
        opacity: 0,
        duration: 0.65,
        delay: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.sb-intro',
          start: 'top 82%',
        },
      })

      // Cards: rise up + Ken-Burns image scale 1.1 → 1
      supportBeyond.cards.forEach((_card, i) => {
        const card = `.sb-card-${i}`

        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: 0.75,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.sb-cards',
            start: 'top 78%',
          },
        })

        // Ken-Burns: image scale from 1.1 down to 1 as card enters
        gsap.fromTo(
          `${card} .sb-card-img`,
          { scale: 1.1 },
          {
            scale: 1,
            duration: 1.2,
            delay: i * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.sb-cards',
              start: 'top 78%',
            },
          }
        )
      })
    },
    [motionOk]
  )

  return (
    <section
      ref={sectionRef}
      id="support-beyond"
      className="bg-[var(--color-dark)] text-[var(--color-paper)] w-full"
      aria-label="Support Beyond Buying and Selling"
    >
      {/* Two-column header */}
      <div className="w-full px-6 md:px-12 lg:px-20 pt-20 pb-14 md:pt-28 md:pb-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* LEFT — giant stacked heading */}
        <TwoToneHeading
          as="h2"
          lead={supportBeyond.heading.lead}
          tail={supportBeyond.heading.tail}
          stacked
          leadClassName="text-white"
          tailClassName="text-white/45"
          className="sb-heading"
        />

        {/* RIGHT — intro + CTA */}
        <div className="sb-intro flex flex-col gap-6 md:pt-3">
          <p className="text-[rgba(255,255,255,0.75)] leading-relaxed font-light text-base md:text-lg">
            {supportBeyond.intro.lead}{' '}
            <span className="text-[rgba(255,255,255,0.45)]">{supportBeyond.intro.tail}</span>
          </p>
          <div>
            <Pill
              variant="ghost"
              href="/services"
              withArrow
              className="border border-white text-white hover:bg-white hover:text-[var(--color-ink)]"
            >
              {supportBeyond.cta}
            </Pill>
          </div>
        </div>
      </div>

      {/* Three image cards */}
      <div className="sb-cards w-full px-6 md:px-12 lg:px-20 pb-16 md:pb-24 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {supportBeyond.cards.map((card, i) => (
          <div
            key={card.title}
            className={`sb-card-${i} group relative aspect-[4/3] overflow-hidden bg-[var(--color-dark-2)] cursor-pointer`}
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Ken-Burns image */}
            <Image
              src={card.img}
              alt={card.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="sb-card-img object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ willChange: 'transform' }}
            />

            {/* Dark gradient scrim — heavier at bottom */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.05) 100%)',
              }}
              aria-hidden="true"
            />

            {/* Title + learn more — bottom left */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex flex-col gap-3">
              <h3 className="font-[var(--font-display)] font-semibold text-xl md:text-2xl text-white leading-tight">
                {card.title}
              </h3>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-white/60 group-hover:text-white transition-colors duration-200">
                {card.cta}
                <span
                  className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
