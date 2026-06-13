'use client'

import { rewiredSteps } from '@/data/content'
import Pill from '@/components/ui/Pill'

export default function RewiredSteps() {
  return (
    <section
      id="rewired-steps"
      className="min-h-[80vh] flex flex-col justify-center bg-[var(--color-dark)] text-[var(--color-paper)] px-6 py-24"
      aria-label="Real Estate Rewired"
    >
      {/* RewiredSteps stub — replace with full animated implementation */}
      <div className="max-w-5xl mx-auto">
        <p className="text-[var(--color-muted)] text-base max-w-xl mb-2">
          {rewiredSteps.intro.lead}
        </p>
        <p className="text-[var(--color-muted)] text-base max-w-xl mb-12">
          {rewiredSteps.intro.tail}
        </p>
        <h2
          className="font-[var(--font-display)] font-bold mb-16"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.05 }}
        >
          {rewiredSteps.title.lead}{' '}
          <span className="text-[var(--color-muted)]">{rewiredSteps.title.tail}</span>
        </h2>
        <ol className="flex flex-col gap-10 mb-16">
          {rewiredSteps.steps.map((step) => (
            <li key={step.n} className="flex gap-6 items-start border-t border-[rgba(255,255,255,0.1)] pt-6">
              <span className="text-xs font-mono text-[var(--color-muted)] mt-1 shrink-0">{step.n}</span>
              <p className="text-xl font-medium">
                {step.lead}{' '}
                <span className="text-[var(--color-muted)] font-normal">{step.tail}</span>
              </p>
            </li>
          ))}
        </ol>
        <Pill variant="light" href="/search" withArrow
          className="border-[var(--color-paper)] text-[var(--color-paper)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]">
          {rewiredSteps.cta}
        </Pill>
      </div>
    </section>
  )
}
