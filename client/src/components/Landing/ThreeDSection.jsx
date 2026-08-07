import { Maximize2, RotateCw } from 'lucide-react'
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Label, Reveal } from './primitives'

const MODEL_IMAGES = {
  dollhouse: {
    furnished: '/Home/three-d/skyline-penthouse-dollhouse-furnished.png',
    unfurnished: '/Home/three-d/skyline-penthouse-dollhouse-unfurnished.png',
  },
  isometric: {
    furnished: '/Home/three-d/skyline-penthouse-isometric-furnished.png',
    unfurnished: '/Home/three-d/skyline-penthouse-isometric-unfurnished.png',
  },
  top: {
    furnished: '/Home/transformation/stage-02-floor-plan.png',
    unfurnished: '/Home/three-d/skyline-penthouse-top-unfurnished.png',
  },
}

const VIEW_OPTIONS = [
  { id: 'dollhouse', name: 'Dollhouse' },
  { id: 'isometric', name: 'Isometric' },
  { id: 'top', name: 'Top View' },
]

const ThreeDSection = () => {
  const [view, setView] = useState('dollhouse')
  const [furnished, setFurnished] = useState(true)
  const [rot, setRot] = useState(0)
  const [zoom, setZoom] = useState(false)

  const style = {
    transform: `rotateZ(${view === 'isometric' ? -2 - rot * 0.2 : -rot * 0.2}deg) scale(${zoom ? 1.08 : 1})`,
  }
  const furnishing = furnished ? 'furnished' : 'unfurnished'
  const activeImage = MODEL_IMAGES[view][furnishing]
  const activeViewName = VIEW_OPTIONS.find((option) => option.id === view)?.name

  return (
    <section id='solutions' className='relative bg-charcoal py-24 md:py-36 overflow-hidden'>
      {/* Ghost word */}
      <div className='pointer-events-none select-none absolute top-10 right-0 font-serif text-[14vw] leading-none text-ivory/[0.03] whitespace-nowrap'>
        SPATIAL
      </div>

      <div className='relative max-w-[1500px] mx-auto px-6 md:px-12'>
        <div className='grid lg:grid-cols-12 gap-10 items-end mb-14 md:mb-20'>
          <div className='lg:col-span-8'>
            <Reveal>
              <Label dark>02 / 3D UNDERSTANDING</Label>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className='mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.06] tracking-[-0.01em] text-ivory'>
                Help buyers understand the space before they enter it.
              </h2>
            </Reveal>
          </div>
          <div className='lg:col-span-4'>
            <Reveal delay={0.16}>
              <p className='text-[15px] leading-[1.85] text-[#B5ACA0]'>
                An interactive model of every property — furnished or raw,
                floor by floor — embedded wherever the listing lives.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Model stage */}
        <Reveal delay={0.12} y={40}>
          <div className='relative border border-ivory/10 rounded-[10px] bg-[#1A1916] overflow-hidden'>
            <div className='flex items-center justify-between px-5 md:px-7 py-4 border-b border-ivory/10'>
              <div className='flex items-center gap-3'>
                <span className='w-1.5 h-1.5 rounded-full bg-[#C3A886] animate-pulse' />
                <p className='text-[10px] tracking-[0.3em] uppercase text-ivory/60'>
                  LIVE 3D MODEL — SKYLINE PENTHOUSE 18
                </p>
              </div>
              <p className='hidden md:block text-[9px] tracking-[0.3em] uppercase text-ivory/40'>
                {activeViewName} / {furnishing} / <span className='text-[#C3A886]'>GEOMETRY MATCH</span>
              </p>
            </div>

            {/* Stage */}
            <div
              className='relative px-4 md:px-16 py-10 md:py-16'
              style={{ perspective: 1400 }}
            >
              {/* Glow */}
              <div className='pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-[#8D775E]/10 blur-[90px] rounded-full' />

              <motion.div
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                style={style}
                className='relative origin-center'
              >
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={`${view}-${furnishing}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className='max-w-[820px] mx-auto'
                  >
                    <img
                      src={activeImage}
                      alt={`${furnished ? 'Furnished' : 'Unfurnished'} ${activeViewName.toLowerCase()} of Skyline Penthouse 18`}
                      className={`w-full h-auto ${view === 'top' ? 'bg-ivory shadow-[0_40px_100px_rgba(0,0,0,0.5)]' : ''}`}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Controls */}
            <div className='border-t border-ivory/10 px-4 md:px-7 py-4 flex flex-wrap items-center justify-between gap-4'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-[9px] tracking-[0.3em] uppercase text-ivory/40 mr-2'>
                  VIEW
                </span>
                {VIEW_OPTIONS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    className={`px-4 py-2 rounded-full border text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 ${
                      view === v.id
                        ? 'bg-[#8D775E] border-[#8D775E] text-ivory'
                        : 'border-ivory/15 text-ivory/60 hover:border-[#8D775E]/60 hover:text-ivory'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
                <span className='w-px h-5 bg-ivory/10 mx-2 hidden sm:block' />
                {['Furnished', 'Unfurnished'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFurnished(f === 'Furnished')}
                    className={`px-4 py-2 rounded-full border text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 ${
                      furnished === (f === 'Furnished')
                        ? 'bg-[#8D775E] border-[#8D775E] text-ivory'
                        : 'border-ivory/15 text-ivory/60 hover:border-[#8D775E]/60 hover:text-ivory'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setRot((r) => r + 8)}
                  className='flex items-center gap-2 px-4 py-2 rounded-full border border-ivory/15 text-ivory/60 hover:border-[#8D775E]/60 hover:text-ivory transition-colors duration-300'
                >
                  <RotateCw size={12} />
                  <span className='text-[10px] font-semibold tracking-[0.18em] uppercase'>
                    Rotate
                  </span>
                </button>
                <button
                  onClick={() => setZoom((z) => !z)}
                  className='flex items-center gap-2 px-4 py-2 rounded-full border border-ivory/15 text-ivory/60 hover:border-[#8D775E]/60 hover:text-ivory transition-colors duration-300'
                >
                  <Maximize2 size={12} />
                  <span className='text-[10px] font-semibold tracking-[0.18em] uppercase'>
                    Zoom
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default ThreeDSection
