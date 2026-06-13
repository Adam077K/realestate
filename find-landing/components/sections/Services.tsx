'use client'

import { services } from '@/data/content'
import Pill from '@/components/ui/Pill'

export default function Services() {
  return (
    <section
      id="services"
      className="min-h-[80vh] flex flex-col justify-center bg-[var(--color-paper-warm)] px-6 py-24"
      aria-label="Services"
    >
      {/* Services stub — replace with full accordion/number row design */}
      <div className="max-w-5xl mx-auto w-full">
        <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-6">
          {services.label}
        </p>
        <h2
          className="font-[var(--font-display)] font-bold text-[var(--color-ink)] mb-16"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1 }}
        >
          {services.heading.lead}{' '}
          <span className="text-[var(--color-muted)]">{services.heading.tail}</span>
        </h2>
        <div className="flex flex-col divide-y divide-[rgba(17,17,17,0.1)]">
          {services.rows.map((row) => (
            <div key={row.n} className="py-8 flex gap-8">
              <span className="text-xs font-mono text-[var(--color-muted)] shrink-0 mt-1">{row.n}</span>
              <div>
                <h3 className="font-[var(--font-display)] font-bold text-3xl text-[var(--color-ink)] mb-3">
                  {row.word}
                </h3>
                <p className="text-[var(--color-muted)] leading-relaxed">{row.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16">
          <p className="text-[var(--color-ink)] mb-2">
            {services.closing.lead}{' '}
            <span className="text-[var(--color-muted)]">{services.closing.tail}</span>
          </p>
          <div className="mt-8">
            <Pill variant="dark" href="/search" withArrow>
              {services.cta}
            </Pill>
          </div>
        </div>
      </div>
    </section>
  )
}
