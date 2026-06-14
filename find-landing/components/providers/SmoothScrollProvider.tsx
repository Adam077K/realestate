'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface SmoothScrollContextValue {
  lenis: Lenis | null
  motionOk: boolean
  reducedMotion: boolean
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  motionOk: true,
  reducedMotion: false,
})

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}

interface SmoothScrollProviderProps {
  children: ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null)
  // motionOk is ALWAYS true — scroll choreography always runs.
  // reducedMotion reflects the live OS preference — used ONLY to gate
  // infinite loops / autoplay (marquees, intervals, ambient drifts).
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    // Track OS reduce-motion preference for gating autoplay/loop animations only.
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    mq.addEventListener('change', handleMotionChange)

    // Always initialize Lenis — smooth scroll is not gated on reduce-motion.
    const initLenis = async () => {
      const LenisModule = await import('lenis')
      const LenisClass = LenisModule.default

      const lenis = new LenisClass({
        autoRaf: false,
        duration: 1.1,
        lerp: 0.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.82,
        touchMultiplier: 2,
      })

      lenisRef.current = lenis

      // Keep GSAP ScrollTrigger in sync with Lenis scroll position
      lenis.on('scroll', ScrollTrigger.update)

      // Drive Lenis via GSAP ticker for frame-perfect sync
      const ticker = (time: number) => {
        lenis.raf(time * 1000)
      }
      gsap.ticker.add(ticker)
      gsap.ticker.lagSmoothing(0)

      // ── Robust multi-point ScrollTrigger refresh ────────────────────────────
      // The Hero pin creates a giant pin-spacer (end:'+=1000%', ~10×vh).
      // The spacer is inserted AFTER the first ScrollTrigger.refresh() runs,
      // so any section triggers below the fold compute wrong start positions
      // and fire immediately at load (they think they're already in view).
      //
      // Fix: refresh at FOUR points so the spacer is always accounted for:
      //   1. fonts.ready   — glyphs are laid out, headings have their real height
      //   2. window 'load' — all images (including the hero building PNG) are decoded
      //   3. double-rAF    — one frame after all synchronous layout work settles
      //   4. setTimeout 600ms — catches slow network / late hydration cases
      //
      // refreshPriority:1 on the hero pin ensures it refreshes before sibling
      // section triggers, so the spacer offset is baked in when they recalculate.
      const doRefresh = () => ScrollTrigger.refresh()

      // 1. fonts.ready
      document.fonts.ready.then(doRefresh)

      // 2. window 'load' (images decoded)
      const onLoad = () => doRefresh()
      window.addEventListener('load', onLoad, { once: true })

      // 3. double rAF after this tick (layout fully settled)
      requestAnimationFrame(() => requestAnimationFrame(doRefresh))

      // 4. Late safety net — catches slow images / hydration lag
      const safetyTimer = setTimeout(doRefresh, 600)

      // Handle resize
      const handleResize = () => {
        ScrollTrigger.refresh()
      }
      window.addEventListener('resize', handleResize, { passive: true })

      return () => {
        clearTimeout(safetyTimer)
        window.removeEventListener('load', onLoad)
        gsap.ticker.remove(ticker)
        ScrollTrigger.getAll().forEach((t) => t.kill())
        lenis.destroy()
        lenisRef.current = null
        window.removeEventListener('resize', handleResize)
      }
    }

    let cleanup: (() => void) | undefined
    initLenis().then((fn) => {
      cleanup = fn
    })

    return () => {
      cleanup?.()
      mq.removeEventListener('change', handleMotionChange)
    }
  }, [])

  return (
    <SmoothScrollContext.Provider
      value={{ lenis: lenisRef.current, motionOk: true, reducedMotion }}
    >
      {children}
    </SmoothScrollContext.Provider>
  )
}
