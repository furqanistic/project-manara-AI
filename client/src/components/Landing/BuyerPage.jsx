import { ArrowDownToLine, MessageCircle, Phone } from 'lucide-react'
import React from 'react'
import { FloorPlanArt } from './FloorPlanArt'
import { Label, Reveal } from './primitives'

const FACTS = [
  { k: 'BEDS', v: '3' },
  { k: 'BATHS', v: '4' },
  { k: 'SQ FT', v: '2,130' },
  { k: 'PARKING', v: '2' },
]

const BuyerPage = () => {
  return (
    <section className='relative bg-white py-24 md:py-36 overflow-hidden'>
      <div className='max-w-[1500px] mx-auto px-6 md:px-12'>
        {/* Header */}
        <div className='grid lg:grid-cols-12 gap-10 items-end mb-16 md:mb-24'>
          <div className='lg:col-span-8'>
            <Reveal>
              <Label>07 / BUYER-FACING EXPERIENCE</Label>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className='mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.06] tracking-[-0.01em] text-charcoal'>
                Give every property a destination.
              </h2>
            </Reveal>
          </div>
          <div className='lg:col-span-4'>
            <Reveal delay={0.16}>
              <p className='text-[15px] leading-[1.85] text-stone'>
                Share one beautifully branded link containing everything a buyer
                needs to explore the property and contact the right agent.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Device composition */}
        <div className='grid lg:grid-cols-12 gap-10 lg:gap-14 items-center'>
          {/* Desktop browser */}
          <Reveal delay={0.1} y={48} className='lg:col-span-8'>
            <div className='border border-beige rounded-[10px] bg-ivory shadow-[0_60px_140px_-60px_rgba(23,22,20,0.3)] overflow-hidden'>
              {/* Browser chrome */}
              <div className='flex items-center gap-2 px-5 py-3.5 border-b border-beige bg-white'>
                <span className='w-2.5 h-2.5 rounded-full bg-beige' />
                <span className='w-2.5 h-2.5 rounded-full bg-beige' />
                <span className='w-2.5 h-2.5 rounded-full bg-beige' />
                <div className='flex-1 mx-4 bg-ivory border border-beige rounded-full px-4 py-1.5 text-[10px] text-stone tracking-wide'>
                  manara.ai/p/skyline-18
                </div>
                <img src='/logoicon.png' alt='' className='h-4 w-auto' />
              </div>

              {/* Page */}
              <div>
                {/* Hero */}
                <div className='relative'>
                  <img
                    src='https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80&auto=format'
                    alt=''
                    className='w-full h-52 md:h-72 object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent' />
                  <div className='absolute bottom-4 left-5 md:bottom-5 md:left-7'>
                    <p className='text-[8px] tracking-[0.3em] uppercase text-[#c3a886]'>
                      DUBAI MARINA — PENTHOUSE
                    </p>
                    <p className='mt-1 font-serif text-2xl md:text-3xl text-ivory'>
                      Skyline Penthouse 18
                    </p>
                    <p className='mt-1.5 text-[12px] font-semibold text-ivory'>
                      AED 4,200,000
                      <span className='font-normal text-ivory/70'>
                        {' '}
                        — ready to view
                      </span>
                    </p>
                  </div>
                </div>

                {/* Tabs + facts */}
                <div className='px-5 md:px-7 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-beige'>
                  <div className='flex gap-6'>
                    {['Gallery', 'Floor Plan', '3D Tour', 'Brochure'].map(
                      (t, i) => (
                        <span
                          key={t}
                          className={`text-[10px] font-semibold tracking-[0.2em] uppercase pb-2 ${
                            i === 0
                              ? 'text-manara border-b-2 border-manara'
                              : 'text-stone'
                          }`}
                        >
                          {t}
                        </span>
                      )
                    )}
                  </div>
                  <div className='grid grid-cols-4 gap-px bg-beige border border-beige rounded-[8px] overflow-hidden'>
                    {FACTS.map((f) => (
                      <div key={f.k} className='bg-white px-4 py-2 text-center'>
                        <p className='text-[8px] tracking-[0.2em] uppercase text-stone'>
                          {f.k}
                        </p>
                        <p className='text-[12px] font-semibold text-charcoal'>
                          {f.v}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content split */}
                <div className='grid md:grid-cols-5'>
                  <div className='md:col-span-3 p-5 md:p-7 border-b md:border-b-0 md:border-r border-beige'>
                    <p className='label-meta mb-3'>FLOOR PLAN</p>
                    <div className='bg-white border border-beige p-3 md:p-4 rounded-[8px]'>
                      <FloorPlanArt refined className='w-full h-auto' />
                    </div>
                    <div className='flex items-center gap-3 mt-4'>
                      <span className='inline-flex items-center gap-2 bg-manara/10 border border-manara/25 text-manara text-[9px] font-semibold tracking-[0.2em] uppercase px-3.5 py-2 rounded-full'>
                        <ArrowDownToLine size={11} /> BROCHURE PDF
                      </span>
                      <span className='inline-flex items-center gap-2 border border-beige text-stone text-[9px] font-semibold tracking-[0.2em] uppercase px-3.5 py-2 rounded-full'>
                        OPEN 3D VIEWER
                      </span>
                    </div>
                  </div>

                  {/* Enquiry + agent */}
                  <div className='md:col-span-2 p-5 md:p-7'>
                    <p className='label-meta mb-3'>ENQUIRE ABOUT THIS PROPERTY</p>
                    <div className='space-y-2.5'>
                      <div className='border border-beige rounded-[8px] px-4 py-2.5 text-[11px] text-stone'>
                        Full name
                      </div>
                      <div className='border border-beige rounded-[8px] px-4 py-2.5 text-[11px] text-stone'>
                        Phone / WhatsApp
                      </div>
                      <div className='border border-beige rounded-[8px] px-4 py-2.5 text-[11px] text-stone'>
                        I would like a viewing on…
                      </div>
                      <div className='bg-manara text-white text-[11px] font-semibold tracking-wide rounded-[8px] px-4 py-3 text-center'>
                        Send Enquiry
                      </div>
                    </div>

                    <div className='flex items-center gap-3.5 mt-6 pt-5 border-t border-beige'>
                      <div className='w-11 h-11 rounded-full bg-ivory border border-beige flex items-center justify-center text-[11px] font-semibold text-manara'>
                        AM
                      </div>
                      <div className='min-w-0'>
                        <p className='text-[12px] font-semibold text-charcoal'>
                          Aisha Malik
                        </p>
                        <p className='text-[10px] text-stone'>
                          Senior Property Advisor — Marina
                        </p>
                      </div>
                      <MessageCircle
                        size={16}
                        className='ml-auto text-[#128C7E]'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Phone */}
          <Reveal delay={0.2} y={48} className='lg:col-span-4'>
            <div className='mx-auto w-[280px] md:w-[320px]'>
              <div className='bg-charcoal rounded-[32px] p-2.5 shadow-[0_60px_120px_-40px_rgba(23,22,20,0.5)]'>
                <div className='bg-ivory rounded-[24px] overflow-hidden'>
                  <img
                    src='https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&auto=format'
                    alt=''
                    className='w-full h-40 object-cover'
                  />
                  <div className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='min-w-0'>
                        <p className='text-[12px] font-semibold text-charcoal truncate'>
                          Skyline Penthouse 18
                        </p>
                        <p className='text-[10px] text-stone'>
                          Dubai Marina · 3 bed · 2,130 sq ft
                        </p>
                      </div>
                      <span className='ml-3 text-[11px] font-bold text-manara whitespace-nowrap'>
                        AED 4.2M
                      </span>
                    </div>
                    <div className='flex gap-2 mt-3.5'>
                      <span className='flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] text-white text-[10px] font-semibold py-2.5 rounded-full'>
                        <MessageCircle size={12} /> WhatsApp
                      </span>
                      <span className='flex items-center justify-center gap-1.5 bg-charcoal text-ivory text-[10px] font-semibold py-2.5 px-3.5 rounded-full'>
                        <Phone size={12} /> Call
                      </span>
                    </div>
                    <div className='flex items-center gap-2.5 mt-4 pt-3.5 border-t border-beige'>
                      <div className='w-7 h-7 rounded-full bg-white border border-beige flex items-center justify-center text-[9px] font-semibold text-manara'>
                        AM
                      </div>
                      <p className='text-[10px] text-stone'>
                        Aisha Malik — replies in minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className='text-center mt-4 text-[9px] tracking-[0.3em] uppercase text-stone'>
                MOBILE EXPERIENCE — ONE LINK
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default BuyerPage
