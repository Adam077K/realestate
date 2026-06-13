'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import MaskedImage from '@/components/ui/MaskedImage'
import { chevronStrip } from '@/data/content'

const ALT_LABELS = [
  'Elegant living room with designer furniture',
  'Spacious master bedroom with city views',
  'Open-plan kitchen and dining area',
  'Professional agent consulting a client',
]

export default function ChevronStrip() {
  const sectionRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const { motionOk } = useSmoothScroll()

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      const items = itemRefs.current.filter(Boolean) as HTMLDivElement[]

      // Stagger in from the right
      gsap.from(items, {
        xPercent: 40,
        opacity: 0,
        stagger: 0.08,
        ease: 'power3.out',
        duration: 0.9,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
      })

      // Subtle continuous x-parallax: each panel shifts slightly at different rates
      items.forEach((el, i) => {
        const direction = i % 2 === 0 ? -1 : 1
        gsap.fromTo(
          el,
          { x: direction * 12 * (i + 1) },
          {
            x: direction * -12 * (i + 1),
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          }
        )
      })
    },
    [motionOk]
  )

  return (
    <section
      id="chevron-strip"
      ref={sectionRef}
      className="bg-[var(--color-paper)] overflow-hidden py-0"
      aria-label="Property image strip"
    >
      {/* Negative margin so chevrons overlap slightly at edges */}
      <div className="flex items-stretch justify-center" style={{ height: 'clamp(280px, 34vw, 520px)' }}>
        {chevronStrip.images.map((src, i) => (
          <div
            key={src}
            ref={(el) => { itemRefs.current[i] = el }}
            className="relative shrink-0 grow-0"
            // Fixed basis + deep negative margin: panels overlap into one
            // ascending, single-direction sweep of tall right-arrowheads.
            style={{
              flexBasis: '26%',
              marginRight: i < chevronStrip.images.length - 1 ? '-12%' : 0,
              zIndex: i,
            }}
          >
            <MaskedImage
              shape="chevron"
              src={src}
              alt={ALT_LABELS[i] ?? `FIND Real Estate property ${i + 1}`}
              fill
              className="h-full"
              objectFit="cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
