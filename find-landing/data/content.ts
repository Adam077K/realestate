/**
 * data/content.ts — SINGLE SOURCE OF TRUTH (bilingual)
 *
 * Brand: בונים עתיד (Bonim Atid) — Israeli real-estate investment advisory firm.
 * Hebrew is the DEFAULT language (RTL). English is the secondary toggle.
 *
 * Two layers live here:
 *   1. `content` — the bilingual tree { he, en }. New components consume this via
 *      `useContent()` from the LanguageProvider.
 *   2. Backward-compatible named exports (hero, whyFind, chevronStrip, …) — the
 *      existing section components still import these so the build stays green.
 *      They are derived from the Hebrew tree (closest mapping). A follow-up wave
 *      migrates the sections onto `useContent()` and removes these.
 */

export type Lang = 'he' | 'en'

// ─── Image Manifest (language-agnostic — keep EXACTLY as-is) ─────────────────────

export const images = {
  heroBuilding: '/images/hero-building.jpg',
  // Golden-hour building with the background keyed out to transparency — used as the
  // hero centerpiece (sits over the sky) AND the fill for the clip-mask wordmark.
  heroBuildingCutout: '/images/hero-building-cutout.png',
  // Opaque, content-trimmed golden building — used as the FILL for the clip-mask
  // wordmark (the transparent cutout left letters empty over its transparent margins).
  heroBuildingFill: '/images/hero-building-fill.jpg',
  cityStreet: '/images/city-street.jpg',
  chevron: [
    '/images/chevron-1.jpg',
    '/images/chevron-2.jpg',
    '/images/chevron-3.jpg',
    '/images/chevron-4.jpg',
  ] as [string, string, string, string],
  aerialForest: '/images/aerial-forest.jpg',
  agentPortrait: '/images/agent-portrait.jpg',
  testimonialCouple: '/images/testimonial-couple.jpg',
  serviceMortgage: '/images/service-mortgage.jpg',
  serviceProperty: '/images/service-property.jpg',
  serviceConstruction: '/images/service-construction.jpg',
  blog: [
    '/images/blog-1.jpg',
    '/images/blog-2.jpg',
    '/images/blog-3.jpg',
  ] as [string, string, string],
  ctaFamily: '/images/cta-family.jpg',
} as const

// ─── Bilingual content tree ──────────────────────────────────────────────────────

