'use client'

import { whyFind } from '@/data/content'

export default function WhyFind() {
  return (
    <section
      id="why-find"
      className="min-h-[60vh] flex items-center justify-center bg-[var(--color-paper-warm)] px-6 py-24"
      aria-label="Why FIND"
    >
      {/* WhyFind section stub — replace with full design */}
      <div className="max-w-3xl text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-6">
          {whyFind.label}
        </p>
        <h2
          className="font-[var(--font-display)] font-bold text-[var(--color-ink)]"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1 }}
        >
          {whyFind.heading.lead}{' '}
          <span className="text-[var(--color-muted)]">{whyFind.heading.tail}</span>
        </h2>
        <p className="mt-6 text-[var(--color-muted)] text-lg leading-relaxed">
          {whyFind.body}
        </p>
      </div>
    </section>
  )
}
