'use client'

/**
 * Preloader — Branded loading screen for בונים עתיד (Bonim Atid).
 *
 * Behaviour:
 *   1. Renders as a full-screen fixed overlay (z-[100]) on top of everything.
 *   2. On mount: kicks off image pre-warming for all below-fold assets so the
 *      first scroll is smooth (browser caches triggered before the user sees them).
 *   3. Fades out (opacity→0 over 450ms) when BOTH:
 *        a. document.fonts.ready has resolved, AND
 *        b. the hero building image has loaded — OR a hard cap of 1800ms.
 *      Enforces a 600ms minimum visible time so it never flashes.
 *   4. After fade: pointer-events:none + display:none so it never blocks the page.
 *
 * A11y: role="status" aria-label="טוען…"; aria-hidden once faded.
 * Motion: logo pulse skipped when prefers-reduced-motion.
 * SSR: all window/document access is inside effects; renders fine on server.
 */

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { images } from '@/data/content'

// All below-fold images to pre-warm in the browser cache.
function collectPreloadSrcs(): string[] {
  const srcs: string[] = [
    images.heroBuildingFill,
    images.cityStreet,
    images.aerialForest,
    images.agentPortrait,
    images.testimonialCouple,
    images.serviceMortgage,
    images.serviceProperty,
    images.serviceConstruction,
    images.ctaFamily,
    images.idanPeleg,
    images.roeyFishman,
    ...images.chevron,
    ...images.blog,
    ...images.buyerCards,
  ]
  return srcs
}

const FADE_DURATION_MS = 450
const MIN_VISIBLE_MS = 600
const MAX_VISIBLE_MS = 1800

export default function Preloader() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)
  const ariaHiddenRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const mountTimeRef = useRef<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    mountTimeRef.current = performance.now()

    // ── Pre-warm image cache (fire-and-forget) ──────────────────────────────
    const srcs = collectPreloadSrcs()
    for (const src of srcs) {
      const im = new window.Image()
      im.src = src
    }

    // ── Determine when to start the fade ────────────────────────────────────
    let dismissed = false

    function startFade() {
      if (dismissed) return
      dismissed = true

      const elapsed = performance.now() - mountTimeRef.current
      const delay = Math.max(0, MIN_VISIBLE_MS - elapsed)

      setTimeout(() => {
        setFading(true)
        // After fade completes, fully remove from interaction layer
        setTimeout(() => {
          setVisible(false)
        }, FADE_DURATION_MS)
      }, delay)
    }

    // Hard cap: dismiss after MAX_VISIBLE_MS regardless
    const hardCapTimer = setTimeout(startFade, MAX_VISIBLE_MS)

    // Optimal path: wait for fonts + hero building image
    const heroImg = new window.Image()
    heroImg.src = images.heroBuildingCutout

    function checkReady() {
      Promise.all([
        document.fonts.ready,
        heroImg.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              heroImg.onload = () => resolve()
              heroImg.onerror = () => resolve() // don't block on error
            }),
      ]).then(() => {
        clearTimeout(hardCapTimer)
        startFade()
      })
    }

    checkReady()

    return () => {
      clearTimeout(hardCapTimer)
      dismissed = true
    }
  }, [])

  // Once fully hidden, mark aria-hidden
  if (!visible && !ariaHiddenRef.current) {
    ariaHiddenRef.current = true
  }

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      role="status"
      aria-label="טוען…"
      aria-hidden={ariaHiddenRef.current}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        background: 'linear-gradient(to bottom, #d4dded 0%, #e6eef5 55%, #f0f4f8 100%)',
        opacity: fading ? 0 : 1,
        transition: fading ? `opacity ${FADE_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
        pointerEvents: fading ? 'none' : 'auto',
        // Backface visibility prevents any sub-pixel flicker during transition
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 'clamp(120px, 22vw, 200px)',
          height: 'auto',
          position: 'relative',
          // Subtle scale pulse — skipped for prefers-reduced-motion via CSS class
        }}
        className="preloader-logo"
      >
        <Image
          src="/images/bonim-logo.webp"
          alt="בונים עתיד"
          width={400}
          height={200}
          priority
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {/* Indeterminate progress bar */}
      <div
        aria-hidden="true"
        style={{
          width: 'clamp(80px, 14vw, 140px)',
          height: '2px',
          borderRadius: '1px',
          background: 'rgba(0,0,0,0.10)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="preloader-progress-track"
          style={{
            position: 'absolute',
            inset: 0,
          }}
        />
      </div>

      {/* Keyframe animations and reduced-motion overrides */}
      <style>{`
        @keyframes preloader-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.025); opacity: 0.88; }
        }
        @keyframes preloader-bar {
          0% { transform: translateX(-100%); width: 55%; }
          50% { transform: translateX(82%); width: 55%; }
          100% { transform: translateX(200%); width: 55%; }
        }
        .preloader-logo {
          animation: preloader-pulse 1.8s ease-in-out infinite;
        }
        .preloader-progress-track::after {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 55%;
          background: rgba(0,0,0,0.38);
          border-radius: 1px;
          animation: preloader-bar 1.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .preloader-logo {
            animation: none;
          }
          .preloader-progress-track::after {
            animation: none;
            transform: none;
            width: 100%;
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  )
}