export const content = {
  he: {
    brand: 'בונים עתיד',
    tagline: 'כשנדל״ן, אנשים ומקצועיות נפגשים',
    nav: {
      links: [
        { label: 'הוובינר', href: '#hero' },
        { label: 'מה תלמדו', href: '#learn' },
        { label: 'המנחים', href: '#founders' },
        { label: 'פרטים', href: '#webinar' },
        { label: 'הרשמה', href: '#register' },
      ],
      cta: 'שריינו מקום',
      toggle: 'עב',
    },
    hero: {
      title: 'דירה חדשה מקבלן ב-2026',
      subhead:
        'איך לנצל את מצב השוק לטובתכם — וובינר חינם עם עידן פלג ורועי פישמן.',
      cta: 'שריינו לי מקום עכשיו',
    },
    arrows: {
      lead: 'זה לא רק דירה.',
      tail: 'זה העתיד שלכם.',
    },
    learn: {
      heading: { lead: 'מה תלמדו', tail: 'בוובינר' },
      items: [
        {
          n: '01',
          lead: 'מה באמת קורה בשוק?',
          tail: 'ניתוח מצב שוק הנדל״ן בישראל ב-2026.',
        },
        {
          n: '02',
          lead: 'איך מזהים אזור עם פוטנציאל?',
          tail: 'הקריטריונים לזיהוי אזורי צמיחה.',
        },
        {
          n: '03',
          lead: 'אילו בדיקות חובה?',
          tail: 'כל הבדיקות לפני רכישה מקבלן.',
        },
        {
          n: '04',
          lead: 'הטעויות שעולות ביוקר',
          tail: 'השגיאות שעולות לרוכשים מאות אלפי שקלים.',
        },
      ],
    },
    founders: {
      heading: { lead: 'מי', tail: 'מנחה?' },
      intro:
        'בונים עתיד נפגשת בדיוק שם — היכן שנדל״ן, אנשים ומקצועיות נפגשים. אנחנו מלווים משקיעים ורוכשים לראות את התמונה המלאה ולקבל החלטות בטוחות לטווח ארוך.',
      people: [
        {
          name: 'עידן פלג',
          role: 'כלכלן ויועץ השקעות נדל״ן',
          bio: 'תואר שני בנדל״ן ומימון, מלווה משקיעים בקבלת החלטות חכמות משנת 2021.',
        },
        {
          name: 'רועי פישמן',
          role: 'שמאי מקרקעין ומומחה מימון',
          bio: 'מעל 8 שנות ניסיון עסקי בחברות מובילות בישראל, עם ראייה מלאה של עסקת הנדל״ן.',
        },
      ],
    },
    pillars: {
      heading: { lead: 'איך בונים עתיד', tail: 'עוזרים לכם' },
      rows: [
        {
          n: '1',
          word: 'לקנות',
          body: 'לקנות נכון: המחיר הנכון, האזור הנכון, עם כל המידע לפניכם.',
        },
        {
          n: '2',
          word: 'לזהות',
          body: 'לזהות הזדמנויות אמיתיות לפני כולם ולהבין מה מניע ערך.',
        },
        {
          n: '3',
          word: 'להרוויח',
          body: 'להימנע מהטעויות היקרות ולהפוך כל רכישה להשקעה חכמה.',
        },
      ],
      closing: {
        lead: 'ליווי מקצועי בכל שלב של ההשקעה',
        tail: '— בידע אמין ובשקיפות מלאה.',
      },
      cta: 'הצטרפו לוובינר',
    },
    testimonials: {
      heading: { lead: 'מה אומרים', tail: 'המשתתפים' },
      items: [
        {
          quote:
            'הגעתי לוובינר בלי לדעת כלום על השקעה בנדל״ן, ויצאתי עם תמונה ברורה ותכנית פעולה. עידן ורועי מסבירים בגובה העיניים — בלי מכירות, רק ערך.',
          name: 'מאיה לוי',
          rating: 5 as const,
        },
        {
          quote:
            'הבדיקות שהציגו לפני רכישה מקבלן חסכו לי טעות של מאות אלפי שקלים. שווה כל דקה, ובחינם.',
          name: 'דניאל כהן',
          rating: 5 as const,
        },
        {
          quote:
            'סוף סוף מישהו שמדבר על השוק בלי באז וסיסמאות. יצאתי עם ביטחון לקבל החלטה ולא לדחות אותה עוד שנה.',
          name: 'נועה אבני',
          rating: 5 as const,
        },
        {
          quote:
            'הליווי המקצועי של רועי בכל מה שקשור למימון פתח לי את הראש. הבנתי איך לבנות עסקה נכון מהיסוד.',
          name: 'אבי מזרחי',
          rating: 5 as const,
        },
        {
          quote:
            'הצוות של בונים עתיד אמין, שקוף ומדויק. ממליצה לכל מי שחושב להשקיע או לקנות דירה ראשונה.',
          name: 'טל ברק',
          rating: 5 as const,
        },
      ],
    },
    webinar: {
      label: 'פרטי הוובינר',
      date: 'יום שני, 22.06.26',
      time: '20:30',
      duration: 'כ-45 דקות',
      platform: 'בזום — הלינק יישלח למייל',
    },
    register: {
      heading: 'שריינו את מקומכם',
      sub: 'מלאו פרטים והצטרפו לוובינר החינמי',
      fields: { name: 'שם מלא', phone: 'טלפון', email: 'אימייל' },
      cta: 'שריינו לי מקום עכשיו!',
    },
    footer: {
      newsletter: 'הישארו מעודכנים',
      emailPlaceholder: 'האימייל שלכם',
      navCols: ['הוובינר', 'המנחים', 'פרטים', 'הרשמה'],
      rights: 'כל הזכויות שמורות · בונים עתיד',
      wordmark: 'בונים עתיד',
    },
  },
  en: {
    brand: 'בונים עתיד',
    tagline: 'Where real estate, people & expertise meet',
    nav: {
      links: [
        { label: 'The Webinar', href: '#hero' },
        { label: "What You'll Learn", href: '#learn' },
        { label: 'The Hosts', href: '#founders' },
        { label: 'Details', href: '#webinar' },
        { label: 'Register', href: '#register' },
      ],
      cta: 'Reserve a spot',
      toggle: 'EN',
    },
    hero: {
      title: 'A New Apartment, Built Right',
      subhead:
        'How to turn the 2026 market to your advantage — a free webinar with Idan Peleg & Roey Fishman.',
      cta: 'Reserve my spot now',
    },
    arrows: {
      lead: "This isn't just an apartment.",
      tail: "It's your future.",
    },
    learn: {
      heading: { lead: "What you'll", tail: 'learn' },
      items: [
        {
          n: '01',
          lead: "What's really happening?",
          tail: "A clear read on Israel's 2026 market.",
        },
        {
          n: '02',
          lead: 'Spotting areas with potential',
          tail: 'The criteria for identifying growth zones.',
        },
        {
          n: '03',
          lead: 'The must-do checks',
          tail: 'Full due diligence before buying from a developer.',
        },
        {
          n: '04',
          lead: 'The costly mistakes',
          tail: 'Errors that cost buyers hundreds of thousands.',
        },
      ],
    },
    founders: {
      heading: { lead: 'Your', tail: 'hosts.' },
      intro:
        'Bonim Atid is where real estate, people and expertise meet. We guide investors and buyers to see the full picture and make confident, long-term decisions.',
      people: [
        {
          name: 'Idan Peleg',
          role: 'Economist & real-estate investment advisor',
          bio: 'MBA in real estate & finance, guiding investors to smart decisions since 2021.',
        },
        {
          name: 'Roey Fishman',
          role: 'Real-estate appraiser & financing expert',
          bio: '8+ years of business experience at leading Israeli firms, with a full-picture view of every deal.',
        },
      ],
    },
    pillars: {
      heading: { lead: 'How Bonim Atid', tail: 'helps you' },
      rows: [
        {
          n: '1',
          word: 'Buy',
          body: 'Buy right: the right price, the right area, all the data in front of you.',
        },
        {
          n: '2',
          word: 'Spot',
          body: 'Spot real opportunities before everyone and understand what drives value.',
        },
        {
          n: '3',
          word: 'Gain',
          body: 'Avoid the costly mistakes and turn every purchase into a smart investment.',
        },
      ],
      closing: {
        lead: 'Professional guidance at every stage',
        tail: '— with reliable knowledge and full transparency.',
      },
      cta: 'Join the webinar',
    },
    testimonials: {
      heading: { lead: 'What attendees', tail: 'say' },
      items: [
        {
          quote:
            'I came in knowing nothing about real-estate investing and left with a clear picture and an action plan. Idan and Roey explain everything at eye level — no selling, just value.',
          name: 'Maya Levi',
          rating: 5 as const,
        },
        {
          quote:
            'The pre-purchase checks they walked through saved me from a mistake worth hundreds of thousands. Worth every minute, and free.',
          name: 'Daniel Cohen',
          rating: 5 as const,
        },
        {
          quote:
            'Finally someone who talks about the market without buzzwords and slogans. I left confident enough to make a decision instead of postponing it another year.',
          name: 'Noa Avni',
          rating: 5 as const,
        },
        {
          quote:
            "Roey's professional guidance on everything financing-related opened my eyes. I understood how to structure a deal correctly from the ground up.",
          name: 'Avi Mizrahi',
          rating: 5 as const,
        },
        {
          quote:
            'The Bonim Atid team is reliable, transparent and precise. I recommend it to anyone thinking about investing or buying a first apartment.',
          name: 'Tal Barak',
          rating: 5 as const,
        },
      ],
    },
    webinar: {
      label: 'Webinar details',
      date: 'Monday, 22.06.26',
      time: '20:30',
      duration: '~45 minutes',
      platform: 'On Zoom — link sent by email',
    },
    register: {
      heading: 'Reserve your spot',
      sub: 'Fill in your details to join the free webinar',
      fields: { name: 'Full name', phone: 'Phone', email: 'Email' },
      cta: 'Reserve my spot now!',
    },
    footer: {
      newsletter: 'Stay updated',
      emailPlaceholder: 'Your email',
      navCols: ['The Webinar', 'The Hosts', 'Details', 'Register'],
      rights: 'All rights reserved · Bonim Atid',
      wordmark: 'בונים עתיד',
    },
  },
} as const

