import { ArrowRight } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Label, Reveal } from './primitives'

const FinalCTA = () => {
  return (
    <section className='relative h-[100svh] min-h-[620px] overflow-hidden bg-charcoal'>
      <motion.img
        initial={{ scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80&auto=format'
        alt='Luxury residence at dusk'
        className='absolute inset-0 w-full h-full object-cover'
      />
      <div className='absolute inset-0 bg-charcoal/70' />
      <div className='absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/40' />

      <div className='relative z-10 h-full flex flex-col items-center justify-center text-center px-6'>
        <Reveal>
          <Label dark>CREATE / PRESENT / CONVERT</Label>
        </Reveal>
        <Reveal delay={0.12} y={40}>
          <h2 className='mt-8 font-serif text-ivory text-[40px] leading-[1.08] sm:text-6xl md:text-7xl lg:text-[84px] tracking-[-0.015em] max-w-[16ch] mx-auto'>
            Every property deserves a better presentation.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className='mt-8 text-[15px] md:text-base text-[#CFC7BB] max-w-md leading-[1.85] mx-auto'>
            Build its complete visual and sales experience with Manāra.
          </p>
        </Reveal>
        <Reveal delay={0.28}>
          <div className='mt-11 flex flex-wrap items-center justify-center gap-4'>
            <Link
              to='/auth?type=signup'
              className='inline-flex items-center gap-2.5 bg-manara text-white text-[13px] font-semibold tracking-wide px-8 py-4 rounded-lg hover:bg-[#a08163] transition-colors duration-300'
            >
              Start Creating
              <ArrowRight size={16} />
            </Link>
            <Link
              to='/auth?type=signup'
              className='inline-flex items-center text-[13px] font-semibold tracking-wide px-8 py-4 rounded-lg border border-ivory/30 text-ivory hover:border-ivory/70 hover:bg-ivory/5 transition-colors duration-300'
            >
              Book a Demo
            </Link>
          </div>
        </Reveal>
      </div>

      <p className='absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.35em] uppercase text-ivory/40'>
        MANĀRA — AI PROPERTY MARKETING WORKSPACE
      </p>
    </section>
  )
}

export default FinalCTA
