'use client'

import { ownYourCareer } from '@/data/content'

export default function OwnYourCareer() {
  return (
    <section
      id="own-your-career"
      className="min-h-[70vh] flex items-center bg-[var(--color-paper-warm)] px-6 py-24"
      aria-label="For Agents"
    >
      {/* OwnYourCareer stub — replace with full two-column design */}
      <div className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-6">
          {ownYourCareer.label}
        </p>
        <h2
          className="font-[var(--font-display)] font-bold text-[var(--color-ink)] mb-8"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1 }}
        >
          {ownYourCareer.heading.lead}{' '}
          <span className="text-[var(--color-muted)]">{ownYourCareer.heading.tail}</span>
        </h2>
        <p className="text-[var(--color-muted)] text-base leading-relaxed">
          {ownYourCareer.body}
        </p>
      </div>
    </section>
  )
}
