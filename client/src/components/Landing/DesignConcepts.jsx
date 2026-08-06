import React from 'react'
import { Label, Reveal } from './primitives'

const MATERIALS = [
  { name: 'Walnut', hex: '#6B4F35' },
  { name: 'Travertine', hex: '#D8CDBE' },
  { name: 'Linen', hex: '#EDE6DA' },
  { name: 'Brushed Brass', hex: '#B3946B' },
  { name: 'Soft Plaster', hex: '#D5CCBE' },
]

const PALETTE = ['#8D775E', '#171614', '#F5F2EC', '#DED6CA', '#AAA196']

const FURNITURE = [
  'Loose linen sofa — 3 seater',
  'Oak & brass coffee table',
  'Bouclé armchairs ×2',
]

const DesignConcepts = () => {
  return (
    <section className='relative bg-ivory py-24 md:py-36'>
      <div className='max-w-[1500px] mx-auto px-6 md:px-12'>
        {/* Header */}
        <div className='grid lg:grid-cols-12 gap-10 items-end mb-16 md:mb-24'>
          <div className='lg:col-span-8'>
            <Reveal>
              <Label>05 / DESIGN CONCEPTS</Label>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className='mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.06] tracking-[-0.01em] text-charcoal'>
                Sell more than dimensions. Sell the possibility.
              </h2>
            </Reveal>
          </div>
          <div className='lg:col-span-4'>
            <Reveal delay={0.16}>
              <p className='text-[15px] leading-[1.85] text-stone'>
                For empty, unfinished, and off-plan properties, Manāra builds a
                complete interior story — so buyers can see themselves inside.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Editorial board */}
        <div className='grid lg:grid-cols-12 gap-px bg-beige border border-beige'>
          {/* Main concept image */}
          <div className='lg:col-span-7 relative bg-white'>
            <Reveal className='h-full'>
              <div className='relative h-full min-h-[420px] md:min-h-[560px]'>
                <img
                  src='https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80&auto=format'
                  alt='Finished interior design concept for an off-plan property'
                  className='absolute inset-0 w-full h-full object-cover'
                />
                <div className='absolute bottom-0 left-0 right-0 p-5 md:p-7 bg-gradient-to-t from-charcoal/70 to-transparent'>
                  <p className='text-[10px] tracking-[0.3em] uppercase text-ivory/80'>
                    CONCEPT 02 — LIVING ROOM, VILLA 04
                  </p>
                  <p className='mt-1 text-[9px] tracking-[0.3em] uppercase text-[#c3a886]'>
                    RENDER 07 OF 12
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Design story rail */}
          <div className='lg:col-span-5 bg-white p-6 md:p-10 flex flex-col'>
            <Reveal>
              <p className='label-meta'>THE DESIGN STORY</p>
              <p className='mt-5 font-serif text-[19px] leading-[1.7] text-charcoal'>
                The palette is drawn from the Gulf landscape — warm stone,
                sun-bleached linen, dark walnut. Furniture stays low and
                relaxed. Light arrives late, and soft.
              </p>
            </Reveal>

            {/* Materials */}
            <Reveal delay={0.1}>
              <div className='mt-10'>
                <p className='label-meta mb-4'>MATERIAL DIRECTION</p>
                <div className='flex gap-3'>
                  {MATERIALS.map((m) => (
                    <div key={m.name} className='flex-1'>
                      <div
                        className='w-full aspect-square rounded-[8px] border border-beige'
                        style={{ background: m.hex }}
                      />
                      <p className='mt-2 text-[8px] font-semibold tracking-[0.18em] uppercase text-stone text-center leading-relaxed'>
                        {m.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Palette */}
            <Reveal delay={0.16}>
              <div className='mt-10'>
                <p className='label-meta mb-4'>RESTRAINED PALETTE</p>
                <div className='flex h-10'>
                  {PALETTE.map((c, i) => (
                    <div
                      key={c}
                      className={`flex-1 ${i > 0 ? 'border-l border-white/40' : ''}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Furniture + light */}
            <Reveal delay={0.2}>
              <div className='mt-10 grid grid-cols-2 gap-10'>
                <div>
                  <p className='label-meta mb-4'>FURNITURE</p>
                  <div className='flex flex-col'>
                    {FURNITURE.map((f, i) => (
                      <div
                        key={f}
                        className='flex items-baseline gap-3 py-2.5 border-b border-beige'
                      >
                        <span className='text-[9px] font-semibold text-manara'>
                          0{i + 1}
                        </span>
                        <span className='text-[12.5px] text-charcoal/80'>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className='label-meta mb-4'>LIGHTING MOOD</p>
                  <p className='text-[13px] leading-[1.8] text-stone'>
                    Warm 2700K throughout — layered downlight, sculptural floor
                    lamps, and one late-afternoon shadow line.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DesignConcepts
