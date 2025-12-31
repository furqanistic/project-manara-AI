import {
    AnimatePresence,
    motion,
    useMotionValue,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion'
import {
    ArrowRight,
    ChevronRight,
    MapPin,
    MousePointer2,
    Sparkles,
    Zap
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/button'

const ModernBeforeAfterSection = () => {
  const [isHovered, setIsHovered] = useState(false)
  const sliderRef = useRef(null)
  const { scrollY } = useScroll()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Parallax transforms 
  const yParallax = useTransform(scrollY, [1500, 2500], isMobile ? [0, 0] : [0, -60])

  // Motion values for the slider
  const sliderPosition = useMotionValue(50)
  const springSliderPosition = useSpring(sliderPosition, {
    damping: 25,
    stiffness: 250,
  })

  const handleUpdate = (clientX) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    sliderPosition.set(percentage)
  }

  const handleMouseMove = (e) => handleUpdate(e.clientX)
  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleUpdate(e.touches[0].clientX)
    }
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    sliderPosition.set(50)
  }

  const processSteps = [
    {
      title: 'Analyze',
      icon: Zap,
      description: 'Neural core identifies spatial geometry, lighting vectors, and material depth.',
    },
    {
      title: 'Synthesis',
      icon: Sparkles,
      description: 'High-fidelity 3D generation engine reinterprets the space with professional criteria.',
    },
  ]

  return (
    <section className='relative py-24 bg-[#faf8f6] overflow-hidden px-6 md:px-12'>
      {/* Background Ambience */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#937c60]/5 blur-[120px]' />
      </div>

      <div className='relative z-10 max-w-[1400px] mx-auto w-full'>
        {/* Interaction Layout */}
        <div className='grid xl:grid-cols-12 gap-16 lg:gap-24 items-center'>
          
          {/* Slider Container */}
          <motion.div 
            className='xl:col-span-8'
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <div
              ref={sliderRef}
              className='relative rounded-[48px] md:rounded-[64px] overflow-hidden cursor-none group shadow-[0_50px_100px_rgba(147,124,96,0.08)] border border-gray-100 bg-white'
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className='relative w-full aspect-[4/3] md:aspect-[16/9]'>
                {/* Initial Space (Before) */}
                <img
                  src='/Home/after.webp'
                  alt='Original Space'
                  className='absolute inset-0 w-full h-full object-cover grayscale brightness-110 opacity-40'
                />

                {/* Transformed Space (After) Clipping */}
                <motion.div
                  className='absolute inset-0 z-10'
                  style={{
                    clipPath: useTransform(
                      springSliderPosition,
                      (pos) => `inset(0 ${100 - pos}% 0 0)`
                    ),
                  }}
                >
                  <img
                    src='/Home/before.webp'
                    alt='AI Transformed Space'
                    className='absolute inset-0 w-full h-full object-cover'
                  />
                  
                  {/* Neural Overlay labels on "Transformed" side */}
                  <div className='absolute top-10 left-10 pointer-events-none z-20 flex flex-col gap-4'>
                    <div className='bg-white/10 backdrop-blur-xl px-6 py-2 rounded-full border border-white/20 flex items-center gap-3'>
                       <div className='w-1.5 h-1.5 rounded-full bg-[#937c60] animate-pulse' />
                       <span className='text-[10px] font-bold tracking-widest text-white uppercase'>Neural Synthesis Active</span>
                    </div>
                  </div>
                </motion.div>

                {/* Vertical Splitter */}
                <motion.div
                  className='absolute top-0 bottom-0 w-[1.5px] bg-white/40 backdrop-blur-sm z-30 pointer-events-none'
                  style={{
                    left: useTransform(springSliderPosition, (pos) => `${pos}%`),
                  }}
                >
                  <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-20 md:h-20 rounded-full border border-white/30 bg-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl overflow-hidden group'>
                     <div className='absolute inset-0 bg-[#937c60]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500' />
                     <motion.div 
                        animate={{ x: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className='relative flex gap-1 items-center'
                      >
                        <ChevronRight className='w-4 h-4 md:w-6 md:h-6 text-white opacity-40 rotate-180' />
                        <ChevronRight className='w-4 h-4 md:w-6 md:h-6 text-white' />
                     </motion.div>
                  </div>
                </motion.div>

                {/* Floating Photometric Raw Label */}
                <div className='absolute top-10 right-10 pointer-events-none z-0'>
                   <div className='bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/20'>
                      <span className='text-[10px] font-bold tracking-widest text-gray-500 uppercase'>Photometric Raw</span>
                   </div>
                </div>

                {/* Interaction Hint */}
                <AnimatePresence>
                  {!isHovered && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='absolute inset-0 bg-gray-900/5 backdrop-blur-[1px] flex items-center justify-center z-40 pointer-events-none'
                    >
                       <div className='text-center space-y-4'>
                          <motion.div 
                            animate={{ x: [-20, 20, -20] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className='w-16 h-16 rounded-full border border-[#937c60]/40 bg-white/40 backdrop-blur-md flex items-center justify-center mx-auto'
                          >
                             <MousePointer2 className='text-[#937c60] w-6 h-6' />
                          </motion.div>
                          <p className='text-[#937c60] font-bold tracking-widest uppercase text-[10px] bg-white/80 px-4 py-1 rounded-full'>Slide to transform</p>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Process Narrative */}
          <div className='xl:col-span-4 space-y-12'>
            <div className='space-y-6'>
               <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className='flex items-center gap-4'
                >
                  <div className='w-10 h-[1px] bg-[#937c60]' />
                  <span className='text-[10px] font-bold tracking-[0.5em] text-[#937c60] uppercase'>The Logic</span>
                </motion.div>
               <h3 className='text-5xl md:text-6xl font-bold text-gray-900 tracking-tightest leading-[0.9]'>
                 Evolve your <br /> 
                 <span className='font-serif italic text-[#937c60]'>habitat.</span>
               </h3>
               <p className='text-gray-400 font-medium text-lg leading-relaxed'>
                  Our neural engine reinterprets existing spatial geometry into photorealistic, verified architectural visions.
               </p>
            </div>

            <div className='space-y-10'>
              {processSteps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className='group'
                >
                   <div className='flex items-start gap-5'>
                      <div className='w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#937c60] group-hover:bg-[#937c60] group-hover:text-white transition-all duration-500'>
                         <step.icon size={20} />
                      </div>
                      <div className='space-y-1'>
                        <h5 className='text-xl font-bold text-gray-900 group-hover:text-[#937c60] transition-colors'>{step.title}</h5>
                        <p className='text-gray-400 text-sm font-medium leading-relaxed'>{step.description}</p>
                      </div>
                   </div>
                </motion.div>
              ))}
            </div>

            <div className='pt-8'>
              <Button 
                 onClick={() => window.location.href = '/moodboard'}
                 className='w-full bg-gray-900 hover:bg-black text-white px-10 py-8 rounded-full font-bold text-lg flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 group'
              >
                 Start Transformation
                 <ArrowRight size={20} className='group-hover:translate-x-1 transition-transform' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ModernBeforeAfterSection
