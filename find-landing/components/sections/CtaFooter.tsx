'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { useGsapContext } from '@/hooks/useGsapContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useContent, useLang } from '@/components/providers/LanguageProvider'
import { images } from '@/data/content'

// ── Social icon SVGs (inline, no extra deps) ─────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.52 3.48A11.9 11.9 0 0 0 12 0C5.373 0 0 5.373 0 12c0 2.115.553 4.178 1.605 5.99L0 24l6.187-1.622A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12a11.9 11.9 0 0 0-3.48-8.52ZM12 21.9a9.84 9.84 0 0 1-5.02-1.375l-.36-.214-3.672.963.981-3.581-.235-.37A9.849 9.849 0 0 1 2.1 12c0-5.46 4.44-9.9 9.9-9.9 2.645 0 5.13 1.03 6.998 2.902A9.855 9.855 0 0 1 21.9 12c0 5.46-4.44 9.9-9.9 9.9Zm5.431-7.418c-.298-.149-1.763-.87-2.036-.969-.273-.099-.472-.149-.67.149-.2.297-.77.969-.944 1.168-.174.2-.347.224-.645.075-.298-.15-1.258-.464-2.397-1.48-.886-.79-1.484-1.766-1.658-2.064-.174-.298-.018-.459.13-.608.134-.133.298-.347.447-.52.15-.174.199-.298.299-.497.099-.2.05-.374-.025-.523-.075-.15-.67-1.616-.918-2.213-.242-.58-.488-.501-.67-.51-.174-.008-.373-.01-.572-.01-.2 0-.522.075-.795.373-.273.298-1.04 1.017-1.04 2.48 0 1.466 1.065 2.882 1.214 3.082.149.2 2.096 3.2 5.077 4.487.71.307 1.264.49 1.696.627.712.227 1.36.195 1.873.118.571-.085 1.763-.72 2.012-1.416.248-.695.248-1.29.174-1.416-.075-.124-.273-.199-.572-.347Z"
        fill="currentColor"
      />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"
        fill="currentColor"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"
        fill="currentColor"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.532-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z"
        fill="currentColor"
      />
    </svg>
  )
}

