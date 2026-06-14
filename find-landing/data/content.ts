/**
 * data/content.ts - SINGLE SOURCE OF TRUTH (bilingual)
 *
 * Brand: בונים עתיד (Bonim Atid) - Israeli real-estate investment advisory firm.
 * Hebrew is the DEFAULT language (RTL). English is the secondary toggle.
 *
 * Two layers live here:
 *   1. `content` - the bilingual tree { he, en }. New components consume this via
 *      `useContent()` from the LanguageProvider.
 *   2. Backward-compatible named exports (hero, whyFind, chevronStrip, …) - the
 *      existing section components still import these so the build stays green.
 *      They are derived from the Hebrew tree (closest mapping). A follow-up wave
 *      migrates the sections onto `useContent()` and removes these.
 */

export type Lang = 'he' | 'en'

// ─── Image Manifest (language-agnostic - keep EXACTLY as-is) ─────────────────────

export const images = {
  heroBuilding: '/images/hero-building.webp',
  // Golden-hour building with the background keyed out to transparency - used as the
  // hero centerpiece (sits over the sky) AND the fill for the clip-mask wordmark.
  // Golden-hour building (transparent cutout, 1024×1024). Fresh filename to bust the
  // Next.js image-optimizer cache that was still serving the previous building.
  heroBuildingCutout: '/images/hero-tower-v4.webp',
  // Opaque, content-trimmed tower - fill for the clip-mask wordmark.
  heroBuildingFill: '/images/hero-tower-fill-v3.webp',
  cityStreet: '/images/city-street.webp',
  chevron: [
    '/images/chevron-family.webp',
    '/images/chevron-buying.webp',
    '/images/chevron-apartment.webp',
    '/images/chevron-planning.avif',
  ] as [string, string, string, string],
  aerialForest: '/images/aerial-forest.webp',
  agentPortrait: '/images/agent-portrait.webp',
  testimonialCouple: '/images/testimonial-couple.webp',
  serviceMortgage: '/images/service-mortgage.webp',
  serviceProperty: '/images/service-property.webp',
  serviceConstruction: '/images/service-construction.webp',
  blog: [
    '/images/blog-1.webp',
    '/images/blog-2.webp',
    '/images/blog-3.webp',
  ] as [string, string, string],
  ctaFamily: '/images/cta-family.webp',
  // Real founder photos
  idanPeleg: '/images/idan-peleg.webp',
  roeyFishman: '/images/roey-fishman.webp',
  // Buyer-group cards (pre-designed, used AS-IS - no overlay)
  buyerCards: [
    '/images/buyer-holon.webp',
    '/images/buyer-haifa.webp',
    '/images/buyer-telaviv.webp',
    '/images/buyer-herzliya.webp',
  ] as [string, string, string, string],
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
      title: 'איך קונים דירה מקבלן נכון ב-2026',
      // Headline cycles through these on scroll (dice/scramble effect).
      cycle: [
        'איך קונים דירה מקבלן נכון ב-2026',
        'איך לנצל את המצב בשוק לטובתנו?',
        'מה חובה לבדוק לפני עסקה?',
      ],
      subhead:
        'וובינר חינם · יום שני 22.6 · 20:30 · בזום · עם עידן פלג ורועי פישמן',
      cta: 'הרשמה לוובינר',
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
        'בונים עתיד נפגשת בדיוק שם - היכן שנדל״ן, אנשים ומקצועיות נפגשים. אנחנו מלווים משקיעים ורוכשים לראות את התמונה המלאה ולקבל החלטות בטוחות לטווח ארוך.',
      people: [
        {
          name: 'עידן פלג',
          role: 'כלכלן ויועץ השקעות נדל״ן',
          bio: 'תואר שני בנדל״ן ומימון, מלווה משקיעים בקבלת החלטות חכמות משנת 2021.',
          img: images.idanPeleg,
        },
        {
          name: 'רועי פישמן',
          role: 'שמאי מקרקעין ומומחה מימון',
          bio: 'מעל 8 שנות ניסיון עסקי בחברות מובילות בישראל, עם ראייה מלאה של עסקת הנדל״ן.',
          img: images.roeyFishman,
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
        tail: '- בידע אמין ובשקיפות מלאה.',
      },
      cta: 'הצטרפו לוובינר',
    },
    testimonials: {
      heading: { lead: 'מה אומרים', tail: 'המשתתפים' },
      items: [
        {
          quote:
            'הגעתי לוובינר בלי לדעת כלום על השקעה בנדל״ן, ויצאתי עם תמונה ברורה ותכנית פעולה. עידן ורועי מסבירים בגובה העיניים - בלי מכירות, רק ערך.',
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
      platform: 'בזום - הלינק יישלח למייל',
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
    newFooter: {
      tagline: 'חברת בונים עתיד מובילה אתכם להזדמנויות הרווחיות ביותר בשוק ומלווה כל לקוח באופן חכם ואחראי.',
      contactCta: 'דברו איתנו',
      columns: {
        sitemap: 'מפת אתר',
        services: 'השירותים שלנו',
        contact: 'דברו איתנו',
      },
      sitemap: [
        { label: 'בית', href: '#' },
        { label: 'הסיפור שלנו', href: '#' },
        { label: 'תוכן מקצועי', href: '#' },
        { label: 'ממליצים עלינו', href: '#' },
        { label: 'שאלות ותשובות', href: '#' },
        { label: 'הצהרת נגישות', href: '#' },
        { label: 'מדיניות פרטיות', href: '#' },
      ],
      services: [
        { label: 'קבוצות קונים לדירות מקבלן', href: '#' },
        { label: 'השקעה במתחמי פינוי בינוי', href: '#' },
        { label: 'ייעוץ אסטרטגי אישי לרכישת דירה', href: '#' },
      ],
      dealsLink: { label: 'העסקאות שלנו »', href: '#' },
      contact: {
        phoneLabel: 'טלפון',
        phone: '050-658-9842',
        emailLabel: 'אימייל',
        email: 'info@bonimatid-re.com',
      },
      followLabel: 'עקבו אחרינו »',
      social: [
        { name: 'WhatsApp', href: '#' },
        { name: 'YouTube', href: '#' },
        { name: 'Instagram', href: '#' },
        { name: 'Facebook', href: '#' },
      ],
      rights: 'כל הזכויות שמורות © בונים עתיד',
    },

    // ── New site sections (real Bonim Atid content) ──────────────────────────
    stats: [
      { value: '16+', label: 'שנות ניסיון משולב' },
      { value: '46M+', label: '₪ שווי עסקאות בשנה האחרונה' },
      { value: '2,000+', label: 'משקיעים בקהילה שלנו' },
    ],
    headline2: 'עסקאות נדל״ן יוצאות דופן מצריכות מומחיות יוצאת דופן.',
    partners: {
      heading: 'השותפים שלנו לדרך',
      logos: [
        { name: 'שיכון ובינוי', img: '/images/logos/shikun-binui.webp' },
        { name: 'תדהר', img: '/images/logos/tidhar.webp' },
        { name: 'גרופיניטי', img: '/images/logos/groupinity.webp' },
        { name: 'AVIV', img: '/images/logos/aviv.webp' },
        { name: 'Acro', img: '/images/logos/acro.webp' },
        { name: 'אזורים', img: '/images/logos/azorim.webp' },
        { name: 'גולן', img: '/images/logos/golan.webp' },
        { name: 'Arad', img: '/images/logos/arad.webp' },
        { name: 'KTV', img: '/images/logos/ktv.webp' },
        { name: 'Kedem', img: '/images/logos/kedem.webp' },
        { name: 'Captain Invest', img: '/images/logos/captain-invest.webp' },
        { name: 'RE-INVEST', img: '/images/logos/re-invest.webp' },
      ],
    },
    advantages: {
      heading: { lead: 'גלו את', tail: 'היתרונות שלנו' },
      items: [
        {
          title: 'מבינים נדל״ן, וגם אנשים',
          desc: 'אנחנו מלווים אתכם בגובה העיניים - מקשיבים לצרכים שלכם ומתאימים את העסקה אליכם, לא להפך.',
        },
        {
          title: '100% מקצועיות, 0% משחקים',
          desc: 'כל המלצה נשענת על נתונים, בדיקות עומק ושקיפות מלאה. בלי לחץ מכירתי ובלי הבטחות באוויר.',
        },
        {
          title: 'לא רק יודעים - מיישמים',
          desc: 'מהשיחה הראשונה ועד החתימה אנחנו לצדכם, מתרגמים את הידע לעסקה אמיתית ומשתלמת.',
        },
        {
          title: 'אין הפתעות, יש ודאות',
          desc: 'אתם יודעים מראש כל מספר וכל שלב. ליווי משפטי וכלכלי שמסיר את אי-הוודאות מהעסקה.',
        },
        {
          title: 'פוקוס מלא על נדל״ן בישראל',
          desc: 'אנחנו חיים ונושמים את שוק הנדל״ן הישראלי, מכירים כל אזור ויודעים איפה ההזדמנויות.',
        },
      ],
    },
    process: {
      heading: { lead: 'איך', tail: 'זה עובד?' },
      steps: [
        { n: '01', title: 'שיחה ראשונית', desc: 'שיחת היכרות קצרה כדי להבין מה אתם מחפשים ומה מתאים לכם.' },
        { n: '02', title: 'פגישה במשרד או בזום', desc: 'פגישת עומק שבה נציג הזדמנויות רלוונטיות ונבנה יחד אסטרטגיה.' },
        { n: '03', title: 'בחירה ושריון דירה', desc: 'בוחרים את הנכס הנכון עבורכם ומבצעים שריון מסודר ובטוח.' },
        { n: '04', title: 'ליווי משפטי ע״י עו״ד הקבוצה', desc: 'עורך הדין של הקבוצה בודק את החוזה ומגן על האינטרסים שלכם.' },
        { n: '05', title: 'חתימה על עסקה משתלמת', desc: 'חותמים על העסקה בביטחון מלא, עם כל המידע לפניכם.' },
      ],
    },
    buyerGroups: {
      heading: { lead: 'קבוצות הקונים', tail: 'שלנו' },
      // Pre-designed cards (text baked into the image) - render AS-IS, no overlay.
      cards: images.buyerCards,
      groups: [
        { city: 'חולון', img: images.buyerCards[0] },
        { city: 'חיפה', img: images.buyerCards[1] },
        { city: 'תל אביב', img: images.buyerCards[2] },
        { city: 'הרצליה', img: images.buyerCards[3] },
      ],
    },
    hitech: {
      heading: 'רבים מלקוחותינו עובדים בחברות הייטק המובילות',
      logos: [
        { name: 'monday.com', img: '/images/logos/monday.webp' },
        { name: 'Microsoft', img: '/images/logos/microsoft.webp' },
        { name: 'Intel', img: '/images/logos/intel.webp' },
        { name: 'Amazon', img: '/images/logos/amazon.webp' },
        { name: 'Payoneer', img: '/images/logos/payoneer.webp' },
        { name: 'Logz.io', img: '/images/logos/logz-io.webp' },
        { name: 'Wix', img: '/images/logos/wix.webp' },
        { name: 'Playtika', img: '/images/logos/playtika.webp' },
        { name: 'Moon Active', img: '/images/logos/moon-active.webp' },
      ],
    },
    countdown: {
      lead: 'הוובינר מתחיל בעוד',
      started: 'הוובינר התחיל',
      units: {
        days: 'ימים',
        hours: 'שעות',
        minutes: 'דקות',
        seconds: 'שניות',
      },
    },
    floatingCta: {
      label: 'כניסה לוובינר',
      ariaLabel: 'כניסה לוובינר - לחצו להרשמה',
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
      title: 'How to buy new-build property right in 2026',
      cycle: [
        'How to buy new-build property right in 2026',
        'How to turn the market\nto your advantage?',
        'What to check before\nsigning any deal?',
      ],
      subhead:
        'Free webinar · Mon 22.6 · 20:30 · on Zoom · with Idan Peleg & Roey Fishman',
      cta: 'Register for the webinar',
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
          img: images.idanPeleg,
        },
        {
          name: 'Roey Fishman',
          role: 'Real-estate appraiser & financing expert',
          bio: '8+ years of business experience at leading Israeli firms, with a full-picture view of every deal.',
          img: images.roeyFishman,
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
        tail: '- with reliable knowledge and full transparency.',
      },
      cta: 'Join the webinar',
    },
    testimonials: {
      heading: { lead: 'What attendees', tail: 'say' },
      items: [
        {
          quote:
            'I came in knowing nothing about real-estate investing and left with a clear picture and an action plan. Idan and Roey explain everything at eye level - no selling, just value.',
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
      platform: 'On Zoom - link sent by email',
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
    newFooter: {
      tagline: 'Bonim Atid leads you to the most profitable opportunities in the market, guiding every client with intelligence and responsibility.',
      contactCta: 'Talk to us',
      columns: {
        sitemap: 'Sitemap',
        services: 'Our services',
        contact: 'Talk to us',
      },
      sitemap: [
        { label: 'Home', href: '#' },
        { label: 'Our story', href: '#' },
        { label: 'Professional content', href: '#' },
        { label: 'Testimonials', href: '#' },
        { label: 'FAQ', href: '#' },
        { label: 'Accessibility statement', href: '#' },
        { label: 'Privacy policy', href: '#' },
      ],
      services: [
        { label: 'Buyer groups for new-build apartments', href: '#' },
        { label: 'Urban renewal (pinuy-binuy) investments', href: '#' },
        { label: 'Personal strategic advisory for apartment purchase', href: '#' },
      ],
      dealsLink: { label: 'Our deals »', href: '#' },
      contact: {
        phoneLabel: 'Phone',
        phone: '050-658-9842',
        emailLabel: 'Email',
        email: 'info@bonimatid-re.com',
      },
      followLabel: 'Follow us »',
      social: [
        { name: 'WhatsApp', href: '#' },
        { name: 'YouTube', href: '#' },
        { name: 'Instagram', href: '#' },
        { name: 'Facebook', href: '#' },
      ],
      rights: '© All rights reserved · Bonim Atid',
    },

    // ── New site sections (real Bonim Atid content) ──────────────────────────
    stats: [
      { value: '16+', label: 'years of combined experience' },
      { value: '46M+', label: 'deal value in the past year' },
      { value: '2,000+', label: 'investors in our community' },
    ],
    headline2: 'Exceptional real-estate deals demand exceptional expertise.',
    partners: {
      heading: 'Our partners',
      logos: [
        { name: 'Shikun & Binui', img: '/images/logos/shikun-binui.webp' },
        { name: 'Tidhar', img: '/images/logos/tidhar.webp' },
        { name: 'Groupinity', img: '/images/logos/groupinity.webp' },
        { name: 'AVIV', img: '/images/logos/aviv.webp' },
        { name: 'Acro', img: '/images/logos/acro.webp' },
        { name: 'Azorim', img: '/images/logos/azorim.webp' },
        { name: 'Golan', img: '/images/logos/golan.webp' },
        { name: 'Arad', img: '/images/logos/arad.webp' },
        { name: 'KTV', img: '/images/logos/ktv.webp' },
        { name: 'Kedem', img: '/images/logos/kedem.webp' },
        { name: 'Captain Invest', img: '/images/logos/captain-invest.webp' },
        { name: 'RE-INVEST', img: '/images/logos/re-invest.webp' },
      ],
    },
    advantages: {
      heading: { lead: 'Discover our', tail: 'advantages' },
      items: [
        {
          title: 'We understand real estate, and people',
          desc: 'We guide you at eye level - listening to your needs and shaping the deal around you, not the other way around.',
        },
        {
          title: '100% professionalism, 0% games',
          desc: 'Every recommendation rests on data, deep due diligence and full transparency. No sales pressure, no empty promises.',
        },
        {
          title: 'We don\u2019t just know \u2014 we execute',
          desc: 'From the first call to the signature we are by your side, turning knowledge into a real, rewarding deal.',
        },
        {
          title: 'No surprises, only certainty',
          desc: 'You know every number and every step in advance. Legal and financial guidance that removes the uncertainty.',
        },
        {
          title: 'Fully focused on Israeli real estate',
          desc: 'We live and breathe the Israeli market, know every area and know exactly where the opportunities are.',
        },
      ],
    },
    process: {
      heading: { lead: 'How it', tail: 'works' },
      steps: [
        { n: '01', title: 'Initial call', desc: 'A short intro call to understand what you are looking for and what fits you.' },
        { n: '02', title: 'Meeting in office or on Zoom', desc: 'A deep-dive meeting where we present relevant opportunities and build a strategy together.' },
        { n: '03', title: 'Choosing & reserving an apartment', desc: 'You choose the right property and we secure an orderly, safe reservation.' },
        { n: '04', title: 'Legal guidance by the group\u2019s attorney', desc: 'The group\u2019s attorney reviews the contract and protects your interests.' },
        { n: '05', title: 'Signing a rewarding deal', desc: 'You sign with full confidence, with all the information in front of you.' },
      ],
    },
    buyerGroups: {
      heading: { lead: 'Our buyer', tail: 'groups' },
      cards: images.buyerCards,
      groups: [
        { city: 'Holon', img: images.buyerCards[0] },
        { city: 'Haifa', img: images.buyerCards[1] },
        { city: 'Tel Aviv', img: images.buyerCards[2] },
        { city: 'Herzliya', img: images.buyerCards[3] },
      ],
    },
    hitech: {
      heading: 'Many of our clients work at leading tech companies',
      logos: [
        { name: 'monday.com', img: '/images/logos/monday.webp' },
        { name: 'Microsoft', img: '/images/logos/microsoft.webp' },
        { name: 'Intel', img: '/images/logos/intel.webp' },
        { name: 'Amazon', img: '/images/logos/amazon.webp' },
        { name: 'Payoneer', img: '/images/logos/payoneer.webp' },
        { name: 'Logz.io', img: '/images/logos/logz-io.webp' },
        { name: 'Wix', img: '/images/logos/wix.webp' },
        { name: 'Playtika', img: '/images/logos/playtika.webp' },
        { name: 'Moon Active', img: '/images/logos/moon-active.webp' },
      ],
    },
    countdown: {
      lead: 'The webinar starts in',
      started: 'The webinar has started',
      units: {
        days: 'Days',
        hours: 'Hours',
        minutes: 'Minutes',
        seconds: 'Seconds',
      },
    },
    floatingCta: {
      label: 'Join the webinar',
      ariaLabel: 'Join the webinar - click to register',
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

// Hero - { title, subhead, cta }
export const hero = {
  title: he.hero.title,
  subhead: he.hero.subhead,
  cta: he.hero.cta,
} as const

// WhyFind - { label, heading: { lead, tail }, body }
export const whyFind = {
  label: he.brand,
  heading: { lead: he.arrows.lead, tail: he.arrows.tail },
  body: he.founders.intro,
} as const

// ChevronStrip - { heading: { lead, tail }, images }
export const chevronStrip = {
  heading: { lead: he.arrows.lead, tail: he.arrows.tail },
  images: images.chevron,
} as const

// RewiredSteps - { intro: { lead, tail }, title: { lead, tail }, cta, steps[] }
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

// OwnYourCareer - { label, heading: { lead, tail }, body }
export const ownYourCareer = {
  label: he.founders.heading.lead,
  heading: { lead: he.founders.heading.lead, tail: he.founders.heading.tail },
  body: `${he.founders.people[0].name} - ${he.founders.people[0].bio} ${he.founders.people[1].name} - ${he.founders.people[1].bio} ${he.founders.intro}`,
} as const

// Testimonials - { heading: { lead, tail }, items: Testimonial[] }
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

// Services - { label, heading: { lead, tail }, rows: ServiceRow[], closing, cta }
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

// SupportBeyond - { heading: { lead, tail }, intro: { lead, tail }, cta, cards: SupportCard[] }
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

// Blog - { posts: BlogPost[] }
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

// CtaFooter - { ctaBand, newsletter, contact, navCols, social }
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
