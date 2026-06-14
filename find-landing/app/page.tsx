import BonimNavbar from '@/components/layout/BonimNavbar'
import Hero from '@/components/sections/Hero'
import ChevronStrip from '@/components/sections/ChevronStrip'
import RewiredSteps from '@/components/sections/RewiredSteps'
import SupportBeyond from '@/components/sections/SupportBeyond'
import Countdown from '@/components/sections/Countdown'
import OwnYourCareer from '@/components/sections/OwnYourCareer'
import Partners from '@/components/sections/Partners'
import Services from '@/components/sections/Services'
import Testimonials from '@/components/sections/Testimonials'
import Stats from '@/components/sections/Stats'
import BuyerGroups from '@/components/sections/BuyerGroups'
import Hitech from '@/components/sections/Hitech'
import CtaFooter from '@/components/sections/CtaFooter'

export default function Home() {
  return (
    <>
      <BonimNavbar />
      {/* Dark scrim - sits behind BonimNavbar (z-[49]), above hero sky (z-0).
          Gives the transparent white navbar legibility at scroll-0 over the bright
          sky gradient. Gradient from rgba(15,22,40,0.38) → transparent over 120px.
          pointer-events-none so it doesn't block clicks. */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '120px',
          zIndex: 49,
          background: 'linear-gradient(to bottom, rgba(15,22,40,0.38) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      <main>
        <Hero />
        <RewiredSteps />
        <SupportBeyond />
        <Countdown />
        <ChevronStrip />
        <OwnYourCareer />
        <Partners />
        <Services />
        <Testimonials />
        <Stats />
        <BuyerGroups />
        <Hitech />
        <CtaFooter />
      </main>
    </>
  )
}
