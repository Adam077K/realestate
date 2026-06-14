'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useLang, useContent } from '@/components/providers/LanguageProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'

/**
 * BuyerGroups - id="buyer-groups".
 *
 * A continuously-moving, infinite marquee carousel of the four PRE-DESIGNED city
 * cards. Motion language: section rises → heading words stagger → marquee fades in
 * as a unit → cards drift. Richer entrance than before.
 */
export default function BuyerGroups() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const { motionOk, reducedMotion } = useSmoothScroll()
  const { dir } = useLang()
  const c = useContent()
  const { buyerGroups } = c

  // Section entrance + heading word reveal (gated on motionOk).
  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      // Section: rise from below as a unified block
      // fromTo + immediateRender:false prevents pin-spacer false triggers
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      )

      // Heading word stagger
      gsap.fromTo(
        '.bg-heading .tt-word',
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.045,
          duration: 0.85,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: { trigger: '.bg-heading', start: 'top 80%' },
        }
      )

      // Sub-line below the heading fades up
      gsap.fromTo(
        '.bg-subline',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.18,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: { trigger: '.bg-heading', start: 'top 80%' },
        }
      )

      // Marquee viewport: clip-wipe reveal from reading-start
      const carouselEl = sectionRef.current?.querySelector('.bg-carousel')
      if (carouselEl) {
        gsap.fromTo(
          carouselEl,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
          {
            clipPath: 'inset(0 0% 0 0)',
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: { trigger: carouselEl, start: 'top 82%' },
          }
        )
      }
    },
    [motionOk]
  )

  // Auto-playing infinite marquee — gated on reducedMotion (not motionOk).
  // Scroll-reveal entrances in useGsapContext above always run (motionOk is always true).
  useEffect(() => {
    const track = trackRef.current
    if (!track || reducedMotion) return

    const distance = () => track.scrollWidth / 2
    const direction = dir === 'rtl' ? 1 : -1
    const SPEED = 60

    const ctx = gsap.context(() => {
      gsap.set(track, { x: 0 })
      tweenRef.current = gsap.to(track, {
        x: () => direction * distance(),
        duration: () => distance() / SPEED,
        ease: 'none',
        repeat: -1,
        modifiers: {
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
  }, [reducedMotion, dir])

  const pause = () => tweenRef.current?.pause()
  const resume = () => tweenRef.current?.play()

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
        <div className="bg-heading mb-4 max-w-3xl">
          <TwoToneHeading
            as="h2"
            lead={buyerGroups.heading.lead}
            tail={buyerGroups.heading.tail}
            className="text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05]"
          />
        </div>
        {/* Decorative eyebrow-style sub-line beneath heading */}
        <div className="bg-subline mb-14 md:mb-20 h-px w-16 bg-[var(--color-ink)]/20" aria-hidden="true" />
      </div>

      {/* Carousel viewport */}
      <div
        className="bg-carousel relative overflow-hidden"
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
            !reducedMotion
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
          {/* Duplicate copy for the seamless loop - decorative only. */}
          {!reducedMotion &&
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
 * ~1.7:1 aspect ratio. Richer hover: deeper lift, shadow bloom, image scale.
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
      className="group shrink-0 w-[min(85vw,560px)] sm:w-[min(60vw,520px)] md:w-[440px] lg:w-[480px]"
    >
      {/* Double-bezel outer shell for depth */}
      <div className="p-[3px] rounded-[1.375rem] bg-[var(--color-ink)]/[0.04] ring-1 ring-[var(--color-ink)]/8 transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[3px] group-hover:shadow-[0_28px_60px_-16px_rgba(0,0,0,0.28)] motion-reduce:transition-none motion-reduce:transform-none">
        <div
          className="relative w-full overflow-hidden rounded-[calc(1.375rem-3px)] ring-1 ring-[var(--color-ink)]/10 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.45)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.55)]"
          style={{ aspectRatio: '590 / 348' }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 768px) 60vw, 480px"
            className="object-contain transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}
