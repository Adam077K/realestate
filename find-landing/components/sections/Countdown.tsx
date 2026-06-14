'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useLang, useContent } from '@/components/providers/LanguageProvider'
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider'

/**
 * Countdown - id="countdown"
 *
 * One-shot reveals use IntersectionObserver (via useScrollReveal), immune to
 * the Hero pin-spacer math. The digit-block CSS transitions are mount-driven
 * (unchanged from original).
 */

const TARGET = new Date(2026, 5, 22, 20, 30, 0)
const TARGET_MS = TARGET.getTime()

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

function compute(): TimeLeft {
  const diff = TARGET_MS - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds, done: false }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

interface UnitBlockProps {
  value: string
  label: string
  revealed: boolean
  motionOk: boolean
  delay: number
}

function UnitBlock({ value, label, revealed, motionOk, delay }: UnitBlockProps) {
  const style = motionOk
    ? {
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.65s cubic-bezier(0.19,1,0.22,1) ${delay}ms, transform 0.65s cubic-bezier(0.19,1,0.22,1) ${delay}ms`,
      }
    : {}

  return (
    <div
      className="flex flex-col items-center gap-2 sm:gap-3"
      style={style}
      aria-label={`${value} ${label}`}
    >
      <div
        className="relative flex items-center justify-center rounded-xl bg-[rgba(255,255,255,0.06)] ring-1 ring-[rgba(255,255,255,0.1)] backdrop-blur-sm"
        style={{
          width: 'clamp(68px, 18vw, 112px)',
          height: 'clamp(76px, 20vw, 124px)',
        }}
        aria-hidden="true"
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-xl bg-[rgba(255,255,255,0.18)]"
          aria-hidden="true"
        />
        <span
          className="font-[var(--font-display)] font-semibold leading-none tracking-[-0.02em] text-white tabular-nums"
          style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}
        >
          {value}
        </span>
      </div>
      <span
        className="text-[10px] font-medium uppercase tracking-[0.22em] text-[rgba(255,255,255,0.42)] sm:text-[11px]"
        aria-hidden="true"
      >
        {label}
      </span>
    </div>
  )
}

export default function Countdown() {
  const sectionRef = useRef<HTMLElement>(null)
  const { dir } = useLang()
  const c = useContent()
  const { motionOk } = useSmoothScroll()

  // One-shot reveals via IntersectionObserver — immune to pin-spacer position math.
  useScrollReveal(
    sectionRef,
    [
      // Section entrance: dark band rises from below
      {
        trigger: sectionRef.current,
        revealAt: 0.2, // 'top 80%'
        build: () =>
          gsap.fromTo(
            sectionRef.current,
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', paused: true }
          ),
      },
      // Lead line: stronger reveal after section settles
      {
        trigger: sectionRef.current,
        revealAt: 0.2, // 'top 80%'
        build: () =>
          gsap.fromTo(
            '.countdown-lead',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.18, ease: 'power2.out', paused: true }
          ),
      },
    ],
    [motionOk]
  )

  // HYDRATION-SAFE: never call Date during the initial render.
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    done: false,
  })

  useEffect(() => {
    setMounted(true)
    setTimeLeft(compute())

    const id = setInterval(() => {
      const next = compute()
      setTimeLeft(next)
      if (next.done) clearInterval(id)
    }, 1000)

    return () => clearInterval(id)
  }, [])

  const cd = c.countdown
  const units = [
    { key: 'days', value: mounted ? pad(timeLeft.days) : '--', label: cd.units.days },
    { key: 'hours', value: mounted ? pad(timeLeft.hours) : '--', label: cd.units.hours },
    { key: 'minutes', value: mounted ? pad(timeLeft.minutes) : '--', label: cd.units.minutes },
    { key: 'seconds', value: mounted ? pad(timeLeft.seconds) : '--', label: cd.units.seconds },
  ] as const

  const delays = [0, 80, 160, 240]

  return (
    <section
      ref={sectionRef}
      id="countdown"
      dir={dir}
      className="relative w-full overflow-hidden bg-[var(--color-dark)]"
      aria-label={mounted && timeLeft.done ? cd.started : cd.lead}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,255,255,0.045), transparent 72%)',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-[rgba(255,255,255,0.08)]"
      />

      <div className="relative mx-auto w-full max-w-5xl px-6 py-16 md:px-12 md:py-24">
        <p
          className="countdown-lead mb-10 text-center font-[var(--font-display)] text-sm font-medium uppercase tracking-[0.28em] text-[rgba(255,255,255,0.5)] md:mb-12 md:text-[13px]"
          style={
            motionOk
              ? {
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                  transition:
                    'opacity 0.6s cubic-bezier(0.19,1,0.22,1), transform 0.6s cubic-bezier(0.19,1,0.22,1)',
                }
              : {}
          }
        >
          {mounted && timeLeft.done ? cd.started : cd.lead}
        </p>

        <div
          dir="ltr"
          className="flex flex-row items-start justify-center gap-3 sm:gap-5 md:gap-8"
          role="timer"
          aria-live="off"
        >
          {units.map((unit, i) => (
            <UnitBlock
              key={unit.key}
              value={unit.value}
              label={unit.label}
              revealed={mounted}
              motionOk={motionOk}
              delay={delays[i]}
            />
          ))}
        </div>

        <p
          className="mt-10 text-center font-[var(--font-display)] text-[11px] font-normal tracking-[0.18em] text-[rgba(255,255,255,0.28)] md:mt-12"
          aria-hidden="true"
          style={
            motionOk
              ? {
                  opacity: mounted ? 1 : 0,
                  transition: 'opacity 0.7s cubic-bezier(0.19,1,0.22,1) 300ms',
                }
              : {}
          }
        >
          {c.webinar.date} · {c.webinar.time}
        </p>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-[rgba(255,255,255,0.06)]"
      />
    </section>
  )
}
