'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useContent } from '@/components/providers/LanguageProvider'
import MaskedImage from '@/components/ui/MaskedImage'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import { images } from '@/data/content'

// Per-image alt text and object-position tuning so faces/subjects stay centred
// within the chevron clip shape. The new images are landscape/square; center
// positioning keeps the subject visible in the tall crop.
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

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      const items = itemRefs.current.filter(Boolean) as HTMLDivElement[]
      if (items.length === 0) return

      // Heading words stagger reveal
      const headingWords = sectionRef.current?.querySelectorAll('.chevron-heading .tt-word')
      if (headingWords && headingWords.length > 0) {
        gsap.from(headingWords, {
          yPercent: 110,
          opacity: 0,
          stagger: 0.05,
          ease: 'power3.out',
          duration: 0.85,
          scrollTrigger: {
            trigger: '.chevron-heading',
            start: 'top 84%',
          },
        })
      }

      // Left→right "opening" reveal: arrows enter in sequence from the left, each
      // sliding in from a slight leftward offset with a fade. The stagger makes the
      // ❯❯❯❯ chain appear to open rightward (frames 015→019). GPU transforms only
      // (opacity + translateX via xPercent).
      gsap.from(items, {
        opacity: 0,
        xPercent: -22,
        stagger: {
          each: 0.14,
          from: 'start', // arrow 1 first … arrow 4 last
        },
        ease: 'power3.out',
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      })
    },
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

      {/*
        Arrow row - 4 EQUAL chevron-arrow panels in a centered horizontal row.
        Every panel is identical width/height with flex-shrink:0, so the four arrows
        are always the same size (no unequal flex-basis, no negative margins). A small
        consistent gap between panels yields a clean white chevron-shaped gap between
        every arrow: the tip (100% 50%) of arrow N points toward the concave notch
        (42% 50%) of arrow N+1, so the empty space between them reads as a white ❯.
        overflow-hidden guards against sub-pixel clip bleed creating a scrollbar.

        The chevron clip shape is intrinsically directional (points right); the row is
        a fixed left→right visual motif, so we pin dir="ltr" on the arrow row regardless
        of page direction so the arrows always point the same way and never collide.
      */}
      <div className="overflow-hidden px-4" dir="ltr">
        <div className="flex items-stretch justify-center gap-[clamp(4px,0.6vw,12px)]">
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
                className="group relative shrink-0 grow-0 will-change-transform"
                style={{
                  width: 'clamp(180px, 21vw, 290px)',
                  height: 'clamp(240px, 30vw, 420px)',
                }}
              >
                {/* clip-path on MaskedImage contains the image scale within the chevron shape */}
                <MaskedImage
                  shape="chevron"
                  src={src}
                  alt={meta.alt}
                  fill
                  className="h-full w-full"
                  objectFit="cover"
                  objectPosition={meta.objectPosition}
                  priority={i === 0}
                  imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.06] motion-reduce:transform-none motion-reduce:transition-none"
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
