'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import SectionLabel from '@/components/ui/SectionLabel'
import { whyFind, images } from '@/data/content'

export default function WhyFind() {
  const sectionRef = useRef<HTMLElement>(null)
  const imageWrapRef = useRef<HTMLDivElement>(null)
  const imageInnerRef = useRef<HTMLDivElement>(null)
  const { motionOk } = useSmoothScroll()

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      // Heading word reveal
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

      // Image clip-path reveal: inset(100% 0 0 0) → inset(0% 0 0 0)
      const imgWrap = imageWrapRef.current
      if (imgWrap) {
        gsap.fromTo(
          imgWrap,
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: imgWrap,
              start: 'top 85%',
            },
          }
        )
      }

      // Subtle parallax y on image inner
      const imgInner = imageInnerRef.current
      if (imgInner) {
        gsap.fromTo(
          imgInner,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: imgWrap,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }
    },
    [motionOk]
  )

  return (
    <section
      id="why-find"
      ref={sectionRef}
      className="bg-[var(--color-paper)] pt-24 pb-0 overflow-hidden"
      aria-label="Why FIND"
    >
      {/* Top row: label upper-left, heading right-aligned */}
      <div className="px-6 md:px-12 lg:px-20 mb-16 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div className="md:w-1/4 pt-2">
          <SectionLabel>{whyFind.label}</SectionLabel>
        </div>

        <div className="md:w-2/3">
          <TwoToneHeading
            lead={whyFind.heading.lead}
            tail={whyFind.heading.tail}
            as="h2"
            className="text-right"
          />
          <p className="mt-6 text-right text-[var(--color-muted)] text-base md:text-lg leading-relaxed max-w-xl ml-auto">
            {whyFind.body}
          </p>
        </div>
      </div>

      {/* Full-width city street image with clip-path reveal + parallax */}
      <div
        ref={imageWrapRef}
        className="w-full overflow-hidden"
        style={{
          clipPath: motionOk ? undefined : 'inset(0% 0 0 0)',
          height: 'clamp(340px, 55vw, 680px)',
        }}
        aria-hidden="false"
      >
        <div
          ref={imageInnerRef}
          className="relative w-full h-full"
          style={{ height: '120%', top: '-10%' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images.cityStreet}
            alt="Aerial view of a residential neighbourhood — Why FIND"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
