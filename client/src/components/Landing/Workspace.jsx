import React from 'react'
import { motion } from 'framer-motion'
import { Label, Reveal } from './primitives'

const RAIL = [
  { name: 'Property Info', state: 'done' },
  { name: 'Source Photography', state: 'done' },
  { name: 'Floor Plans', state: 'done' },
  { name: 'Generated Renders', state: 'active' },
  { name: 'Marketing Assets', state: 'pending' },
  { name: 'Approval Status', state: 'pending' },
  { name: 'Property Page', state: 'pending' },
  { name: 'Lead Activity', state: 'pending' },
]

const GALLERY = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80&auto=format',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80&auto=format',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&auto=format',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&auto=format',
]

const FACTS = [
  { k: 'BEDS', v: '03' },
  { k: 'BATHS', v: '04' },
  { k: 'PARKING', v: '02' },
  { k: 'TYPE', v: 'PENTHOUSE' },
]

const STATUS = [
  { name: 'Source photography', state: 'Complete', done: true },
  { name: 'Branded floor plan', state: 'Complete', done: true },
  { name: 'Interior renders', state: 'Generating…', done: false },
  { name: 'Brochure & listing copy', state: 'Queued', done: false },
]

const LEADS = [
  { name: 'A. Al Maktoum', source: 'WhatsApp', time: '12 MIN' },
  { name: 'S. Whitfield', source: 'Property Page', time: '41 MIN' },
]

