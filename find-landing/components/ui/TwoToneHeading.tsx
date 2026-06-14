'use client'

import { cn } from '@/lib/utils'
import { Fragment, type ReactNode } from 'react'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4'

export interface TwoToneHeadingProps {
  /**
   * First portion of the heading — rendered in full ink color.
   * Can be a string (auto-split into word spans for GSAP staggering)
   * or arbitrary ReactNode for custom markup.
   */
  lead: string
  /**
   * Second portion — rendered in muted grey.
   * Can be a string or ReactNode.
   */
  tail: string
  /** HTML heading element to render */
  as?: HeadingTag
  /** Additional classes on the wrapper element */
  className?: string
  /** Override lead color (Tailwind class e.g. "text-white") */
  leadClassName?: string
  /** Override tail color (Tailwind class e.g. "text-white/50") */
  tailClassName?: string
  /** Render lead and tail on separate lines */
  stacked?: boolean
  /**
   * Per-instance size override — replaces the built-in `text-[clamp(...)]`
   * for this instance only. When absent, the default sizeByTag value is used.
   * Example: `sizeClassName="text-[clamp(4rem,9vw,8rem)] leading-[1.0] tracking-[-0.03em]"`
   */
  sizeClassName?: string
}

/**
 * Renders each word in a string as:
 *   <span class="word-clip">
 *     <span class="word-inner tt-word">{word}</span>
 *   </span>
 *
 * The outer .word-clip has overflow:hidden so GSAP can slide words in from below.
 * Target `.tt-word` elements in a ScrollTrigger stagger for reveal animations.
 */
function WordSpans({
  text,
  className,
}: {
  text: string
  className?: string
}): ReactNode {
  const words = text.trim().split(/\s+/)
  return (
    <>
      {words.map((word, i) => (
        // The inter-word space is emitted as a real sibling BETWEEN .word-clip
        // elements (never inside them) - whitespace at an inline-block boundary
        // collapses, so a Fragment with a separate text node preserves the gap.
        <Fragment key={`${word}-${i}`}>
          <span className="word-clip">
            <span className={cn('word-inner tt-word', className)}>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}

const sizeByTag: Record<HeadingTag, string> = {
  h1: 'text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-[-0.03em]',
  h2: 'text-[clamp(2rem,4.5vw,4rem)] leading-[1.08] tracking-[-0.025em]',
  h3: 'text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.1] tracking-[-0.02em]',
  h4: 'text-[clamp(1.25rem,2.5vw,2rem)] leading-[1.15] tracking-[-0.015em]',
}

export default function TwoToneHeading({
  lead,
  tail,
  as: Tag = 'h2',
  className,
  leadClassName,
  tailClassName,
  stacked = false,
  sizeClassName,
}: TwoToneHeadingProps) {
  return (
    <Tag
      className={cn(
        'font-[var(--font-display)]',
        sizeClassName ?? sizeByTag[Tag],
        className
      )}
    >
      <span className={cn('text-[var(--color-ink)]', leadClassName)}>
        <WordSpans text={lead} />
      </span>
      {stacked ? <br /> : <span>&nbsp;</span>}
      <span className={cn('text-[var(--color-muted)]', tailClassName)}>
        <WordSpans text={tail} />
      </span>
    </Tag>
  )
}
