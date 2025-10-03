// File: client/src/pages/Home/HomePage.jsx
import AIOutputsSection from '@/components/Home/AIOutputsSection'
import HeroSection from '@/components/Home/HeroSection'
import ImageCollageSection from '@/components/Home/ImageCollageSection'
import MissionSection from '@/components/Home/MissionSection'
import ModernBeforeAfterSection from '@/components/Home/ModernBeforeAfterSection'
import CompactFooter from '@/components/Layout/CompactFooter'
import TopBar from '@/components/Layout/Topbar'
import Lenis from '@studio-freight/lenis'
import { motion } from 'framer-motion'
import React, { useEffect, useRef } from 'react'

const HomePage = () => {
  const lenisRef = useRef(null)

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    lenisRef.current = lenis

    // Animation frame loop for Lenis
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Cleanup
    return () => {
      lenis.destroy()
    }
  }, [])

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  // Section variants for staggered entrance
  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 60,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.div
      variants={pageVariants}
      initial='initial'
      animate='animate'
      className='relative bg-black'
    >
      {/* Navigation */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <TopBar />
      </motion.div>

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content Sections */}
      <motion.main className='relative z-10'>
        {/* Image Collage Section */}
        <motion.section
          variants={sectionVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
          className='relative'
        >
          <ImageCollageSection />
        </motion.section>

        {/* Before/After Section */}
        <motion.section
          variants={sectionVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
          className='relative'
        >
          <ModernBeforeAfterSection />
        </motion.section>

        {/* AI Outputs Section */}
        <motion.section
          variants={sectionVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
          className='relative'
        >
          <AIOutputsSection />
        </motion.section>

        {/* Mission Section */}
        <motion.section
          variants={sectionVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
          className='relative'
        >
          <MissionSection />
        </motion.section>
      </motion.main>

      {/* Footer */}

      <CompactFooter />

      {/* Scroll Progress Indicator */}
      <motion.div
        className='fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#937c60] via-[#a68970] to-[#937c60] origin-left z-50'
        style={{
          scaleX: 0,
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Background Gradient Overlay */}
      <div className='fixed inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black pointer-events-none' />
    </motion.div>
  )
}

export default HomePage
