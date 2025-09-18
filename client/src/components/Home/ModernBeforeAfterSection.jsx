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
  Eye,
  Layers,
  MousePointer,
  Sparkles,
  Zap,
} from 'lucide-react'
import React, { useRef, useState } from 'react'

const ModernBeforeAfterSection = () => {
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef(null)
  const sliderRef = useRef(null)
  const { scrollY } = useScroll()

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 1000], [0, -100])
  const y2 = useTransform(scrollY, [0, 1000], [0, 50])

  // Motion values for the slider
  const sliderPosition = useMotionValue(50)
  const springSliderPosition = useSpring(sliderPosition, {
    damping: 20,
    stiffness: 300,
  })

  const brandColor = '#937c60'
  const brandColorLight = '#a68970'

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
      icon: Eye,
      title: 'Upload & Analyze',
      description: 'AI scans your space instantly',
      delay: 0.1,
    },
    {
      icon: Sparkles,
      title: 'Generate Concepts',
      description: 'Multiple design options created',
      delay: 0.2,
    },
    {
      icon: Layers,
      title: '3D Visualization',
      description: 'Photorealistic renders produced',
      delay: 0.3,
    },
    {
      icon: Zap,
      title: 'Connect & Install',
      description: 'UAE partners ready to execute',
      delay: 0.4,
    },
  ]

  const stats = [
    { value: '2.4s', label: 'Generation Time' },
    { value: '500+', label: 'UAE Partners' },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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
    hidden: { x: -40, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <section
      ref={containerRef}
      className='relative min-h-screen bg-black overflow-hidden flex items-center py-20'
    >
      {/* Animated Grid Background */}
      <motion.div className='absolute inset-0 opacity-10' style={{ y: y2 }}>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 124, 96, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 124, 96, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </motion.div>

      {/* Floating Background Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          className='absolute top-20 right-20 w-40 h-40 rounded-full opacity-5'
          style={{
            background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)`,
            y: y1,
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className='absolute bottom-40 left-20 w-32 h-32 rounded-full opacity-5'
          style={{
            background: `radial-gradient(circle, ${brandColorLight} 0%, transparent 70%)`,
            y: y2,
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <motion.div
        className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6'
        variants={containerVariants}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Header */}
        <motion.div
          className='text-center space-y-6 mb-20'
          variants={itemVariants}
        >
          <motion.h2
            className='text-5xl md:text-7xl font-black leading-none tracking-tight'
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className='block text-white'
              initial={{ x: -50 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              See the
            </motion.span>
            <motion.span
              className='block'
              style={{ color: brandColor }}
              initial={{ x: 50 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Magic Happen
            </motion.span>
          </motion.h2>

          <motion.p
            className='text-xl text-gray-400 max-w-2xl mx-auto'
            variants={itemVariants}
          >
            Watch how our AI transforms ordinary spaces into extraordinary
            environments.
            <motion.span
              className='text-white font-medium block mt-2'
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Move your cursor to reveal the transformation.
            </motion.span>
          </motion.p>
        </motion.div>

        {/* Main Grid */}
        <div className='grid lg:grid-cols-3 gap-12 items-center'>
          {/* Before/After Slider - 2 columns */}
          <motion.div className='lg:col-span-2' variants={itemVariants}>
            <motion.div
              ref={sliderRef}
              className='relative rounded-3xl overflow-hidden cursor-crosshair group shadow-2xl'
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              {/* Before Image */}
              <div className='relative w-full h-[500px] md:h-[600px]'>
                <motion.img
                  src='/Home/after.webp'
                  alt='Before transformation'
                  className='w-full h-full object-cover'
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1 }}
                />

                {/* Before Label */}
                <motion.div
                  className='absolute top-6 left-6 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/20'
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <span className='text-sm font-medium'>Before</span>
                </motion.div>
              </div>

              {/* After Image Overlay */}
              <motion.div
                className='absolute inset-0'
                style={{
                  clipPath: useTransform(
                    springSliderPosition,
                    (pos) => `polygon(0 0, ${pos}% 0, ${pos}% 100%, 0 100%)`
                  ),
                }}
              >
                <motion.img
                  src='/Home/before.webp'
                  alt='After transformation'
                  className='w-full h-full object-cover'
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                />

                {/* After Label */}
                <motion.div
                  className='absolute top-6 left-6 backdrop-blur-sm text-white px-4 py-2 rounded-full border'
                  style={{
                    background: `${brandColor}90`,
                    borderColor: `${brandColorLight}50`,
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <span className='text-sm font-medium'>After</span>
                </motion.div>
              </motion.div>

              {/* Reveal Line */}
              <motion.div
                className='absolute top-0 bottom-0 w-0.5 shadow-lg z-10'
                style={{
                  left: useTransform(springSliderPosition, (pos) => `${pos}%`),
                  background: `linear-gradient(to bottom, ${brandColorLight}, #ffffff, ${brandColorLight})`,
                }}
              >
                {/* Animated Handle */}
                <motion.div
                  className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl border-2 flex items-center justify-center'
                  style={{ borderColor: brandColor }}
                  whileHover={{ scale: 1.2 }}
                  animate={{
                    boxShadow: [
                      `0 0 20px ${brandColor}40`,
                      `0 0 30px ${brandColor}60`,
                      `0 0 20px ${brandColor}40`,
                    ],
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity },
                    scale: { duration: 0.2 },
                  }}
                >
                  <motion.div
                    className='w-3 h-3 rounded-full'
                    style={{ background: brandColor }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>

              {/* Instructions Overlay */}
              <AnimatePresence>
                {!isHovered && (
                  <motion.div
                    className='absolute inset-0 bg-black/20 flex items-center justify-center'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className='text-center text-white bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20'
                      initial={{ scale: 0.8, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.8, y: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className='w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border'
                        style={{
                          background: `${brandColor}20`,
                          borderColor: `${brandColor}50`,
                        }}
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <MousePointer
                          className='w-8 h-8'
                          style={{ color: brandColorLight }}
                        />
                      </motion.div>
                      <p className='text-lg font-semibold mb-2'>
                        Move to Transform
                      </p>
                      <p className='text-sm' style={{ color: brandColorLight }}>
                        Hover and move cursor left to right
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* How It Works - 1 column */}
          <motion.div className='space-y-8' variants={itemVariants}>
            {/* Process Steps */}
            <div className='space-y-6'>
              <motion.h3
                className='text-2xl font-bold text-white'
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                How It Works
              </motion.h3>

              <div className='space-y-4'>
                {processSteps.map((step, index) => {
                  const IconComponent = step.icon
                  return (
                    <motion.div
                      key={index}
                      variants={stepVariants}
                      initial='hidden'
                      whileInView='visible'
                      viewport={{ once: true }}
                      transition={{ delay: step.delay }}
                    >
                      <motion.div
                        className='flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 cursor-pointer'
                        whileHover={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          scale: 1.02,
                          borderColor: `${brandColor}30`,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          className='w-12 h-12 rounded-xl flex items-center justify-center border'
                          style={{
                            background: `${brandColor}20`,
                            borderColor: `${brandColor}30`,
                          }}
                          whileHover={{
                            background: `${brandColor}30`,
                            scale: 1.1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <IconComponent
                            className='w-6 h-6'
                            style={{ color: brandColorLight }}
                          />
                        </motion.div>
                        <div>
                          <motion.div className='text-white font-semibold mb-1'>
                            {step.title}
                          </motion.div>
                          <motion.div className='text-gray-400 text-sm'>
                            {step.description}
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Stats */}
            <motion.div
              className='grid grid-cols-2 gap-4'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className='text-center p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10'
                  whileHover={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    scale: 1.05,
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                >
                  <motion.div
                    className='text-2xl font-bold mb-1'
                    style={{ color: brandColorLight }}
                    animate={{
                      textShadow: [
                        `0 0 10px ${brandColor}40`,
                        `0 0 20px ${brandColor}60`,
                        `0 0 10px ${brandColor}40`,
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className='text-gray-400 text-sm'>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.button
              className='group w-full px-6 py-4 text-white font-bold rounded-2xl relative overflow-hidden'
              style={{
                background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColorLight} 100%)`,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 20px 40px -10px ${brandColor}40`,
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {/* Animated gradient overlay */}
              <motion.div
                className='absolute inset-0'
                style={{
                  background: `linear-gradient(135deg, ${brandColorLight} 0%, ${brandColor} 100%)`,
                }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Button content */}
              <div className='relative flex items-center justify-center gap-2'>
                <span>Start Your Transformation</span>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <ArrowRight className='w-5 h-5' />
                </motion.div>
              </div>

              {/* Shine effect */}
              <motion.div
                className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12'
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default ModernBeforeAfterSection