export type Content = (typeof content)[Lang]

// ════════════════════════════════════════════════════════════════════════════════
// BACKWARD-COMPAT NAMED EXPORTS
// Existing section components import these. They mirror the OLD shapes exactly so
// the build stays green, populated from the Hebrew tree (closest mapping).
// Removed in the section-migration wave once sections move to useContent().
// ════════════════════════════════════════════════════════════════════════════════

const he = content.he

export const logoSubline = he.tagline

// Hero — { title, subhead, cta }
export const hero = {
  title: he.hero.title,
  subhead: he.hero.subhead,
  cta: he.hero.cta,
} as const

// WhyFind — { label, heading: { lead, tail }, body }
export const whyFind = {
  label: he.brand,
  heading: { lead: he.arrows.lead, tail: he.arrows.tail },
  body: he.founders.intro,
} as const

// ChevronStrip — { heading: { lead, tail }, images }
export const chevronStrip = {
  heading: { lead: he.arrows.lead, tail: he.arrows.tail },
  images: images.chevron,
} as const

// RewiredSteps — { intro: { lead, tail }, title: { lead, tail }, cta, steps[] }
export const rewiredSteps = {
  intro: { lead: he.founders.intro, tail: he.pillars.closing.lead },
  title: { lead: he.learn.heading.lead, tail: he.learn.heading.tail },
  cta: he.hero.cta,
  steps: he.learn.items.slice(0, 3).map((item) => ({
    n: item.n,
    lead: item.lead,
    tail: item.tail,
  })),
} as const

