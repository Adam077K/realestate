'use client'

import { useEffect, useRef, useState } from 'react'
import { useContent } from '@/components/providers/LanguageProvider'

/**
 * FloatingWebinarCta - Fixed bottom-right CTA that fades in after the user
 * scrolls past the hero section (scrollY > window.innerHeight * 0.9).
 *
 * - rAF-throttled scroll listener (single active rAF per frame)
 * - CSS opacity/transform transition (respects prefers-reduced-motion)
 * - RTL-safe: right: 20px is the same in both directions; no text-align issues
 * - Accessible: aria-label, min 44px tap target, visible focus ring
 * - z-index: 60 (above content, below any modal)
 */
export default function FloatingWebinarCta() {
  const [visible, setVisible] = useState(false)
  const rafRef = useRef<number | null>(null)
  const c = useContent()

  useEffect(() => {
    function handleScroll() {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const threshold = window.innerHeight * 0.9
        setVisible(window.scrollY > threshold)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Initial check (page may already be scrolled on mount)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return (
    <a
      href="#register"
      aria-label={c.floatingCta.ariaLabel}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 60,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        paddingInline: '18px',
        minHeight: '44px',
        borderRadius: '9999px',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        fontSize: '0.875rem',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        letterSpacing: '0.01em',
        textDecoration: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.18)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        pointerEvents: visible ? 'auto' : 'none',
        // Respect reduced-motion
        // The @media query is handled by the class below; keep inline transition as base
      }}
      className="floating-webinar-cta focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white motion-reduce:transition-none"
    >
      {/* Calendar icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="5" cy="10.5" r="1" fill="currentColor" />
        <circle cx="8" cy="10.5" r="1" fill="currentColor" />
        <circle cx="11" cy="10.5" r="1" fill="currentColor" />
      </svg>
      {c.floatingCta.label}
    </a>
  )
}
