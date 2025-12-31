import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import React, { useRef } from 'react'

const ImageCollageSection = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Columns for a more "organized" waterfall/masonry feel
  const columns = [
    {
      speed: 0,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&auto=format',
          title: 'Majestic Living',
          tag: 'Iconic',
          aspect: 'aspect-[3/4]'
        },
        {
          url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1000&auto=format',
          title: 'Artisan Studio',
          tag: 'Craft',
          aspect: 'aspect-square'
        }
      ]
    },
    {
      speed: -0.15,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&auto=format',
          title: 'Marble Harmony',
          tag: 'Material',
          aspect: 'aspect-square'
        },
        {
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&auto=format',
          title: 'Arched Living',
          tag: 'Geometry',
          aspect: 'aspect-[3/4]'
        }
      ]
    },
    {
      speed: 0.1,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format',
          title: 'The Penthouse',
          tag: 'Luxury',
          aspect: 'aspect-[4/5]'
        },
        {
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format',
          title: 'Nordic Light',
          tag: 'Atmosphere',
          aspect: 'aspect-square'
        }
      ]
    }
  ]

  return (
    <section ref={containerRef} className='relative py-24 bg-[#faf8f6] overflow-hidden'>
      <div className='max-w-[1400px] mx-auto px-6 md:px-12'>
        {/* Modern Header - Centered & Organized */}
        <div className='flex flex-col items-center text-center mb-24 max-w-3xl mx-auto'>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className='flex items-center gap-3 mb-6 bg-white px-6 py-2 rounded-full border border-gray-100 shadow-sm'
          >
            <span className='text-[10px] font-bold tracking-[0.4em] text-[#937c60] uppercase'>Curated Collection</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className='text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-[1.1]'
          >
            Visions of <span className='text-[#937c60] font-serif italic'>Modernity.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className='text-gray-400 text-lg md:text-xl font-medium leading-relaxed'
          >
            Explore a structured anthology of AI-synthesized environments, 
            where precision meets imagination.
          </motion.p>
        </div>

        {/* Organized Column Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10'>
          {columns.map((column, colIndex) => {
            // Each column has its own parallax effect
            const y = useTransform(scrollYProgress, [0, 1], [0, column.speed * 400])
            
            return (
              <motion.div 
                key={colIndex} 
                style={{ y }}
                className='flex flex-col gap-6 lg:gap-10'
              >
                {column.images.map((img, imgIndex) => (
                  <motion.div
                    key={imgIndex}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: (colIndex + imgIndex) * 0.1, duration: 0.8 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className='group relative'
                  >
                    {/* Image Container */}
                    <div className={`relative w-full ${img.aspect} overflow-hidden rounded-[32px] md:rounded-[48px] bg-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] group-hover:shadow-[0_40px_80px_-20px_rgba(147,124,96,0.15)] transition-all duration-700`}>
                      <img 
                        src={img.url} 
                        alt={img.title}
                        className='w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1'
                      />
                      
                      {/* Architectural Overlay */}
                      <div className='absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
                    </div>

                    {/* Minimalist Labels below image for "Organized" feel */}
                    <div className='mt-6 px-2 flex justify-between items-center'>
                      <div className='space-y-1'>
                        <p className='text-[10px] font-bold text-[#937c60] tracking-widest uppercase'>{img.tag}</p>
                        <h3 className='text-xl lg:text-2xl font-bold text-gray-900 tracking-tight transition-colors group-hover:text-[#937c60]'>
                          {img.title}
                        </h3>
                      </div>
                      <div className='w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0'>
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default ImageCollageSection