// OwnYourCareer — { label, heading: { lead, tail }, body }
export const ownYourCareer = {
  label: he.founders.heading.lead,
  heading: { lead: he.founders.heading.lead, tail: he.founders.heading.tail },
  body: `${he.founders.people[0].name} — ${he.founders.people[0].bio} ${he.founders.people[1].name} — ${he.founders.people[1].bio} ${he.founders.intro}`,
} as const

// Testimonials — { heading: { lead, tail }, items: Testimonial[] }
export interface Testimonial {
  author: string
  quote: string
  stars: 5
  role?: string
}

export const testimonials = {
  heading: {
    lead: he.testimonials.heading.lead,
    tail: he.testimonials.heading.tail,
  },
  items: he.testimonials.items.map((t) => ({
    author: t.name,
    quote: t.quote,
    stars: 5 as const,
  })) satisfies Testimonial[],
} as const

// Services — { label, heading: { lead, tail }, rows: ServiceRow[], closing, cta }
export interface ServiceRow {
  n: string
  word: string
  body: string
}

export const services = {
  label: he.pillars.heading.lead,
  heading: { lead: he.pillars.heading.lead, tail: he.pillars.heading.tail },
  rows: he.pillars.rows.map((r) => ({
    n: r.n,
    word: r.word,
    body: r.body,
  })) satisfies ServiceRow[],
  closing: { lead: he.pillars.closing.lead, tail: he.pillars.closing.tail },
  cta: he.pillars.cta,
} as const

// SupportBeyond — { heading: { lead, tail }, intro: { lead, tail }, cta, cards: SupportCard[] }
export interface SupportCard {
  title: string
  img: string
  cta: string
}

export const supportBeyond = {
  heading: { lead: he.learn.heading.lead, tail: he.learn.heading.tail },
  intro: { lead: he.arrows.lead, tail: he.arrows.tail },
  cta: he.pillars.cta,
  cards: [
    { title: he.learn.items[0].lead, img: images.serviceMortgage, cta: he.nav.cta },
    { title: he.learn.items[1].lead, img: images.serviceProperty, cta: he.nav.cta },
    { title: he.learn.items[2].lead, img: images.serviceConstruction, cta: he.nav.cta },
  ] satisfies SupportCard[],
} as const

// Blog — { posts: BlogPost[] }
export interface BlogPost {
  date: string
  title: string
  excerpt: string
  img: string
}

export const blog = {
  posts: [
    {
      date: he.webinar.date,
      title: he.learn.items[0].lead,
      excerpt: he.learn.items[0].tail,
      img: images.blog[0],
    },
    {
      date: he.webinar.date,
      title: he.learn.items[1].lead,
      excerpt: he.learn.items[1].tail,
      img: images.blog[1],
    },
    {
      date: he.webinar.date,
      title: he.learn.items[2].lead,
      excerpt: he.learn.items[2].tail,
      img: images.blog[2],
    },
  ] satisfies BlogPost[],
} as const

// CtaFooter — { ctaBand, newsletter, contact, navCols, social }
export const ctaFooter = {
  ctaBand: { heading: he.register.heading },
  newsletter: {
    label: he.footer.newsletter,
    emailPlaceholder: he.footer.emailPlaceholder,
  },
  contact: {
    headOffice: he.webinar.platform,
    email: 'hello@bonim-atid.co.il',
    phone: he.webinar.time,
  },
  navCols: he.footer.navCols as unknown as string[],
  social: ['Facebook', 'Instagram', 'Youtube', 'Linkedin'] as string[],
} as const