const Workspace = () => {
  return (
    <section className='relative bg-white py-24 md:py-36 overflow-hidden'>
      {/* Ghost word */}
      <div className='pointer-events-none select-none absolute -top-6 left-1/2 -translate-x-1/2 font-serif text-[16vw] leading-none text-charcoal/[0.03] whitespace-nowrap'>
        WORKSPACE
      </div>

      <div className='relative max-w-[1500px] mx-auto px-6 md:px-12'>
        <div className='max-w-3xl'>
          <Reveal>
            <Label>04 / PROPERTY WORKSPACE</Label>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className='mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.06] tracking-[-0.01em] text-charcoal'>
              Everything belonging to a property, finally in one place.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className='mt-7 max-w-xl text-[15px] leading-[1.85] text-stone'>
              One project holds the full life of a listing — files, visuals,
              approvals, page, and leads — so nothing is lost between tools,
              people, or versions.
            </p>
          </Reveal>
        </div>

        {/* Interface frame */}
        <Reveal delay={0.2} y={48} className='mt-16 md:mt-24'>
          <div className='border border-beige bg-white rounded-[10px] overflow-hidden shadow-[0_60px_140px_-60px_rgba(23,22,20,0.25)]'>
            {/* Title bar */}
            <div className='flex items-center justify-between px-5 md:px-8 py-4 border-b border-beige'>
              <div className='flex items-center gap-4'>
                <span className='w-2 h-2 rounded-full bg-manara' />
                <p className='label-meta'>PROPERTY WORKSPACE — PROJECT 001</p>
              </div>
              <div className='flex items-center gap-4'>
                <span className='hidden sm:inline-flex items-center gap-2 border border-beige rounded-full px-4 py-1.5 text-[9px] font-semibold tracking-[0.25em] uppercase text-stone'>
                  <span className='w-1.5 h-1.5 rounded-full bg-manara animate-pulse' />
                  GENERATING
                </span>
                <span className='inline-flex items-center gap-2 bg-manara/10 border border-manara/25 rounded-full px-4 py-1.5 text-[9px] font-semibold tracking-[0.25em] uppercase text-manara'>
                  APPROVAL PENDING
                </span>
              </div>
            </div>

            <div className='grid lg:grid-cols-12'>
              {/* Rail */}
              <div className='lg:col-span-3 xl:col-span-2 border-b lg:border-b-0 lg:border-r border-beige p-5 md:p-6'>
                <p className='label-meta mb-4'>PROPERTY CONTENTS</p>
                <div className='flex lg:flex-col gap-1 overflow-x-auto'>
                  {RAIL.map((item) => (
                    <div
                      key={item.name}
                      className={`flex items-center gap-3 whitespace-nowrap px-3 py-2.5 rounded-[8px] transition-colors ${
                        item.state === 'active'
                          ? 'bg-manara/10 text-manara'
                          : 'text-charcoal/70'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.state === 'done'
                            ? 'bg-manara'
                            : item.state === 'active'
                              ? 'bg-manara animate-pulse'
                              : 'bg-beige'
                        }`}
                      />
                      <span className='text-[12px] font-medium'>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main panel */}
              <div className='lg:col-span-9 xl:col-span-7 p-5 md:p-8'>
                <div className='flex items-start justify-between gap-6'>
                  <div>
                    <p className='label-meta'>DUBAI MARINA</p>
                    <h3 className='mt-2 font-serif text-2xl md:text-3xl text-charcoal'>
                      Skyline Penthouse 18
                    </h3>
                    <p className='mt-1.5 text-[12px] text-stone'>
                      AED 4,200,000 — Handover Q4 2027
                    </p>
                  </div>
                  <span className='hidden sm:block text-right text-[9px] font-semibold tracking-[0.25em] uppercase text-manara whitespace-nowrap'>
                    LIVE PAGE
                    <br />
                    MANARA.AI/P/001
                  </span>
                </div>

                {/* Gallery */}
                <div className='grid grid-cols-4 gap-2 mt-6'>
                  {GALLERY.map((src, i) => (
                    <div
                      key={i}
                      className={`relative aspect-[3/4] overflow-hidden rounded-[8px] bg-ivory border border-beige ${
                        i === 2 ? 'outline outline-1 outline-manara/50' : ''
                      }`}
                    >
                      <img
                        src={src}
                        alt=''
                        className='w-full h-full object-cover'
                      />
                      {i === 2 && (
                        <span className='absolute top-1.5 left-1.5 bg-manara text-white text-[7px] font-bold tracking-[0.2em] uppercase px-2 py-1 rounded'>
                          NEW RENDER
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Facts */}
                <div className='grid grid-cols-4 gap-px bg-beige border border-beige mt-4'>
                  {FACTS.map((f) => (
                    <div key={f.k} className='bg-ivory px-4 py-3.5'>
                      <p className='text-[8px] font-semibold tracking-[0.25em] uppercase text-stone'>
                        {f.k}
                      </p>
                      <p className='mt-1 text-sm font-semibold text-charcoal'>
                        {f.v}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Status */}
                <div className='mt-6 flex flex-col'>
                  {STATUS.map((s, i) => (
                    <motion.div
                      key={s.name}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                      className='flex items-center justify-between py-3 border-b border-beige last:border-b-0'
                    >
                      <span className='text-[13px] text-charcoal/80'>
                        {s.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold tracking-[0.2em] uppercase ${
                          s.done ? 'text-manara' : 'text-stone'
                        }`}
                      >
                        {s.state}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Leads column */}
              <div className='lg:col-span-3 border-t lg:border-t-0 lg:border-l border-beige p-5 md:p-6'>
                <p className='label-meta mb-4'>LEAD ACTIVITY</p>
                <div className='flex flex-col gap-3'>
                  {LEADS.map((l) => (
                    <div
                      key={l.name}
                      className='border border-beige rounded-[8px] px-4 py-3.5 bg-ivory'
                    >
                      <div className='flex items-center justify-between'>
                        <p className='text-[13px] font-semibold text-charcoal'>
                          {l.name}
                        </p>
                        <span className='text-[9px] font-semibold tracking-[0.2em] uppercase text-manara'>
                          {l.time}
                        </span>
                      </div>
                      <p className='mt-1 text-[11px] text-stone'>
                        via {l.source}
                      </p>
                    </div>
                  ))}
                </div>
                <div className='mt-6 border-t border-beige pt-5'>
                  <p className='text-[9px] font-semibold tracking-[0.25em] uppercase text-stone'>
                    VIEWS THIS WEEK
                  </p>
                  <div className='flex items-end gap-1.5 mt-3 h-16'>
                    {[34, 48, 40, 62, 55, 78, 90].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm ${i === 6 ? 'bg-manara' : 'bg-beige'}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <p className='mt-3 text-[11px] text-charcoal/60'>
                    <span className='font-semibold text-manara'>418</span>{' '}
                    total views — page live 9 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Workspace
