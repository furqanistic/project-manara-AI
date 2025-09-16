import { ArrowRight, Eye, Layers, Sparkles, Zap } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const ModernBeforeAfterSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const imageRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleMouseMove = (e) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100

    setMousePosition({ x: Math.max(0, Math.min(100, percentage)) })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition({ x: 50 })
  }

  return (
    <div
      ref={containerRef}
      className='relative min-h-screen bg-black overflow-hidden flex items-center'
    >
      {/* Subtle Grid Background */}
      <div className='absolute inset-0 opacity-10'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `
              linear-gradient(rgba(245, 158, 11, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(245, 158, 11, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20'>
        {/* Header */}
        <div
          className={`text-center space-y-6 mb-20 transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className='text-5xl md:text-7xl font-black leading-none tracking-tight'>
            <span className='block text-white'>See the</span>
            <span className='block bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent'>
              Magic Happen
            </span>
          </h2>

          <p className='text-xl text-gray-400 max-w-2xl mx-auto'>
            Watch how our AI transforms ordinary spaces into extraordinary
            environments.
            <span className='text-white font-medium'>
              {' '}
              Move your cursor to reveal the transformation.
            </span>
          </p>
        </div>

        {/* Main Grid */}
        <div className='grid lg:grid-cols-3 gap-12 items-center'>
          {/* Before/After - Takes up 2 columns */}
          <div
            className={`lg:col-span-2 transition-all duration-1000 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div
              ref={imageRef}
              className='relative rounded-3xl overflow-hidden cursor-crosshair group shadow-2xl'
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Before Image */}
              <div className='relative w-full h-[500px] md:h-[600px]'>
                <img
                  src='/Home/after.webp'
                  alt='Before transformation'
                  className='w-full h-full object-cover'
                />

                {/* Before Label */}
                <div className='absolute top-6 left-6 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/20'>
                  <span className='text-sm font-medium'>Before</span>
                </div>
              </div>

              {/* After Image Overlay */}
              <div
                className='absolute inset-0 transition-all duration-100 ease-out'
                style={{
                  clipPath: `polygon(0 0, ${mousePosition.x}% 0, ${mousePosition.x}% 100%, 0 100%)`,
                }}
              >
                <img
                  src='/Home/before.webp'
                  alt='After transformation'
                  className='w-full h-full object-cover'
                />

                {/* After Label */}
                <div className='absolute top-6 left-6 bg-gradient-to-r from-amber-500/90 to-amber-600/90 backdrop-blur-sm text-black px-4 py-2 rounded-full border border-amber-300/50'>
                  <span className='text-sm font-medium'>After</span>
                </div>
              </div>

              {/* Reveal Line */}
              <div
                className='absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 via-white to-amber-400 shadow-lg transition-all duration-100 ease-out z-10'
                style={{ left: `${mousePosition.x}%` }}
              >
                {/* Handle */}
                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl border-2 border-amber-400 flex items-center justify-center'>
                  <div className='w-2 h-2 bg-amber-500 rounded-full'></div>
                </div>
              </div>

              {/* Instructions */}
              {!isHovered && (
                <div className='absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-300 opacity-100 group-hover:opacity-0'>
                  <div className='text-center text-white bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
                    <div className='w-16 h-16 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-400/50'>
                      <svg
                        className='w-8 h-8 text-amber-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M7 16l-4-4m0 0l4-4m-4 4h18'
                        />
                      </svg>
                    </div>
                    <p className='text-lg font-semibold mb-2'>
                      Move to Transform
                    </p>
                    <p className='text-amber-300 text-sm'>
                      Hover and move cursor left to right
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* How It Works - 1 column */}
          <div
            className={`space-y-8 transition-all duration-1000 delay-400 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Process Steps */}
            <div className='space-y-6'>
              <h3 className='text-2xl font-bold text-white'>How It Works</h3>

              <div className='space-y-4'>
                <div className='group'>
                  <div className='flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300'>
                    <div className='w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500/30 transition-colors'>
                      <Eye className='w-6 h-6 text-amber-400' />
                    </div>
                    <div>
                      <div className='text-white font-semibold mb-1'>
                        Upload & Analyze
                      </div>
                      <div className='text-gray-400 text-sm'>
                        AI scans your space instantly
                      </div>
                    </div>
                  </div>
                </div>

                <div className='group'>
                  <div className='flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300'>
                    <div className='w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500/30 transition-colors'>
                      <Sparkles className='w-6 h-6 text-amber-400' />
                    </div>
                    <div>
                      <div className='text-white font-semibold mb-1'>
                        Generate Concepts
                      </div>
                      <div className='text-gray-400 text-sm'>
                        Multiple design options created
                      </div>
                    </div>
                  </div>
                </div>

                <div className='group'>
                  <div className='flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300'>
                    <div className='w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500/30 transition-colors'>
                      <Layers className='w-6 h-6 text-amber-400' />
                    </div>
                    <div>
                      <div className='text-white font-semibold mb-1'>
                        3D Visualization
                      </div>
                      <div className='text-gray-400 text-sm'>
                        Photorealistic renders produced
                      </div>
                    </div>
                  </div>
                </div>

                <div className='group'>
                  <div className='flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300'>
                    <div className='w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500/30 transition-colors'>
                      <Zap className='w-6 h-6 text-amber-400' />
                    </div>
                    <div>
                      <div className='text-white font-semibold mb-1'>
                        Connect & Install
                      </div>
                      <div className='text-gray-400 text-sm'>
                        UAE partners ready to execute
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10'>
                <div className='text-2xl font-bold text-amber-400 mb-1'>
                  2.4s
                </div>
                <div className='text-gray-400 text-sm'>Generation Time</div>
              </div>
              <div className='text-center p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10'>
                <div className='text-2xl font-bold text-amber-400 mb-1'>
                  500+
                </div>
                <div className='text-gray-400 text-sm'>UAE Partners</div>
              </div>
            </div>

            {/* CTA */}
            <button className='group w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              <div className='relative flex items-center justify-center gap-2'>
                <span>Start Your Transformation</span>
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernBeforeAfterSection
