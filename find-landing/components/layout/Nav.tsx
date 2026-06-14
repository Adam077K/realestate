'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Logo from '@/components/layout/Logo'
import Pill from '@/components/ui/Pill'
import { cn } from '@/lib/utils'
import { useLang, useContent } from '@/components/providers/LanguageProvider'

const SCROLL_THRESHOLD = 80

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { lang, setLang, dir } = useLang()
  const c = useContent()

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > SCROLL_THRESHOLD)
  }, [])

  useEffect(() => {
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

  const otherLang = lang === 'he' ? 'en' : 'he'
  const toggleLabel = lang === 'he' ? 'EN' : 'עב'
  const switchAria =
    lang === 'he' ? 'Switch to English' : 'החלפה לעברית'

  return (
    <header
      dir={dir}
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'transition-all duration-300',
        scrolled
          ? 'bg-[rgba(255,255,255,0.92)] backdrop-blur-md border-b border-[rgba(17,17,17,0.08)] shadow-[0_1px_20px_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
      )}
    >
      <nav
        className="mx-auto flex h-[84px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-16"
        aria-label={lang === 'he' ? 'ניווט ראשי' : 'Main navigation'}
      >
        {/* Leading edge: Logo (right in RTL) */}
        <Link
          href="#hero"
          aria-label="בונים עתיד"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2"
        >
          <Logo variant="nav" />
        </Link>

        {/* Center: links */}
        <ul className="hidden lg:flex items-center gap-1" role="list">
          {c.nav.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'inline-flex items-center px-4 py-2 rounded-md',
                  'text-[15px] font-medium text-[var(--color-ink)]',
                  'transition-colors duration-150',
                  'hover:text-[var(--color-dark)] hover:bg-[rgba(17,17,17,0.05)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2'
                )}
                style={{ textShadow: '0 1px 6px rgba(255,255,255,0.5)' }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Trailing edge: language toggle + CTA (left in RTL) */}
        <div className="flex items-center gap-3 md:gap-5">
          <button
            type="button"
            onClick={() => setLang(otherLang)}
            aria-label={switchAria}
            className={cn(
              'inline-flex items-center justify-center min-w-[44px] min-h-[40px] px-3 rounded-full',
              'text-sm font-semibold tracking-wide',
              'border border-[rgba(17,17,17,0.18)] text-[var(--color-ink)]',
              'transition-colors duration-150',
              'hover:bg-[rgba(17,17,17,0.06)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2'
            )}
          >
            {toggleLabel}
          </button>

          <Pill
            variant="dark"
            href="#register"
            className="hidden sm:inline-flex px-7 py-3.5 text-[15px]"
          >
            {c.nav.cta}
          </Pill>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={
              mobileOpen
                ? lang === 'he'
                  ? 'סגירת תפריט'
                  : 'Close menu'
                : lang === 'he'
                  ? 'פתיחת תפריט'
                  : 'Open menu'
            }
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
        aria-label={lang === 'he' ? 'ניווט במובייל' : 'Mobile navigation'}
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 ease-out',
          'bg-[rgba(255,255,255,0.96)] backdrop-blur-md',
          mobileOpen ? 'max-h-[440px] border-b border-[rgba(17,17,17,0.08)]' : 'max-h-0'
        )}
      >
        <ul className="flex flex-col px-6 pt-2 pb-6 gap-1" role="list">
          {c.nav.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center justify-between py-3 text-base font-medium text-[var(--color-ink)] border-b border-[rgba(17,17,17,0.06)] last:border-0 hover:text-[var(--color-muted)] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-4">
            <Pill
              variant="dark"
              href="#register"
              className="w-full justify-center"
            >
              {c.nav.cta}
            </Pill>
          </li>
        </ul>
      </div>
    </header>
  )
}
