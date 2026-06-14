import { useRef, useEffect, type RefObject, type DependencyList } from 'react'
import { gsap } from '@/lib/gsap'

/**
 * Wraps gsap.context() with automatic cleanup.
 *
 * Usage:
 *   const containerRef = useRef<HTMLDivElement>(null)
 *   useGsapContext(containerRef, (ctx) => {
 *     gsap.to('.my-element', { opacity: 1 })
 *   }, [])
 *
 * - All GSAP animations inside the callback are scoped to containerRef.
 * - Cleanup is automatic on unmount or when deps change.
 */
export function useGsapContext(
  containerRef: RefObject<HTMLElement | null>,
  callback: (ctx: gsap.Context) => void | (() => void),
  deps: DependencyList = []
) {
  const ctxRef = useRef<gsap.Context | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // gsap.context passes the created Context instance to the callback as its
    // first argument - use that, not the outer `ctx` (which is in the TDZ here).
    const ctx = gsap.context((self: gsap.Context) => {
      return callback(self)
    }, container)

    ctxRef.current = ctx

    return () => {
      ctx.revert()
      ctxRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ctxRef
}
