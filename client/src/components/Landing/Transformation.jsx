import React, { useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion'
import { FloorPlanArt } from './FloorPlanArt'

const STAGES = [
  {
    no: '01',
    name: 'Original Property File',
    desc: 'Source photographs, uploads, and listing details as received.',
  },
  {
    no: '02',
    name: 'Branded Floor Plan',
    desc: 'Validated, measured, and refined into a presentation-ready plan.',
  },
  {
    no: '03',
    name: '3D Visualization',
    desc: 'Photorealistic interiors staged to the property’s full potential.',
  },
  {
    no: '04',
    name: 'Buyer Presentation',
    desc: 'A finished, shareable property page ready for the market.',
  },
]

const Transformation = () => {
  const ref = useRef(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(3, Math.floor(v * 4))
    if (idx !== active) setActive(idx)
  })

  const stage1 = useTransform(scrollYProgress, [0, 0.22], [1, 0])
  const stage2 = useTransform(scrollYProgress, [0.18, 0.3, 0.48], [0, 1, 0])
  const stage3 = useTransform(scrollYProgress, [0.42, 0.55, 0.74], [0, 1, 0])
  const stage4 = useTransform(scrollYProgress, [0.68, 0.8], [0, 1])
  const scale1 = useTransform(scrollYProgress, [0, 0.22], [1.05, 1])
  const scale4 = useTransform(scrollYProgress, [0.68, 0.82], [1.06, 1])

  return (
    <section id='product' className='relative bg-ivory'>
      <div ref={ref} className='relative h-[360vh]'>
        <div className='sticky top-0 h-[100svh] overflow-hidden'>
          {/* Stage 1 — original photo */}
          <motion.div
            style={{ opacity: stage1 }}
            className='absolute inset-0'
          >
            <motion.img
              style={{ scale: scale1 }}
              src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80&auto=format'
              alt='Original property photograph'
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-charcoal/35' />
            <div className='absolute top-6 left-6 md:top-10 md:left-12 text-[10px] tracking-[0.35em] uppercase text-ivory/80'>
              RAW SOURCE — UPLOADED FILE 04.JPG
            </div>
          </motion.div>

          {/* Stage 2 — branded floor plan */}
          <motion.div
            style={{ opacity: stage2 }}
            className='absolute inset-0 bg-ivory'
          >
            <div className='h-full flex items-center justify-center px-6 py-24'>
              <motion.div
                initial={false}
                className='w-full max-w-[1000px] bg-white border border-beige p-4 md:p-8 shadow-[0_40px_120px_-40px_rgba(23,22,20,0.25)]'
              >
                <div className='flex items-center justify-between px-1 pb-4 border-b border-beige mb-4'>
                  <p className='label-arch'>SIGNATURE RESIDENCE / LEVEL 02</p>
                  <p className='label-meta'>SCALE 1:100 — 2,130 SQ FT</p>
                </div>
                <FloorPlanArt refined className='w-full h-auto' />
              </motion.div>
            </div>
          </motion.div>

          {/* Stage 3 — 3D visualization */}
          <motion.div
            style={{ opacity: stage3 }}
            className='absolute inset-0'
          >
            <motion.img
              initial={false}
              src='https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=2000&q=80&auto=format'
              alt='Photorealistic furnished 3D visualization'
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-charcoal/25' />
            <div className='absolute top-6 left-6 md:top-10 md:left-12 text-[10px] tracking-[0.35em] uppercase text-ivory/80'>
              3D VISUALIZATION — FURNISHED CONCEPT 02
            </div>
          </motion.div>

          {/* Stage 4 — buyer presentation */}
          <motion.div
            style={{ opacity: stage4 }}
            className='absolute inset-0 bg-charcoal'
          >
            <motion.img
              initial={false}
              style={{ scale: scale4 }}
              src='https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2000&q=80&auto=format'
              alt='Finished buyer-facing property presentation'
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-charcoal/60' />
            <div className='absolute top-6 left-6 md:top-10 md:left-12 text-[10px] tracking-[0.35em] uppercase text-ivory/80'>
              LIVE PROPERTY PAGE — MANARA.AI/P/001
            </div>
            <div className='absolute bottom-10 right-6 md:right-12 hidden md:block text-right'>
              <p className='font-serif text-ivory text-2xl md:text-3xl'>
                Skyline Penthouse
              </p>
              <p className='mt-2 text-[11px] tracking-[0.25em] uppercase text-[#c3a886]'>
                AED 4,200,000 — 3 BED / 2,130 SQ FT
              </p>
            </div>
          </motion.div>

          {/* Progress rail */}
          <div className='absolute right-6 md:right-12 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-6'>
            {STAGES.map((s, i) => (
              <div key={s.no} className='flex items-center gap-4 justify-end'>
                <span
                  className={`text-[9px] tracking-[0.3em] uppercase transition-all duration-500 ${
                    i === active ? 'opacity-100' : 'opacity-40'
                  }`}
                  style={{
                    color:
                      active === 1
                        ? i === active
                          ? '#171614'
                          : '#171614'
                        : i === active
                          ? '#F5F2EC'
                          : '#F5F2EC',
                  }}
                >
                  {s.name}
                </span>
                <span
                  className={`text-[10px] font-semibold transition-all duration-500 ${
                    i === active ? 'scale-110 opacity-100' : 'opacity-35'
                  }`}
                  style={{
                    color:
                      i === active
                        ? '#8D775E'
                        : active === 1
                          ? '#171614'
                          : '#F5F2EC',
                  }}
                >
                  {s.no}
                </span>
              </div>
            ))}
          </div>

          {/* Active caption */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-colors duration-500 ${
              active === 1 ? '' : 'bg-gradient-to-t from-charcoal/70 to-transparent'
            }`}
          >
            <div
              className={`h-px mx-6 md:mx-12 ${
                active === 1 ? 'bg-charcoal/15' : 'bg-ivory/20'
              }`}
            />
            <div className='max-w-[1500px] mx-auto px-6 md:px-12 py-6 md:py-8 flex items-end justify-between gap-6'>
              <div className='max-w-md'>
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.35em] transition-colors duration-500 ${
                    active === 1 ? 'text-manara' : 'text-[#c3a886]'
                  }`}
                >
                  STAGE {STAGES[active].no} — {STAGES[active].name.toUpperCase()}
                </p>
                <p
                  className={`mt-2.5 text-sm leading-relaxed hidden sm:block transition-colors duration-500 ${
                    active === 1 ? 'text-stone' : 'text-ivory/75'
                  }`}
                >
                  {STAGES[active].desc}
                </p>
              </div>
              <p
                className={`hidden lg:block text-[9px] font-medium tracking-[0.3em] uppercase ${
                  active === 1 ? 'text-stone' : 'text-ivory/50'
                }`}
              >
                THE MANĀRA PIPELINE / 01 — 04
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Transformation
