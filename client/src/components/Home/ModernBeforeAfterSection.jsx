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
  MousePointer,
} from 'lucide-react'
import React, { useRef, useState } from 'react'
import { Button } from '../../components/ui/button'

const ModernBeforeAfterSection = () => {
  const [isHovered, setIsHovered] = useState(false)
  const sliderRef = useRef(null)
  const { scrollY } = useScroll()

  // Parallax transforms 
  const yParallax = useTransform(scrollY, [1000, 2000], [0, -80])

  // Motion values for the slider
  const sliderPosition = useMotionValue(50)
  const springSliderPosition = useSpring(sliderPosition, {
    damping: 25,
    stiffness: 250,
  })

  const brandColor = '#937c60'

  const handleMouseMove = (e) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    sliderPosition.set(percentage)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    sliderPosition.set(50)
  }

  const processSteps = [
    {
      title: 'Analyze',
      description: 'AI identifies spatial geometry and lighting.',
    },
    {
      title: 'Synthesis',
      description: 'High-fidelity 3D visualization within seconds.',
    },
  ]

  return (
    <section
      className='relative py-40 bg-[#faf8f6] overflow-hidden px-10 md:px-20'
    >
      <div className='relative z-10 max-w-[1500px] mx-auto w-full'>
        {/* Interaction Layout */}
        <div className='grid xl:grid-cols-12 gap-20 items-center'>
          {/* Slider Container */}
          <motion.div 
            className='xl:col-span-8'
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div
              ref={sliderRef}
              className='relative rounded-[60px] overflow-hidden cursor-none group shadow-[0_50px_100px_rgba(147,124,96,0.05)] border border-[#937c60]/5'
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className='relative w-full aspect-[16/10] md:aspect-[16/9]'>
                {/* Before Image */}
                <img
                  src='/Home/after.webp'
                  alt='Original Space'
                  className='absolute inset-0 w-full h-full object-cover grayscale brightness-110'
                />

                {/* After Image Clipping */}
                <motion.div
                  className='absolute inset-0'
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
                </motion.div>

                {/* Minimalist Split Line */}
                <motion.div
                  className='absolute top-0 bottom-0 w-[1px] bg-[#937c60]/30 backdrop-blur-sm z-10 pointer-events-none'
                  style={{
                    left: useTransform(springSliderPosition, (pos) => `${pos}%`),
                  }}
                >
                  <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-[#937c60]/20 bg-white/40 backdrop-blur-md flex items-center justify-center shadow-xl'>
                     <motion.div 
                        animate={{ x: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className='flex gap-1'
                      >
                        <ChevronRight className='w-4 h-4 text-[#937c60]/40 rotate-180' />
                        <ChevronRight className='w-4 h-4 text-[#937c60]' />
                     </motion.div>
                  </div>
                </motion.div>

                {/* Floating Labels */}
                <div className='absolute top-10 left-10 pointer-events-none z-20 flex gap-4'>
                  <div className='bg-white/40 backdrop-blur-md px-6 py-2 rounded-full border border-gray-200'>
                     <span className='text-[10px] font-bold tracking-widest text-gray-400 uppercase'>Photometric Raw</span>
                  </div>
                  <div className='bg-[#937c60]/10 backdrop-blur-md px-6 py-2 rounded-full border border-[#937c60]/20'>
                     <span className='text-[10px] font-bold tracking-widest text-[#937c60] uppercase'>Neural Gen</span>
                  </div>
                </div>

                {/* Custom Cursor Instructions */}
                <AnimatePresence>
                  {!isHovered && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='absolute inset-0 bg-[#faf8f6]/20 backdrop-blur-[2px] flex items-center justify-center z-30 pointer-events-none'
                    >
                       <div className='text-center space-y-4'>
                          <motion.div 
                            animate={{ x: [-20, 20, -20] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className='w-12 h-12 rounded-full border border-[#937c60]/40 flex items-center justify-center mx-auto'
                          >
                             <MousePointer className='text-[#937c60] w-5 h-5' />
                          </motion.div>
                          <p className='text-[#937c60] font-bold tracking-widest uppercase text-xs opacity-60'>Slide to transform</p>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Process Narrative */}
          <div className='xl:col-span-4 space-y-12'>
            <div className='space-y-4'>
               <h4 className='text-[10px] font-bold text-[#937c60] uppercase tracking-[0.4em]'>The Logic</h4>
               <h3 className='text-5xl font-bold text-gray-900 tracking-tight leading-tight'>Evolve your <br /> environment.</h3>
            </div>

            <div className='space-y-8'>
              {processSteps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className='group space-y-2'
                >
                   <div className='flex items-center gap-3'>
                      <div className='w-8 h-[1px] bg-[#937c60] opacity-40' />
                      <h5 className='text-xl font-bold text-gray-900'>{step.title}</h5>
                   </div>
                   <p className='text-gray-400 font-medium leading-relaxed pl-11'>{step.description}</p>
                </motion.div>
              ))}
            </div>

            <div className='pt-8'>
              <Button 
                 onClick={() => window.location.href = '/moodboard'}
                 className='w-full bg-gray-900 hover:bg-black text-white px-8 py-8 rounded-[32px] font-bold text-lg flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95'
              >
                 Start Transformation
                 <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ModernBeforeAfterSection
