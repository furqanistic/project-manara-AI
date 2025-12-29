import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  Camera,
  CheckCircle,
  FileText,
  Layers,
  MapPin,
  Sparkles,
  Zap,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'

const AIOutputsSection = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const yParallax = useTransform(scrollY, [2500, 3500], [0, -100])

  const brandColor = '#937c60'

  const steps = [
    { number: '01', title: 'Capture Space', desc: 'Raw environment scan.' },
    { number: '02', title: 'Neural Alignment', desc: 'Style vector mapping.' },
    { number: '03', title: 'Synthesis', desc: 'HD layout generation.' },
    { number: '04', title: 'Execution', desc: 'Partner bridge active.' },
  ]

  const inputItems = [
    { icon: Camera, title: 'Office Scan', detail: 'Primary perspective' },
    { icon: Sparkles, title: 'Aesthetic DNA', detail: 'Minimalist / Industrial' },
    { icon: Zap, title: 'Spatial Logic', detail: 'Workflow optimized' },
  ]

  const deliverables = [
    { icon: FileText, title: 'Design Deck', meta: 'Stakeholder ready' },
    { icon: Layers, title: 'CAD Blueprint', meta: 'Millimeter precision' },
    { icon: Sparkles, title: 'UHD Render', meta: 'Path-traced light' },
    { icon: MapPin, title: 'Local Mesh', meta: 'Verified UAE firms' },
  ]

  return (
    <section className='relative py-40 bg-[#faf8f6] overflow-hidden px-10 md:px-20'>
      {/* Background Ambience */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#937c60]/5 blur-[120px]' />
        <div className='absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#b8a58c]/3 blur-[100px]' />
      </div>

      <div className='relative z-10 max-w-[1500px] mx-auto w-full'>
        {/* Cinematic Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          onViewportEnter={() => {
            setTimeout(() => setCurrentStep(1), 500)
            setTimeout(() => setCurrentStep(2), 1500)
            setTimeout(() => setCurrentStep(3), 2500)
            setTimeout(() => setCurrentStep(4), 3500)
          }}
          className='flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-32'
        >
          <div className='space-y-6'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-[1px] bg-[#937c60] opacity-40'></div>
              <span className='text-[10px] font-bold tracking-[0.5em] text-[#937c60] uppercase'>The Pipeline</span>
            </div>
            <h2 className='text-6xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-[0.85]'>
              Input Raw. <br />
              <span className='text-[#937c60]'>Output Pure.</span>
            </h2>
          </div>
          <p className='text-gray-400 font-medium text-xl max-w-sm'>
            Our design engine distills raw environmental data into actionable, premium architecture.
          </p>
        </motion.div>

        {/* Phase Progress HUD */}
        <div className='mb-32'>
           <div className='flex flex-wrap lg:flex-nowrap items-center gap-8 lg:gap-0'>
              {steps.map((step, i) => (
                <React.Fragment key={i}>
                  <div className='flex items-center gap-6 group'>
                    <motion.div 
                      className={`w-20 h-20 rounded-[30px] flex items-center justify-center font-bold text-2xl transition-all duration-700 ${currentStep > i ? 'bg-[#937c60] text-white shadow-[0_15px_30px_rgba(147,124,96,0.3)]' : 'bg-white border border-gray-100 text-gray-300'}`}
                      animate={currentStep === i + 1 ? { scale: 1.15 } : { scale: 1 }}
                    >
                      {currentStep > i ? <CheckCircle size={28} /> : <span>{step.number}</span>}
                    </motion.div>
                    <div className='space-y-1 lg:pr-12'>
                       <p className={`font-bold transition-colors duration-500 ${currentStep > i ? 'text-gray-900' : 'text-gray-300'}`}>{step.title}</p>
                       <p className='text-[10px] uppercase tracking-widest text-gray-400 font-bold'>{step.desc}</p>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className='hidden lg:block h-[1px] bg-gray-100 flex-1 mx-8 relative overflow-hidden'>
                       <motion.div 
                         className='absolute inset-0 bg-[#937c60]'
                         initial={{ x: '-100%' }}
                         animate={currentStep > i + 1 ? { x: '0%' } : { x: '-100%' }}
                         transition={{ duration: 1, ease: 'easeInOut' }}
                       />
                    </div>
                  )}
                </React.Fragment>
              ))}
           </div>
        </div>

        {/* Primary Transformation HUD */}
        <div className='grid xl:grid-cols-12 gap-16 items-center mb-40'>
           {/* Left: Input Analysis */}
           <motion.div 
             className='xl:col-span-5'
             initial={{ opacity: 0, x: -40 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
           >
              <div className='bg-white rounded-[60px] p-12 border border-black/5 shadow-[0_40px_100px_rgba(0,0,0,0.02)] space-y-12'>
                 <div className='space-y-4'>
                    <h3 className='text-3xl font-bold text-gray-900 tracking-tight'>Environmental Data</h3>
                    <p className='text-gray-400 font-medium'>Capture. Map. Synthesize.</p>
                 </div>
                 
                 <div className='space-y-6'>
                    {inputItems.map((item, i) => (
                      <motion.div 
                        key={i} 
                        className={`flex items-center gap-6 p-6 rounded-3xl border transition-all duration-700 ${currentStep > 0 ? 'border-[#937c60]/20 bg-[#937c60]/5' : 'border-gray-50 bg-gray-50/50 grayscale'}`}
                      >
                         <div className='w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#937c60] shadow-sm'>
                            <item.icon size={24} />
                         </div>
                         <div className='space-y-1'>
                            <p className='font-bold text-gray-900'>{item.title}</p>
                            <p className='text-xs text-gray-400 font-bold uppercase tracking-widest'>{item.detail}</p>
                         </div>
                      </motion.div>
                    ))}
                 </div>
              </div>
           </motion.div>

           {/* Center: Neural Core Animation */}
           <div className='xl:col-span-2 flex flex-col items-center justify-center gap-6'>
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 90, 180, 270, 360] 
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className='w-24 h-24 rounded-full border border-[#937c60]/20 flex items-center justify-center p-4'
              >
                  <div className='w-full h-full rounded-full bg-gradient-to-br from-[#937c60] to-[#b8a58c] shadow-[0_0_30px_rgba(147,124,96,0.3)]' />
              </motion.div>
              <div className='text-center space-y-1'>
                 <p className='text-[10px] font-bold text-[#937c60] uppercase tracking-[0.4em]'>Synthesis</p>
                 <p className='text-gray-400 font-mono text-xs'>2.4ms latency</p>
              </div>
           </div>

           {/* Right: Output Preview */}
           <motion.div 
             className='xl:col-span-5'
             initial={{ opacity: 0, x: 40 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
           >
              <AnimatePresence>
                 {currentStep >= 3 && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className='bg-white rounded-[60px] p-12 border border-black/5 shadow-[0_40px_100px_rgba(0,0,0,0.02)]'
                   >
                      <div className='flex justify-between items-center mb-10'>
                         <h3 className='text-3xl font-bold text-gray-900 tracking-tight'>Design Result</h3>
                         <div className='px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2'>
                            <div className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />
                            Verified Output
                         </div>
                      </div>
                      
                      <div className='relative overflow-hidden rounded-[40px] aspect-[4/3] group'>
                         <img 
                           src='/Home/moodboard.png' 
                           alt='Neural Output' 
                           className='w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700'
                         />
                         <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
                      </div>
                      
                      <div className='mt-8 flex justify-between items-end'>
                         <div className='space-y-1'>
                            <p className='font-bold text-gray-900'>Neural Moodboard v2.4</p>
                            <p className='text-xs text-gray-400'>Generated for UAE Commercial Standards</p>
                         </div>
                         <Button className='bg-gray-900 rounded-2xl px-6 py-6'>Explore Output</Button>
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </motion.div>
        </div>

        {/* Deliverables Grid */}
        <div className='max-w-5xl mx-auto'>
           <motion.h4 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             className='text-center text-[10px] font-bold text-[#937c60] uppercase tracking-[0.6em] mb-16'
           >
             Included Deliverables
           </motion.h4>
           
           <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
              {deliverables.map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className='text-center space-y-6 group'
                >
                   <div className='w-20 h-20 rounded-[30px] bg-white border border-gray-100 flex items-center justify-center mx-auto group-hover:bg-[#937c60] group-hover:text-white transition-all duration-500'>
                      <item.icon size={28} />
                   </div>
                   <div className='space-y-1'>
                      <p className='font-bold text-gray-900'>{item.title}</p>
                      <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>{item.meta}</p>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </div>
    </section>
  )
}

export default AIOutputsSection
