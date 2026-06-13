'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useLang, useContent } from '@/components/providers/LanguageProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'

/**
 * BuyerGroups — id="buyer-groups".
 *
 * The three active Bonim Atid buyer-group cities (Holon / Petah Tikva / Bat Yam),
 * each as an image card: a full-bleed photograph with a dark scrim, the city name
 * in display type, a short note, and a "Details" affordance that nudges on hover.
 *
 * Bilingual via `c.buyerGroups`; RTL-aware (text-start + dir-driven grid order,
 * arrow flips with dir). Reveal: heading words stagger, cards clip-reveal + rise,
 * gated on motionOk with a static fallback (full opacity, no clip).
 */
export default function BuyerGroups() {
  const sectionRef = useRef<HTMLElement>(null)
  const { motionOk } = useSmoothScroll()
  const { dir } = useLang()
  const c = useContent()
  const { buyerGroups } = c

  const isHebrew = c.register.fields.name === 'שם מלא'
  const detailsLabel = isHebrew ? 'פרטים' : 'Details'
  const arrow = dir === 'rtl' ? '←' : '→'

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      gsap.from('.bg-heading .tt-word', {
        yPercent: 110,
        opacity: 0,
        stagger: 0.04,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.bg-heading', start: 'top 82%' },
      })

      gsap.utils.toArray<HTMLElement>('.bg-card').forEach((card, i) => {
        const media = card.querySelector('.bg-card-media')
        const tl = gsap.timeline({
          scrollTrigger: { trigger: card, start: 'top 84%' },
          delay: i * 0.08,
        })
        if (media) {
          tl.fromTo(
            media,
            { clipPath: 'inset(100% 0 0 0)' },
            { clipPath: 'inset(0% 0 0 0)', duration: 0.95, ease: 'power3.out' }
          )
        }
        tl.from(
          card.querySelectorAll('.bg-card-text'),
          { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.5'
        )
      })
    },
    [motionOk]
  )

  return (
    <section
      ref={sectionRef}
      id="buyer-groups"
      className="bg-[var(--color-paper)] px-6 md:px-12 lg:px-20 py-24 md:py-32 overflow-hidden"
      aria-label={`${buyerGroups.heading.lead} ${buyerGroups.heading.tail}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-heading mb-14 md:mb-20 max-w-3xl">
          <TwoToneHeading
            as="h2"
            lead={buyerGroups.heading.lead}
            tail={buyerGroups.heading.tail}
            className="text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05]"
          />
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {buyerGroups.groups.map((group) => (
            <li key={group.city}>
              <a
                href="#register"
                className="bg-card group block relative rounded-2xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2"
                aria-label={`${group.city} — ${detailsLabel}`}
              >
                {/* Media + scrim */}
                <div
                  className="bg-card-media relative aspect-[3/4]"
                  style={{ clipPath: motionOk ? 'inset(100% 0 0 0)' : undefined }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={group.img}
                    alt={group.city}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
                  />
                </div>

                {/* Overlaid text */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-7 text-start">
                  <h3 className="bg-card-text font-[var(--font-display)] text-[clamp(1.5rem,3vw,2.25rem)] leading-tight tracking-[-0.02em] text-white">
                    {group.city}
                  </h3>
                  <p className="bg-card-text text-[rgba(255,255,255,0.75)] text-sm md:text-[0.95rem] leading-relaxed mt-2">
                    {group.note}
                  </p>
                  <span className="bg-card-text mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
                    {detailsLabel}
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                    >
                      {arrow}
                    </span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
