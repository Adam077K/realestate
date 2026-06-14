'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from '@/lib/gsap'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import { useLang, useContent } from '@/components/providers/LanguageProvider'
import { images } from '@/data/content'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import MaskedImage from '@/components/ui/MaskedImage'

const AUTOPLAY_DELAY = 5000

/**
 * Testimonials → attendee testimonials for the Bonim Atid webinar.
 *
 * One-shot reveals use IntersectionObserver (via useScrollReveal), immune to
 * the Hero pin-spacer math. Autoplay crossfade uses premium easing (power3.inOut).
 */
export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { motionOk, reducedMotion } = useSmoothScroll()
  const { dir } = useLang()
  const c = useContent()
  const { testimonials } = c
  const isRtl = dir === 'rtl'
  const items = testimonials.items

  // Crossfade to a new index with premium easing
  const goTo = useCallback(
    (idx: number) => {
      if (idx === activeIdx) return
      const el = quoteRef.current
      if (!el || !motionOk) {
        setActiveIdx(idx)
        return
      }

      gsap.to(el, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setActiveIdx(idx)
          gsap.fromTo(
            el,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
          )
        },
      })
    },
    [activeIdx, motionOk]
  )

  // Autoplay — gated on reducedMotion (not motionOk).
  useEffect(() => {
    if (reducedMotion) return
    timerRef.current = setTimeout(() => {
      goTo((activeIdx + 1) % items.length)
    }, AUTOPLAY_DELAY)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeIdx, reducedMotion, goTo, items.length])

  // One-shot reveals via IntersectionObserver — immune to pin-spacer position math.
  useScrollReveal(
    sectionRef,
    [
      // Section block rises as a unit
      {
        trigger: sectionRef.current,
        revealAt: 0.2, // 'top 80%'
        build: () =>
          gsap.fromTo(
            sectionRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', paused: true }
          ),
      },
      // Heading words stagger
      {
        trigger: sectionRef.current,
        revealAt: 0.22, // 'top 78%'
        build: () => {
          const words = sectionRef.current?.querySelectorAll('.testimonials-heading .tt-word')
          return gsap.fromTo(
            words ? Array.from(words) : [],
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.045,
              ease: 'power3.out',
              duration: 0.85,
              paused: true,
            }
          )
        },
      },
      // Image: directional clip-path wipe (reading-start origin)
      {
        trigger: '.testimonial-image-wrap',
        revealAt: 0.17, // 'top 83%'
        build: () => {
          const imgWrap = sectionRef.current?.querySelector('.testimonial-image-wrap')
          const hiddenClip = isRtl ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'
          return gsap.fromTo(
            imgWrap ?? [],
            { clipPath: hiddenClip },
            { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power3.out', paused: true }
          )
        },
      },
      // Right panel: fade up with slight delay
      {
        trigger: '.testimonial-right',
        revealAt: 0.17, // 'top 83%'
        build: () => {
          const rightPanel = sectionRef.current?.querySelector('.testimonial-right')
          return gsap.fromTo(
            rightPanel ?? [],
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              delay: 0.25,
              paused: true,
            }
          )
        },
      },
      // Quote mark: scale + fade in after panel
      {
        trigger: '.testimonial-right',
        revealAt: 0.17, // 'top 83%'
        build: () => {
          const quoteMark = sectionRef.current?.querySelector('.testimonial-quote-mark')
          return gsap.fromTo(
            quoteMark ?? [],
            { opacity: 0, scale: 0.7 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              delay: 0.5,
              ease: 'power3.out',
              paused: true,
            }
          )
        },
      },
    ],
    [motionOk, isRtl]
  )

  const active = items[activeIdx]

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="bg-[var(--color-paper-warm)] px-6 md:px-12 lg:px-20 py-24 md:py-32"
      aria-label={`${testimonials.heading.lead} ${testimonials.heading.tail}`}
    >
      {/* Heading */}
      <div className="testimonials-heading mb-12 md:mb-16">
        <TwoToneHeading
          lead={testimonials.heading.lead}
          tail={testimonials.heading.tail}
          as="h2"
        />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row md:items-stretch gap-8 md:gap-12 lg:gap-16">
        {/* Image card */}
        <div className="md:w-[45%] lg:w-[48%]">
          <div
            className="testimonial-image-wrap w-full overflow-hidden rounded-sm"
            style={{
              clipPath: motionOk ? undefined : 'inset(0 0% 0 0)',
              aspectRatio: '3/2.5',
            }}
          >
            <MaskedImage
              shape="rect"
              src={images.testimonialCouple}
              alt={`${active.name} - ${testimonials.heading.lead} ${testimonials.heading.tail}`}
              fill
              className="h-full"
              objectFit="cover"
            />
          </div>
        </div>

        {/* Pager + quote */}
        <div className="testimonial-right md:w-[55%] lg:w-[52%] flex flex-col justify-between">
          {/* Top divider */}
          <span className="block h-px bg-[rgba(17,17,17,0.15)] mb-6" aria-hidden="true" />

          {/* Pager row */}
          <div className="flex items-center justify-between mb-6">
            <nav aria-label="Testimonial navigation">
              <ol className="flex gap-2">
                {items.map((_, i) => (
                  <li key={i}>
                    <button
                      onClick={() => goTo(i)}
                      aria-label={`Testimonial ${i + 1} of ${items.length}`}
                      aria-current={i === activeIdx ? 'true' : undefined}
                      className={[
                        'w-9 h-9 rounded-full text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] tabular-nums',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-ink)]',
                        'border',
                        i === activeIdx
                          ? 'border-[var(--color-ink)] bg-transparent text-[var(--color-ink)] scale-110'
                          : 'border-[rgba(17,17,17,0.2)] text-[var(--color-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] hover:scale-105',
                      ].join(' ')}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Decorative large quote mark */}
            <span
              className="testimonial-quote-mark font-[var(--font-display)] font-bold text-[var(--color-ink)] select-none leading-none"
              style={{ fontSize: 'clamp(3rem, 5.5vw, 4.5rem)', opacity: 0.85 }}
              aria-hidden="true"
            >
              {isRtl ? '„' : '"'}
            </span>
          </div>

          {/* Active quote - animated crossfade */}
          <div ref={quoteRef} className="flex-1 flex flex-col justify-between">
            <blockquote
              className="font-[var(--font-display)] font-medium text-[var(--color-ink)] text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.3] tracking-[-0.02em] mb-8"
              aria-live="polite"
              aria-atomic="true"
            >
              {active.quote}
            </blockquote>

            {/* Author + stars */}
            <footer className="flex items-center gap-4">
              <cite className="not-italic text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]">
                {active.name}
              </cite>
              <span className="text-[var(--color-muted)] text-xs" aria-hidden="true">
                /
              </span>
              <span
                className="flex gap-0.5"
                aria-label={`${active.rating} / 5`}
              >
                {Array.from({ length: active.rating }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="text-[var(--color-ink)] text-sm leading-none"
                    style={{
                      display: 'inline-block',
                      transition: `opacity 0.3s cubic-bezier(0.32,0.72,0,1) ${i * 60}ms, transform 0.3s cubic-bezier(0.32,0.72,0,1) ${i * 60}ms`,
                    }}
                  >
                    ★
                  </span>
                ))}
              </span>
            </footer>
          </div>
        </div>
      </div>
    </section>
  )
}
