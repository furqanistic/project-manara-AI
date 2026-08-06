import React from 'react'
import { FloorPlanArt } from './FloorPlanArt'
import { Hairline, Label, Reveal } from './primitives'

const CAPABILITIES = [
  'Room-by-room validation',
  'Measured annotations',
  'North orientation',
  'Furniture placement',
  'Original-versus-refined comparison',
  'Branded export styles',
]

const EXPORTS = ['PORTAL READY', 'BROCHURE', 'PRESENTATION', '3D SOURCE']

const FloorPlanSection = () => {
  return (
    <section className='relative bg-ivory py-24 md:py-36 overflow-hidden'>
      <div className='max-w-[1500px] mx-auto px-6 md:px-12'>
        {/* Header */}
        <div className='grid lg:grid-cols-12 gap-10 items-end mb-16 md:mb-24'>
          <div className='lg:col-span-8'>
            <Reveal>
              <Label>02 / FLOOR-PLAN INTELLIGENCE</Label>
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
              <div className='rotate-[-1.2deg] opacity-80'>
                <FloorPlanArt refined={false} className='w-full h-auto' />
              </div>
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
              <FloorPlanArt refined className='w-full h-auto' />
            </div>
          </div>
        </Reveal>

        {/* Capabilities + export styles */}
        <div className='grid lg:grid-cols-12 gap-10 lg:gap-16 mt-16 md:mt-24'>
          <div className='lg:col-span-5'>
            <Reveal>
              <Label>WHAT MANĀRA CORRECTS</Label>
            </Reveal>
            <div className='mt-8 flex flex-col'>
              {CAPABILITIES.map((c, i) => (
                <Reveal key={c} delay={i * 0.05}>
                  <div className='flex items-baseline gap-5 py-3.5 border-b border-beige group'>
                    <span className='text-[10px] font-semibold text-manara w-6'>
                      0{i + 1}
                    </span>
                    <span className='text-[15px] text-charcoal/80 group-hover:text-manara transition-colors duration-300'>
                      {c}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className='lg:col-span-7'>
            <Reveal>
              <Label>BRANDED EXPORT STYLES</Label>
            </Reveal>
            <div className='grid grid-cols-2 gap-px bg-beige border border-beige mt-8'>
              {EXPORTS.map((e, i) => (
                <div
                  key={e}
                  className='bg-ivory p-6 md:p-10 flex flex-col justify-between min-h-[140px] md:min-h-[180px] group cursor-default'
                >
                  <span className='text-[10px] font-semibold text-manara'>
                    STYLE 0{i + 1}
                  </span>
                  <span className='font-serif text-xl md:text-2xl text-charcoal group-hover:text-manara transition-colors duration-300'>
                    {e}
                  </span>
                </div>
              ))}
            </div>
            <Reveal delay={0.1}>
              <div className='flex items-center gap-5 mt-6'>
                <span className='w-8 h-px bg-manara' />
                <p className='text-[11px] font-semibold tracking-[0.25em] uppercase text-stone'>
                  YOUR LOGO — YOUR SPACES — YOUR FORMATS
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <Hairline className='mt-20 md:mt-28' />
      </div>
    </section>
  )
}

export default FloorPlanSection
