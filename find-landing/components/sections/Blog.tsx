'use client'

import { blog } from '@/data/content'
import Image from 'next/image'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function Blog() {
  return (
    <section
      id="blog"
      className="min-h-[70vh] flex flex-col justify-center bg-[var(--color-paper)] px-6 py-24"
      aria-label="Blog"
    >
      {/* Blog stub — replace with full editorial card layout */}
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blog.posts.map((post) => (
            <article key={post.title} className="flex flex-col group cursor-pointer">
              <div className="relative aspect-[3/2] rounded-lg overflow-hidden mb-4 bg-[var(--color-paper-warm)]">
                <Image
                  src={post.img}
                  alt={post.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <time
                dateTime={post.date}
                className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2"
              >
                {formatDate(post.date)}
              </time>
              <h3 className="font-[var(--font-display)] font-semibold text-xl text-[var(--color-ink)] mb-3 group-hover:text-[var(--color-muted)] transition-colors leading-snug">
                {post.title}
              </h3>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed flex-1">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
