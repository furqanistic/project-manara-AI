import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, Play } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import TopBar from '@/components/Layout/Topbar'
import { EASE } from '@/components/Landing/ease'
import BoomerangVideoBg from './BoomerangVideoBg'

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

const HeroSection = () => {
  return (
    <>
      <TopBar />

      {/* Hero — cinematic background */}
      <section className='relative flex flex-col items-center min-h-screen'>
        <BoomerangVideoBg />

        {/* Hero Copy */}
        <div className='relative z-10 flex flex-col items-center text-center pt-20 sm:pt-26 md:pt-32 px-4 sm:px-6'>
          <h1 className='font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight text-charcoal font-normal [text-shadow:0_1px_2px_rgba(244,240,232,0.8),0_8px_32px_rgba(244,240,232,0.5)]'>
            From moodboard
            <br />
            to move-in.
          </h1>

          <div className='mt-8 grid w-full max-w-sm gap-3 pb-14 sm:mt-10 sm:mb-0 sm:flex sm:w-auto sm:max-w-none sm:items-center sm:justify-center sm:gap-4 sm:pb-18 md:mt-12 md:pb-24'>
            <Link
              to='/moodboard'
              className='inline-flex items-center justify-center gap-2.5 rounded-full bg-manara col-span-2 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_-16px_rgba(23,22,20,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#7a6650] sm:col-auto sm:px-7 sm:py-3.5'
            >
              Start Creating
              <ArrowRight className='h-4 w-4' />
            </Link>

            <a
              href='#product'
              className='inline-flex items-center justify-center gap-2.5 rounded-full border border-charcoal/20 bg-ivory/75 px-6 py-3 text-sm font-semibold text-charcoal backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-charcoal/40 hover:bg-ivory sm:px-7 sm:py-3.5'
            >
              <Play className='h-3.5 w-3.5 fill-current' />
              Watch Demo
            </a>

            <Link
              to='/auth?type=signup'
              className='inline-flex items-center justify-center gap-2.5 rounded-full border border-charcoal/20 bg-white/45 px-6 py-3 text-sm font-semibold text-charcoal backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-charcoal/40 hover:bg-white/75 sm:px-7 sm:py-3.5'
            >
              <CalendarDays className='h-4 w-4' />
              Book a Demo
            </Link>
          </div>
        </div>

        {/* Bottom Info Panel */}
        <div className='relative z-10 mt-auto w-full max-w-6xl px-4 sm:px-6 pb-5 sm:pb-8'>
<motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.15 }}
          className='bg-ivory/95 backdrop-blur-md border border-beige rounded-2xl shadow-[0_40px_90px_-30px_rgba(24,23,21,0.45)] px-5 sm:px-8 md:px-12 pt-5 sm:pt-10 md:pt-12 pb-4 sm:pb-6'
        >
          {/* Row 1 */}
          <div className='grid gap-3 md:grid-cols-2 md:gap-8 lg:gap-16'>
            <div>
              <p className='label-arch'>What do we do?</p>
              <h2 className='mt-1.5 sm:mt-3 text-2xl sm:text-4xl md:text-[44px] font-serif font-normal leading-[1.1] tracking-tight text-charcoal'>
                Imagination,
                <br className='hidden sm:inline' />
                executed.
              </h2>
            </div>

            <div className='flex flex-col justify-end gap-2.5 sm:gap-4'>
              <p className='text-[13px] sm:text-sm md:text-[15px] text-stone leading-relaxed'>
                AI-powered interior design for Dubai and the UAE. Share a
                photo of your space and get photorealistic 3D renders,
                precise floor plans, and curated shop lists — in under two
                hours.
              </p>
              <p className='label-meta'>Dubai · UAE · Under 2 hours</p>
            </div>
          </div>

          {/* Hairline Divider */}
          <div className='mt-4 sm:mt-10 md:mt-12 h-px bg-beige w-full' />

          {/* Row 2 — Prominent Feature Tiles */}
          <div className='grid sm:grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-6'>
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.number}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.3 + i * 0.1 }}
                >
<Link
                    to={feature.href}
                    className='group relative flex h-full w-full items-center gap-3 overflow-hidden rounded-xl bg-charcoal px-4 py-3.5 sm:flex-col sm:items-stretch sm:px-6 sm:py-7 transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-16px_rgba(24,23,21,0.5)]'
                  >
                    <div className='relative flex shrink-0 items-center justify-between gap-4 sm:block sm:w-auto'>
                      <span className='font-serif text-2xl text-manara/80 transition-colors duration-300 group-hover:text-[#c3a886] sm:text-2xl'>
                        {feature.number}
                      </span>
                      <span className='flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-all duration-300 group-hover:border-manara group-hover:bg-manara group-hover:text-white sm:pointer-events-none sm:absolute sm:right-0 sm:top-0'>
                        <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5' />
                      </span>
                    </div>

                    <div className='relative min-w-0 sm:mt-9'>
                      <p className='text-[17px] font-semibold tracking-tight text-ivory'>
                        {feature.label}
                      </p>
                      <p className='mt-1 text-[13px] leading-relaxed text-[#B5ACA0] sm:mt-2'>
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
