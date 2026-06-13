'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'
import TwoToneHeading from '@/components/ui/TwoToneHeading'
import SectionLabel from '@/components/ui/SectionLabel'
import { ownYourCareer, images } from '@/data/content'

export default function OwnYourCareer() {
  const sectionRef = useRef<HTMLElement>(null)
  const aerialWrapRef = useRef<HTMLDivElement>(null)
  const aerialInnerRef = useRef<HTMLDivElement>(null)
  const portraitWrapRef = useRef<HTMLDivElement>(null)
  const portraitInnerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const { motionOk } = useSmoothScroll()

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      // Heading word reveal
      const headingWords = sectionRef.current?.querySelectorAll('.career-heading .tt-word')
      if (headingWords && headingWords.length > 0) {
        gsap.from(headingWords, {
          yPercent: 110,
          opacity: 0,
          stagger: 0.04,
          ease: 'power3.out',
          duration: 0.85,
          scrollTrigger: {
            trigger: '.career-heading',
            start: 'top 82%',
          },
        })
      }

      // Aerial forest image — clip-path reveal
      const aerialWrap = aerialWrapRef.current
      if (aerialWrap) {
        gsap.fromTo(
          aerialWrap,
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: aerialWrap,
              start: 'top 85%',
            },
          }
        )
      }

      // Aerial parallax
      const aerialInner = aerialInnerRef.current
      if (aerialInner) {
        gsap.fromTo(
          aerialInner,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: aerialWrap,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }

      // Agent portrait — rises in from below with delay
      const portraitWrap = portraitWrapRef.current
      if (portraitWrap) {
        gsap.fromTo(
          portraitWrap,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            ease: 'power3.out',
            delay: 0.25,
            scrollTrigger: {
              trigger: aerialWrap,
              start: 'top 75%',
            },
          }
        )
      }

      // Body paragraph — line-level fade up
      const body = bodyRef.current
      if (body) {
        gsap.from(body, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: body,
            start: 'top 85%',
          },
        })
      }
    },
    [motionOk]
  )

  return (
    <section
      id="own-your-career"
      ref={sectionRef}
      className="bg-[var(--color-paper)] px-6 md:px-12 lg:px-20 py-24 md:py-32 overflow-hidden"
      aria-label="For Agents — Own Your Career"
    >
      {/* Top row: label upper-left, heading spans right side */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-16 md:mb-20">
        <div className="md:w-1/4 pt-2 shrink-0">
          <SectionLabel>{ownYourCareer.label}</SectionLabel>
        </div>

        <div className="md:w-3/4 career-heading">
          <TwoToneHeading
            lead={ownYourCareer.heading.lead}
            tail={ownYourCareer.heading.tail}
            as="h2"
          />
        </div>
      </div>

      {/* Asymmetric image layout + body copy */}
      <div className="relative flex flex-col md:flex-row md:items-start gap-0">
        {/* LEFT: agent portrait — smaller, lower-left, rises with delay */}
        <div className="hidden md:block md:w-[30%] lg:w-[28%] relative">
          {/* Spacer to push portrait down */}
          <div className="h-[22vw] max-h-72" aria-hidden="true" />
          <div
            ref={portraitWrapRef}
            className="relative overflow-hidden rounded-sm"
            style={{
              opacity: motionOk ? 0 : 1,
              width: '100%',
              aspectRatio: '3/4',
            }}
          >
            <div
              ref={portraitInnerRef}
              className="relative w-full h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images.agentPortrait}
                alt="FIND agent at work — career ownership and equity for top performers"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Body copy below portrait on desktop — appears beneath image */}
          <p
            ref={bodyRef}
            className="mt-8 text-[var(--color-muted)] text-sm leading-relaxed max-w-xs"
          >
            {ownYourCareer.body}
          </p>
        </div>

        {/* RIGHT: aerial forest image — large, upper-right */}
        <div className="md:w-[70%] lg:w-[72%] md:pl-10 lg:pl-16">
          <div
            ref={aerialWrapRef}
            className="relative overflow-hidden rounded-sm"
            style={{
              clipPath: motionOk ? undefined : 'inset(0% 0 0 0)',
              aspectRatio: '16/9',
            }}
          >
            <div
              ref={aerialInnerRef}
              className="relative w-full"
              style={{ height: '120%', top: '-10%' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images.aerialForest}
                alt="Aerial view of a tree-lined suburban neighbourhood — Own Your Career with FIND"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Mobile: body below images */}
        <div className="md:hidden mt-8">
          <p className="text-[var(--color-muted)] text-sm leading-relaxed">
            {ownYourCareer.body}
          </p>
        </div>
      </div>
    </section>
  )
}
