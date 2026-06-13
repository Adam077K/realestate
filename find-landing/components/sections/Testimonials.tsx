'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import MaskedImage from '@/components/ui/MaskedImage'
import { testimonials, images } from '@/data/content'

const AUTOPLAY_DELAY = 5000

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { motionOk } = useSmoothScroll()

  // Crossfade to a new index
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
        y: -8,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          setActiveIdx(idx)
          gsap.fromTo(
            el,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
          )
        },
      })
    },
    [activeIdx, motionOk]
  )

  // Autoplay — pause when motionOk is false
  useEffect(() => {
    if (!motionOk) return
    timerRef.current = setTimeout(() => {
      goTo((activeIdx + 1) % testimonials.items.length)
    }, AUTOPLAY_DELAY)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeIdx, motionOk, goTo])

  // Section entrance animations
  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      // Heading words
      const words = sectionRef.current?.querySelectorAll('.tt-word')
      if (words && words.length > 0) {
        gsap.from(words, {
          yPercent: 110,
          opacity: 0,
          stagger: 0.04,
          ease: 'power3.out',
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        })
      }

      // Image clip-path reveal
      const imgWrap = sectionRef.current?.querySelector('.testimonial-image-wrap')
      if (imgWrap) {
        gsap.fromTo(
          imgWrap,
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: imgWrap,
              start: 'top 85%',
            },
          }
        )
      }

      // Right panel fade up
      const rightPanel = sectionRef.current?.querySelector('.testimonial-right')
      if (rightPanel) {
        gsap.from(rightPanel, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.3,
          scrollTrigger: {
            trigger: rightPanel,
            start: 'top 85%',
          },
        })
      }
    },
    [motionOk]
  )

  const active = testimonials.items[activeIdx]

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="bg-[var(--color-paper-warm)] px-6 md:px-12 lg:px-20 py-24 md:py-32"
      aria-label="Testimonials"
    >
      {/* Heading */}
      <div className="mb-12 md:mb-16">
        <TwoToneHeading
          lead={testimonials.heading.lead}
          tail={testimonials.heading.tail}
          as="h2"
        />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row md:items-stretch gap-8 md:gap-12 lg:gap-16">
        {/* LEFT: image */}
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
              alt="Happy couple — FIND Real Estate client testimonial"
              fill
              className="h-full"
              objectFit="cover"
            />
          </div>
        </div>

        {/* RIGHT: pager + quote */}
        <div className="testimonial-right md:w-[55%] lg:w-[52%] flex flex-col justify-between">
          {/* Top divider */}
          <span className="block h-px bg-[rgba(17,17,17,0.15)] mb-6" aria-hidden="true" />

          {/* Pager row */}
          <div className="flex items-center justify-between mb-6">
            {/* Numbered pager */}
            <nav aria-label="Testimonial navigation">
              <ol className="flex gap-2">
                {testimonials.items.map((_, i) => (
                  <li key={i}>
                    <button
                      onClick={() => goTo(i)}
                      aria-label={`Go to testimonial ${i + 1}`}
                      aria-current={i === activeIdx ? 'true' : undefined}
                      className={[
                        'w-9 h-9 rounded-full text-sm font-medium transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-ink)]',
                        'border',
                        i === activeIdx
                          ? 'border-[var(--color-ink)] bg-transparent text-[var(--color-ink)]'
                          : 'border-[rgba(17,17,17,0.2)] text-[var(--color-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]',
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
              className="text-[var(--color-muted)] select-none"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1, opacity: 0.35 }}
              aria-hidden="true"
            >
              &#8221;
            </span>
          </div>

          {/* Active quote — animated crossfade */}
          <div ref={quoteRef} className="flex-1 flex flex-col justify-between">
            <blockquote
              className="text-[var(--color-ink)] text-[clamp(1rem,1.8vw,1.25rem)] leading-[1.6] mb-8"
              aria-live="polite"
              aria-atomic="true"
            >
              {active.quote}
            </blockquote>

            {/* Author + stars */}
            <footer className="flex items-center gap-4">
              <cite className="not-italic text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]">
                {active.author}
              </cite>
              <span className="text-[var(--color-muted)] text-xs" aria-hidden="true">
                /
              </span>
              <span
                className="flex gap-0.5"
                aria-label={`${active.stars} out of 5 stars`}
              >
                {Array.from({ length: active.stars }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="text-[var(--color-ink)] text-sm leading-none"
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
