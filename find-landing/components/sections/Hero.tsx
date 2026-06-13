'use client'

import Pill from '@/components/ui/Pill'
import { hero, images } from '@/data/content'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      aria-label="Hero"
    >
      {/* Sky gradient background */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background: `linear-gradient(
            to bottom,
            var(--color-sky-peach) 0%,
            var(--color-sky-orange) 20%,
            var(--color-sky-rose) 40%,
            var(--color-sky-violet) 60%,
            var(--color-sky-blue) 80%,
            var(--color-sky-deep) 100%
          )`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        <h1
          className="font-[var(--font-display)] font-bold text-[var(--color-paper)]"
          style={{
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
          }}
        >
          {hero.title}
        </h1>

        <p
          className="mt-6 text-[var(--color-paper)] font-[var(--font-body)] font-light max-w-xl"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            lineHeight: 1.6,
            opacity: 0.85,
          }}
        >
          {hero.subhead}
        </p>

        <div className="mt-10">
          <Pill
            variant="dark"
            href="/search"
            withArrow
            className="bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[var(--color-paper-warm)]"
          >
            {hero.cta}
          </Pill>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60"
        aria-hidden="true"
      >
        <span className="text-[var(--color-paper)] text-xs tracking-widest uppercase font-light">
          Scroll
        </span>
        <div className="w-px h-10 bg-[var(--color-paper)] opacity-60" />
      </div>
    </section>
  )
}
