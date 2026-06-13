'use client'

import { ctaFooter } from '@/data/content'
import Logo from '@/components/layout/Logo'
import Pill from '@/components/ui/Pill'
import { useState } from 'react'

export default function CtaFooter() {
  const [email, setEmail] = useState('')

  return (
    <footer
      id="cta-footer"
      className="bg-[var(--color-dark)] text-[var(--color-paper)]"
      aria-label="Footer"
    >
      {/* CTA Band */}
      <div className="border-b border-[rgba(255,255,255,0.08)] px-6 py-20 md:py-28 text-center">
        <h2
          className="font-[var(--font-display)] font-bold text-[var(--color-paper)] mb-8"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.05 }}
        >
          {ctaFooter.ctaBand.heading}
        </h2>
        <Pill variant="light" href="/search" withArrow
          className="border-[var(--color-paper)] text-[var(--color-paper)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]">
          Find Properties
        </Pill>
      </div>

      {/* Footer body */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand + newsletter */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Logo variant="footer" />

          <div>
            <label
              htmlFor="footer-email"
              className="block text-xs uppercase tracking-widest text-[rgba(255,255,255,0.55)] mb-3"
            >
              {ctaFooter.newsletter.label}
            </label>
            <div className="flex gap-2">
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ctaFooter.newsletter.emailPlaceholder}
                aria-label="Email address for newsletter"
                className="flex-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-full px-5 py-3 text-sm text-[var(--color-paper)] placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.3)] focus:ring-offset-2 focus:ring-offset-[var(--color-dark)]"
              />
              <Pill
                variant="light"
                type="submit"
                className="border-[var(--color-paper)] text-[var(--color-paper)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] shrink-0"
              >
                Subscribe
              </Pill>
            </div>
          </div>

          <address className="not-italic text-sm text-[rgba(255,255,255,0.55)] leading-relaxed flex flex-col gap-1">
            <span>{ctaFooter.contact.headOffice}</span>
            <a
              href={`mailto:${ctaFooter.contact.email}`}
              className="hover:text-[var(--color-paper)] transition-colors"
            >
              {ctaFooter.contact.email}
            </a>
            <a
              href={`tel:${ctaFooter.contact.phone.replace(/\s/g, '')}`}
              className="hover:text-[var(--color-paper)] transition-colors"
            >
              {ctaFooter.contact.phone}
            </a>
          </address>
        </div>

        {/* Nav columns */}
        <div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col gap-3">
              {ctaFooter.navCols.map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-[rgba(255,255,255,0.55)] hover:text-[var(--color-paper)] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Social */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[rgba(255,255,255,0.35)] mb-4">
            Follow
          </p>
          <ul className="flex flex-col gap-3">
            {ctaFooter.social.map((platform) => (
              <li key={platform}>
                <a
                  href={`https://${platform.toLowerCase()}.com/findrealestate`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[rgba(255,255,255,0.55)] hover:text-[var(--color-paper)] transition-colors"
                  aria-label={`FIND Real Estate on ${platform}`}
                >
                  {platform}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[rgba(255,255,255,0.06)] px-6 py-6">
        <p className="text-xs text-[rgba(255,255,255,0.3)] text-center">
          &copy; {new Date().getFullYear()} FIND Real Estate. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
