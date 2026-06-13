import type { Metadata } from 'next'
import { Onest, Hanken_Grotesk, Heebo } from 'next/font/google'
import './globals.css'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { LanguageProvider } from '@/components/providers/LanguageProvider'

// Display face: Onest — a tight, near-zero-tracking neo-grotesk for Latin headings.
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

// Hebrew face: Heebo — a clean, modern Hebrew sans that pairs well with the Latin
// grotesks. Exposed as --font-hebrew and used as the fallback in both the display
// and body font stacks so Hebrew text renders cleanly in every section.
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-hebrew',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'בונים עתיד — וובינר השקעות נדל״ן',
  description:
    'איך לנצל את מצב השוק לטובתכם — וובינר חינם עם עידן פלג ורועי פישמן.',
  openGraph: {
    title: 'בונים עתיד — וובינר השקעות נדל״ן',
    description:
      'איך לנצל את מצב השוק לטובתכם — וובינר חינם עם עידן פלג ורועי פישמן.',
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
      className={`${onest.variable} ${hankenGrotesk.variable} ${heebo.variable}`}
    >
      <body>
        <LanguageProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
