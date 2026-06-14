'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'
import MaskedImage from '@/components/ui/MaskedImage'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import { images } from '@/data/content'

const IMAGE_META: { alt: string; objectPosition: string }[] = [
  { alt: 'משפחה מאושרת בדירה חדשה', objectPosition: 'center center' },
  { alt: 'רכישת דירה - חוזה ומפתח', objectPosition: 'center center' },
  { alt: 'פנים דירה מודרנית מוארת', objectPosition: 'center center' },
  { alt: 'משפחה מתכננת ביחד', objectPosition: 'center center' },
]

export default function ChevronStrip() {
  const sectionRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const { motionOk } = useSmoothScroll()
  const c = useContent()

  // One-shot reveals via IntersectionObserver — immune to pin-spacer position math.
  useScrollReveal(
    sectionRef,
    [
      // Section entrance: whole section rises
      {
        trigger: sectionRef.current,
        revealAt: 0.2, // 'top 80%'
        build: () =>
          gsap.fromTo(
            sectionRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', paused: true }
          ),
      },
      // Heading words stagger reveal
      {
        trigger: '.chevron-heading',
        revealAt: 0.18, // 'top 82%'
        build: () => {
          const headingWords = sectionRef.current?.querySelectorAll('.chevron-heading .tt-word')
          return gsap.fromTo(
            headingWords ? Array.from(headingWords) : [],
            { yPercent: 115, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.055,
              ease: 'power3.out',
              duration: 0.9,
              paused: true,
            }
          )
        },
      },
      // Arrow row: entire row wipes in via clip-path from the left
      {
        trigger: '.chevron-arrow-row',
        revealAt: 0.16, // 'top 84%'
        build: () => {
          const arrowRow = sectionRef.current?.querySelector('.chevron-arrow-row')
          return gsap.fromTo(
            arrowRow ?? [],
            { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power3.out', paused: true }
          )
        },
      },
      // Individual arrows stagger inside the clip: rise + fade
      {
        trigger: sectionRef.current,
        revealAt: 0.2, // 'top 80%'
        build: () => {
          const items = itemRefs.current.filter(Boolean) as HTMLDivElement[]
          return gsap.fromTo(
            items,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              stagger: { each: 0.1, from: 'start' },
              ease: 'power3.out',
              duration: 0.75,
              delay: 0.15,
              paused: true,
            }
          )
        },
      },
    ],
    [motionOk]
  )

  const chevronImages = images.chevron

  return (
    <section
      id="chevron-strip"
      ref={sectionRef}
      className="bg-[var(--color-paper)] py-16 md:py-20 lg:py-24"
      aria-label="בונים עתיד - אודות"
    >
      {/* Heading - centered above the arrow row */}
      <div className="chevron-heading mb-10 md:mb-14 flex justify-center px-4 text-center">
        <TwoToneHeading lead={c.arrows.lead} tail={c.arrows.tail} as="h2" />
      </div>

      {/* Mobile: 2×2 grid (no overlap, no horizontal scroll).
          sm+: original overlapped horizontal flex row. */}
      <div className="overflow-hidden px-4" dir="ltr">
        <div className="chevron-arrow-row grid grid-cols-2 gap-2 sm:flex sm:items-stretch sm:justify-center">
          {chevronImages.map((src, i) => {
            const meta =
              IMAGE_META[i] ?? {
                alt: `בונים עתיד - תמונה ${i + 1}`,
                objectPosition: 'center',
              }

            return (
              <div
                key={src}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                className="chevron-panel group relative will-change-transform"
              >
                <MaskedImage
                  shape="chevron"
                  src={src}
                  alt={meta.alt}
                  fill
                  className="h-full w-full"
                  objectFit="cover"
                  objectPosition={meta.objectPosition}
                  imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.07] motion-reduce:transform-none motion-reduce:transition-none"
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
