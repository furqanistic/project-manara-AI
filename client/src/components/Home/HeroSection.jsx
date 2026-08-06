import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { EASE } from '@/components/Landing/ease'
import BoomerangVideoBg from './BoomerangVideoBg'

const STUDIO_ITEMS = [
  { name: '3D Renders', href: '/visualizer' },
  { name: 'Floor Plans', href: '/floorplans' },
  { name: 'AI Designs', href: '/moodboard' },
]

const NAV_LINKS = [
  { label: 'Projects', href: '/projects' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
]

const FEATURES = [
  {
    number: '01',
    label: '3D Renders',
    href: '/visualizer',
    copy: 'Photorealistic visuals of your space, from any photo.',
  },
  {
    number: '02',
    label: 'Floor Plans',
    href: '/floorplans',
    copy: 'Precise layouts drawn to scale, ready to act on.',
  },
  {
    number: '03',
    label: 'Shop Lists',
    href: '/moodboard',
    copy: 'Curated furniture & finishes, buyable in one click.',
  },
]

const TopNav = () => {
  const [studioOpen, setStudioOpen] = useState(false)
  const studioRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (studioRef.current && !studioRef.current.contains(event.target)) {
        setStudioOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className='fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 md:px-14 py-3.5 sm:py-4 bg-ivory/85 backdrop-blur-md border-b border-beige'>
      <div className='flex items-center justify-between'>
        <Link to='/' className='flex items-center'>
          <img
            src='/logoicon.png'
            alt='Manāra logo'
            className='h-8 w-auto object-contain'
          />
        </Link>

        <nav className='hidden md:flex items-center gap-8'>
          {/* Studio Dropdown */}
          <div className='relative' ref={studioRef}>
            <button
              onClick={() => setStudioOpen((prev) => !prev)}
              className='flex items-center gap-1.5 text-sm text-charcoal/70 hover:text-manara transition-colors duration-200'
            >
              Studio
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  studioOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {studioOpen && (
              <div className='absolute top-full left-0 mt-2 w-52 bg-ivory border border-beige rounded-lg shadow-[0_20px_50px_rgba(24,23,21,0.1)] p-1.5'>
                {STUDIO_ITEMS.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setStudioOpen(false)}
                    className='flex items-center px-3 py-2.5 rounded text-sm font-medium text-charcoal/70 hover:text-manara hover:bg-white/60 transition-all'
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className='text-sm text-charcoal/70 hover:text-manara transition-colors duration-200'
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          to='/moodboard'
          className="hidden md:inline-flex items-center bg-manara text-white text-sm font-medium rounded-full px-6 py-3 hover:bg-[#7a6650] transition-colors duration-200"
        >
          Start Creating
        </Link>
        <Link
          to='/moodboard'
          className="md:hidden bg-manara text-white text-sm font-medium rounded-full px-5 py-2.5 hover:bg-[#7a6650] transition-colors duration-200"
        >
          Start
        </Link>
      </div>
    </header>
  )
}

const HeroSection = () => {
  return (
    <>
      <TopNav />

      {/* Hero — cinematic background */}
      <section className='relative flex flex-col items-center min-h-screen'>
        <BoomerangVideoBg />

        {/* Hero Copy */}
        <div className='relative z-10 flex flex-col items-center text-center pt-24 sm:pt-26 md:pt-32 px-4 sm:px-6'>
          <h1 className='font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight text-charcoal font-normal [text-shadow:0_1px_2px_rgba(244,240,232,0.8),0_8px_32px_rgba(244,240,232,0.5)]'>
            From moodboard
            <br />
            to move-in.
          </h1>

          <Link
            to='/moodboard'
            className="mt-8 sm:mt-10 md:mt-12 bg-manara text-white text-sm font-medium rounded-full px-6 sm:px-8 py-3 sm:py-3.5 hover:bg-[#7a6650] transition-colors duration-200"
          >
            Start Creating
          </Link>
        </div>

        {/* Bottom Info Panel */}
        <div className='relative z-10 mt-auto w-full max-w-6xl px-4 sm:px-6 pb-5 sm:pb-8'>
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 }}
            className='bg-ivory/95 backdrop-blur-md border border-beige rounded-2xl shadow-[0_40px_90px_-30px_rgba(24,23,21,0.45)] px-5 sm:px-8 md:px-12 pt-8 sm:pt-10 md:pt-12 pb-5 sm:pb-6'
          >
            {/* Row 1 */}
            <div className='grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-16'>
              <div>
                <p className='label-arch'>What do we do?</p>
                <h2 className='mt-3 text-3xl sm:text-4xl md:text-[44px] font-serif font-normal leading-[1.08] tracking-tight text-charcoal'>
                  Imagination,
                  <br className='hidden sm:inline' />
                  executed.
                </h2>
              </div>

              <div className='flex flex-col justify-end gap-4'>
                <p className='text-sm md:text-[15px] text-stone leading-relaxed'>
                  AI-powered interior design for Dubai and the UAE. Share a
                  photo of your space and get photorealistic 3D renders,
                  precise floor plans, and curated shop lists — in under two
                  hours.
                </p>
                <p className='label-meta'>Dubai · UAE · Under 2 hours</p>
              </div>
            </div>

            {/* Hairline Divider */}
            <div className='mt-8 sm:mt-10 md:mt-12 h-px bg-beige w-full' />

            {/* Row 2 — Prominent Feature Tiles */}
            <div className='grid sm:grid-cols-3 gap-3 sm:gap-4 mt-5 sm:mt-6'>
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.number}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.3 + i * 0.1 }}
                >
                  <Link
                    to={feature.href}
                    className='group relative flex h-full flex-col overflow-hidden rounded-xl bg-charcoal px-6 py-6 sm:py-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-16px_rgba(24,23,21,0.5)]'
                  >
                    <div className='relative flex items-start justify-between'>
                      <span className='font-serif text-2xl text-manara/80 transition-colors duration-300 group-hover:text-[#c3a886]'>
                        {feature.number}
                      </span>
                      <span className='flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-all duration-300 group-hover:border-manara group-hover:bg-manara group-hover:text-white'>
                        <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5' />
                      </span>
                    </div>

                    <div className='relative mt-9'>
                      <p className='text-[17px] font-semibold tracking-tight text-ivory'>
                        {feature.label}
                      </p>
                      <p className='mt-2 text-[13px] leading-relaxed text-[#B5ACA0]'>
                        {feature.copy}
                      </p>
                    </div>

                    <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-colors duration-500 group-hover:from-manara/20 group-hover:to-transparent' />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default HeroSection