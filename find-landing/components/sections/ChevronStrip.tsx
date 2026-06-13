'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import MaskedImage from '@/components/ui/MaskedImage'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import { chevronStrip } from '@/data/content'

// Per-image alt text and object-position tuning so faces/subjects stay centred
// within the chevron clip shape (the visible area is roughly the right 58% of
// the bounding box once the notch clips the left edge).
const IMAGE_META: { alt: string; objectPosition: string }[] = [
  { alt: 'Woman in blazer — FIND Real Estate agent', objectPosition: '60% center' },
  { alt: 'Bedroom interior with city views', objectPosition: '55% center' },
  { alt: 'Open-plan living interior', objectPosition: '55% center' },
  { alt: 'Man in suit — FIND Real Estate agent', objectPosition: '50% center' },
]

// How much each chevron overlaps the next (as a fraction of the flex-basis).
// The notch sits at 42% from left; the tip is at 100%.  Overlapping by ~16–18%
// seats the tip of arrow N inside the notch of arrow N+1, leaving a clean white
// V-gap between them — matching the reference (frame_016, frame_018).
const OVERLAP_FRACTION = '17%'

export default function ChevronStrip() {
  const sectionRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const { motionOk } = useSmoothScroll()

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      const items = itemRefs.current.filter(Boolean) as HTMLDivElement[]

      // Left→right opening reveal: each arrow enters in sequence from left to right.
      // We clip from opacity 0 + slight leftward offset so the chain "opens" rightward
      // — matching the band-reveal motion across frames 015→019.
      gsap.from(items, {
        opacity: 0,
        xPercent: -18,
        stagger: {
          each: 0.12,
          from: 'start', // left first
        },
        ease: 'power3.out',
        duration: 0.85,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      })

      // Subtle continuous parallax — each panel drifts at a slightly different rate.
      // Keep the offset small so the ❯❯❯❯ chain stays visually aligned.
      items.forEach((el, i) => {
        gsap.fromTo(
          el,
          { x: (i + 1) * 8 },
          {
            x: (i + 1) * -8,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.8,
            },
          }
        )
      })
    },
    [motionOk]
  )

  // Static (no-motion) fallback: arrows simply visible, no transform
  const images = chevronStrip.images

  return (
    <section
      id="chevron-strip"
      ref={sectionRef}
      className="bg-[var(--color-paper)] py-16 md:py-20 lg:py-24"
      aria-label="FIND Real Estate — about section"
    >
      {/* Heading — centered above the arrow row */}
      <div className="mb-10 md:mb-14 flex justify-center px-4 text-center">
        <TwoToneHeading
          lead={chevronStrip.heading.lead}
          tail={chevronStrip.heading.tail}
          as="h2"
        />
      </div>

      {/* Arrow row — overflow-hidden so the outermost clips don't cause scrollbar */}
      <div className="overflow-hidden">
        {/*
          The flex container is centred and uses a fixed height.
          Each chevron has a flex-basis that when summed (minus overlaps) fills ~70–76%
          of the viewport at 1280px — matching the reference proportions.
          Negative right margin = overlap so tip nests into the next chevron's notch.
          Ascending z-index ensures the right-most arrow renders on top, consistent
          with a left-to-right directional sweep.
        */}
        <div
          className="flex items-stretch justify-center"
          style={{ height: 'clamp(300px, 38vw, 560px)' }}
        >
          {images.map((src, i) => {
            const meta = IMAGE_META[i] ?? { alt: `FIND Real Estate image ${i + 1}`, objectPosition: 'center' }
            const isLast = i === images.length - 1

            return (
              <div
                key={src}
                ref={(el) => { itemRefs.current[i] = el }}
                className="relative shrink-0 grow-0"
                style={{
                  // Each panel is ~22% wide; 4 × 22% − 3 × 17% overlap ≈ 37% total,
                  // leaving ~63% white — tuned to match reference (frame_018).
                  flexBasis: '22%',
                  marginRight: isLast ? 0 : `-${OVERLAP_FRACTION}`,
                  zIndex: i,
                }}
                aria-hidden={false}
              >
                <MaskedImage
                  shape="chevron"
                  src={src}
                  alt={meta.alt}
                  fill
                  className="h-full w-full"
                  objectFit="cover"
                  objectPosition={meta.objectPosition}
                  priority={i === 0}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
