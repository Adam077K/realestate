'use client'

import { chevronStrip } from '@/data/content'
import Image from 'next/image'

export default function ChevronStrip() {
  return (
    <section
      id="chevron-strip"
      className="min-h-[50vh] flex overflow-hidden"
      aria-label="Chevron image strip"
    >
      {/* ChevronStrip stub — replace with masked chevron images */}
      {chevronStrip.images.map((src, i) => (
        <div key={src} className="relative flex-1 min-h-[400px] bg-[var(--color-paper-warm)]">
          <Image
            src={src}
            alt={`FIND Real Estate property ${i + 1}`}
            fill
            style={{ objectFit: 'cover' }}
            sizes="25vw"
          />
        </div>
      ))}
    </section>
  )
}
