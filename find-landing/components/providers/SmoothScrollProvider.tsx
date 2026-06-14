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
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  motionOk: true,
})

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}

interface SmoothScrollProviderProps {
  children: ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null)
  const [motionOk, setMotionOk] = useState(true)

  useEffect(() => {
    // Detect reduced-motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const prefersReduced = mq.matches
    setMotionOk(!prefersReduced)

    // If user prefers reduced motion, skip Lenis entirely - use native scroll
    if (prefersReduced) return

    const initLenis = async () => {
      const LenisModule = await import('lenis')
      const LenisClass = LenisModule.default

      const lenis = new LenisClass({
        autoRaf: false,
        duration: 1.5,
        lerp: 0.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.7,
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

      // Listen for future motion preference changes
      const handleMotionChange = (e: MediaQueryListEvent) => {
        setMotionOk(!e.matches)
      }
      mq.addEventListener('change', handleMotionChange)

      return () => {
        gsap.ticker.remove(ticker)
        ScrollTrigger.getAll().forEach((t) => t.kill())
        lenis.destroy()
        lenisRef.current = null
        window.removeEventListener('resize', handleResize)
        mq.removeEventListener('change', handleMotionChange)
      }
    }

    let cleanup: (() => void) | undefined
    initLenis().then((fn) => {
      cleanup = fn
    })

    return () => {
      cleanup?.()
    }
  }, [])

  return (
    <SmoothScrollContext.Provider
      value={{ lenis: lenisRef.current, motionOk }}
    >
      {children}
    </SmoothScrollContext.Provider>
  )
}
