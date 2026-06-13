'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Logo from '@/components/layout/Logo'
import Pill from '@/components/ui/Pill'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Search', href: '/search', dropdown: false },
  { label: 'Agents', href: '/agents', dropdown: false },
  { label: 'Join', href: '/join', dropdown: true },
  { label: 'Paperwork', href: '/paperwork', dropdown: true },
  { label: 'Resources', href: '/resources', dropdown: true },
  { label: 'About', href: '/about', dropdown: true },
] as const

const SCROLL_THRESHOLD = 80

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > SCROLL_THRESHOLD)
  }, [])

  useEffect(() => {
    // Set initial state
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Close mobile menu on ESC
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'transition-all duration-300',
        scrolled
          ? 'bg-[rgba(255,255,255,0.92)] backdrop-blur-md border-b border-[rgba(17,17,17,0.08)] shadow-[0_1px_20px_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
      )}
    >
      <nav
        className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-16"
        aria-label="Main navigation"
      >
        {/* Left: Logo */}
        <Link href="/" aria-label="FIND Real Estate — home">
          <Logo variant="nav" />
        </Link>

        {/* Center: Desktop links */}
        <ul
          className="hidden lg:flex items-center gap-1"
          role="list"
        >
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={cn(
                  'group inline-flex items-center gap-1 px-3 py-2 rounded-md',
                  'text-sm font-medium text-[var(--color-ink)]',
                  'transition-colors duration-150',
                  'hover:text-[var(--color-dark)] hover:bg-[rgba(17,17,17,0.05)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2'
                )}
              >
                {link.label}
                {link.dropdown && (
                  <svg
                    aria-hidden="true"
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="currentColor"
                    className="opacity-40 transition-transform duration-150 group-hover:rotate-180"
                  >
                    <path d="M1 3 L5 7 L9 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: Sign In + mobile toggle */}
        <div className="flex items-center gap-3">
          <Pill
            variant="dark"
            href="/sign-in"
            className="hidden sm:inline-flex"
          >
            Sign In
          </Pill>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className={cn(
              'lg:hidden flex flex-col justify-center items-center w-11 h-11 gap-[5px] rounded-md',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2'
            )}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span
              className={cn(
                'block h-0.5 w-5 bg-[var(--color-ink)] rounded-full transition-all duration-200',
                mobileOpen && 'translate-y-[7px] rotate-45'
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-5 bg-[var(--color-ink)] rounded-full transition-all duration-200',
                mobileOpen && 'opacity-0'
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-5 bg-[var(--color-ink)] rounded-full transition-all duration-200',
                mobileOpen && '-translate-y-[7px] -rotate-45'
              )}
            />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 ease-out',
          'bg-[rgba(255,255,255,0.96)] backdrop-blur-md',
          mobileOpen ? 'max-h-[400px] border-b border-[rgba(17,17,17,0.08)]' : 'max-h-0'
        )}
      >
        <ul className="flex flex-col px-6 pt-2 pb-6 gap-1" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="flex items-center justify-between py-3 text-base font-medium text-[var(--color-ink)] border-b border-[rgba(17,17,17,0.06)] last:border-0 hover:text-[var(--color-muted)] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
                {link.dropdown && (
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path d="M4 6 L8 10 L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </Link>
            </li>
          ))}
          <li className="pt-4">
            <Pill variant="dark" href="/sign-in" className="w-full justify-center">
              Sign In
            </Pill>
          </li>
        </ul>
      </div>
    </header>
  )
}
