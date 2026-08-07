// File: client/src/pages/Home/HomePage.jsx
import Agencies from '@/components/Landing/Agencies'
import BuyerPage from '@/components/Landing/BuyerPage'
import DesignConcepts from '@/components/Landing/DesignConcepts'
import FinalCTA from '@/components/Landing/FinalCTA'
import FloorPlanSection from '@/components/Landing/FloorPlanSection'
import HeroSection from '@/components/Home/HeroSection'
import LandingFooter from '@/components/Landing/LandingFooter'
import ListingMedia from '@/components/Landing/ListingMedia'
import SocialProof from '@/components/Landing/SocialProof'
import ThreeDSection from '@/components/Landing/ThreeDSection'
import Transformation from '@/components/Landing/Transformation'
import Workspace from '@/components/Landing/Workspace'
import Lenis from '@studio-freight/lenis'
import React, { useEffect } from 'react'

const HomePage = () => {
  useEffect(() => {
    if (window.innerWidth < 1024) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    })

    let rafId
    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className='relative bg-ivory'>
      <main>
        <HeroSection />
        <Transformation />
        <FloorPlanSection />
        <ThreeDSection />
        <ListingMedia />
        <Workspace />
        <DesignConcepts />
        <BuyerPage />
        <Agencies />
        <SocialProof />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  )
}

export default HomePage
