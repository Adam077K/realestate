'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { FindGlyph } from '@/components/layout/Logo'
import Pill from '@/components/ui/Pill'
import { ctaFooter, images } from '@/data/content'

export default function CtaFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const motionOk = !useReducedMotion()
  const [email, setEmail] = useState('')

  useGsapContext(
    footerRef,
    () => {
      if (!motionOk) return

      // Footer wordmark: clip-path wipe left → right
      gsap.fromTo(
        '.footer-wordmark',
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.4,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: '.footer-wordmark',
            start: 'top 88%',
          },
        }
      )

      // Newsletter row fade up
      gsap.from('.footer-newsletter', {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.footer-newsletter',
          start: 'top 88%',
        },
      })

      // Contact blocks stagger
      gsap.from('.footer-contact-block', {
        y: 16,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.footer-contact',
          start: 'top 88%',
        },
      })
    },
    [motionOk]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Newsletter submit — placeholder; wires to email service
    setEmail('')
  }

  return (
    <footer
      ref={footerRef}
      id="cta-footer"
      className="w-full"
      aria-label="Footer"
    >
      {/* ── CTA Band — full-width family image with scrim + pill ── */}
      <div className="relative w-full aspect-[16/7] min-h-[320px] overflow-hidden">
        <Image
          src={images.ctaFamily}
          alt="A family finding their new home"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark scrim */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          aria-hidden="true"
        />
        {/* Centered CTA */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
          <Pill
            variant="ghost"
            href="/search"
            withArrow
            className="border border-white text-white hover:bg-white hover:text-[var(--color-ink)] text-base px-8 py-4"
            aria-label={ctaFooter.ctaBand.heading}
          >
            {ctaFooter.ctaBand.heading}
          </Pill>
        </div>
      </div>

      {/* ── Footer body — dark ── */}
      <div className="bg-[var(--color-dark)] text-[var(--color-paper)]">
        {/* Top grid: newsletter + contact + nav + social */}
        <div className="w-full px-6 md:px-12 lg:px-20 pt-14 md:pt-20 pb-12 md:pb-16 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] lg:grid-cols-[1fr_1fr_auto_auto] gap-10 md:gap-12 lg:gap-16">

          {/* Newsletter column */}
          <div className="footer-newsletter flex flex-col gap-6 max-w-sm">
            <p className="text-sm font-medium text-white">
              {ctaFooter.newsletter.label}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-0">
              <label htmlFor="footer-email" className="sr-only">
                Email address for newsletter
              </label>
              <div className="relative flex items-center">
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ctaFooter.newsletter.emailPlaceholder}
                  aria-label="Email address for newsletter"
                  className={[
                    'w-full bg-transparent border-b border-[rgba(255,255,255,0.3)] pb-2 pr-10',
                    'text-sm text-white placeholder:text-[rgba(255,255,255,0.35)]',
                    'outline-none focus:border-white transition-[border-color] duration-200',
                  ].join(' ')}
                />
                <button
                  type="submit"
                  aria-label="Submit newsletter subscription"
                  className="absolute right-0 bottom-2 text-[rgba(255,255,255,0.5)] hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  →
                </button>
              </div>
            </form>

            {/* Contact blocks */}
            <div className="footer-contact flex flex-col gap-5 pt-4">
              <div className="footer-contact-block flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.38)] font-medium">
                  Head Office
                </span>
                <address className="not-italic text-sm text-[rgba(255,255,255,0.55)] leading-snug">
                  {ctaFooter.contact.headOffice}
                </address>
              </div>
              <div className="footer-contact-block flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.38)] font-medium">
                  Email Us
                </span>
                <a
                  href={`mailto:${ctaFooter.contact.email}`}
                  className="text-sm text-[rgba(255,255,255,0.55)] hover:text-white transition-colors duration-150"
                >
                  {ctaFooter.contact.email}
                </a>
              </div>
              <div className="footer-contact-block flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.38)] font-medium">
                  Call Us
                </span>
                <a
                  href={`tel:${ctaFooter.contact.phone.replace(/\s/g, '')}`}
                  className="text-sm text-[rgba(255,255,255,0.55)] hover:text-white transition-colors duration-150"
                >
                  {ctaFooter.contact.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Spacer — pushes nav + social right on lg */}
          <div className="hidden lg:block" aria-hidden="true" />

          {/* Nav column */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col gap-3">
              {ctaFooter.navCols.map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-lg md:text-xl font-[var(--font-display)] font-light text-white hover:text-[rgba(255,255,255,0.55)] transition-colors duration-150"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social column */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.38)] font-medium mb-3">
              Follow
            </p>
            <ul className="flex flex-col gap-3">
              {ctaFooter.social.map((platform) => (
                <li key={platform}>
                  <a
                    href={`https://${platform.toLowerCase()}.com/findrealestate`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[rgba(255,255,255,0.55)] hover:text-white transition-colors duration-150"
                    aria-label={`FIND Real Estate on ${platform}`}
                  >
                    {platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Giant FIND wordmark — full viewport width, wipes left→right ── */}
        <div
          className="footer-wordmark w-full overflow-hidden px-0"
          style={{ willChange: 'clip-path' }}
          aria-label="FIND"
          role="img"
        >
          <FindGlyph className="w-full h-auto text-white block" />
        </div>

        {/* Legal bar */}
        <div className="px-6 md:px-12 lg:px-20 py-5 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-xs text-[rgba(255,255,255,0.28)]">
            &copy; {new Date().getFullYear()} FIND Real Estate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
