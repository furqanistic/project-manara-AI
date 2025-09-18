import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, Eye, Sparkles } from 'lucide-react'
import React, { useState } from 'react'

const ImageCollageSection = () => {
  const [hoveredImage, setHoveredImage] = useState(null)
  const { scrollY } = useScroll()

  // Parallax effects for background elements
  const y1 = useTransform(scrollY, [0, 1000], [0, -50])
  const y2 = useTransform(scrollY, [0, 1000], [0, 100])
  const y3 = useTransform(scrollY, [0, 1000], [0, -30])

  const brandColor = '#937c60'

  const designImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
      title: 'Modern Living Room',
      category: 'Living Spaces',
      size: 'lg',
      position: { top: '4%', left: '4%' },
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=500&fit=crop&crop=center',
      title: 'Minimalist Kitchen',
      category: 'Kitchen Design',
      size: 'lg',
      position: { top: '2%', left: '72%' },
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop&crop=center',
      title: 'Luxe Bedroom',
      category: 'Bedrooms',
      size: 'lg',
      position: { top: '55%', left: '78%' },
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=400&fit=crop&crop=center',
      title: 'Workspace Design',
      category: 'Home Office',
      size: 'md',
      position: { top: '5%', left: '45%' },
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&h=700&fit=crop&crop=center',
      title: 'Dining Experience',
      category: 'Dining Rooms',
      size: 'xl',
      position: { top: '60%', left: '6%' },
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop&crop=center',
      title: 'Bathroom Spa',
      category: 'Bathrooms',
      size: 'sm',
      position: { top: '40%', left: '1%' },
    },
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
  ]

  const getBubbleSize = (size) => {
    const sizes = {
      xl: 'w-72 h-72 md:w-80 md:h-80',
      lg: 'w-52 h-52 md:w-60 md:h-60',
      md: 'w-40 h-40 md:w-48 md:h-48',
      sm: 'w-32 h-32 md:w-40 md:h-40',
    }
    return sizes[size] || sizes.md
  }

  const getInitialDelay = (index) => index * 0.1

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  }

  const headerVariants = {
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

  const bubbleVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 50,
      filter: 'blur(4px)',
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
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
      scale: 1.08,
      y: -8,
      rotate: 1,
      filter: 'brightness(1.1) saturate(1.2)',
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <section className='relative py-24 overflow-hidden bg-gradient-to-b from-white to-stone-50'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          style={{ y: y1 }}
          className='absolute top-20 left-1/4 w-72 h-72 rounded-full opacity-30'
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
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
          className='absolute bottom-20 right-1/4 w-64 h-64 rounded-full opacity-20'
          animate={{
            scale: [1, 1.2, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className='w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 rounded-full' />
        </motion.div>

        <motion.div
          style={{ y: y3 }}
          className='absolute top-1/2 right-10 w-56 h-56 rounded-full opacity-15'
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 30,
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
          className='text-center mb-16 space-y-6'
          variants={headerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2
            className='text-5xl md:text-7xl font-bold text-stone-900 leading-tight'
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className='block'
              initial={{ x: -50 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Designs That
            </motion.span>
            <motion.span
              className='block'
              style={{ color: brandColor }}
              initial={{ x: 50 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Inspire Reality
            </motion.span>
          </motion.h2>

          <motion.p
            className='text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed'
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Every space tells a story. Our AI creates personalized designs that
            transform houses into homes.
          </motion.p>
        </motion.div>

        {/* Image Collage */}
        <motion.div
          className='relative h-[500px] md:h-[650px] w-full'
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
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
                onHoverStart={() => setHoveredImage(image.id)}
                onHoverEnd={() => setHoveredImage(null)}
              >
                <motion.div
                  className='relative w-full h-full'
                  variants={hoverVariants}
                  initial='rest'
                  animate={hoveredImage === image.id ? 'hover' : 'rest'}
                >
                  {/* Outer Glow Ring */}
                  <motion.div
                    className='absolute -inset-2 rounded-full'
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
                    className='relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl'
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
                      whileHover={{ scale: 1.1 }}
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
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className='text-center space-y-2'
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <h3 className='font-bold text-sm md:text-base'>
                              {image.title}
                            </h3>
                            <p className='text-xs md:text-sm opacity-80'>
                              {image.category}
                            </p>
                          </motion.div>

                          <motion.button
                            className='mt-4 flex items-center gap-2 px-4 py-2 backdrop-blur-sm border border-white/30 rounded-full text-xs md:text-sm font-medium transition-all duration-300'
                            style={{
                              background: `linear-gradient(45deg, ${brandColor}90, rgba(255,255,255,0.1))`,
                            }}
                            whileHover={{
                              scale: 1.05,
                              background: `linear-gradient(45deg, ${brandColor}, rgba(255,255,255,0.2))`,
                            }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                          >
                            <Eye className='w-4 h-4' />
                            <span>View Design</span>
                            <ArrowUpRight className='w-3 h-3' />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Shine Effect */}
                    <motion.div
                      className='absolute top-4 left-4 w-8 h-8 bg-white/30 rounded-full'
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

                  {/* Floating Sparkles */}
                  <AnimatePresence>
                    {hoveredImage === image.id && (
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

                {/* Blur effect for non-hovered items */}
                {hoveredImage && hoveredImage !== image.id && (
                  <motion.div
                    className='absolute inset-0 backdrop-blur-[2px] rounded-full'
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
