import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import {
    Activity,
    ArrowRight,
    Box,
    Camera,
    CheckCircle,
    Cpu,
    FileText,
    Layers,
    MapPin,
    Sparkles,
    Zap
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/button'

const AIOutputsSection = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const steps = [
    { number: '01', title: 'Capture Space', desc: 'Photometric Data' },
    { number: '02', title: 'Neural Map', desc: 'Vector Alignment' },
    { number: '03', title: 'HD Synthesis', desc: 'Neural Rendering' },
    { number: '04', title: 'Verification', desc: 'Local Compliance' },
  ]

  const inputItems = [
    { icon: Camera, title: 'Spatial Scan', detail: 'Primary perspective mapped' },
    { icon: Sparkles, title: 'Aesthetic DNA', detail: 'Minimalist vector extraction' },
    { icon: Zap, title: 'Light Logic', detail: 'Photometric environment data' },
  ]

  const deliverables = [
    { icon: FileText, title: 'Design Deck', meta: 'Stakeholder presentation ready' },
    { icon: Layers, title: 'CAD Layer', meta: 'Millimeter precision blueprints' },
    { icon: Sparkles, title: 'UHD Render', meta: 'Path-traced light synthesis' },
    { icon: MapPin, title: 'Sourcing Mesh', meta: 'Verified UAE contractor list' },
  ]

  const startSequence = () => {
    if (currentStep !== 0) return
    const sequence = [400, 1400, 2400, 3400]
    sequence.forEach((delay, index) => {
      setTimeout(() => setCurrentStep(index + 1), delay)
    })
  }

  return (
    <section ref={containerRef} className='relative py-24 bg-[#faf8f6] overflow-hidden px-6 md:px-12'>
      {/* Dynamic Background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-[#937c60]/5 blur-[120px]' />
        <div className='absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#b8a58c]/3 blur-[100px]' />
      </div>

      <div className='relative z-10 max-w-[1400px] mx-auto w-full'>
        {/* Cinematic Header */}
        <div className='flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24'>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onViewportEnter={() => {
              if (!isMobile) startSequence()
              else setCurrentStep(4)
            }}
            className='space-y-6'
          >
            <div className='flex items-center gap-4'>
              <div className='w-12 h-[1px] bg-[#937c60]'></div>
              <span className='text-[10px] font-bold tracking-[0.5em] text-[#937c60] uppercase'>The Synthesis Engine</span>
            </div>
            <h2 className='text-6xl md:text-8xl font-bold text-gray-900 tracking-tightest leading-[0.85]'>
              Input Raw. <br />
              <span className='text-[#937c60] font-serif italic'>Output Pure.</span>
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className='text-gray-400 font-medium text-xl max-w-sm leading-relaxed'
          >
            Our core engine distills raw environmental data into cinematic, structurally verified architecture.
          </motion.p>
        </div>

        {/* Sophisticated Pipeline Tracker */}
        <div className='mb-24 relative px-4'>
           {/* Connecting Line */}
           <div className='absolute top-10 left-0 right-0 h-[1.5px] bg-gray-100 hidden lg:block z-0'>
              <motion.div 
                className='absolute h-full bg-[#937c60] shadow-[0_0_15px_rgba(147,124,96,0.5)]'
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
           </div>

           <div className='relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0'>
              {steps.map((step, i) => (
                <div key={i} className='flex flex-col items-center lg:items-start text-center lg:text-left group'>
                  <div className='relative mb-6'>
                    <motion.div 
                      className={`w-20 h-20 rounded-[28px] flex items-center justify-center font-bold text-2xl transition-all duration-700 ${currentStep > i ? 'bg-[#937c60] text-white shadow-[0_20px_40px_rgba(147,124,96,0.25)]' : 'bg-white border border-gray-100 text-gray-200 shadow-sm'}`}
                      animate={currentStep === i + 1 ? { scale: 1.15, rotate: [0, 5, -5, 0] } : { scale: 1 }}
                    >
                      {currentStep > i ? <CheckCircle size={28} /> : <span>{step.number}</span>}
                    </motion.div>
                    {currentStep === i + 1 && (
                      <motion.div 
                        className='absolute -inset-2 border-2 border-[#937c60]/20 rounded-[32px] border-dashed'
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                  </div>
                  <div className='space-y-1 lg:pr-8'>
                     <p className={`text-lg font-bold transition-colors duration-500 ${currentStep > i ? 'text-gray-900' : 'text-gray-300'}`}>{step.title}</p>
                     <p className='text-[10px] uppercase tracking-widest text-[#937c60]/60 font-bold'>{step.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Central Neural Transformation HUD */}
        <div className='grid xl:grid-cols-12 gap-12 items-stretch mb-32'>
           {/* Left: Input Intelligence */}
           <motion.div 
             className='xl:col-span-5'
             initial={{ opacity: 0, x: -40 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
           >
              <div className='h-full bg-white rounded-[48px] p-10 md:p-14 border border-gray-100 shadow-[0_30px_60px_rgba(0,0,0,0.02)] flex flex-col justify-between group overflow-hidden relative'>
                 <div className='absolute top-0 right-0 w-32 h-32 bg-[#937c60]/5 blur-3xl rounded-full' />
                 
                 <div className='space-y-4 mb-20'>
                    <h3 className='text-3xl font-bold text-gray-900 tracking-tight'>Neural Input</h3>
                    <p className='text-gray-400 font-medium'>Capture. Map. Synthesize.</p>
                 </div>
                 
                 <div className='space-y-6'>
                    {inputItems.map((item, i) => (
                      <motion.div 
                        key={i} 
                        className={`flex items-center gap-6 p-6 rounded-[28px] border transition-all duration-700 ${currentStep > 0 ? 'border-[#937c60]/20 bg-stone-50' : 'border-gray-50 bg-gray-50/50 grayscale'}`}
                        whileHover={currentStep > 0 ? { x: 10, backgroundColor: 'white' } : {}}
                      >
                         <div className='w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#937c60] shadow-sm'>
                            <item.icon size={22} />
                         </div>
                         <div className='space-y-1'>
                            <p className='font-bold text-gray-900'>{item.title}</p>
                            <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none'>{item.detail}</p>
                         </div>
                      </motion.div>
                    ))}
                 </div>
              </div>
           </motion.div>

           {/* Center: Neural Core Animation */}
           <div className='xl:col-span-2 flex flex-col items-center justify-center gap-10 py-12 lg:py-0'>
              <div className='relative'>
                 <motion.div 
                   animate={{ 
                     rotate: [0, 360],
                     scale: [1, 1.05, 1]
                   }}
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                   className='w-32 h-32 rounded-full border border-[#937c60]/10 flex items-center justify-center p-6'
                 >
                    <div className='w-full h-full rounded-full bg-gradient-to-br from-[#937c60] via-[#b8a58c] to-[#937c60] shadow-[0_0_40px_rgba(147,124,96,0.3)] flex items-center justify-center text-white'>
                       <Activity size={32} />
                    </div>
                 </motion.div>
                 {/* Satellite orbs */}
                 <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                   className='absolute inset-[-20%] pointer-events-none'
                 >
                    <div className='absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#937c60]/40 blur-sm' />
                    <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#b8a58c]/40 blur-sm' />
                 </motion.div>
              </div>
              
              <div className='text-center space-y-2'>
                 <div className='flex items-center gap-2 justify-center'>
                    <Cpu size={14} className='text-[#937c60]' />
                    <p className='text-[10px] font-bold text-[#937c60] uppercase tracking-[0.4em]'>Active Core</p>
                 </div>
                 <p className='text-gray-300 font-mono text-[10px] tracking-widest'>Lat: 2.4ms / Gen: v4.8</p>
              </div>
           </div>

           {/* Right: Output Masterpiece */}
           <motion.div 
             className='xl:col-span-5'
             initial={{ opacity: 0, x: 40 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
           >
              <div className='h-full relative'>
                 <AnimatePresence mode='wait'>
                    {currentStep >= 3 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className='h-full bg-gray-900 rounded-[48px] p-10 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden group'
                      >
                         <div className='absolute top-0 left-0 w-full h-full opacity-30 mix-blend-overlay' 
                              style={{ backgroundImage: 'linear-gradient(45deg, #937c60 0%, transparent 100%)' }} />
                         
                         <div className='relative z-10 flex flex-col h-full'>
                            <div className='flex justify-between items-center mb-10'>
                               <div className='space-y-1'>
                                  <h3 className='text-3xl font-bold text-white tracking-tight'>Neural Output</h3>
                                  <p className='text-gray-400 font-medium text-sm'>Cinematic HD Generation</p>
                               </div>
                               <div className='px-4 py-2 bg-[#937c60]/20 text-[#a68970] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#937c60]/30 shadow-sm'>
                                  Verified
                               </div>
                            </div>
                            
                            <div className='relative flex-1 overflow-hidden rounded-[32px] group/img mb-10'>
                               <img 
                                 src='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&auto=format' 
                                 alt='Neural Output' 
                                 className='w-full h-full object-cover grayscale brightness-110 group-hover/img:grayscale-0 group-hover/img:scale-110 transition-all duration-1000'
                               />
                               <div className='absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent' />
                               <div className='absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between'>
                                   <div className='flex items-center gap-3'>
                                      <Box size={16} className='text-[#937c60]' />
                                      <span className='text-[10px] font-bold text-white uppercase tracking-widest'>Render v2.4</span>
                                   </div>
                                   <span className='text-[8px] font-mono text-white/40'>4096 x 2730 px</span>
                               </div>
                            </div>
                            
                            <div className='flex flex-wrap items-center justify-between gap-6'>
                               <div className='space-y-1'>
                                  <p className='text-sm font-bold text-white'>Neural Moodboard Arch_12</p>
                                  <p className='text-[10px] text-gray-500 font-medium'>Optimized for UAE High-Tier Residential</p>
                               </div>
                               <Button className='bg-white text-gray-900 hover:bg-white/90 rounded-2xl px-8 h-12 font-bold transition-all active:scale-95'>
                                  Explore Deck
                               </Button>
                            </div>
                         </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='h-full bg-white rounded-[48px] border border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center'
                      >
                         <div className='w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center text-gray-300 mb-6'>
                            <Activity size={32} className='animate-pulse' />
                         </div>
                         <h4 className='text-xl font-bold text-gray-400 mb-2'>Synthesis in Progress</h4>
                         <p className='text-sm text-gray-300'>Awaiting neural map completion...</p>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </motion.div>
        </div>

        {/* Deliverables Grid - Refined Cards */}
        <div className='max-w-[1200px] mx-auto'>
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             className='text-center mb-16 space-y-4'
           >
              <div className='h-[1px] w-24 bg-gray-200 mx-auto mb-6' />
              <h4 className='text-[11px] font-bold text-[#937c60] uppercase tracking-[0.6em]'>Included Deliverables</h4>
           </motion.div>
           
           <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {deliverables.map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10, backgroundColor: 'white', borderColor: '#937c60/20' }}
                  className='p-10 rounded-[40px] border border-gray-100/50 bg-[#faf8f6] transition-all duration-500 group text-center flex flex-col items-center'
                >
                   <div className='w-20 h-20 rounded-[30px] bg-white border border-gray-100 flex items-center justify-center mb-8 group-hover:bg-gray-900 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm'>
                      <item.icon size={26} />
                   </div>
                   <div className='space-y-3'>
                      <p className='text-lg font-bold text-gray-900 leading-tight'>{item.title}</p>
                      <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed px-4'>{item.meta}</p>
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
