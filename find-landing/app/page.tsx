import Nav from '@/components/layout/Nav'
import Hero from '@/components/sections/Hero'
import WhyFind from '@/components/sections/WhyFind'
import ChevronStrip from '@/components/sections/ChevronStrip'
import RewiredSteps from '@/components/sections/RewiredSteps'
import OwnYourCareer from '@/components/sections/OwnYourCareer'
import Testimonials from '@/components/sections/Testimonials'
import Services from '@/components/sections/Services'
import SupportBeyond from '@/components/sections/SupportBeyond'
import Blog from '@/components/sections/Blog'
import CtaFooter from '@/components/sections/CtaFooter'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <WhyFind />
        <ChevronStrip />
        <RewiredSteps />
        <OwnYourCareer />
        <Testimonials />
        <Services />
        <SupportBeyond />
        <Blog />
        <CtaFooter />
      </main>
    </>
  )
}
