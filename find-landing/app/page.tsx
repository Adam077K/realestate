import Nav from '@/components/layout/Nav'
import Hero from '@/components/sections/Hero'
import ChevronStrip from '@/components/sections/ChevronStrip'
import RewiredSteps from '@/components/sections/RewiredSteps'
import OwnYourCareer from '@/components/sections/OwnYourCareer'
import Services from '@/components/sections/Services'
import Testimonials from '@/components/sections/Testimonials'
import SupportBeyond from '@/components/sections/SupportBeyond'
import CtaFooter from '@/components/sections/CtaFooter'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ChevronStrip />
        <RewiredSteps />
        <OwnYourCareer />
        <Services />
        <Testimonials />
        <SupportBeyond />
        <CtaFooter />
      </main>
    </>
  )
}
