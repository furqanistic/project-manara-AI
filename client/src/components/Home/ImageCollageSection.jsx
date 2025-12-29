import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, Eye } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const ImageCollageSection = () => {
  const [hoveredImage, setHoveredImage] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const y1 = useTransform(scrollY, [2000, 3000], [0, -100])
  const y2 = useTransform(scrollY, [2000, 3000], [0, 80])

  const designImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&auto=format',
      title: 'Modern Living',
      size: 'xl',
      position: { top: '2%', left: '4%' },
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format',
      title: 'Minimalist Kitchen',
      size: 'lg',
      position: { top: '2%', left: '72%' },
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format',
      title: 'Luxe Bedroom',
      size: 'lg',
      position: { top: '65%', left: '72%' },
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&auto=format',
      title: 'Workspace',
      size: 'md',
      position: { top: '4%', left: '42%' },
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&auto=format',
      title: 'Dining Experience',
      size: 'xl',
      position: { top: '60%', left: '2%' },
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&auto=format',
      title: 'Bathroom Spa',
      size: 'sm',
      position: { top: '42%', left: '6%' },
    },
    {
       id: 12,
       url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format',
       title: 'Arched Living',
       size: 'lg',
       position: { top: '25%', left: '22%' },
    },
    {
      id: 7,
      url: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800&auto=format',
      title: 'Reading Nook',
      size: 'lg',
      position: { top: '80%', left: '45%' },
    },
    {
      id: 8,
      url: 'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=800&auto=format',
      title: 'Outdoor Living',
      size: 'lg',
      position: { top: '28%', left: '55%' },
    },
    {
      id: 10,
      url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&auto=format',
      title: 'Elegant Hallway',
      size: 'md',
      position: { top: '55%', left: '45%' },
    },
    {
      id: 11,
      url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&auto=format',
      title: 'Garden View',
      size: 'sm',
      position: { top: '45%', left: '85%' },
    },
  ]

  const getBubbleSize = (size) => {
    const sizes = {
      xl: 'w-72 h-72 lg:w-[420px] lg:h-[420px]',
      lg: 'w-52 h-52 lg:w-80 lg:h-80',
      md: 'w-40 h-40 lg:w-64 lg:h-64',
      sm: 'w-32 h-32 lg:w-48 lg:h-48'
    }
    return sizes[size] || sizes.md
  }

  return (
    <section className='relative py-40 overflow-hidden bg-[#faf8f6]'>
      {/* Background Ambience */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-5%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#937c60]/5 blur-[120px]' />
        <div className='absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#b8a58c]/3 blur-[100px]' />
      </div>

      <div className='relative z-10 max-w-[1500px] mx-auto px-10 md:px-20'>
        {/* Vertical Side Marker */}
        {!isMobile && (
          <div className='absolute left-10 top-1/2 -translate-y-1/2 h-64 flex flex-col items-center justify-between pointer-events-none opacity-20'>
            <div className='w-[1px] h-20 bg-[#937c60]' />
            <span className='[writing-mode:vertical-lr] rotate-180 text-[10px] font-bold tracking-[0.6em] text-[#937c60] uppercase'>Est. 2025</span>
            <div className='w-[1px] h-20 bg-[#937c60]' />
          </div>
        )}

        {/* Cinematic Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-32'
        >
          <div className='space-y-6'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-[1px] bg-[#937c60] opacity-40'></div>
              <span className='text-[10px] font-bold tracking-[0.5em] text-[#937c60] uppercase'>Curated Gallery</span>
            </div>
            <h2 className='text-6xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-[0.85]'>
              Designs that <br />
              <span className='text-[#937c60]'>Inspire.</span>
            </h2>
          </div>
          <p className='text-gray-400 font-medium text-xl max-w-sm'>
            Explore an infinite collection of AI-synthesized spaces, tailored for modern UAE living.
          </p>
        </motion.div>

        {/* Dynamic Collage Grid */}
        <div className={`relative ${isMobile ? 'h-[800px]' : 'h-[1000px]'} w-full`}>
          {designImages.map((image, index) => (
            <motion.div
              key={image.id}
              className={`absolute ${getBubbleSize(image.size)} cursor-none group`}
              style={{
                top: isMobile ? `${Number(image.position.top.replace('%', '')) * 1.5}%` : image.position.top,
                left: image.position.left,
                zIndex: hoveredImage === image.id ? 50 : 20 - index,
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.8 }}
            >
              <motion.div
                className='relative w-full h-full rounded-[60px] md:rounded-[100px] overflow-hidden border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)]'
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  boxShadow: '0 40px 80px rgba(147, 124, 96, 0.15)' 
                }}
                onHoverStart={() => setHoveredImage(image.id)}
                onHoverEnd={() => setHoveredImage(null)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className='w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700'
                />

                {/* Glass Overlay on Hover */}
                <AnimatePresence>
                  {hoveredImage === image.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent flex flex-col items-center justify-end pb-12'
                    >
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className='text-center'
                      >
                         <h4 className='text-white font-bold tracking-tight text-xl mb-4'>{image.title}</h4>
                         <div className='flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-xs font-bold uppercase tracking-widest'>
                           <Eye size={14} />
                           View Details
                         </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Static Index Indicator */}
                <div className='absolute top-8 left-8 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center'>
                    <span className='text-white/40 font-bold text-[10px]'>0{index + 1}</span>
                </div>
              </motion.div>

              {/* Parallax Depth Tags */}
              {!isMobile && index % 3 === 0 && (
                <motion.div 
                  style={{ y: index % 2 === 0 ? y1 : y2 }}
                  className='absolute -right-8 top-1/2 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 pointer-events-none'
                >
                   <p className='text-[10px] font-bold text-[#937c60] uppercase tracking-widest'>Manāra AI Render</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ImageCollageSection
