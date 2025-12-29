import {
    AnimatePresence,
    motion,
    useScroll,
    useTransform,
} from 'framer-motion'
import { ArrowRight, ChevronRight, Globe, Sparkles, Zap } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'

const HeroSection = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
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

  const yHero = useTransform(scrollY, [0, 500], [0, 100])
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0])

  const brandColor = '#937c60'

  const stages = [
    { title: 'Neural Analysis', status: 'Scanning geometry...', color: '#937c60' },
    { title: 'Aesthetic Search', status: 'Matching intent...', color: '#b8a58c' },
    { title: 'HD Synthesis', status: 'Generating photorealism...', color: '#e5e7eb' },
  ]

  return (
    <section className='relative min-h-screen bg-[#faf8f6] font-["Poppins"] selection:bg-[#937c60]/10 overflow-hidden flex items-center pt-40 md:pt-48'>
      {/* Cinematic Background Ambience */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-[#937c60]/5 blur-[140px]' />
        <div className='absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#937c60]/3 blur-[120px]' />
      </div>

      <main className='relative z-10 max-w-[1500px] mx-auto px-10 md:px-20 w-full'>
        <div className='grid xl:grid-cols-12 gap-20 items-center'>
          
          {/* Left Content Column */}
          <motion.div 
            style={{ y: yHero, opacity: opacityHero }}
            className='xl:col-span-7 space-y-12'
          >
            <div className='space-y-6'>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className='flex items-center gap-4'
              >
                <div className='w-16 h-[1px] bg-[#937c60] opacity-40'></div>
                <span className='text-[10px] font-bold tracking-[0.6em] text-[#937c60] uppercase'>Neural Design Intelligence</span>
              </motion.div>
              
              <h1 className='text-[10vw] md:text-[8vw] lg:text-[7vw] font-bold text-gray-900 tracking-tighter leading-[0.85]'>
                Synthesize <br />
                <span className='text-[#937c60]'>Space.</span>
              </h1>

              <p className='text-gray-400 font-medium text-xl md:text-2xl max-w-xl leading-relaxed'>
                The design engine that translates your imagination into photorealistic, executable architecture.
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-8 items-center pt-4'>
               <Button 
                 onClick={() => window.location.href = '/moodboard'}
                 className='bg-gray-900 hover:bg-black text-white px-12 py-8 rounded-[32px] font-bold text-lg flex items-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.1)] active:scale-95 transition-all'
               >
                 Begin Genesis
                 <ArrowRight size={20} />
               </Button>
               
               <a href="/pricing" className='group flex items-center gap-4 text-gray-500 font-bold hover:text-gray-900 transition-colors'>
                  Enterprise Demo
                  <ChevronRight size={20} className='group-hover:translate-x-2 transition-transform text-[#937c60]' />
               </a>
            </div>

            {/* Architectural Stats Bar */}
            <div className='grid grid-cols-3 gap-12 pt-16 border-t border-gray-100 max-w-xl'>
               {[
                 { label: 'Latency', value: '2.4ms' },
                 { label: 'Library', value: '50M+' },
                 { label: 'Uptime', value: '99.9%' }
               ].map((stat, i) => (
                 <div key={i} className='space-y-1'>
                    <p className='text-2xl font-bold text-gray-900 tracking-tighter'>{stat.value}</p>
                    <p className='text-[9px] font-bold text-[#937c60] uppercase tracking-widest'>{stat.label}</p>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Right Visual Column (Neural HUD) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className='xl:col-span-5 relative hidden xl:block'
          >
            <div className='bg-white rounded-[60px] p-12 shadow-[0_50px_100px_rgba(147,124,96,0.08)] border border-[#937c60]/5 relative overflow-hidden group'>
               <div className='absolute top-0 right-0 w-64 h-64 bg-[#937c60]/5 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full' />
               
               <div className='relative z-10 space-y-10'>
                  {/* Neural Core Element */}
                  <div className='flex justify-between items-center'>
                     <div className='flex gap-2'>
                        <div className='w-2 h-2 rounded-full bg-gray-100' />
                        <div className='w-2 h-2 rounded-full bg-gray-100' />
                        <div className='w-2 h-2 rounded-full bg-[#937c60]/40' />
                     </div>
                     <span className='font-mono text-[10px] text-gray-300 tracking-widest uppercase'>Core-v4.8</span>
                  </div>

                  <div className='aspect-square rounded-[40px] bg-gray-50 overflow-hidden relative border border-gray-100'>
                     <img 
                       src='https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format' 
                       alt='Neural Synthesis Preview' 
                       className='w-full h-full object-cover grayscale brightness-110 group-hover:grayscale-0 transition-all duration-1000'
                     />
                     <div className='absolute inset-0 bg-[#937c60]/10 mix-blend-overlay' />
                     
                     {/* Scanning Line Animation */}
                     <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        className='absolute inset-x-0 h-[100px] bg-gradient-to-b from-[#937c60]/30 to-transparent z-20 pointer-events-none flex items-start'
                     >
                        <div className='w-full h-[1px] bg-[#937c60]/50' />
                     </motion.div>
                  </div>

                  {/* Dynamic Status HUD */}
                  <div className='space-y-6'>
                     <AnimatePresence mode='wait'>
                        <motion.div 
                          key={activeStep}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className='p-6 rounded-3xl bg-gray-50 border border-gray-100 flex justify-between items-center'
                        >
                           <div className='space-y-1'>
                              <p className='text-xs font-bold text-gray-900'>{stages[activeStep].title}</p>
                              <p className='text-[10px] text-[#937c60] font-bold uppercase tracking-widest'>{stages[activeStep].status}</p>
                           </div>
                           <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                           >
                              <Sparkles size={18} className='text-[#937c60]' />
                           </motion.div>
                        </motion.div>
                     </AnimatePresence>

                     <div className='flex justify-between items-end'>
                        <div className='space-y-1'>
                           <p className='text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em]'>Synthesis Active</p>
                           <p className='text-3xl font-bold text-gray-900 tracking-tighter'>Manāra Genesis</p>
                        </div>
                        <div className='w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white'>
                           <Zap size={20} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Floating Detail Tags */}
          </motion.div>
        </div>
      </main>

      {/* Decorative Side Anchor */}
      {!isMobile && (
        <div className='absolute left-10 bottom-20 h-32 flex flex-col items-center justify-between pointer-events-none opacity-20'>
          <div className='w-[1px] h-12 bg-[#937c60]' />
          <Globe size={18} className='text-[#937c60]' />
          <div className='w-[1px] h-12 bg-[#937c60]' />
        </div>
      )}
    </section>
  )
}

export default HeroSection
