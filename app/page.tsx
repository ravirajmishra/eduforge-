'use client'
import { useRef } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import GeneratorForm from '@/components/GeneratorForm'
import FeaturesSection from '@/components/FeaturesSection'
import Footer from '@/components/Footer'

export default function Home() {
  const generatorRef = useRef<HTMLDivElement>(null)

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="min-h-screen bg-white mesh-bg">
      <Navbar />
      <Hero onScrollToGenerator={scrollToGenerator} />
      <HowItWorks />
      <div ref={generatorRef}>
        <GeneratorForm />
      </div>
      <FeaturesSection />
      <Footer />
    </main>
  )
}
