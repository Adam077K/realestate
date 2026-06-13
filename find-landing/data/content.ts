/**
 * data/content.ts — SINGLE SOURCE OF TRUTH
 * All copy, image paths, and structured data for the FIND Real Estate landing page.
 * Section workers import from here — never hardcode copy in components.
 */

// ─── Image Manifest ────────────────────────────────────────────────────────────

export const images = {
  heroBuilding: '/images/hero-building.jpg',
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

// ─── Nav ───────────────────────────────────────────────────────────────────────

export const logoSubline = 'Real Estate'

// ─── Hero ──────────────────────────────────────────────────────────────────────

export const hero = {
  title: 'Find What Moves You',
  subhead: "Expert agents. Real guidance. A clear path to find what's next.",
  cta: 'Find Properties',
} as const

// ─── Why FIND ──────────────────────────────────────────────────────────────────

export const whyFind = {
  label: 'Why FIND',
  heading: {
    lead: "Your life's changing. Don't just find a place —",
    tail: "find what's next.",
  },
  body: "We help you move forward with clarity, confidence, and the right agent by your side.",
} as const

// ─── Chevron Strip (image rail, no copy) ───────────────────────────────────────

export const chevronStrip = {
  images: images.chevron,
} as const

// ─── Rewired Steps ─────────────────────────────────────────────────────────────

export const rewiredSteps = {
  intro: {
    lead: "It's about identity. Progress. Getting unstuck. You're not just looking for a place.",
    tail: "You're looking for alignment. That's what we help you find.",
  },
  title: {
    lead: 'Real Estate,',
    tail: 'Rewired.',
  },
  cta: 'Start Your Search',
  steps: [
    {
      n: '01',
      lead: 'Talk to a Real Human.',
      tail: 'We match you with an expert who actually listens.',
    },
    {
      n: '02',
      lead: 'Get Clarity.',
      tail: "We define what you really need, not just what's available.",
    },
    {
      n: '03',
      lead: 'Move Forward.',
      tail: 'We find what fits — and make it happen.',
    },
  ],
} as const

// ─── Own Your Career ───────────────────────────────────────────────────────────

export const ownYourCareer = {
  label: 'For Agents',
  heading: {
    lead: "Don't Rent Your Career.",
    tail: 'Own It.',
  },
  body: "At FIND, our agents don't just work for the brand—they own a part of it. We give top performers real equity, so they're invested in more than just your transaction—they're invested in your outcome. Agents are certified, supported, and equipped to deliver five-star service—because their success is tied to yours. You're not just here to close deals — you're building a career, a life, a legacy. We help agents find the company that gives them the support, tools, and leadership to thrive.",
} as const

// ─── Testimonials ──────────────────────────────────────────────────────────────

export interface Testimonial {
  author: string
  quote: string
  stars: 5
  role?: string
}

export const testimonials = {
  heading: {
    lead: "Don't Take",
    tail: 'Our Word for It.',
  },
  items: [
    {
      author: 'BERNADETTE HOGAN',
      quote:
        '"Michael was a great realtor. Such a hard worker, dedicated to helping us find the perfect neighborhood, price point and home. He\'s a workaholic so he was available morning, noon and night. Tireless and dedicated. Would recommend him 100%!"',
      stars: 5 as const,
    },
    {
      author: 'JAMES & PRIYA CHEN',
      quote:
        '"We were first-time buyers in a brutal NYC market and genuinely had no idea what we were doing. Our FIND agent walked us through every step, negotiated hard on our behalf, and got us into a place we actually love. Cannot recommend enough."',
      stars: 5 as const,
    },
    {
      author: 'MARCUS DELGADO',
      quote:
        '"Listed and sold in 11 days, above asking price. The staging advice alone was worth it. The team at FIND knows this market cold and it shows in every conversation. Professional from start to finish."',
      stars: 5 as const,
    },
    {
      author: 'SOPHIE OKAFOR',
      quote:
        '"I relocated from London and needed someone who really understood the Manhattan rental market. My agent knew buildings I had never even seen online. Found me something incredible in the West Village in under two weeks. Magic."',
      stars: 5 as const,
    },
    {
      author: 'THERESA & BOB WALSH',
      quote:
        '"After 22 years in our Tribeca loft it was time to downsize. Our FIND agent treated us with patience and zero pressure, and found us a Park Slope brownstone that feels like home from day one. Exactly what good real estate looks like."',
      stars: 5 as const,
    },
  ] satisfies Testimonial[],
} as const

// ─── Services ──────────────────────────────────────────────────────────────────

export interface ServiceRow {
  n: string
  word: string
  body: string
}

export const services = {
  label: 'Services',
  heading: {
    lead: 'How FIND',
    tail: 'Can Help You',
  },
  rows: [
    {
      n: '1',
      word: 'Buy',
      body: "Buy smarter with expert agents backed by mortgage, legal, and appraisal pros—dialed in to get you the best deal, fast. We've done this over 10,000 times, and we know what wins.",
    },
    {
      n: '2',
      word: 'Sell',
      body: 'Sell fast, sell high. Your listing gets pro staging, strategic pricing, constant open houses, and agents who never stop working until the right buyer signs.',
    },
    {
      n: '3',
      word: 'Rent',
      body: 'Access hidden rentals before they hit the market through agents who know every landlord in town. With decades of NYC experience, we unlock the best deals you won\'t find online.',
    },
  ] satisfies ServiceRow[],
  closing: {
    lead: 'Our certified agents guide you through every stage of real estate',
    tail: 'with expert knowledge and reliable support.',
  },
  cta: 'Get Started with FIND',
} as const

// ─── Support Beyond ────────────────────────────────────────────────────────────

export interface SupportCard {
  title: string
  img: string
  cta: string
}

export const supportBeyond = {
  heading: {
    lead: 'Support Beyond',
    tail: 'Buying and Selling',
  },
  intro: {
    lead: 'The real estate market never stands still — and neither do we.',
    tail: 'Our experts offer continued support beyond the sale, helping you maximize your investment.',
  },
  cta: 'Discover Our Services',
  cards: [
    {
      title: 'Mortgage Services',
      img: images.serviceMortgage,
      cta: 'Learn More',
    },
    {
      title: 'Property Management',
      img: images.serviceProperty,
      cta: 'Learn More',
    },
    {
      title: 'Construction and Real Estate Development',
      img: images.serviceConstruction,
      cta: 'Learn More',
    },
  ] satisfies SupportCard[],
} as const

// ─── Blog ──────────────────────────────────────────────────────────────────────

export interface BlogPost {
  date: string
  title: string
  excerpt: string
  img: string
}

export const blog = {
  posts: [
    {
      date: '2026-04-15',
      title: 'Q1 2026 NYC Market Report',
      excerpt:
        'Q1 2026 saw strong rental demand, active sales, and shifting pricing across NYC. Here\'s what it means heading into the spring market.',
      img: images.blog[0],
    },
    {
      date: '2026-04-01',
      title: 'Philly Real Estate: A Winter Chill or a Spring Opportunity?',
      excerpt:
        'Record-low listings and steady price growth define a unique February for the Philadelphia Metro.',
      img: images.blog[1],
    },
    {
      date: '2026-03-09',
      title: 'What $1M Buys in Different NYC Neighborhoods',
      excerpt:
        "Curious what $1M can still buy in today's NYC market? Explore a snapshot of available listings across Manhattan and discover the surprising range of options at this key price point.",
      img: images.blog[2],
    },
  ] satisfies BlogPost[],
} as const

// ─── CTA Footer ────────────────────────────────────────────────────────────────

export const ctaFooter = {
  ctaBand: {
    heading: "Let's Get Started",
  },
  newsletter: {
    label: 'Subscribe to our Newsletter!',
    emailPlaceholder: 'Enter address',
  },
  contact: {
    headOffice: '5 West 37th Street, 12th Floor, New York, NY 10018',
    email: 'hello@findrealestate.com',
    phone: '+1 212 994 9965',
  },
  navCols: ['Search', 'Agents', 'Join', 'About Us', 'Agent Portal'] as string[],
  social: ['Facebook', 'Instagram', 'Youtube', 'Linkedin'] as string[],
} as const
