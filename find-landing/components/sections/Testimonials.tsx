'use client'

import { testimonials } from '@/data/content'

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="min-h-[70vh] flex flex-col justify-center bg-[var(--color-paper)] px-6 py-24"
      aria-label="Testimonials"
    >
      {/* Testimonials stub — replace with paginated carousel */}
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="font-[var(--font-display)] font-bold text-[var(--color-ink)] mb-16"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1 }}
        >
          {testimonials.heading.lead}{' '}
          <span className="text-[var(--color-muted)]">{testimonials.heading.tail}</span>
        </h2>
        <blockquote className="text-xl leading-relaxed text-[var(--color-ink)] mb-8">
          {testimonials.items[0].quote}
        </blockquote>
        <cite className="not-italic text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          {testimonials.items[0].author}
        </cite>
        <div className="flex justify-center gap-1 mt-4" aria-label="5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} aria-hidden="true" className="text-[var(--color-ink)] text-sm">★</span>
          ))}
        </div>
      </div>
    </section>
  )
}
