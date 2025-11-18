// File: project-manara-AI/client/src/components/Home/ImageCollageSection.jsx
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, Eye, Sparkles } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const ImageCollageSection = () => {
  const [hoveredImage, setHoveredImage] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [touchDevice, setTouchDevice] = useState(false)
  const { scrollY } = useScroll()

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
      setTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Mobile-optimized parallax effects
  const y1 = useTransform(scrollY, [0, 1000], isMobile ? [0, -20] : [0, -50])
  const y2 = useTransform(scrollY, [0, 1000], isMobile ? [0, 30] : [0, 100])
  const y3 = useTransform(scrollY, [0, 1000], isMobile ? [0, -10] : [0, -30])

  const brandColor = '#937c60'

  // Mobile-optimized design images with better positioning
  const designImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
      title: 'Modern Living Room',
      category: 'Living Spaces',
      size: 'lg',
      position: isMobile
        ? { top: '8%', left: '5%' }
        : { top: '4%', left: '4%' },
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=500&fit=crop&crop=center',
      title: 'Minimalist Kitchen',
      category: 'Kitchen Design',
      size: isMobile ? 'md' : 'lg',
      position: isMobile
        ? { top: '5%', left: '65%' }
        : { top: '2%', left: '72%' },
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop&crop=center',
      title: 'Luxe Bedroom',
      category: 'Bedrooms',
      size: isMobile ? 'md' : 'lg',
      position: isMobile
        ? { top: '75%', left: '70%' }
        : { top: '55%', left: '78%' },
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=400&fit=crop&crop=center',
      title: 'Workspace Design',
      category: 'Home Office',
      size: isMobile ? 'sm' : 'md',
      position: isMobile
        ? { top: '12%', left: '35%' }
        : { top: '5%', left: '45%' },
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&h=700&fit=crop&crop=center',
      title: 'Dining Experience',
      category: 'Dining Rooms',
      size: isMobile ? 'lg' : 'xl',
      position: isMobile
        ? { top: '45%', left: '8%' }
        : { top: '60%', left: '6%' },
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop&crop=center',
      title: 'Bathroom Spa',
      category: 'Bathrooms',
      size: 'sm',
      position: isMobile
        ? { top: '30%', left: '2%' }
        : { top: '40%', left: '1%' },
    },
    // Reduce number of images on mobile for better performance
    ...(isMobile
      ? []
      : [
          {
            id: 7,
            url: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=600&h=400&fit=crop&crop=center',
            title: 'Cozy Reading Nook',
            category: 'Specialty Areas',
            size: 'lg',
            position: { top: '70%', left: '55%' },
          },
          {
            id: 8,
            url: 'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=700&h=500&fit=crop&crop=center',
            title: 'Outdoor Living',
            category: 'Exterior Design',
            size: 'lg',
            position: { top: '25%', left: '58%' },
          },
          {
            id: 9,
            url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=600&fit=crop&crop=center',
            title: 'Contemporary Style',
            category: 'Modern Design',
            size: 'xl',
            position: { top: '10%', left: '22%' },
          },
          {
            id: 10,
            url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=400&h=400&fit=crop&crop=center',
            title: 'Elegant Hallway',
            category: 'Entryways',
            size: 'md',
            position: { top: '48%', left: '42%' },
          },
          {
            id: 11,
            url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400&h=400&fit=crop&crop=center',
            title: 'Garden View',
            category: 'Outdoor Spaces',
            size: 'sm',
            position: { top: '29%', left: '88%' },
          },
          {
            id: 12,
            url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=400&fit=crop&crop=center',
            title: 'Artistic Corner',
            category: 'Creative Spaces',
            size: 'md',
            position: { top: '80%', left: '32%' },
          },
        ]),
  ]

  const getBubbleSize = (size) => {
    if (isMobile) {
      const mobileSizes = {
        xl: 'w-36 h-36',
        lg: 'w-32 h-32',
        md: 'w-24 h-24',
        sm: 'w-20 h-20',
      }
      return mobileSizes[size] || mobileSizes.md
    }

    const desktopSizes = {
      xl: 'w-72 h-72 md:w-80 md:h-80',
      lg: 'w-52 h-52 md:w-60 md:h-60',
      md: 'w-40 h-40 md:w-48 md:h-48',
      sm: 'w-32 h-32 md:w-40 md:h-40',
    }
    return desktopSizes[size] || desktopSizes.md
  }

  const getInitialDelay = (index) => index * (isMobile ? 0.05 : 0.1)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.08,
        delayChildren: 0.3,
      },
    },
  }

  const headerVariants = {
    hidden: { y: isMobile ? 30 : 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: isMobile ? 0.6 : 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const bubbleVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: isMobile ? 20 : 50,
      filter: 'blur(2px)',
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: isMobile ? 0.6 : 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const hoverVariants = {
    rest: {
      scale: 1,
      y: 0,
      rotate: 0,
      filter: 'brightness(1) saturate(1)',
    },
    hover: {
      scale: isMobile ? 1.05 : 1.08,
      y: isMobile ? -4 : -8,
      rotate: isMobile ? 0.5 : 1,
      filter: 'brightness(1.1) saturate(1.2)',
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  // Mobile touch handlers
  const handleTouch = (imageId) => {
    if (touchDevice) {
      setHoveredImage(hoveredImage === imageId ? null : imageId)
    }
  }

  return (
    <section className='relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-white to-stone-50'>
      {/* Animated Background Elements - Reduced intensity on mobile */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          style={{ y: y1 }}
          className={`absolute top-20 left-1/4 ${
            isMobile ? 'w-40 h-40' : 'w-72 h-72'
          } rounded-full opacity-20`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: isMobile ? 15 : 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className='w-full h-full rounded-full'
            style={{
              background: `radial-gradient(circle, ${brandColor}20 0%, transparent 70%)`,
            }}
          />
        </motion.div>

        <motion.div
          style={{ y: y2 }}
          className={`absolute bottom-20 right-1/4 ${
            isMobile ? 'w-32 h-32' : 'w-64 h-64'
          } rounded-full opacity-15`}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: isMobile ? 20 : 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className='w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 rounded-full' />
        </motion.div>

        <motion.div
          style={{ y: y3 }}
          className={`absolute top-1/2 right-10 ${
            isMobile ? 'w-28 h-28' : 'w-56 h-56'
          } rounded-full opacity-10`}
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: isMobile ? 25 : 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className='w-full h-full bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full' />
        </motion.div>
      </div>

      <div className='relative z-10 max-w-8xl mx-auto px-4'>
        {/* Header Section */}
        <motion.div
          className='text-center mb-12 md:mb-16 space-y-4 md:space-y-6'
          variants={headerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: isMobile ? '-50px' : '-100px' }}
        >
          <motion.h2
            className='text-4xl md:text-5xl lg:text-7xl font-bold text-stone-900 leading-tight px-4'
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: isMobile ? 0.6 : 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.span
              className='block'
              initial={{ x: isMobile ? -30 : -50 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: isMobile ? 0.6 : 0.8, delay: 0.1 }}
            >
              Designs That
            </motion.span>
            <motion.span
              className='block'
              style={{ color: brandColor }}
              initial={{ x: isMobile ? 30 : 50 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: isMobile ? 0.6 : 0.8, delay: 0.2 }}
            >
              Inspire Reality
            </motion.span>
          </motion.h2>

          <motion.p
            className='text-base md:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed px-4'
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: isMobile ? 0.6 : 0.8, delay: 0.3 }}
          >
            Every space tells a story. Our AI creates personalized designs that
            transform houses into homes.
          </motion.p>
        </motion.div>

        {/* Image Collage - Adjusted height for mobile */}
        <motion.div
          className={`relative ${
            isMobile ? 'h-[400px]' : 'h-[500px] md:h-[650px]'
          } w-full`}
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: isMobile ? '-50px' : '-100px' }}
        >
          <AnimatePresence>
            {designImages.map((image, index) => (
              <motion.div
                key={image.id}
                className={`absolute ${getBubbleSize(
                  image.size
                )} cursor-pointer`}
                style={{
                  top: image.position.top,
                  left: image.position.left,
                  zIndex: hoveredImage === image.id ? 50 : 30 - index,
                }}
                variants={bubbleVariants}
                initial='hidden'
                whileInView='visible'
                viewport={{ once: true }}
                transition={{
                  delay: getInitialDelay(index),
                }}
                onHoverStart={() => !touchDevice && setHoveredImage(image.id)}
                onHoverEnd={() => !touchDevice && setHoveredImage(null)}
                onTouchStart={() => handleTouch(image.id)}
              >
                <motion.div
                  className='relative w-full h-full'
                  variants={hoverVariants}
                  initial='rest'
                  animate={hoveredImage === image.id ? 'hover' : 'rest'}
                >
                  {/* Outer Glow Ring - Smaller on mobile */}
                  <motion.div
                    className={`absolute ${
                      isMobile ? '-inset-1' : '-inset-2'
                    } rounded-full`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: hoveredImage === image.id ? 1 : 0,
                      scale: hoveredImage === image.id ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: `radial-gradient(circle, ${brandColor}30 0%, ${brandColor}10 50%, transparent 100%)`,
                    }}
                  />

                  {/* Main Image Container */}
                  <motion.div
                    className={`relative w-full h-full rounded-full overflow-hidden ${
                      isMobile ? 'border-2' : 'border-4'
                    } border-white shadow-xl`}
                    whileHover={{
                      borderColor: `${brandColor}60`,
                      boxShadow: `0 20px 40px -10px ${brandColor}20`,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.img
                      src={image.url}
                      alt={image.title}
                      className='w-full h-full object-cover'
                      whileHover={{ scale: isMobile ? 1.05 : 1.1 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />

                    {/* Overlay */}
                    <motion.div
                      className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredImage === image.id ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Content Overlay */}
                    <AnimatePresence>
                      {hoveredImage === image.id && (
                        <motion.div
                          className='absolute inset-0 flex flex-col items-center justify-center text-white'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className='text-center space-y-1 md:space-y-2'
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <h3 className='font-bold text-xs md:text-base leading-tight'>
                              {image.title}
                            </h3>
                            <p className='text-xs opacity-80 hidden md:block'>
                              {image.category}
                            </p>
                          </motion.div>

                          <motion.button
                            className={`mt-2 md:mt-4 flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 backdrop-blur-sm border border-white/30 rounded-full text-xs font-medium transition-all duration-300`}
                            style={{
                              background: `linear-gradient(45deg, ${brandColor}90, rgba(255,255,255,0.1))`,
                            }}
                            whileHover={{
                              scale: 1.05,
                              background: `linear-gradient(45deg, ${brandColor}, rgba(255,255,255,0.2))`,
                            }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                          >
                            <Eye className='w-3 h-3' />
                            <span className='hidden md:inline'>
                              View Design
                            </span>
                            <span className='md:hidden'>View</span>
                            <ArrowUpRight className='w-3 h-3' />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Shine Effect - Smaller on mobile */}
                    <motion.div
                      className={`absolute ${
                        isMobile
                          ? 'top-2 left-2 w-4 h-4'
                          : 'top-4 left-4 w-8 h-8'
                      } bg-white/30 rounded-full`}
                      animate={{
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    />
                  </motion.div>

                  {/* Floating Sparkles - Fewer and smaller on mobile */}
                  <AnimatePresence>
                    {hoveredImage === image.id && !isMobile && (
                      <>
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className='absolute w-1 h-1 rounded-full'
                            style={{
                              background: brandColor,
                              top: `${20 + i * 30}%`,
                              right: `${-10 + i * 5}%`,
                            }}
                            initial={{ opacity: 0, scale: 0, rotate: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0],
                              rotate: 360,
                              x: [0, 10, 20],
                              y: [0, -10, -20],
                            }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{
                              duration: 1.5,
                              delay: i * 0.2,
                              repeat: Infinity,
                              repeatDelay: 2,
                            }}
                          />
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Blur effect for non-hovered items - Less intense on mobile */}
                {hoveredImage && hoveredImage !== image.id && (
                  <motion.div
                    className={`absolute inset-0 ${
                      isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-[2px]'
                    } rounded-full`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

export default ImageCollageSection
