import type { Metadata } from 'next'
import { Onest, Hanken_Grotesk, Assistant } from 'next/font/google'
import './globals.css'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { LanguageProvider } from '@/components/providers/LanguageProvider'

// Display face: Onest - a tight, near-zero-tracking neo-grotesk for Latin headings.
const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken-grotesk',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

// Hebrew face: Assistant - the de-facto premium modern Hebrew sans on high-end
// Israeli sites. Its native Hebrew letterforms are more refined and humanist than
// Rubik's geometric build: open apertures, even rhythm, and a wide weight range
// (300–800) that reads crisp at giant display sizes (hero headline, pillar words,
// footer wordmark) and stays comfortable at body sizes. Pairs cleanly with the
// Onest/Hanken Latin grotesks. Exposed as --font-hebrew; it backs both the display
// and body stacks and leads the Hebrew-display stack so Hebrew renders polished
// everywhere headings, body, giant words, footer wordmark and buttons appear.
const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  variable: '--font-hebrew',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'בונים עתיד - וובינר השקעות נדל״ן',
  description:
    'איך לנצל את מצב השוק לטובתכם - וובינר חינם עם עידן פלג ורועי פישמן.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'בונים עתיד - וובינר השקעות נדל״ן',
    description:
      'איך לנצל את מצב השוק לטובתכם - וובינר חינם עם עידן פלג ורועי פישמן.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${onest.variable} ${hankenGrotesk.variable} ${assistant.variable}`}
    >
      <body>
        <LanguageProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
