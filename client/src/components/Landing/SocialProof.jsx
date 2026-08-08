import React from 'react'
import { Reveal } from './primitives'

const SocialProof = () => {
  return (
    <section className='relative bg-ivory py-20 md:py-28'>
      <div className='max-w-[1500px] mx-auto px-6 md:px-12'>
        <div className='grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16'>
          {/* Label + attribution */}
          <Reveal className='order-2 lg:order-1'>
            <div className='lg:border-t lg:border-beige lg:pt-8'>
              <p className='label-arch'>WHAT PROPERTY TEAMS SAY</p>
              <div className='mt-8 flex items-center gap-4 lg:flex-col lg:items-start'>
                <span className='flex h-11 w-11 items-center justify-center rounded-full bg-manara/10 font-serif text-lg text-manara'>
                  R
                </span>
                <div>
                  <p className='text-[13px] font-semibold text-charcoal'>
                    Rania Al Suwaidi
                  </p>
                  <p className='mt-1 text-[10px] font-medium tracking-[0.3em] uppercase text-stone'>
                    Head of Marketing — Meridian Properties, Dubai
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Quote */}
          <Reveal delay={0.1} className='order-1 lg:order-2'>
            <blockquote>
              <p className='font-serif text-[26px] sm:text-3xl md:text-[38px] leading-[1.25] tracking-[-0.01em] text-charcoal'>
                “Manāra turned an entire property marketing workflow into one
                clear, controlled experience.”
              </p>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default SocialProof