const SOCIAL_ICONS: Record<string, React.FC> = {
  WhatsApp: WhatsAppIcon,
  YouTube: YouTubeIcon,
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
}

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
  const regBgRef = useRef<HTMLDivElement>(null)
  const motionOk = !useReducedMotion()
  const c = useContent()
  const { dir } = useLang()
  const isHebrew = c.register.fields.name === 'שם מלא'

  // Registration form - controlled, no backend; shows a success state on submit.
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [submitted, setSubmitted] = useState(false)

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

      // Subtle parallax on the background image - drifts 8% over section height.
      // GPU-safe: transform/yPercent only, no top/left.
      const bg = regBgRef.current
      if (bg) {
        gsap.fromTo(
          bg,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: '.reg-band',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }
    },
    [motionOk]
  )

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const thanksTitle = isHebrew ? 'המקום שלכם שמור.' : "You're in."
  const thanksMsg = isHebrew
    ? 'שלחנו את לינק הוובינר לאימייל שלכם - נתראה בשידור.'
    : "We've emailed your webinar link - see you on the broadcast."

  // Trust / urgency cues - derived from the single source of truth (webinar facts).
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
      {/* ── Registration band - cinematic image + scrim + split composition ── */}
      <section
        id="register"
        className="reg-band relative w-full overflow-hidden"
        aria-labelledby="register-heading"
      >
        {/* Background image with subtle parallax - container clips overflow,
            inner div translates ±5% via scrub so content above/below is never exposed */}
        <div
          ref={regBgRef}
          className="absolute inset-0 will-change-transform"
          style={{ height: '110%', top: '-5%' }}
          aria-hidden="true"
        >
          <Image
            src={images.ctaFamily}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            aria-hidden="true"
          />
        </div>
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
        {/* Subtle warm accent glow anchored to the form side - depth with intent. */}
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

              {/* Webinar facts - concrete trust cues */}
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

                    {/* Prominent CTA pill - full width, arrow nudge, GPU transform only */}
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

      {/* ── Footer body - teal/sage gradient, 4-column RTL ── */}
      <div
        style={{
          background: 'linear-gradient(to left, #5f9d91 0%, #a9cabf 100%)',
        }}
        className="text-white"
        role="contentinfo"
        aria-label={c.newFooter.columns.contact}
      >
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
          {/* 4-column grid - RTL: cols flow right→left in the page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

            {/* ── Col 1 (RTL reading-start - rightmost on desktop): Logo + tagline + CTA ── */}
            <div className="flex flex-col items-start gap-6">
              {/* Building-icon: render full logo, filter white, crop to icon portion */}
              <a href="#" aria-label="בונים עתיד – דף הבית" className="flex-shrink-0">
                <div
                  className="relative overflow-hidden"
                  style={{ width: '64px', height: '64px' }}
                >
                  <Image
                    src="/images/bonim-logo.png"
                    alt="בונים עתיד"
                    fill
                    sizes="64px"
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'right center',
                      filter: 'brightness(0) invert(1)',
                      transform: 'scale(2.4) translateX(25%)',
                      transformOrigin: 'right center',
                    }}
                  />
                </div>
              </a>

              {/* Tagline */}
              <p
                className="text-[15px] leading-relaxed font-light text-white/90"
                style={{ maxWidth: '28ch' }}
              >
                {c.newFooter.tagline}
              </p>

              {/* Outline CTA button */}
              <a
                href="#register"
                className="mt-auto inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{ border: '1px solid rgba(255,255,255,0.7)', minHeight: '44px' }}
              >
                {c.newFooter.contactCta}
              </a>
            </div>

            {/* ── Col 2: מפת אתר (Sitemap) ── */}
            <nav aria-label={c.newFooter.columns.sitemap}>
              <h3 className="mb-5 text-base font-semibold text-white">
                {c.newFooter.columns.sitemap}
              </h3>
              <ul className="flex flex-col gap-3">
                {c.newFooter.sitemap.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-[14px] font-light text-white/85 leading-snug transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* ── Col 3: השירותים שלנו (Services) ── */}
            <nav aria-label={c.newFooter.columns.services}>
              <h3 className="mb-5 text-base font-semibold text-white">
                {c.newFooter.columns.services}
              </h3>
              <ul className="flex flex-col gap-3">
                {c.newFooter.services.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-[14px] font-light text-white/85 leading-snug transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              {/* Separated deals link */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <a
                  href={c.newFooter.dealsLink.href}
                  className="text-[14px] font-medium text-white/90 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  {c.newFooter.dealsLink.label}
                </a>
              </div>
            </nav>

            {/* ── Col 4 (leftmost on desktop): דברו איתנו (Contact) ── */}
            <div>
              <h3 className="mb-5 text-base font-semibold text-white">
                {c.newFooter.columns.contact}
              </h3>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href={`tel:${c.newFooter.contact.phone.replace(/-/g, '')}`}
                    className="text-[14px] font-light text-white/85 leading-snug transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                    dir="ltr"
                  >
                    {c.newFooter.contact.phoneLabel}: {c.newFooter.contact.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${c.newFooter.contact.email}`}
                    className="text-[14px] font-light text-white/85 leading-snug transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                    dir="ltr"
                  >
                    {c.newFooter.contact.emailLabel}: {c.newFooter.contact.email}
                  </a>
                </li>
              </ul>

              {/* Social follow row */}
              <div className="mt-6">
                <a
                  href="#"
                  className="text-[14px] font-medium text-white/90 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  {c.newFooter.followLabel}
                </a>
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  {c.newFooter.social.map((s) => {
                    const Icon = SOCIAL_ICONS[s.name]
                    return (
                      <a
                        key={s.name}
                        href={s.href}
                        aria-label={s.name}
                        className="flex items-center justify-center rounded-full text-white transition-colors duration-150 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        style={{
                          width: '44px',
                          height: '44px',
                          border: '1px solid rgba(255,255,255,0.5)',
                          flexShrink: 0,
                        }}
                      >
                        {Icon && <Icon />}
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Legal bar */}
        <div
          className="border-t px-6 md:px-12 lg:px-20 py-4"
          style={{ borderColor: 'rgba(255,255,255,0.2)' }}
        >
          <p className="text-xs text-white/60 text-center">
            {c.newFooter.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
