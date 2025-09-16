import {
  ArrowRight,
  ChevronDown,
  Eye,
  Globe,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isLightBackground, setIsLightBackground] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    setIsLoaded(true)

    const handleMouseMove = (e) => {
      if (containerRef.current && window.innerWidth > 768) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        })
      }
    }

    const handleScroll = () => {
      // Detect if we're on a light background section
      const element = document.elementFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2
      )
      if (element) {
        const isLight =
          element.closest('.bg-white') ||
          element.closest('[class*="bg-gray-1"]') ||
          element.closest('[class*="bg-slate-1"]') ||
          element.closest('.light-section')

        setIsLightBackground(isLight)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('scroll', handleScroll)
      handleScroll() // Check initial state

      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('scroll', handleScroll)
      }
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
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: Layers,
      title: '3D Visualization Engine',
      description: 'Real-time rendering with photorealistic quality',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Eye,
      title: 'Visual Recognition',
      description: 'Instant style analysis from uploaded images',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Globe,
      title: 'UAE Marketplace',
      description: 'Curated network of verified local installers',
      color: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <div
      ref={containerRef}
      className='relative min-h-screen bg-black overflow-hidden'
      style={{
        background: `radial-gradient(circle at ${mousePosition.x * 100}% ${
          mousePosition.y * 100
        }%, rgba(143, 121, 95, 0.15) 0%, transparent 50%), linear-gradient(135deg, #000000 0%, #111111 100%)`,
      }}
    >
      {/* Dynamic Grid Background - Responsive */}
      <div className='absolute inset-0 opacity-20 md:opacity-30'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `
              linear-gradient(rgba(143, 121, 95, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(143, 121, 95, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: `translate(${mousePosition.x * -10}px, ${
              mousePosition.y * -10
            }px)`,
          }}
        />
      </div>

      {/* Floating Orbs - Reduced on mobile */}
      <div className='absolute inset-0 overflow-hidden'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-pulse ${
              i > 3 ? 'hidden md:block' : ''
            }`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
              transform: `translate(${mousePosition.x * (5 + i * 2)}px, ${
                mousePosition.y * (3 + i * 2)
              }px)`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            <div
              className={`w-16 h-16 md:w-32 md:h-32 rounded-full blur-xl opacity-15 md:opacity-20 bg-gradient-to-r ${
                features[i % 4].color
              }`}
            />
          </div>
        ))}
      </div>

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-28 md:pt-32 lg:pt-12'>
        {/* Main Hero Content */}
        <div className='min-h-screen flex flex-col justify-center py-8 -mt-12 sm:-mt-16 md:-mt-20 lg:mt-0'>
          <div className='grid lg:grid-cols-12 gap-8 lg:gap-12 items-center'>
            {/* Left Content - Mobile First Approach */}
            <div className='lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left'>
              {/* Main Headline - Mobile Optimized */}
              <div
                className={`space-y-4 md:space-y-6 transition-all duration-1000 delay-200 ${
                  isLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-none tracking-tight'>
                  <span className='block text-white'>Design</span>
                  <span className='block bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent'>
                    Amplified
                  </span>
                  <span className='block text-gray-400 text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-light'>
                    by Intelligence
                  </span>
                </h1>

                <p
                  className={`text-base sm:text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0 transition-colors duration-300 ${
                    isLightBackground ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  Transform spaces with AI that thinks like a designer. From
                  concept to installation,
                  <span
                    className={`font-medium transition-colors duration-300 ${
                      isLightBackground ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    {' '}
                    Manāra orchestrates your entire interior journey
                  </span>{' '}
                  in the UAE.
                </p>
              </div>

              {/* CTA Section - Mobile Optimized */}
              <div
                className={`flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4 transition-all duration-1000 delay-400 px-2 sm:px-0 ${
                  isLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <button className='group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl md:rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 w-full sm:w-auto'>
                  <div className='absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  <div className='relative flex items-center justify-center gap-2'>
                    <span className='text-sm md:text-base'>
                      Start Designing
                    </span>
                    <ArrowRight className='w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform' />
                  </div>
                  <div className='absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl md:rounded-2xl blur-xl'></div>
                </button>

                <button
                  className={`group flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 backdrop-blur-xl border rounded-xl md:rounded-2xl transition-all duration-300 w-full sm:w-auto ${
                    isLightBackground
                      ? 'bg-white/70 hover:bg-white/80 border-gray-200/30 text-gray-700 hover:text-gray-900'
                      : 'bg-white/5 hover:bg-white/10 border-white/20 text-white hover:border-white/30'
                  }`}
                >
                  <span className='text-sm md:text-base'>Watch Live Demo</span>
                </button>
              </div>

              {/* Stats - Mobile Responsive */}
              <div
                className={`grid grid-cols-3 gap-4 md:gap-8 lg:gap-12 pt-8 md:pt-12 transition-all duration-1000 delay-600 ${
                  isLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <div className='text-center lg:text-left'>
                  <div
                    className={`text-xl md:text-2xl lg:text-3xl font-bold transition-colors duration-300 ${
                      isLightBackground ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    2.4s
                  </div>
                  <div
                    className={`text-xs md:text-sm leading-tight transition-colors duration-300 ${
                      isLightBackground ? 'text-gray-600' : 'text-gray-500'
                    }`}
                  >
                    Avg Generation Time
                  </div>
                </div>
                <div className='text-center lg:text-left'>
                  <div
                    className={`text-xl md:text-2xl lg:text-3xl font-bold transition-colors duration-300 ${
                      isLightBackground ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    99.2%
                  </div>
                  <div
                    className={`text-xs md:text-sm leading-tight transition-colors duration-300 ${
                      isLightBackground ? 'text-gray-600' : 'text-gray-500'
                    }`}
                  >
                    Design Accuracy
                  </div>
                </div>
                <div className='text-center lg:text-left'>
                  <div
                    className={`text-xl md:text-2xl lg:text-3xl font-bold transition-colors duration-300 ${
                      isLightBackground ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    500+
                  </div>
                  <div
                    className={`text-xs md:text-sm leading-tight transition-colors duration-300 ${
                      isLightBackground ? 'text-gray-600' : 'text-gray-500'
                    }`}
                  >
                    UAE Partners
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual - Mobile Responsive */}
            <div className='lg:col-span-5 relative mt-8 lg:mt-0'>
              <div
                className={`transition-all duration-1000 delay-300 ${
                  isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              >
                {/* Main Interface Mockup - Mobile Optimized */}
                <div className='relative mx-auto max-w-md lg:max-w-none'>
                  <div
                    className={`backdrop-blur-2xl border rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl transition-all duration-300 ${
                      isLightBackground
                        ? 'bg-white/70 border-gray-200/30 shadow-gray-900/10'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className='space-y-4 md:space-y-6'>
                      {/* Header */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2 md:gap-3'>
                          <div className='w-2 h-2 md:w-3 md:h-3 bg-red-400 rounded-full'></div>
                          <div className='w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full'></div>
                          <div className='w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full'></div>
                        </div>
                        <div
                          className={`text-xs text-gray-500 font-mono hidden sm:block transition-colors duration-300 ${
                            isLightBackground
                              ? 'text-gray-600'
                              : 'text-gray-500'
                          }`}
                        >
                          manara.ai/design
                        </div>
                      </div>

                      {/* Features Grid - Mobile Layout */}
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
                        {features.map((feature, index) => {
                          const isActive = index === activeFeature
                          return (
                            <div
                              key={index}
                              className={`relative p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl border transition-all duration-500 ${
                                isActive
                                  ? 'bg-white/10 border-white/30 scale-105'
                                  : 'bg-white/5 border-white/10 hover:bg-white/8'
                              }`}
                            >
                              <div className='flex items-center gap-3 mb-2 md:mb-3'>
                                <div
                                  className={`flex-1 h-2 md:h-3 rounded-full bg-gradient-to-r ${feature.color} opacity-60`}
                                ></div>
                              </div>

                              <div
                                className={`text-white font-semibold text-xs md:text-sm mb-1 md:mb-2 transition-colors duration-300 ${
                                  isLightBackground
                                    ? 'text-gray-900'
                                    : 'text-white'
                                }`}
                              >
                                {feature.title}
                              </div>
                              <div
                                className={`text-xs md:text-sm transition-colors duration-300 ${
                                  isLightBackground
                                    ? 'text-gray-600'
                                    : 'text-gray-400'
                                }`}
                              >
                                {feature.description}
                              </div>

                              {/* Active Indicator */}
                              {isActive && (
                                <div className='absolute -inset-0.5 bg-gradient-to-r from-amber-400/20 to-amber-600/20 rounded-xl md:rounded-2xl -z-10 animate-pulse'></div>
                              )}

                              {/* Glassy highlight */}
                              <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Progress Bar */}
                      <div className='space-y-2'>
                        <div className='flex justify-between items-center'>
                          <span
                            className={`text-xs md:text-sm transition-colors duration-300 ${
                              isLightBackground
                                ? 'text-gray-600'
                                : 'text-gray-400'
                            }`}
                          >
                            Generating Design...
                          </span>
                          <span
                            className={`text-xs md:text-sm font-mono transition-colors duration-300 ${
                              isLightBackground ? 'text-gray-900' : 'text-white'
                            }`}
                          >
                            87%
                          </span>
                        </div>
                        <div
                          className={`w-full rounded-full h-1.5 md:h-2 transition-colors duration-300 ${
                            isLightBackground ? 'bg-gray-200/50' : 'bg-white/10'
                          }`}
                        >
                          <div
                            className='bg-gradient-to-r from-amber-500 to-amber-600 h-1.5 md:h-2 rounded-full transition-all duration-1000'
                            style={{ width: '87%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Noise Texture Overlay - Reduced on mobile */}
      <div
        className='absolute inset-0 opacity-5 md:opacity-10 pointer-events-none'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>
    </div>
  )
}

export default HeroSection
