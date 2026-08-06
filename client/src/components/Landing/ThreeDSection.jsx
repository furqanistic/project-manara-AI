import { Maximize2, RotateCw } from 'lucide-react'
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FloorPlanArt } from './FloorPlanArt'
import { Label, Reveal } from './primitives'

const DollhouseSVG = ({ furnished }) => (
  <svg viewBox='0 0 800 620' className='w-full h-auto' fill='none'>
    {/* Back wall depth */}
    <rect
      x='52'
      y='152'
      width='696'
      height='332'
      stroke='#C3A886'
      strokeOpacity='0.18'
      strokeDasharray='3 6'
    />
    {/* Window openings on back wall */}
    <g stroke='#C3A886' strokeOpacity='0.4' strokeWidth='1.2'>
      <rect x='96' y='200' width='96' height='64' />
      <rect x='112' y='216' width='64' height='32' />
      <rect x='330' y='200' width='140' height='84' />
      <rect x='350' y='220' width='100' height='44' />
      <rect x='96' y='370' width='96' height='56' />
      <rect x='112' y='386' width='64' height='24' />
    </g>
    {/* Ground slab */}
    <rect x='40' y='500' width='720' height='20' fill='#221F1B' stroke='#C3A886' strokeWidth='1.5' />
    {/* Upper floor slab */}
    <rect x='40' y='300' width='720' height='16' fill='#221F1B' stroke='#C3A886' strokeWidth='1.5' />
    {/* Roof slab */}
    <rect x='40' y='120' width='720' height='16' fill='#221F1B' stroke='#C3A886' strokeWidth='1.5' />
    {/* Roof hatch */}
    <g stroke='#C3A886' strokeOpacity='0.25' strokeWidth='1'>
      <line x1='60' y1='136' x2='80' y2='120' />
      <line x1='110' y1='136' x2='130' y2='120' />
      <line x1='160' y1='136' x2='180' y2='120' />
      <line x1='210' y1='136' x2='230' y2='120' />
      <line x1='260' y1='136' x2='280' y2='120' />
      <line x1='310' y1='136' x2='330' y2='120' />
      <line x1='360' y1='136' x2='380' y2='120' />
      <line x1='410' y1='136' x2='430' y2='120' />
      <line x1='460' y1='136' x2='480' y2='120' />
      <line x1='510' y1='136' x2='530' y2='120' />
      <line x1='560' y1='136' x2='580' y2='120' />
      <line x1='610' y1='136' x2='630' y2='120' />
      <line x1='660' y1='136' x2='680' y2='120' />
      <line x1='710' y1='136' x2='730' y2='120' />
    </g>
    {/* Cut walls */}
    <g stroke='#C3A886' strokeWidth='2'>
      <line x1='40' y1='136' x2='40' y2='500' />
      <line x1='240' y1='136' x2='240' y2='500' />
      <line x1='520' y1='136' x2='520' y2='500' />
      <line x1='760' y1='136' x2='760' y2='500' />
    </g>

    {/* Furniture silhouettes */}
    <AnimatePresence>
      {furnished && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          stroke='#DED6CA'
          strokeWidth='1.6'
          fill='#221F1B'
          strokeLinejoin='round'
        >
          {/* Upper room A — bed */}
          <rect x='70' y='205' width='130' height='62' rx='3' />
          <line x1='70' y1='205' x2='200' y2='205' strokeWidth='2.4' />
          <rect x='214' y='215' width='18' height='26' rx='2' />
          {/* Upper room C — bath */}
          <rect x='560' y='210' width='130' height='44' rx='6' />
          <circle cx='580' cy='270' r='9' />
          <rect x='606' y='264' width='38' height='26' rx='2' />
          {/* Living — sofa, table, lamp */}
          <rect x='300' y='420' width='150' height='38' rx='4' />
          <rect x='470' y='424' width='34' height='30' rx='2' />
          <line x1='268' y1='430' x2='268' y2='300' />
          <path d='M 252 300 L 284 300 L 276 316 L 260 316 Z' />
          {/* Living pendant */}
          <line x1='400' y1='152' x2='400' y2='190' strokeWidth='1' />
          <path d='M 380 200 A 20 20 0 0 1 420 200 Z' fill='#8D775E' stroke='#8D775E' />
          {/* Kitchen */}
          <rect x='60' y='430' width='140' height='34' rx='2' />
          <rect x='60' y='378' width='52' height='34' rx='2' />
          {/* Right ground — desk + chair */}
          <rect x='560' y='408' width='120' height='34' rx='2' />
          <rect x='690' y='418' width='34' height='22' rx='2' />
        </motion.g>
      )}
    </AnimatePresence>

    {/* Room labels */}
    <g
      fill='#8D775E'
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.22em',
      }}
    >
      <text x='135' y='180'>BEDROOM</text>
      <text x='380' y='180'>LIVING — DOUBLE HEIGHT</text>
      <text x='640' y='180'>BATHROOM</text>
      <text x='135' y='350'>KITCHEN</text>
      <text x='640' y='350'>STUDY</text>
    </g>
    {/* Axis + scale */}
    <g
      className='fill-[#AAA196]'
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: '0.25em',
      }}
    >
      <text x='40' y='580'>SECTION A—A</text>
      <text x='40' y='600'>SCALE 1:50</text>
      <text x='700' y='600' textAnchor='end'>VILLA 04 — INTERNAL VIEW</text>
    </g>
  </svg>
)

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

  const style =
    view === 'isometric'
      ? { transform: `rotateX(56deg) rotateZ(${-34 - rot}deg) scale(${zoom ? 1.16 : 1.08})`, transformStyle: 'preserve-3d' }
      : { transform: `rotateY(${view === 'dollhouse' ? -10 - rot : rot}deg) scale(${zoom ? 1.08 : 1})` }

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
              <Label dark>04 / 3D UNDERSTANDING</Label>
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
                  LIVE 3D MODEL — VILLA 04
                </p>
              </div>
              <p className='hidden md:block text-[9px] tracking-[0.3em] uppercase text-ivory/40'>
                24K TRIANGLES / WEBGL / <span className='text-[#C3A886]'>60 FPS</span>
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
                    key={view}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className='max-w-[820px] mx-auto'
                  >
                    {view === 'top' ? (
                      <div className='bg-ivory p-5 md:p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)]'>
                        <div className='flex items-center justify-between pb-4 border-b border-beige mb-4'>
                          <p className='label-arch'>TOP VIEW — VILLA 04</p>
                          <p className='label-meta'>SCALE 1:100</p>
                        </div>
                        <FloorPlanArt refined className='w-full h-auto' />
                      </div>
                    ) : (
                      <DollhouseSVG furnished={furnished} />
                    )}
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
