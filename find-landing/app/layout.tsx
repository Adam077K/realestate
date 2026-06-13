import type { Metadata } from 'next'
import { Onest, Hanken_Grotesk } from 'next/font/google'
import './globals.css'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'

// Display face: Onest - a tight, near-zero-tracking neo-grotesk that reads
// close to the reference's Helvetica/Sohne-like headings (see frame_034, frame_019).
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

export const metadata: Metadata = {
  title: 'FIND Real Estate',
  description: 'Expert agents. Real guidance. A clear path to find what\'s next.',
  openGraph: {
    title: 'FIND Real Estate',
    description: 'Expert agents. Real guidance. A clear path to find what\'s next.',
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
      lang="en"
      className={`${onest.variable} ${hankenGrotesk.variable}`}
    >
      <body>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
