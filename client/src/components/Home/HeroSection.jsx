import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { ArrowRight, ChevronRight, Globe, Layers, Maximize2, MousePointer2, Sparkles, Zap } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/button'

const HeroSection = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = (e) => {
    if (isMobile) return
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    setMousePos({
      x: (clientX / innerWidth - 0.5) * 20,
      y: (clientY / innerHeight - 0.5) * 20,
    })
  }

  const yHero = useTransform(scrollY, [0, 500], isMobile ? [0, 0] : [0, 80])
  const opacityHero = useTransform(scrollY, [0, 400], isMobile ? [1, 1] : [1, 0])

  const stages = [
    { title: 'Neural Analysis', status: 'Scanning geometry...', color: '#937c60' },
    { title: 'Aesthetic Search', status: 'Matching intent...', color: '#b8a58c' },
    { title: 'HD Synthesis', status: 'Generating photorealism...', color: '#e5e7eb' },
  ]

  return (
    <section 
      onMouseMove={handleMouseMove}
      className='relative min-h-screen bg-[#faf8f6] font-["Poppins"] selection:bg-[#937c60]/10 overflow-hidden flex items-center md:pt-40'
    >
      {/* Cinematic Background Ambience */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div 
          className='absolute top-[-10%] right-[-5%] w-[70%] h-[70%] rounded-full bg-[#937c60]/5 blur-[140px] transition-transform duration-1000'
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        />
        <div 
          className='absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#b8a58c]/3 blur-[120px] transition-transform duration-1000'
          style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
        />
        {/* Grain Overlay */}
        <div className='absolute inset-0 opacity-[0.03] pointer-events-none' 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
      </div>

      <main className='relative z-10 max-w-[1500px] mx-auto px-6 md:px-20 w-full'>
        <div className='grid xl:grid-cols-12 gap-16 items-center'>
          
          {/* Left Content Column */}
          <motion.div 
            style={{ y: yHero, opacity: opacityHero }}
            className='xl:col-span-7 space-y-8 md:space-y-12'
          >
            <div className='space-y-6 md:space-y-8'>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className='flex items-center gap-4'
              >
                <div className='w-12 h-[1px] bg-[#937c60]'></div>
                <span className='text-[10px] font-bold tracking-[0.5em] text-[#937c60] uppercase'>The Future of Spatial Synthesis</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className='text-5xl md:text-8xl lg:text-9xl font-bold text-gray-900 tracking-tightest leading-[0.95] md:leading-[0.85]'
              >
                Synthesize <br />
                <span className='text-[#937c60] font-serif italic italic'>Your Vision.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className='text-gray-400 font-medium text-base md:text-2xl max-w-xl leading-relaxed'
              >
                Architectural intelligence that translates raw imagination into photorealistic, executable spaces in seconds.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className='flex flex-col sm:flex-row gap-4 sm:gap-6 items-center pt-4'
            >
               <Button 
                 onClick={() => window.location.href = '/moodboard'}
                 className='w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-8 sm:px-10 py-6 sm:py-7 rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 group'
               >
                 Begin Synthesis
                 <ArrowRight size={20} className='group-hover:translate-x-1 transition-transform' />
               </Button>
               
               <a href="/pricing" className='w-full sm:w-auto justify-center group flex items-center gap-3 text-gray-500 font-bold hover:text-gray-900 transition-colors py-4 px-6 rounded-full hover:bg-gray-100/50'>
                  Enterprise Solutions
                  <ChevronRight size={18} className='group-hover:translate-x-1 transition-transform text-[#937c60]' />
               </a>
            </motion.div>

            {/* Premium Stats Strip */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className='flex flex-nowrap justify-between md:justify-start gap-2 md:gap-12 pt-10 md:pt-16 border-t border-gray-100 max-w-2xl w-full md:w-auto overflow-x-auto'
            >
               {[
                 { label: 'Latency', value: '2.4ms', icon: Zap },
                 { label: 'Generation', value: '4K HD', icon: Sparkles },
                 { label: 'Uptime', value: '99.9%', icon: Globe }
               ].map((stat, i) => (
                 <div key={i} className='flex items-center gap-2 md:gap-4 group min-w-max'>
                    <div className='w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#937c60] shadow-sm transform group-hover:scale-110 transition-transform'>
                       <stat.icon size={16} className='md:w-[18px] md:h-[18px]' />
                    </div>
                    <div>
                        <p className='text-sm md:text-xl font-bold text-gray-900 tracking-tight'>{stat.value}</p>
                        <p className='text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest'>{stat.label}</p>
                    </div>
                 </div>
               ))}
            </motion.div>
          </motion.div>

          {/* Right Visual Column (Architectural HUD) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className='xl:col-span-5 relative hidden xl:block'
          >
            {/* Main Image Frame with Layered Elements */}
            <div className='relative'>
                <div className='absolute -inset-4 border border-gray-900/5 rounded-[60px] pointer-events-none' />
                <div className='absolute -inset-8 border border-gray-900/[0.02] rounded-[70px] pointer-events-none' />
                
                <div className='bg-white rounded-[56px] p-4 shadow-[0_50px_100px_rgba(147,124,96,0.12)] border border-[#937c60]/10 overflow-hidden relative group'>
                    {/* Editorial Image container */}
                    <div className='aspect-[4/5] rounded-[44px] overflow-hidden relative bg-stone-100'>
                        <img 
                            src='https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&auto=format' 
                            alt='Neural Synthesis' 
                            className='w-full h-full object-cover transition-all duration-1000 scale-[1.02] group-hover:scale-110'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent' />
                        
                        {/* Scanning Effect */}
                        <motion.div 
                            animate={{ top: ['-20%', '120%'] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                            className='absolute inset-x-0 h-32 bg-gradient-to-b from-[#937c60]/0 via-[#937c60]/40 to-[#937c60]/0 z-20 pointer-events-none'
                        >
                            <div className='w-full h-[1px] bg-white/50' />
                        </motion.div>

                        {/* Floating Interaction UI */}
                        <div className='absolute top-8 left-8 flex flex-col gap-3'>
                            <div className='bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center gap-3 text-white'>
                                <Layers size={16} />
                                <span className='text-[10px] font-bold uppercase tracking-widest'>Base.Mesh</span>
                            </div>
                            <div className='bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center gap-3 text-white'>
                                <Maximize2 size={16} />
                                <span className='text-[10px] font-bold uppercase tracking-widest'>4096px</span>
                            </div>
                        </div>

                        {/* Status Label */}
                        <div className='absolute bottom-8 left-8 right-8'>
                            <div className='bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] flex flex-col gap-4'>
                                <div className='flex justify-between items-center'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-2 h-2 rounded-full bg-[#937c60] animate-pulse' />
                                        <p className='text-[10px] font-bold text-white uppercase tracking-widest'>Synthesis Phase</p>
                                    </div>
                                    <span className='text-[10px] font-mono text-white/50'>v1.2.0</span>
                                </div>
                                <AnimatePresence mode='wait'>
                                    <motion.p 
                                        key={activeStep}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className='text-2xl font-bold text-white tracking-tight'
                                    >
                                        {stages[activeStep].title}
                                    </motion.p>
                                </AnimatePresence>
                                <div className='h-1 w-full bg-white/10 rounded-full overflow-hidden'>
                                    <motion.div 
                                        className='h-full bg-[#937c60]'
                                        animate={{ width: ['0%', '100%'] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Satellite Floating Elements */}
                <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className='absolute -top-12 -right-8 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 z-30'
                >
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-2xl bg-[#937c60]/10 flex items-center justify-center text-[#937c60]'>
                            <MousePointer2 size={24} />
                        </div>
                        <div>
                            <p className='text-xs font-bold text-gray-900'>Neural Drag</p>
                            <p className='text-[9px] text-gray-400 font-bold uppercase tracking-widest'>Active Control</p>
                        </div>
                    </div>
                </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Aesthetic Accents */}
      {!isMobile && (
        <React.Fragment>
          <div className='absolute left-10 top-1/2 -translate-y-1/2 h-64 flex flex-col items-center justify-between opacity-20 pointer-events-none'>
            <div className='w-[1px] h-24 bg-[#937c60]' />
            <span className='[writing-mode:vertical-lr] text-[10px] font-bold tracking-[0.8em] uppercase text-[#937c60]'>Architectural Essence</span>
            <div className='w-[1px] h-24 bg-[#937c60]' />
          </div>
          <div className='absolute right-10 bottom-10 opacity-10 pointer-events-none'>
            <span className='text-[12vw] font-black italic font-serif text-gray-900 leading-none'>2025</span>
          </div>
        </React.Fragment>
      )}
    </section>
  )
}

export default HeroSection
