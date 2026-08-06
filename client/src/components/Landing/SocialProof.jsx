import React from 'react'
import { Reveal } from './primitives'

const SocialProof = () => {
  return (
    <section className='relative bg-ivory py-28 md:py-44'>
      <div className='max-w-[1500px] mx-auto px-6 md:px-12'>
        <Reveal>
          <div className='max-w-5xl mx-auto text-center'>
            <p className='label-arch'>WHAT PROPERTY TEAMS SAY</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <blockquote className='max-w-5xl mx-auto mt-14 text-center'>
            <p className='font-serif text-[28px] sm:text-4xl md:text-[44px] leading-[1.3] tracking-[-0.01em] text-charcoal'>
              “Manāra turned an entire property marketing workflow into one
              clear, controlled experience.”
            </p>
            <div className='mt-12 flex items-center justify-center'>
              <span className='h-px w-10 bg-manara' />
            </div>
            <footer className='mt-8'>
              <p className='text-[13px] font-semibold text-charcoal'>
                Rania Al Suwaidi
              </p>
              <p className='mt-1.5 text-[10px] font-medium tracking-[0.3em] uppercase text-stone'>
                Head of Marketing — Meridian Properties, Dubai
              </p>
            </footer>
          </blockquote>
        </Reveal>
      </div>
    </section>
  )
}

export default SocialProof
