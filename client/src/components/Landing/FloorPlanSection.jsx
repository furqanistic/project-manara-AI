import React from 'react'
import { Label, Reveal } from './primitives'

const SOURCE_PLAN = '/Home/floor-plan-source-survey.png'
const REFINED_PLAN = '/Home/transformation/stage-02-matching-floor-plan.png'

const FloorPlanSection = () => {
  return (
    <section className='relative bg-ivory py-24 md:py-36 overflow-hidden'>
      <div className='max-w-[1500px] mx-auto px-6 md:px-12'>
        {/* Header */}
        <div className='grid lg:grid-cols-12 gap-10 items-end mb-16 md:mb-24'>
          <div className='lg:col-span-8'>
            <Reveal>
              <Label>01 / FLOOR-PLAN INTELLIGENCE</Label>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className='mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.06] tracking-[-0.01em] text-charcoal'>
                Accurate plans.
                <br />
                Refined for presentation.
              </h2>
            </Reveal>
          </div>
          <div className='lg:col-span-4'>
            <Reveal delay={0.16}>
              <p className='text-[15px] leading-[1.85] text-stone'>
                Transform uploaded plans into editable, validated, and branded
                property visuals prepared for portals, brochures, presentations,
                and 3D generation.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Original vs refined comparison */}
        <Reveal delay={0.1}>
          <div className='grid md:grid-cols-2 border border-beige bg-white'>
            {/* Original */}
            <div className='relative p-5 md:p-8'>
              <div className='flex items-center justify-between mb-6'>
                <p className='label-meta'>SOURCE DRAWING</p>
                <span className='inline-flex items-center gap-2 text-[9px] font-semibold tracking-[0.25em] uppercase text-stone'>
                  <span className='w-1.5 h-1.5 rounded-full bg-stone' />
                  AS RECEIVED
                </span>
              </div>
              <figure className='relative aspect-[16/10] overflow-hidden border border-charcoal/10 bg-[#f4f1eb] shadow-[0_16px_40px_-28px_rgba(23,22,20,0.45)]'>
                <img
                  src={SOURCE_PLAN}
                  alt='Original surveyor CAD drawing of the curved Crescent Residence penthouse'
                  className='h-full w-full object-contain'
                  loading='lazy'
                />
              </figure>
            </div>
            {/* Refined */}
            <div className='relative p-5 md:p-8 border-t md:border-t-0 md:border-l border-beige'>
              <div className='flex items-center justify-between mb-6'>
                <p className='label-arch'>REFINED MANĀRA PLAN</p>
                <span className='inline-flex items-center gap-2 text-[9px] font-semibold tracking-[0.25em] uppercase text-manara'>
                  <span className='w-1.5 h-1.5 rounded-full bg-manara' />
                  VALIDATED
                </span>
              </div>
              <figure className='relative aspect-[16/10] overflow-hidden border border-manara/15 bg-[#f8f4ed] shadow-[0_18px_45px_-28px_rgba(23,22,20,0.35)]'>
                <img
                  src={REFINED_PLAN}
                  alt='Refined presentation-ready floor plan of the same Crescent Residence penthouse'
                  className='h-full w-full object-contain'
                  loading='lazy'
                />
              </figure>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  )
}

export default FloorPlanSection
