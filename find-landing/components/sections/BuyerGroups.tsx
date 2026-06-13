'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useLang, useContent } from '@/components/providers/LanguageProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'

/**
 * BuyerGroups — id="buyer-groups".
 *
 * A continuously-moving, infinite marquee carousel of the four PRE-DESIGNED city
 * cards (`c.buyerGroups.cards`: Holon / Haifa / Tel Aviv / Herzliya). The card
 * images already have all their text/labels baked in, so they are rendered AS-IS:
 * no overlay, no scrim, no darkening, no cropping. Each card keeps its native
 * ~590×348 (≈1.7:1) aspect ratio so it "fits exactly".
 *
 * Motion: the track is two back-to-back copies of the cards; we tween it by exactly
 * one copy's width on an infinite, GPU-transform (x) timeline, then modulo-wrap —
 * giving a seamless, premium loop. Direction follows `dir` (RTL scrolls the other
 * way). Hover pauses. With reduced motion (motionOk === false) the track is a static,
 * wrapping row (no auto-move) and the duplicate copy is hidden from a11y.
 *
 * Heading (`c.buyerGroups.heading`) sits above via TwoToneHeading; the section id
 * is preserved.
 */
export default function BuyerGroups() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const { motionOk } = useSmoothScroll()
  const { dir } = useLang()
  const c = useContent()
  const { buyerGroups } = c

  // Heading reveal (gated on motionOk).
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
    },
    [motionOk]
  )

  // Auto-playing infinite marquee. One copy = half the track (cards duplicated once).
  useEffect(() => {
    const track = trackRef.current
    if (!track || !motionOk) return

    // Distance to travel = width of a single copy (half of the full duplicated track).
    const distance = () => track.scrollWidth / 2
    // RTL reads right→left, so cards should drift toward the start (positive x in RTL,
    // negative x in LTR) for a natural "incoming" feel.
    const direction = dir === 'rtl' ? 1 : -1
    const SPEED = 60 // px per second — calm, premium drift

    const ctx = gsap.context(() => {
      gsap.set(track, { x: 0 })
      tweenRef.current = gsap.to(track, {
        x: () => direction * distance(),
        duration: () => distance() / SPEED,
        ease: 'none',
        repeat: -1,
        modifiers: {
          // Wrap within a single copy so the loop is seamless.
          x: (value) => {
            const d = distance()
            if (d === 0) return '0px'
            const wrapped =
              direction < 0
                ? gsap.utils.wrap(-d, 0, parseFloat(value))
                : gsap.utils.wrap(0, d, parseFloat(value))
            return `${wrapped}px`
          },
        },
      })
    }, track)

    return () => ctx.revert()
  }, [motionOk, dir])

  const pause = () => tweenRef.current?.pause()
  const resume = () => tweenRef.current?.play()

  // Render one set of cards; when animating we render a second, aria-hidden copy
  // for the seamless loop. Static (reduced-motion) shows a single wrapping row.
  const cards = buyerGroups.cards
  const cities = buyerGroups.groups

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
      </div>

      {/* Carousel viewport — full-bleed within the section padding box */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
      >
        {/* Edge fades to hint the continuous motion */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 md:w-20 bg-gradient-to-r from-[var(--color-paper)] to-transparent"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 md:w-20 bg-gradient-to-l from-[var(--color-paper)] to-transparent"
        />

        <div
          ref={trackRef}
          className={
            motionOk
              ? 'flex w-max gap-5 md:gap-6 will-change-transform'
              : 'flex flex-wrap justify-center gap-5 md:gap-6'
          }
        >
          {cards.map((src, i) => (
            <BuyerCard
              key={`a-${i}`}
              src={src}
              index={i}
              alt={cities[i]?.city ?? ''}
            />
          ))}
          {/* Duplicate copy for the seamless loop — decorative only. */}
          {motionOk &&
            cards.map((src, i) => (
              <BuyerCard key={`b-${i}`} src={src} index={i} alt="" ariaHidden />
            ))}
        </div>
      </div>
    </section>
  )
}

/**
 * A single pre-designed buyer-group card image, shown AS-IS at its native
 * ~1.7:1 aspect ratio (object-contain so nothing is cropped or distorted).
 * No overlay, no scrim — the artwork carries its own labels.
 */
function BuyerCard({
  src,
  index,
  alt,
  ariaHidden = false,
}: {
  src: string
  index: number
  alt: string
  ariaHidden?: boolean
}) {
  return (
    <div
      aria-hidden={ariaHidden || undefined}
      className="shrink-0 w-[min(85vw,560px)] sm:w-[min(60vw,520px)] md:w-[440px] lg:w-[480px]"
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl ring-1 ring-[var(--color-ink)]/10 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.5)]"
        style={{ aspectRatio: '590 / 348' }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 768px) 60vw, 480px"
          className="object-contain"
          priority={index === 0}
        />
      </div>
    </div>
  )
}
