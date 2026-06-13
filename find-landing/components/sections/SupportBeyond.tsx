'use client'

import { supportBeyond } from '@/data/content'
import Image from 'next/image'
import Pill from '@/components/ui/Pill'

export default function SupportBeyond() {
  return (
    <section
      id="support-beyond"
      className="min-h-[70vh] flex flex-col justify-center bg-[var(--color-dark)] text-[var(--color-paper)] px-6 py-24"
      aria-label="Support Beyond Buying and Selling"
    >
      {/* SupportBeyond stub — replace with full card grid design */}
      <div className="max-w-5xl mx-auto w-full">
        <h2
          className="font-[var(--font-display)] font-bold mb-4"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1 }}
        >
          {supportBeyond.heading.lead}{' '}
          <span className="text-[var(--color-muted)]">{supportBeyond.heading.tail}</span>
        </h2>
        <p className="text-[var(--color-muted)] max-w-xl mb-4">
          {supportBeyond.intro.lead}
        </p>
        <p className="text-[var(--color-muted)] max-w-xl mb-12">
          {supportBeyond.intro.tail}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {supportBeyond.cards.map((card) => (
            <div key={card.title} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[var(--color-dark-2)]">
              <Image
                src={card.img}
                alt={card.title}
                fill
                style={{ objectFit: 'cover', opacity: 0.6 }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="font-[var(--font-display)] font-semibold text-lg text-[var(--color-paper)] mb-2">
                  {card.title}
                </h3>
                <span className="text-sm text-[var(--color-muted)] hover:text-[var(--color-paper)] cursor-pointer transition-colors">
                  {card.cta} →
                </span>
              </div>
            </div>
          ))}
        </div>
        <Pill variant="light" href="/services" withArrow
          className="border-[var(--color-paper)] text-[var(--color-paper)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]">
          {supportBeyond.cta}
        </Pill>
      </div>
    </section>
  )
}
