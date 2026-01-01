import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'

const MissionSection = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const brandColor = '#937c60'

  const missionTexts = [
    'Transform Every Space.',
    'Democratize Great Design.',
    'Empower Your Vision.',
    'Connect UAE Communities.'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % missionTexts.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className='relative py-32 bg-white dark:bg-[#0a0a0a] overflow-hidden transition-colors duration-500'>
      {/* Background Cinematic Decor */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-[10%] left-[-5%] text-[20vw] font-black text-gray-400/[0.03] dark:text-white/[0.015] select-none italic font-serif'>
          Purpose
        </div>
        <div className='absolute bottom-[10%] right-[-5%] text-[20vw] font-black text-gray-400/[0.03] dark:text-white/[0.015] select-none italic font-serif'>
          Vision
        </div>
      </div>

      <div className='relative z-10 max-w-[1200px] mx-auto px-6 text-center'>
        <div className='space-y-12'>
          {/* Label with Line */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center gap-6'
          >
            <div className='w-[1px] h-16 bg-gradient-to-b from-transparent to-[#937c60]' />
            <span className='text-[10px] font-bold tracking-[0.8em] text-[#937c60] uppercase pl-[0.8em]'>Our North Star</span>
          </motion.div>

          {/* Main Massive Statement */}
          <div className='space-y-8'>
            <h2 className='text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 dark:text-white tracking-tighter leading-[1.2]'>
              We exist to <br />
              <div className='relative h-[1.2em] mt-2 text-[#937c60] flex justify-center'>
                <div className='relative w-full overflow-visible'>
                  <AnimatePresence mode='wait'>
                    <motion.span
                      key={currentTextIndex}
                      initial={{ y: '100%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      exit={{ y: '-100%', opacity: 0 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className='absolute inset-0 flex items-center justify-center whitespace-normal md:whitespace-nowrap px-4'
                    >
                      {missionTexts[currentTextIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </h2>
          </div>

          {/* Subtext Statement */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='max-w-2xl mx-auto pt-12 border-t border-gray-100 dark:border-white/10'
          >
            <p className='text-xl md:text-2xl text-gray-400 dark:text-gray-500 leading-relaxed font-medium'>
              Manāra bridges the gap between imagination and execution, 
              empowering every individual in the UAE to live in a space 
              that reflects their highest aspirations.
            </p>
          </motion.div>

          {/* Aesthetic Signature */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className='pt-16 opacity-20 dark:opacity-40'
          >
             <span className='text-[10px] font-bold tracking-[1em] uppercase text-gray-900 dark:text-white'>Since 2025</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default MissionSection
