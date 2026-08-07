import React, { useRef, useState } from 'react'
import { Label, Reveal } from './primitives'

const ORIGINAL_IMAGE = '/Home/listing-media-original.png'
const STAGED_IMAGE = '/Home/listing-media-staged.png'

const CONTROLS = [
  { name: 'Virtual Staging', on: true },
  { name: 'Decluttering', on: true },
  { name: 'Furniture Removal', on: false },
  { name: 'Lighting Correction', on: true },
  { name: 'Style Consistency', on: true },
  { name: 'High-Resolution Export', on: false },
]

const ListingMedia = () => {
  const [pos, setPos] = useState(58)
  const ref = useRef(null)
  const dragging = useRef(false)

  const handle = (clientX) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const p = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100))
    setPos(p)
  }

  return (
    <section className='relative bg-ivory py-24 md:py-36'>
      <div className='max-w-[1500px] mx-auto px-6 md:px-12'>
        {/* Header */}
        <div className='grid lg:grid-cols-12 gap-10 items-end mb-16 md:mb-24'>
          <div className='lg:col-span-8'>
            <Reveal>
              <Label>03 / AI LISTING MEDIA</Label>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className='mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.06] tracking-[-0.01em] text-charcoal'>
                Present the property at its highest potential.
              </h2>
            </Reveal>
          </div>
          <div className='lg:col-span-4'>
            <Reveal delay={0.16}>
              <p className='text-[15px] leading-[1.85] text-stone'>
                A single upload becomes a professionally staged, naturally lit
                campaign — consistent across every photo, every time.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Before / after */}
        <Reveal delay={0.1} y={40}>
          <div
            ref={ref}
            className='relative overflow-hidden border border-beige rounded-[10px] bg-white select-none cursor-ew-resize touch-none'
            onPointerDown={(e) => {
              dragging.current = true
              e.currentTarget.setPointerCapture(e.pointerId)
              handle(e.clientX)
            }}
            onPointerMove={(e) => {
              if (e.pointerType === 'mouse' || dragging.current) handle(e.clientX)
            }}
            onPointerUp={() => (dragging.current = false)}
            onPointerLeave={(e) => {
              if (e.pointerType === 'mouse') {
                dragging.current = false
                setPos(58)
              }
            }}
          >
            <div className='relative aspect-[16/9] md:aspect-[21/9]'>
              {/* Staged result beneath the comparison reveal */}
              <img
                src={STAGED_IMAGE}
                alt='AI virtually staged Dubai Marina penthouse living room'
                className='absolute inset-0 w-full h-full object-cover'
              />
              {/* Original photo clipped over the staged result */}
              <div
                className='absolute inset-0 overflow-hidden'
                style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
              >
                <img
                  src={ORIGINAL_IMAGE}
                  alt='Original empty Dubai Marina penthouse photograph'
                  className='absolute inset-0 w-full h-full object-cover'
                />
              </div>

              {/* Divider */}
              <div
                className='absolute top-0 bottom-0 w-px bg-ivory/90 z-10'
                style={{ left: `${pos}%` }}
              />
              <div
                className='absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-ivory border border-beige flex items-center justify-center shadow-[0_8px_24px_rgba(23,22,20,0.25)]'
                style={{ left: `${pos}%`, transform: 'translate(-50%, -50%)' }}
              >
                <span className='text-[9px] font-bold tracking-widest text-manara'>
                  ◂ ▸
                </span>
              </div>

              {/* Labels */}
              <span className='absolute top-5 left-5 z-10 text-[9px] font-semibold tracking-[0.3em] uppercase text-ivory bg-charcoal/40 backdrop-blur-sm rounded-full px-4 py-2'>
                ORIGINAL PHOTO
              </span>
              <span
                className='absolute top-5 z-10 text-[9px] font-semibold tracking-[0.3em] uppercase text-ivory bg-charcoal/40 backdrop-blur-sm rounded-full px-4 py-2'
                style={{ left: `calc(${pos}% + 16px)` }}
              >
                AI STAGED
              </span>
            </div>
          </div>
        </Reveal>

        {/* Controls */}
        <Reveal delay={0.15}>
          <p className='text-center mt-7 mb-4 text-[9px] font-semibold tracking-[0.3em] uppercase text-stone'>
            MOVE ACROSS THE IMAGE TO COMPARE
          </p>
          <div className='flex flex-wrap items-center justify-center gap-2 md:gap-2.5'>
            {CONTROLS.map((c) => (
              <span
                key={c.name}
                className={`px-4 md:px-5 py-2.5 rounded-full border text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 ${
                  c.on
                    ? 'bg-manara text-white border-manara'
                    : 'border-beige text-stone bg-white hover:border-manara/50 hover:text-manara'
                }`}
              >
                {c.name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default ListingMedia
