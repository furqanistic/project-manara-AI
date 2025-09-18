import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  Camera,
  CheckCircle,
  FileText,
  Layers,
  MapPin,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react'
import React, { useState } from 'react'

const AIOutputsSection = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const { scrollY } = useScroll()

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 1000], [0, -50])
  const y2 = useTransform(scrollY, [0, 1000], [0, 100])

  const brandColor = '#937c60'
  const brandColorLight = '#a68970'

  const steps = [
    {
      number: '01',
      title: 'Upload Your Space',
      subtitle: 'Take a photo of your office',
    },
    {
      number: '02',
      title: 'Share Your Vision',
      subtitle: 'Describe your style preferences',
    },
    {
      number: '03',
      title: 'AI Creates Magic',
      subtitle: 'Professional outputs in seconds',
    },
    {
      number: '04',
      title: 'Ready to Build',
      subtitle: 'Connect with UAE installers',
    },
  ]

  const inputItems = [
    {
      icon: Camera,
      title: 'Office Photo',
      subtitle: 'current-office-space.jpg',
      step: 1,
    },
    {
      icon: Sparkles,
      title: 'Style Vision',
      subtitle: '"Modern, productive workspace"',
      step: 2,
    },
    {
      icon: () => <span className='font-bold'>$</span>,
      title: 'Budget Range',
      subtitle: 'AED 30,000 - 50,000',
      step: 2,
    },
  ]

  const deliverables = [
    {
      icon: FileText,
      title: 'Design Presentations',
      desc: 'Client pitch decks',
    },
    {
      icon: Layers,
      title: '2D AutoCAD Plans',
      desc: 'Technical drawings',
    },
    {
      icon: Sparkles,
      title: '3D Renders',
      desc: 'Photorealistic views',
    },
    {
      icon: MapPin,
      title: 'UAE Installers',
      desc: 'Within 1-2 hours',
    },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const stepVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const progressVariants = {
    hidden: { width: 0 },
    visible: {
      width: '100%',
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <section className='relative py-24 bg-gradient-to-b from-white via-stone-50 to-white overflow-hidden'>
      {/* Background Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          style={{ y: y1 }}
          className='absolute top-32 right-20 w-32 h-32 rounded-full opacity-5'
          style={{
            background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          style={{ y: y2 }}
          className='absolute bottom-32 left-20 w-40 h-40 rounded-full opacity-5'
          style={{
            background: `radial-gradient(circle, ${brandColorLight} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <motion.div
        className='max-w-7xl mx-auto px-6'
        variants={containerVariants}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Header */}
        <motion.div className='text-center mb-20' variants={itemVariants}>
          <motion.h2
            className='text-6xl md:text-7xl font-black text-stone-900 mb-6 leading-tight'
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              From Photo to
            </motion.span>
            <br />
            <motion.span
              style={{ color: brandColor }}
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Professional Design
            </motion.span>
          </motion.h2>

          <motion.p
            className='text-xl text-stone-600 max-w-3xl mx-auto'
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            See how AI transforms a simple office photo into complete design
            deliverables
          </motion.p>
        </motion.div>

        {/* Step Flow Indicator */}
        <motion.div
          className='flex justify-center mb-20'
          variants={itemVariants}
          onViewportEnter={() => {
            // Trigger step progression when in view
            setTimeout(() => setCurrentStep(1), 500)
            setTimeout(() => setCurrentStep(2), 1500)
            setTimeout(() => setCurrentStep(3), 2500)
            setTimeout(() => setCurrentStep(4), 3500)
          }}
        >
          <motion.div
            className='flex items-center gap-8 p-6 bg-white rounded-2xl shadow-lg border border-stone-100'
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {steps.map((step, index) => (
              <div key={index} className='flex items-center'>
                <div className='flex items-center gap-4'>
                  <motion.div
                    className='relative flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm'
                    initial={{ scale: 0.8 }}
                    animate={{
                      backgroundColor:
                        currentStep > index ? brandColor : 'transparent',
                      color: currentStep > index ? '#ffffff' : '#9ca3af',
                      borderColor:
                        currentStep > index ? 'transparent' : '#d1d5db',
                      borderWidth: currentStep > index ? 0 : 2,
                      scale: currentStep === index + 1 ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <AnimatePresence mode='wait'>
                      {currentStep > index ? (
                        <motion.div
                          key='check'
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CheckCircle className='w-6 h-6' />
                        </motion.div>
                      ) : (
                        <motion.span
                          key='number'
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          {step.number}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <div className='hidden md:block'>
                    <motion.div
                      className='font-semibold text-stone-900 text-sm'
                      animate={{
                        color: currentStep > index ? brandColor : '#111827',
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {step.title}
                    </motion.div>
                    <motion.div
                      className='text-stone-500 text-xs'
                      animate={{
                        opacity: currentStep > index ? 1 : 0.7,
                      }}
                    >
                      {step.subtitle}
                    </motion.div>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className='relative ml-8 w-12 h-0.5 bg-stone-200 rounded-full overflow-hidden'>
                    <motion.div
                      className='absolute inset-0 rounded-full'
                      style={{ backgroundColor: brandColor }}
                      variants={progressVariants}
                      initial='hidden'
                      animate={currentStep > index + 1 ? 'visible' : 'hidden'}
                    />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Main Transformation */}
        <div className='grid lg:grid-cols-12 gap-12 items-center mb-24'>
          {/* Input Side */}
          <motion.div className='lg:col-span-5' variants={itemVariants}>
            <motion.div
              className='bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden'
              whileHover={{
                y: -5,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
              }}
              transition={{ duration: 0.3 }}
            >
              <div className='p-8 border-b border-stone-100'>
                <h3 className='text-2xl font-bold text-stone-900 mb-2'>
                  Your Input
                </h3>
                <p className='text-stone-600'>
                  Simple details, powerful results
                </p>
              </div>

              <div className='p-8 space-y-6'>
                {inputItems.map((item, index) => {
                  const IconComponent = item.icon
                  const isActive = currentStep >= item.step

                  return (
                    <motion.div
                      key={index}
                      className='flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-500'
                      animate={{
                        borderColor: isActive ? '#bbf7d0' : '#e5e7eb',
                        backgroundColor: isActive ? '#f0fdf4' : '#f9fafb',
                      }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                    >
                      <motion.div
                        className='w-12 h-12 rounded-xl flex items-center justify-center'
                        animate={{
                          backgroundColor: isActive ? '#dcfce7' : '#f3f4f6',
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {typeof IconComponent === 'function' ? (
                          <motion.div
                            animate={{
                              color: isActive ? '#16a34a' : '#6b7280',
                            }}
                          >
                            <IconComponent />
                          </motion.div>
                        ) : (
                          <IconComponent
                            className='w-6 h-6'
                            style={{
                              color: isActive ? '#16a34a' : '#6b7280',
                            }}
                          />
                        )}
                      </motion.div>

                      <div className='flex-1'>
                        <div className='font-semibold text-stone-900'>
                          {item.title}
                        </div>
                        <div className='text-stone-600 text-sm'>
                          {item.subtitle}
                        </div>

                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              className='text-green-600 text-xs mt-1 flex items-center gap-1'
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CheckCircle className='w-3 h-3' />
                              <span>
                                {item.step === 1
                                  ? 'Analyzed'
                                  : item.step === 2
                                  ? 'Processed'
                                  : 'Complete'}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Arrow & Processing */}
          <div className='lg:col-span-2 flex justify-center'>
            <AnimatePresence>
              {currentStep >= 3 && (
                <motion.div
                  className='text-center'
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    className='inline-flex items-center gap-3 px-6 py-3 rounded-full text-white font-bold text-sm shadow-lg mb-4'
                    style={{
                      background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                    }}
                    animate={{
                      boxShadow: [
                        `0 4px 20px ${brandColor}30`,
                        `0 4px 30px ${brandColor}50`,
                        `0 4px 20px ${brandColor}30`,
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    AI Processing
                  </motion.div>

                  <motion.div
                    className='flex justify-center'
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight
                      className='w-8 h-8'
                      style={{ color: brandColor }}
                    />
                  </motion.div>

                  <motion.div
                    className='text-xs text-stone-500 mt-2'
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    2.4 seconds
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Output Side */}
          <motion.div className='lg:col-span-5' variants={itemVariants}>
            <AnimatePresence>
              {currentStep >= 3 && (
                <motion.div
                  className='bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden'
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.9 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{
                    y: -5,
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                  }}
                >
                  <div className='p-8 border-b border-stone-100'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='text-2xl font-bold text-stone-900 mb-2'>
                          AI Output
                        </h3>
                        <p className='text-stone-600'>
                          Professional moodboard ready
                        </p>
                      </div>

                      <motion.div
                        className='flex items-center gap-2 px-3 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <CheckCircle className='w-4 h-4' />
                        Complete
                      </motion.div>
                    </div>
                  </div>

                  <div className='p-8'>
                    <motion.div
                      className='relative group'
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    >
                      <motion.img
                        src='/Home/moodboard.png'
                        alt='AI Generated Office Moodboard'
                        className='w-full rounded-2xl shadow-lg'
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Overlay on hover */}
                      <motion.div
                        className='absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-all duration-300 flex items-center justify-center'
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <motion.div
                          className='px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-stone-900'
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          View Full Resolution
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className='mt-6 text-center'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <div className='font-semibold text-stone-900 mb-1'>
                        Professional Office Moodboard
                      </div>
                      <div className='text-stone-600 text-sm'>
                        Ready for client presentation or contractor briefing
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Complete Package */}
        <AnimatePresence>
          {currentStep >= 4 && (
            <motion.div
              className='text-center mb-16'
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.h3
                className='text-3xl font-bold text-stone-900 mb-4'
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Plus Everything Else You Need
              </motion.h3>

              <motion.p
                className='text-stone-600 mb-12'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Every Manāra project includes all deliverables for
                implementation
              </motion.p>

              <motion.div
                className='grid md:grid-cols-4 gap-6 max-w-4xl mx-auto'
                variants={containerVariants}
                initial='hidden'
                animate='visible'
              >
                {deliverables.map((item, index) => (
                  <motion.div
                    key={index}
                    className='p-6 bg-white rounded-2xl border border-stone-100 shadow-sm'
                    variants={stepVariants}
                    whileHover={{
                      y: -5,
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                      borderColor: `${brandColor}30`,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className='w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center'
                      style={{ background: `${brandColor}15` }}
                      whileHover={{
                        background: `${brandColor}25`,
                        scale: 1.1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <item.icon
                        className='w-6 h-6'
                        style={{ color: brandColor }}
                      />
                    </motion.div>

                    <h4 className='font-semibold text-stone-900 mb-2'>
                      {item.title}
                    </h4>
                    <p className='text-stone-600 text-sm'>{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          className='text-center'
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.button
            className='inline-flex items-center gap-4 px-10 py-5 text-lg font-bold rounded-2xl text-white shadow-2xl'
            style={{
              background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 25px 50px -10px ${brandColor}40`,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Upload className='w-5 h-5' />
            <span>Start with Your Office Photo</span>
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <ArrowRight className='w-5 h-5' />
            </motion.div>
          </motion.button>

          <motion.p
            className='text-stone-600 mt-6 max-w-2xl mx-auto'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            Upload a photo of your current office space and get a complete
            design package with professional moodboards, plans, and UAE
            installer connections
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default AIOutputsSection
