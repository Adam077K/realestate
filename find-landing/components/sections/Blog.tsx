'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import Pill from '@/components/ui/Pill'
import { blog } from '@/data/content'

function formatDate(dateStr: string): string {
  // Parse as local date to avoid timezone shifts
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export default function Blog() {
  const sectionRef = useRef<HTMLElement>(null)
  const motionOk = !useReducedMotion()

  useGsapContext(
    sectionRef,
    () => {
      if (!motionOk) return

      blog.posts.forEach((_post, i) => {
        const row = `.blog-row-${i}`

        // Title words stagger upward from overflow-hidden clip
        gsap.from(`${row} .blog-title-word`, {
          yPercent: 100,
          opacity: 0,
          stagger: 0.04,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 78%',
          },
        })

        // Date + excerpt fade up
        gsap.from(`${row} .blog-meta`, {
          y: 16,
          opacity: 0,
          duration: 0.6,
          delay: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 78%',
          },
        })

        // Image clip-reveal from left → right
        gsap.fromTo(
          `${row} .blog-image-wrap`,
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.0,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: row,
              start: 'top 78%',
            },
          }
        )

        // CTA pill
        gsap.from(`${row} .blog-pill`, {
          y: 12,
          opacity: 0,
          duration: 0.5,
          delay: 0.28,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 78%',
          },
        })
      })
    },
    [motionOk]
  )

  return (
    <section
      ref={sectionRef}
      id="blog"
      className="bg-[var(--color-paper)] w-full"
      aria-label="Latest from our blog"
    >
      {blog.posts.map((post, i) => (
        <article
          key={post.title}
          className={`blog-row-${i} border-t border-[rgba(17,17,17,0.1)] w-full px-6 md:px-12 lg:px-20 py-12 md:py-16 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-start`}
        >
          {/* LEFT — text content */}
          <div className="flex flex-col gap-5 max-w-xl">
            {/* Date */}
            <time
              dateTime={post.date}
              className="blog-meta text-xs font-medium tracking-[0.14em] uppercase text-[var(--color-muted)]"
            >
              {formatDate(post.date)}
            </time>

            {/* Title — each word wrapped in overflow-hidden clip for GSAP stagger */}
            <h2 className="font-[var(--font-display)] text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.08] tracking-[-0.025em] text-[var(--color-ink)]">
              {post.title.split(/\s+/).map((word, wi) => (
                <span
                  key={`${word}-${wi}`}
                  className="word-clip"
                  style={{ marginRight: wi < post.title.split(/\s+/).length - 1 ? '0.22em' : 0 }}
                >
                  <span className="blog-title-word word-inner">{word}</span>
                </span>
              ))}
            </h2>

            {/* Excerpt */}
            <p className="blog-meta text-[var(--color-muted)] leading-relaxed text-sm md:text-base font-light">
              {post.excerpt}
            </p>

            {/* CTA */}
            <div className="blog-pill mt-1">
              <Pill variant="dark" href="#" withArrow>
                Read More
              </Pill>
            </div>
          </div>

          {/* RIGHT — image with clip-reveal */}
          <div
            className="blog-image-wrap w-full md:w-[360px] lg:w-[420px] aspect-[3/2] relative overflow-hidden flex-shrink-0"
            style={{ willChange: 'clip-path' }}
          >
            <Image
              src={post.img}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover"
            />
          </div>
        </article>
      ))}

      {/* Bottom hairline cap */}
      <div className="border-t border-[rgba(17,17,17,0.1)] w-full" aria-hidden="true" />
    </section>
  )
}
