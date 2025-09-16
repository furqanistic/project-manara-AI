import { ArrowUpRight, Eye, Play, Sparkles } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const ImageCollageSection = () => {
  const [hoveredImage, setHoveredImage] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

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
    switch (size) {
      case 'xl':
        return 'w-80 h-80'
      case 'lg':
        return 'w-60 h-60'
      case 'md':
        return 'w-48 h-48'
      case 'sm':
        return 'w-40 h-40'
      default:
        return 'w-48 h-48'
    }
  }

  const getZIndex = (size, isHovered) => {
    if (isHovered) return 'z-50'
    switch (size) {
      case 'xl':
        return 'z-30'
      case 'lg':
        return 'z-25'
      case 'md':
        return 'z-20'
      case 'sm':
        return 'z-15'
      default:
        return 'z-20'
    }
  }

  return (
    <div
      ref={sectionRef}
      className='relative bg-gradient-to-br from-stone-50 to-amber-50/50 py-16 overflow-hidden'
    >
      {/* Simplified Background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-br from-purple-200/10 to-amber-200/8 rounded-full'></div>
        <div className='absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-200/10 to-purple-200/8 rounded-full'></div>
        <div className='absolute top-1/2 right-10 w-56 h-56 bg-gradient-to-br from-emerald-200/10 to-teal-200/8 rounded-full'></div>
      </div>

      <div className='relative z-10 max-w-8xl mx-auto px-4'>
        {/* Compact Header Section */}
        <div
          className={`text-center mb-12 space-y-4 transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className='text-3xl lg:text-5xl font-bold text-stone-900 leading-tight'>
            <span className='block'>Designs That</span>
            <span className='bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent'>
              Inspire Reality
            </span>
          </h2>

          <p className='text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed'>
            Every space tells a story. Our AI creates personalized designs that
            transform houses into homes.
          </p>
        </div>

        {/* Expanded Bubble Collage */}
        <div className='relative h-[650px] w-full mb-16'>
          {designImages.map((image, index) => (
            <div
              key={image.id}
              className={`group absolute ${getBubbleSize(
                image.size
              )} ${getZIndex(
                image.size,
                hoveredImage === image.id
              )} rounded-full overflow-hidden cursor-pointer transition-all duration-400 ease-out ${
                isVisible ? `opacity-100 scale-100` : 'opacity-0 scale-75'
              }`}
              style={{
                top: image.position.top,
                left: image.position.left,
                transitionDelay: `${index * 80}ms`,
                transform:
                  hoveredImage === image.id
                    ? 'scale(1.08) translateY(-6px)'
                    : 'scale(1) translateY(0px)',
                filter:
                  hoveredImage && hoveredImage !== image.id
                    ? 'brightness(0.8) saturate(0.8)'
                    : 'brightness(1) saturate(1)',
              }}
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              {/* Cool Outer Ring */}
              <div
                className={`absolute -inset-1 rounded-full bg-gradient-to-br from-amber-300/30 via-orange-300/20 to-amber-400/30 opacity-0 group-hover:opacity-100 transition-all duration-400`}
              ></div>

              {/* Subtle Glow Effect */}
              {hoveredImage === image.id && (
                <div className='absolute -inset-2 rounded-full bg-gradient-to-br from-amber-400/20 via-orange-400/15 to-amber-500/20'></div>
              )}

              {/* Image Container */}
              <div className='relative w-full h-full rounded-full overflow-hidden border-3 border-white/90 shadow-lg'>
                <img
                  src={image.url}
                  alt={image.title}
                  className='w-full h-full object-cover transition-all duration-500 group-hover:scale-105'
                />

                {/* Light Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                {/* Centered View Button */}
                <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300'>
                  <button className='group/btn px-5 py-2.5 bg-gradient-to-r from-amber-400/95 to-amber-500/95 backdrop-blur-sm border border-amber-300/60 rounded-full text-white font-medium hover:from-amber-300 hover:to-amber-400 transition-all duration-300 transform hover:scale-105 shadow-lg'>
                    <div className='flex items-center gap-2'>
                      <Eye className='w-4 h-4 transition-transform duration-200 group-hover/btn:scale-110' />
                      <span className='text-sm font-semibold'>View</span>
                    </div>

                    {/* Button Shine Effect */}
                    <div className='absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-600'></div>
                  </button>
                </div>

                {/* Simple Shine Effect */}
                <div className='absolute top-4 left-4 w-6 h-6 bg-white/40 rounded-full opacity-50 group-hover:opacity-70 transition-all duration-400'></div>
              </div>

              {/* Minimal Sparkles */}
              {hoveredImage === image.id && (
                <>
                  <div className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-amber-300 to-amber-400 rounded-full opacity-80'></div>
                  <div className='absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-orange-300 to-amber-300 rounded-full opacity-80'></div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Compact Bottom CTA */}
        <div
          className={`text-center transition-all duration-800 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className='space-y-4'>
            <h3 className='text-xl font-bold text-stone-900'>
              Ready to see your space transformed?
            </h3>
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <button className='px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'>
                Start Your Design Journey
              </button>
              <button className='px-6 py-3 bg-white/80 backdrop-blur-sm text-stone-700 font-semibold rounded-full border border-stone-200 hover:border-amber-300 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'>
                Explore More Designs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageCollageSection
