import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import React, { useCallback, useEffect, useState } from 'react'

const AUTOPLAY_DELAY = 4000

const STAGES = [
  {
    no: '01',
    eyebrow: 'Property capture',
    name: 'Every angle, one home',
    desc: 'A complete visual survey captures the character, materials, and most marketable views of the residence.',
    image: '/Home/transformation/stage-01-multi-angle.png',
    alt: 'Four consistent photography angles of the same luxury Dubai Marina penthouse',
    meta: '4 curated views',
    imagePosition: 'center',
  },
  {
    no: '02',
    eyebrow: 'Spatial clarity',
    name: 'The matching floor plan',
    desc: 'The same residence is translated into a precise, presentation-ready plan that buyers can understand instantly.',
    image: '/Home/transformation/stage-02-matching-floor-plan.png',
    alt: 'Presentation-ready floor plan of the same curved Dubai Marina penthouse',
    meta: '',
    imagePosition: 'center',
  },
  {
    no: '03',
    eyebrow: 'Dimensional model',
    name: 'See the space in 3D',
    desc: 'A detailed isometric model makes scale, circulation, furniture, and room relationships immediately tangible.',
    image: '/Home/transformation/stage-03-isometric-3d.png',
    alt: 'Isometric 3D dollhouse visualization of the same luxury penthouse floor plan',
    meta: 'Full furnished model',
    imagePosition: 'center',
  },
  {
    no: '04',
    eyebrow: 'Ready to market',
    name: 'A brochure worth keeping',
    desc: 'Photography, planning, and 3D storytelling become one beautiful sales piece, ready for buyers and agents.',
    image: '/Home/transformation/stage-04-luxury-brochure.png',
    alt: 'Luxury sales brochure for the same Crescent Residence penthouse',
    meta: 'Buyer-ready presentation',
    imagePosition: 'center',
  },
]

const Transformation = () => {
  const shouldReduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [cycle, setCycle] = useState(0)

  const selectStage = useCallback((index) => {
    setActive(index)
    setCycle((value) => value + 1)
  }, [])

  useEffect(() => {
    if (shouldReduceMotion) return undefined

    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % STAGES.length)
      setCycle((value) => value + 1)
    }, AUTOPLAY_DELAY)

    return () => window.clearTimeout(timer)
  }, [active, cycle, shouldReduceMotion])

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      selectStage((active + 1) % STAGES.length)
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      selectStage((active - 1 + STAGES.length) % STAGES.length)
    }
  }

  const activeStage = STAGES[active]

  return (
    <section
      id='product'
      aria-labelledby='transformation-title'
      className='relative overflow-hidden bg-charcoal py-20 sm:py-24 lg:py-32'
      onKeyDown={handleKeyDown}
    >
      <div
        className='pointer-events-none absolute inset-0 opacity-70'
        aria-hidden='true'
        style={{
          background:
            'radial-gradient(circle at 84% 12%, rgba(141,119,94,0.2), transparent 30%), radial-gradient(circle at 8% 80%, rgba(195,168,134,0.08), transparent 28%)',
        }}
      />

      <div className='relative mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12'>
        <header className='mb-10 grid gap-6 lg:mb-14 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-end'>
          <div>
            <p className='label-arch label-arch-light'>One residence / four deliverables</p>
            <h2
              id='transformation-title'
              className='mt-5 max-w-xl font-serif text-4xl leading-[0.98] tracking-[-0.02em] text-ivory sm:text-5xl lg:text-6xl'
            >
              From first look to<br className='hidden sm:block' /> final sale.
            </h2>
          </div>
          <div className='lg:justify-self-end lg:max-w-lg'>
            <p className='text-sm leading-[1.8] text-[#b8b0a6] sm:text-[15px]'>
              Follow one penthouse through the complete Manāra pipeline. Every
              stage builds on the last, giving buyers a more complete way to see
              the property.
            </p>
            <div className='mt-5 flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.28em] text-ivory/45'>
              <span className='h-px w-9 bg-[#c3a886]/50' />
              Auto-advances every 4 seconds
            </div>
          </div>
        </header>

        <div className='grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-center xl:grid-cols-[410px_minmax(0,1fr)]'>
          <div
            className='order-2 flex snap-x gap-3 overflow-x-auto pb-2 lg:order-1 lg:self-center lg:flex-col lg:overflow-visible lg:pb-0'
            role='tablist'
            aria-label='Property transformation stages'
          >
            {STAGES.map((stage, stageIndex) => {
              const isActive = stageIndex === active
              const nextStage = STAGES[(stageIndex + 1) % STAGES.length]

              return (
                <motion.button
                  layout={!shouldReduceMotion}
                  key={stage.no}
                  type='button'
                  role='tab'
                  id={`transformation-tab-${stage.no}`}
                  aria-selected={isActive}
                  aria-controls='transformation-preview'
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectStage(stageIndex)}
                  transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                  style={{ '--stage-order': (stageIndex - active + STAGES.length) % STAGES.length }}
                  className={`group relative min-w-[272px] snap-start overflow-hidden rounded-xl border px-5 py-5 text-left transition-colors duration-500 sm:min-w-[320px] lg:min-w-0 lg:px-6 lg:py-5 lg:[order:var(--stage-order)] ${
                    isActive
                      ? 'border-[#c3a886]/55 bg-[#f5f2ec] text-charcoal shadow-[0_24px_70px_-30px_rgba(0,0,0,0.8)]'
                      : 'border-ivory/10 bg-ivory/[0.035] text-ivory hover:border-ivory/25 hover:bg-ivory/[0.06]'
                  }`}
                >
                  <span className='flex items-start gap-4'>
                    <span
                      className={`mt-0.5 font-serif text-3xl leading-none transition-colors ${
                        isActive ? 'text-manara' : 'text-[#c3a886]/55'
                      }`}
                    >
                      {stage.no}
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span
                        className={`block text-[9px] font-semibold uppercase tracking-[0.28em] ${
                          isActive ? 'text-manara' : 'text-ivory/40'
                        }`}
                      >
                        {stage.eyebrow}
                      </span>
                      <span className='mt-2 block font-serif text-[23px] leading-tight'>
                        {stage.name}
                      </span>
                      <span className='mt-3 hidden min-h-[44px] text-[12px] leading-[1.65] sm:min-h-[42px] sm:text-[13px] lg:block'>
                        <span
                          className={`block transition-opacity duration-300 ${
                            isActive ? 'text-charcoal/65 opacity-100' : 'text-charcoal/65 opacity-0'
                          }`}
                        >
                          {stage.desc}
                        </span>
                      </span>
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.span
                            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className='block overflow-hidden'
                          >
                            <span className='mt-4 hidden border-t border-charcoal/10 pt-3 lg:block'>
                              <span className='mb-2 flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.24em] text-charcoal/50'>
                                <span>Next · Stage {nextStage.no}</span>
                                <span>{shouldReduceMotion ? 'Auto-play off' : '4 sec'}</span>
                              </span>
                              <span className='block h-1 overflow-hidden rounded-full bg-charcoal/10'>
                                {shouldReduceMotion ? (
                                  <span className='block h-full w-full rounded-full bg-manara/35' />
                                ) : (
                                  <motion.span
                                    key={`progress-${cycle}-${active}`}
                                    aria-hidden='true'
                                    className='block h-full origin-left rounded-full bg-manara'
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: AUTOPLAY_DELAY / 1000, ease: 'linear' }}
                                  />
                                )}
                              </span>
                            </span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span
                      aria-hidden='true'
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full transition-all duration-500 ${
                        isActive
                          ? 'scale-100 bg-manara shadow-[0_0_0_5px_rgba(141,119,94,0.14)]'
                          : 'scale-75 bg-ivory/20'
                      }`}
                    />
                  </span>
                </motion.button>
              )
            })}
          </div>

          <div
            id='transformation-preview'
            role='tabpanel'
            aria-labelledby={`transformation-tab-${activeStage.no}`}
            className='order-1 lg:order-2'
          >
            <div className='relative aspect-[16/10] overflow-hidden rounded-xl border border-ivory/10 bg-[#0d0c0b] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] sm:aspect-video lg:h-full lg:min-h-[570px] lg:aspect-auto'>
              <AnimatePresence mode='wait' initial={false}>
                <motion.div
                  key={activeStage.no}
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.025 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className='absolute inset-0'
                >
                  <img
                    src={activeStage.image}
                    alt={activeStage.alt}
                    className='h-full w-full object-cover'
                    style={{ objectPosition: activeStage.imagePosition }}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/10' />
                </motion.div>
              </AnimatePresence>

              <div className='absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7 lg:p-8'>
                <AnimatePresence mode='wait' initial={false}>
                  <motion.div
                    key={`caption-${activeStage.no}`}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className='text-[9px] font-semibold uppercase tracking-[0.3em] text-[#d1b693]'>
                      Stage {activeStage.no}
                    </p>
                    <p className='mt-1.5 font-serif text-2xl text-ivory sm:text-3xl'>
                      {activeStage.name}
                    </p>
                  </motion.div>
                </AnimatePresence>
                {activeStage.meta && (
                  <p className='hidden rounded-full border border-white/15 bg-charcoal/45 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.24em] text-ivory/70 backdrop-blur-md sm:block'>
                    {activeStage.meta}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className='mt-5 text-center text-[9px] uppercase tracking-[0.25em] text-ivory/35 lg:text-right'>
          Select any stage · Use arrow keys
        </p>
      </div>
    </section>
  )
}

export default Transformation
