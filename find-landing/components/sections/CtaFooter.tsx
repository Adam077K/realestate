'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useContent } from '@/components/providers/LanguageProvider'
import { BrandWordmarkMask } from '@/components/layout/Logo'
import Pill from '@/components/ui/Pill'
import { images } from '@/data/content'

/**
 * Registration band + Footer.
 *
 * TOP  (id="register"): cinematic background-image band with a dark scrim,
 *   a heading/sub, a real 3-field controlled form (name / phone / email) that
 *   preventDefaults and shows a "thanks" state, and a prominent CTA pill.
 * BOTTOM: newsletter signup, nav columns, rights line, and the giant
 *   "בונים עתיד" wordmark filled with the hero building image.
 */
export default function CtaFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const motionOk = !useReducedMotion()
  const c = useContent()
  const isHebrew = c.register.fields.name === 'שם מלא'

  // Registration form — controlled, no backend; shows a success state on submit.
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  // Newsletter — separate controlled field.
  const [newsletterEmail, setNewsletterEmail] = useState('')

  useGsapContext(
    footerRef,
    () => {
      if (!motionOk) return

      gsap.from('.reg-inner', {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.reg-band', start: 'top 78%' },
      })

      gsap.fromTo(
        '.footer-wordmark',
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.4,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: '.footer-wordmark', start: 'top 90%' },
        }
      )

      gsap.from('.footer-col', {
        y: 18,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.footer-grid', start: 'top 88%' },
      })
    },
    [motionOk]
  )

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterEmail('')
  }

  const thanksMsg = isHebrew ? 'תודה! שמרנו לכם מקום — נשלח את הלינק למייל.' : "Thanks! Your spot is saved — we'll email the link."
  const headOfficeCaption = isHebrew ? 'המנחים' : 'Hosts'

  return (
    <footer ref={footerRef} className="w-full" aria-label="Footer">
      {/* ── Registration band — cinematic image + scrim + form ── */}
      <section
        id="register"
        className="reg-band relative w-full overflow-hidden"
        aria-labelledby="register-heading"
      >
        <Image
          src={images.ctaFamily}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
        {/* Dark scrim for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.8) 100%)',
          }}
          aria-hidden="true"
        />

        <div className="reg-inner relative z-10 w-full px-6 md:px-12 lg:px-20 py-20 md:py-28 flex flex-col items-center text-center">
          <h2
            id="register-heading"
            className="font-[var(--font-display)] font-semibold text-white text-[clamp(1.9rem,4.5vw,3.5rem)] leading-[1.08] tracking-[-0.02em] max-w-3xl"
          >
            {c.register.heading}
          </h2>
          <p className="mt-4 text-[rgba(255,255,255,0.78)] text-base md:text-lg font-light max-w-xl">
            {c.register.sub}
          </p>

          {submitted ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-10 w-full max-w-xl rounded-2xl border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.08)] px-6 py-8 backdrop-blur-sm"
            >
              <p className="text-lg md:text-xl font-medium text-white">{thanksMsg}</p>
            </div>
          ) : (
            <form
              onSubmit={handleRegister}
              className="mt-10 w-full max-w-xl flex flex-col gap-4"
              noValidate
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['name', 'phone', 'email'] as const).map((field) => (
                  <div key={field} className="flex flex-col gap-1.5 text-start">
                    <label htmlFor={`reg-${field}`} className="sr-only">
                      {c.register.fields[field]}
                    </label>
                    <input
                      id={`reg-${field}`}
                      name={field}
                      type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                      autoComplete={
                        field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'name'
                      }
                      required
                      value={form[field]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                      placeholder={c.register.fields[field]}
                      className="min-h-[48px] w-full rounded-full border border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.06)] px-5 text-sm text-white placeholder:text-[rgba(255,255,255,0.55)] outline-none transition-colors duration-200 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/60"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-1">
                <Pill
                  variant="ghost"
                  type="submit"
                  withArrow
                  className="border border-white bg-white text-[var(--color-ink)] hover:bg-transparent hover:text-white text-base px-8 py-4"
                  aria-label={c.register.cta}
                >
                  {c.register.cta}
                </Pill>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer body — dark ── */}
      <div className="bg-[var(--color-dark)] text-[var(--color-paper)]">
        <div className="footer-grid w-full px-6 md:px-12 lg:px-20 pt-14 md:pt-20 pb-12 md:pb-16 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-16">
          {/* Newsletter column */}
          <div className="footer-col flex flex-col gap-5 max-w-sm">
            <p className="text-sm font-medium text-white">{c.footer.newsletter}</p>
            <form onSubmit={handleNewsletter}>
              <label htmlFor="footer-email" className="sr-only">
                {c.footer.emailPlaceholder}
              </label>
              <div className="relative flex items-center">
                <input
                  id="footer-email"
                  type="email"
                  autoComplete="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={c.footer.emailPlaceholder}
                  className="w-full bg-transparent border-b border-[rgba(255,255,255,0.3)] pb-2 pe-10 text-sm text-white placeholder:text-[rgba(255,255,255,0.4)] outline-none transition-[border-color] duration-200 focus:border-white"
                />
                <button
                  type="submit"
                  aria-label={c.footer.newsletter}
                  className="absolute end-0 bottom-2 text-[rgba(255,255,255,0.5)] hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  {isHebrew ? '←' : '→'}
                </button>
              </div>
            </form>
          </div>

          {/* Nav column */}
          <nav className="footer-col" aria-label={headOfficeCaption}>
            <ul className="flex flex-col gap-3 md:items-end">
              {c.footer.navCols.map((item) => (
                <li key={item}>
                  <a
                    href={`#${item}`}
                    className="text-lg md:text-xl font-[var(--font-display)] font-light text-white hover:text-[rgba(255,255,255,0.55)] transition-colors duration-150"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ── Giant "בונים עתיד" wordmark — building-filled, wipes in ── */}
        <div
          className="footer-wordmark w-full overflow-hidden px-4 md:px-8"
          style={{ willChange: 'clip-path' }}
        >
          <BrandWordmarkMask
            fillSrc={images.heroBuildingFill}
            className="w-full h-auto block"
          />
        </div>

        {/* Legal bar */}
        <div className="px-6 md:px-12 lg:px-20 py-5 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-xs text-[rgba(255,255,255,0.32)]">
            &copy; {new Date().getFullYear()} · {c.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
