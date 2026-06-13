'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useContent } from '@/components/providers/LanguageProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'

/**
 * Webinar details — an elegant dark block presenting the four logistics facts
 * (date / time / duration / platform) as premium tiles that reveal on scroll.
 *
 * id="webinar" so the nav "פרטים / Details" anchor resolves here.
 */
export default function SupportBeyond() {
  const sectionRef = useRef<HTMLElement>(null)
  const motionOk = !useReducedMotion()
  const c = useContent()
  const w = c.webinar

  // Per-tile caption + decorative glyph. Captions are language-aware (the
  // content tree carries values only); we key off a Hebrew-only string to pick.
  const isHebrew = c.register.fields.name === 'שם מלא'
  const tiles = [
    {
      key: 'date',
      glyph: '◷',
      caption: isHebrew ? 'תאריך' : 'Date',
      value: w.date,
    },
    {
      key: 'time',
      glyph: '◴',
      caption: isHebrew ? 'שעה' : 'Time',
      value: w.time,
    },
    {
      key: 'duration',
      glyph: '∿',
      caption: isHebrew ? 'משך' : 'Duration',
      value: w.duration,
    },
    {
      key: 'platform',
      glyph: '◈',
      caption: isHebrew ? 'פלטפורמה' : 'Platform',
      value: w.platform,
    },
  ] as const

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      gsap.from('.wb-heading .tt-word', {
        yPercent: 110,
        opacity: 0,
        stagger: 0.04,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.wb-heading', start: 'top 82%' },
      })

      gsap.from('.wb-label', {
        y: 16,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.wb-label', start: 'top 88%' },
      })

      gsap.from('.wb-tile', {
        y: 36,
        opacity: 0,
        stagger: 0.09,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.wb-tiles', start: 'top 80%' },
      })
    },
    [motionOk]
  )

  return (
    <section
      ref={sectionRef}
      id="webinar"
      className="bg-[var(--color-dark)] text-[var(--color-paper)] w-full"
      aria-labelledby="webinar-heading"
    >
      <div className="w-full px-6 md:px-12 lg:px-20 pt-20 pb-20 md:pt-28 md:pb-28">
        {/* Eyebrow label */}
        <p className="wb-label text-[11px] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.45)] font-medium mb-5">
          {w.label}
        </p>

        {/* Heading */}
        <TwoToneHeading
          as="h2"
          lead={w.label}
          tail={w.date}
          leadClassName="text-white"
          tailClassName="text-[rgba(255,255,255,0.4)]"
          className="wb-heading max-w-4xl"
        />
        <span id="webinar-heading" className="sr-only">
          {`${w.label} — ${w.date} ${w.time}`}
        </span>

        {/* Detail tiles */}
        <ul className="wb-tiles mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {tiles.map((tile) => (
            <li
              key={tile.key}
              className="wb-tile group relative flex flex-col gap-4 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[var(--color-dark-2)] p-6 md:p-7 transition-colors duration-300 hover:border-[rgba(255,255,255,0.28)]"
              style={{ willChange: 'transform, opacity' }}
            >
              <span
                aria-hidden="true"
                className="text-3xl leading-none text-[rgba(255,255,255,0.55)] transition-transform duration-300 ease-out group-hover:scale-110 group-hover:text-white"
              >
                {tile.glyph}
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.4)] font-medium">
                  {tile.caption}
                </span>
                <span className="font-[var(--font-display)] text-xl md:text-2xl font-semibold leading-tight text-white">
                  {tile.value}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
