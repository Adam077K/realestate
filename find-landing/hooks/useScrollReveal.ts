'use client'

import { useEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from '@/lib/gsap'

export interface RevealSpec {
  /** Element, or a selector resolved within the scope, to OBSERVE for entering the viewport. */
  trigger: string | Element | null
  /** Viewport fraction (from the bottom) the trigger must cross before playing.
   *  0.2 ≈ ScrollTrigger 'top 80%'. Default 0.15. */
  revealAt?: number
  /** Build + return a PAUSED gsap tween/timeline. Pass `paused:true` in vars so the
   *  hidden 'from' state is applied at build time (target armed/hidden at load). */
  build: () => gsap.core.Tween | gsap.core.Timeline
}

/**
 * IntersectionObserver-driven scroll reveal. Immune to the Hero pin-spacer position
 * math that makes ScrollTrigger one-shot reveals mis-fire at page load. Each spec's
 * tween is built PAUSED (hidden 'from' applied immediately = armed) then played ONCE
 * when its trigger first crosses into view.
 */
export function useScrollReveal(
  scopeRef: RefObject<HTMLElement | null>,
  specs: RevealSpec[],
  deps: DependencyList = []
) {
  useEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    const observers: IntersectionObserver[] = []

    const ctx = gsap.context(() => {
      for (const spec of specs) {
        const resolved =
          typeof spec.trigger === 'string' ? scope.querySelector(spec.trigger) : spec.trigger
        // `trigger: ref.current` is captured at render time when the ref may still be
        // null; fall back to the observed scope element so the spec still arms + reveals
        // (the section IS the intended trigger in that case).
        const el = resolved ?? scope

        const tween = spec.build()
        tween.pause()

        const margin = Math.round((spec.revealAt ?? 0.15) * 100)
        const io = new IntersectionObserver(
          (entries, obs) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                tween.play()
                obs.disconnect()
              }
            }
          },
          { rootMargin: `0px 0px -${margin}% 0px`, threshold: 0 }
        )
        io.observe(el)
        observers.push(io)
      }
    }, scope)

    return () => {
      observers.forEach((io) => io.disconnect())
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
