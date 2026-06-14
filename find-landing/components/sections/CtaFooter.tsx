'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useContent, useLang } from '@/components/providers/LanguageProvider'
import { BrandWordmarkMask } from '@/components/layout/Logo'
import { images } from '@/data/content'

/**
 * Registration band + Footer.
 *
 * TOP  (id="register"): a premium two-part conversion moment over a cinematic
 *   background-image band. A bold value/urgency panel (heading, sub, webinar
 *   facts + a limited-seats cue) sits beside an elevated glass form card with a
 *   real 3-field controlled form (name / phone / email) that preventDefaults
 *   and shows a "thanks" success state, plus a prominent CTA pill.
 * BOTTOM: newsletter signup, nav columns, rights line, and the giant
 *   "בונים עתיד" wordmark filled with the hero building image.
 */
export default function CtaFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const motionOk = !useReducedMotion()
  const c = useContent()
  const { dir } = useLang()
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

      // Scroll-reveal for the registration composition: panel + card stagger up.
      gsap.from('.reg-reveal', {
        y: 34,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.reg-band', start: 'top 80%' },
      })

      // Form rows cascade in just after the card.
      gsap.from('.reg-field', {
        y: 16,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.07,
        scrollTrigger: { trigger: '.reg-card', start: 'top 85%' },
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

  const thanksTitle = isHebrew ? 'המקום שלכם שמור.' : "You're in."
  const thanksMsg = isHebrew
    ? 'שלחנו את לינק הוובינר לאימייל שלכם — נתראה בשידור.'
    : "We've emailed your webinar link — see you on the broadcast."
  const headOfficeCaption = isHebrew ? 'המנחים' : 'Hosts'

  // Trust / urgency cues — derived from the single source of truth (webinar facts).
  const seatsLabel = isHebrew ? 'מקומות מוגבלים' : 'Limited seats'
  const freeLabel = isHebrew ? 'השתתפות חינם' : 'Free to attend'
  const noteLabel = isHebrew
    ? 'ללא התחייבות · ביטול בכל עת'
    : 'No commitment · cancel anytime'
  const formLead = isHebrew ? 'שמירת מקום מהירה' : 'Quick registration'
  const factsHeading = isHebrew ? 'מתי?' : 'When?'

  const factRows: { k: string; v: string }[] = [
    { k: isHebrew ? 'תאריך' : 'Date', v: c.webinar.date },
    { k: isHebrew ? 'שעה' : 'Time', v: c.webinar.time },
    { k: isHebrew ? 'משך' : 'Length', v: c.webinar.duration },
    { k: isHebrew ? 'איפה' : 'Where', v: c.webinar.platform },
  ]

  return (
    <footer ref={footerRef} className="w-full" aria-label="Footer">
      {/* ── Registration band — cinematic image + scrim + split composition ── */}
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
        {/* Layered scrim: vertical depth + a directional wash so the form card
            edge reads cleanly against the photo regardless of language side. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(8,8,10,0.82) 0%, rgba(8,8,10,0.62) 42%, rgba(8,8,10,0.86) 100%)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              dir === 'rtl'
                ? 'linear-gradient(to left, rgba(8,8,10,0.55) 0%, rgba(8,8,10,0) 60%)'
                : 'linear-gradient(to right, rgba(8,8,10,0.55) 0%, rgba(8,8,10,0) 60%)',
          }}
          aria-hidden="true"
        />
        {/* Subtle warm accent glow anchored to the form side — depth with intent. */}
        <div
          className="pointer-events-none absolute -bottom-24 h-[420px] w-[420px] rounded-full blur-[120px] opacity-30"
          style={{
            background:
              'radial-gradient(circle, var(--color-sky-orange) 0%, transparent 70%)',
            insetInlineEnd: '-6rem',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 py-20 md:py-28">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* ── Value / urgency panel ── */}
            <div className="reg-reveal flex flex-col items-start text-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.07)] px-4 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-sm">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-sky-orange)]"
                  aria-hidden="true"
                />
                {seatsLabel}
              </span>

              <h2
                id="register-heading"
                className="mt-6 font-[var(--font-display)] font-semibold text-white text-[clamp(2.1rem,4.8vw,3.75rem)] leading-[1.05] tracking-[-0.02em] max-w-2xl"
              >
                {c.register.heading}
              </h2>
              <p className="mt-4 max-w-md text-base md:text-lg font-light leading-relaxed text-[rgba(255,255,255,0.8)]">
                {c.register.sub}
              </p>

              {/* Webinar facts — concrete trust cues */}
              <div className="mt-8 w-full max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.5)]">
                  {factsHeading}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
                  {factRows.map((row) => (
                    <div
                      key={row.k}
                      className="border-t border-[rgba(255,255,255,0.14)] pt-2"
                    >
                      <dt className="text-[11px] uppercase tracking-wide text-[rgba(255,255,255,0.45)]">
                        {row.k}
                      </dt>
                      <dd className="mt-0.5 text-sm font-medium text-white">
                        {row.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* ── Elegant glass form card ── */}
            <div className="reg-reveal reg-card relative w-full">
              <div className="rounded-3xl border border-[rgba(255,255,255,0.18)] bg-[rgba(16,16,20,0.55)] p-6 md:p-8 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                {submitted ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex flex-col items-center gap-4 py-8 text-center"
                  >
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-sky-orange)]/20 text-2xl text-[var(--color-sky-peach)]"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <p className="text-xl font-semibold text-white">{thanksTitle}</p>
                    <p className="max-w-xs text-sm font-light leading-relaxed text-[rgba(255,255,255,0.72)]">
                      {thanksMsg}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="flex flex-col gap-5" noValidate>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{formLead}</p>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-sky-peach)]">
                        {freeLabel}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3.5">
                      {(['name', 'phone', 'email'] as const).map((field) => (
                        <div key={field} className="reg-field flex flex-col gap-1.5 text-start">
                          <label
                            htmlFor={`reg-${field}`}
                            className="text-xs font-medium text-[rgba(255,255,255,0.6)]"
                          >
                            {c.register.fields[field]}
                          </label>
                          <input
                            id={`reg-${field}`}
                            name={field}
                            type={
                              field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'
                            }
                            inputMode={
                              field === 'phone' ? 'tel' : field === 'email' ? 'email' : 'text'
                            }
                            autoComplete={
                              field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'name'
                            }
                            dir={field === 'name' ? dir : 'ltr'}
                            required
                            value={form[field]}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, [field]: e.target.value }))
                            }
                            placeholder={c.register.fields[field]}
                            className="min-h-[52px] w-full rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] px-4 text-[15px] text-white placeholder:text-[rgba(255,255,255,0.4)] outline-none transition-[border-color,background-color,box-shadow] duration-200 hover:border-[rgba(255,255,255,0.32)] focus-visible:border-[var(--color-sky-peach)] focus-visible:bg-[rgba(255,255,255,0.08)] focus-visible:ring-2 focus-visible:ring-[var(--color-sky-orange)]/45"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Prominent CTA pill — full width, arrow nudge, GPU transform only */}
                    <button
                      type="submit"
                      className="group mt-1 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-[var(--color-ink)] shadow-[0_10px_30px_-8px_rgba(255,255,255,0.4)] transition-[background-color,color,box-shadow] duration-200 hover:bg-[var(--color-sky-peach)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                      aria-label={c.register.cta}
                    >
                      <span>{c.register.cta}</span>
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform duration-200 ease-out group-hover:[transform:translateX(var(--arrow-nudge))]"
                        style={
                          {
                            ['--arrow-nudge' as string]:
                              dir === 'rtl' ? '-0.25rem' : '0.25rem',
                          } as React.CSSProperties
                        }
                      >
                        {dir === 'rtl' ? '←' : '→'}
                      </span>
                    </button>

                    <p className="text-center text-[11px] font-light text-[rgba(255,255,255,0.45)]">
                      {noteLabel}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
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
