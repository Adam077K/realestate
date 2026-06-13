import Nav from '@/components/layout/Nav'
import Hero from '@/components/sections/Hero'
import Stats from '@/components/sections/Stats'
import ChevronStrip from '@/components/sections/ChevronStrip'
import RewiredSteps from '@/components/sections/RewiredSteps'
import OwnYourCareer from '@/components/sections/OwnYourCareer'
import Partners from '@/components/sections/Partners'
import Services from '@/components/sections/Services'
import Testimonials from '@/components/sections/Testimonials'
import BuyerGroups from '@/components/sections/BuyerGroups'
import Hitech from '@/components/sections/Hitech'
import SupportBeyond from '@/components/sections/SupportBeyond'
import CtaFooter from '@/components/sections/CtaFooter'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <RewiredSteps />
        <ChevronStrip />
        <OwnYourCareer />
        <Partners />
        <Services />
        <Testimonials />
        <BuyerGroups />
        <Hitech />
        <SupportBeyond />
        <CtaFooter />
      </main>
    </>
  )
}
