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

      // Refresh ScrollTrigger once fonts are loaded
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh()
      })

      // Handle resize
      const handleResize = () => {
        ScrollTrigger.refresh()
      }
      window.addEventListener('resize', handleResize, { passive: true })

      return () => {
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
