import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowRight, Eye, Globe, Layers, Sparkles } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const HeroSection = () => {
  const [activeFeature, setActiveFeature] = useState(0)
  const { scrollY } = useScroll()
  const containerRef = useRef(null)

  // Custom cursor follow
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springConfig = { damping: 25, stiffness: 700 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 1000], [0, -100])
  const y2 = useTransform(scrollY, [0, 1000], [0, -200])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 100)
      cursorY.set(e.clientY - 100)
    }

    window.addEventListener('mousemove', moveCursor)
    return () => {
      window.removeEventListener('mousemove', moveCursor)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Sparkles,
      title: 'AI Design Intelligence',
      description: 'Neural networks trained on 50M+ interior designs',
      gradient: 'from-violet-500/20 to-purple-600/20',
    },
    {
      icon: Layers,
      title: '3D Visualization Engine',
      description: 'Real-time rendering with photorealistic quality',
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: Eye,
      title: 'Visual Recognition',
      description: 'Instant style analysis from uploaded images',
      gradient: 'from-emerald-500/20 to-teal-500/20',
    },
    {
      icon: Globe,
      title: 'UAE Marketplace',
      description: 'Curated network of verified local installers',
      gradient: 'from-orange-500/20 to-red-500/20',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <>
      {/* Custom Cursor Follow Effect */}
      <motion.div
        className='fixed pointer-events-none z-0 hidden md:block'
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <div
          className='w-48 h-48 rounded-full opacity-20'
          style={{
            background:
              'radial-gradient(circle, rgba(147, 124, 96, 0.3) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </motion.div>

      <section
        ref={containerRef}
        className='relative min-h-screen bg-black overflow-hidden'
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
              backgroundSize: '60px 60px',
            }}
          />
        </motion.div>

        {/* Floating Elements */}
        <div className='absolute inset-0 overflow-hidden'>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className='absolute w-32 h-32 rounded-full opacity-10 blur-xl'
              style={{
                left: `${20 + i * 20}%`,
                top: `${15 + (i % 2) * 50}%`,
                background:
                  i === 0
                    ? '#937c60'
                    : i === 1
                    ? 'linear-gradient(45deg, #3b82f6, #06b6d4)'
                    : i === 2
                    ? 'linear-gradient(45deg, #10b981, #14b8a6)'
                    : 'linear-gradient(45deg, #f59e0b, #ef4444)',
              }}
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <motion.div
          className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32'
          style={{ opacity }}
        >
          <div className='min-h-screen flex flex-col justify-center py-8'>
            <motion.div
              className='grid lg:grid-cols-12 gap-8 lg:gap-16 items-center'
              variants={containerVariants}
              initial='hidden'
              animate='visible'
            >
              {/* Left Content */}
              <div className='lg:col-span-7 space-y-8 text-center lg:text-left'>
                <motion.div className='space-y-6' variants={itemVariants}>
                  <motion.h1
                    className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight'
                    style={{ y: y1 }}
                  >
                    <motion.span
                      className='block text-white'
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                      Design
                    </motion.span>
                    <motion.span
                      className='block text-[#937c60]'
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        duration: 1,
                        delay: 0.2,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      Amplified
                    </motion.span>
                    <motion.span
                      className='block text-gray-400 text-3xl md:text-4xl lg:text-6xl font-light'
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        duration: 1,
                        delay: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      by Intelligence
                    </motion.span>
                  </motion.h1>

                  <motion.p
                    className='text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto lg:mx-0 leading-relaxed text-gray-400'
                    variants={itemVariants}
                  >
                    Transform spaces with AI that thinks like a designer. From
                    concept to installation,
                    <span className='font-medium text-white'>
                      {' '}
                      Manāra orchestrates your entire interior journey
                    </span>{' '}
                    in the UAE.
                  </motion.p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  className='flex flex-col sm:flex-row gap-4 pt-4'
                  variants={itemVariants}
                >
                  <motion.button
                    className='group relative px-8 py-4 bg-[#937c60] text-white font-bold rounded-2xl overflow-hidden'
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      className='absolute inset-0 bg-gradient-to-r from-[#a68970] to-[#937c60]'
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className='relative flex items-center justify-center gap-2'>
                      <span>Start Designing</span>
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <ArrowRight className='w-5 h-5' />
                      </motion.div>
                    </div>
                  </motion.button>

                  <motion.button
                    className='group flex items-center justify-center gap-3 px-8 py-4 backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-[#937c60]/30 text-white rounded-2xl transition-all duration-300'
                    whileHover={{
                      scale: 1.02,
                      borderColor: 'rgba(147, 124, 96, 0.6)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Watch Live Demo</span>
                  </motion.button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  className='grid grid-cols-3 gap-8 lg:gap-12 pt-12'
                  variants={itemVariants}
                >
                  {[
                    { value: '2.4s', label: 'Avg Generation Time' },
                    { value: '99.2%', label: 'Design Accuracy' },
                    { value: '500+', label: 'UAE Partners' },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className='text-center lg:text-left'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    >
                      <div className='text-2xl lg:text-3xl font-bold text-white'>
                        {stat.value}
                      </div>
                      <div className='text-sm text-gray-500 leading-tight'>
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Right Visual */}
              <div className='lg:col-span-5 relative mt-12 lg:mt-0'>
                <motion.div variants={itemVariants} className='relative'>
                  <motion.div
                    className='backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl'
                    whileHover={{ y: -10, rotateY: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className='space-y-6'>
                      {/* Header */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='w-3 h-3 bg-red-400 rounded-full'></div>
                          <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                          <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                        </div>
                        <div className='text-xs text-gray-500 font-mono'>
                          manara.ai/design
                        </div>
                      </div>

                      {/* Features Grid */}
                      <div className='grid grid-cols-2 gap-4'>
                        <AnimatePresence mode='wait'>
                          {features.map((feature, index) => {
                            const IconComponent = feature.icon
                            const isActive = index === activeFeature
                            return (
                              <motion.div
                                key={index}
                                className={`relative p-5 rounded-2xl border transition-all duration-500 ${
                                  isActive
                                    ? 'bg-white/10 border-[#937c60]/40'
                                    : 'bg-white/5 border-white/10'
                                }`}
                                layout
                                animate={{
                                  scale: isActive ? 1.05 : 1,
                                  opacity: isActive ? 1 : 0.7,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <motion.div
                                  className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-3`}
                                  animate={{ rotate: isActive ? 360 : 0 }}
                                  transition={{
                                    duration: 2,
                                    ease: 'easeInOut',
                                  }}
                                >
                                  <IconComponent className='w-4 h-4 text-white' />
                                </motion.div>

                                <div className='text-white font-semibold text-sm mb-2'>
                                  {feature.title}
                                </div>
                                <div className='text-gray-400 text-xs leading-relaxed'>
                                  {feature.description}
                                </div>

                                {isActive && (
                                  <motion.div
                                    className='absolute -inset-0.5 bg-[#937c60]/20 rounded-2xl -z-10'
                                    layoutId='activeFeature'
                                    transition={{ duration: 0.3 }}
                                  />
                                )}
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </div>

                      {/* Progress Bar */}
                      <div className='space-y-2'>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm text-gray-400'>
                            Generating Design...
                          </span>
                          <span className='text-sm font-mono text-white'>
                            87%
                          </span>
                        </div>
                        <div className='w-full bg-white/10 rounded-full h-2'>
                          <motion.div
                            className='bg-[#937c60] h-2 rounded-full shadow-lg shadow-[#937c60]/30'
                            initial={{ width: '0%' }}
                            animate={{ width: '87%' }}
                            transition={{
                              duration: 2,
                              delay: 1,
                              ease: 'easeOut',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Elements around the interface */}
                  <motion.div
                    className='absolute -top-4 -right-4 w-8 h-8 bg-[#937c60] rounded-full opacity-60'
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className='absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full opacity-40'
                    animate={{
                      y: [0, 10, 0],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Subtle noise texture */}
        <div
          className='absolute inset-0 opacity-5 pointer-events-none mix-blend-multiply'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </section>
    </>
  )
}

export default HeroSection
