import React, { useEffect, useState } from 'react'

const MissionSection = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const brandColor = '#937c60'
  const brandColorLight = '#a68970'

  const missionTexts = [
    'Transform every space',
    'Democratize great design',
    'Empower your vision',
    'Connect UAE communities',
  ]

  useEffect(() => {
    setIsVisible(true)

    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % missionTexts.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className='relative py-32 bg-gradient-to-b from-white to-stone-50 overflow-hidden'>
      {/* Subtle Background Pattern */}
      <div
        className='absolute inset-0 opacity-[0.02]'
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, ${brandColor} 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, ${brandColor} 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      <div className='relative z-10 max-w-6xl mx-auto px-6 text-center'>
        {/* Mission Label */}
        <div
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div
            className='inline-flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-medium mb-12'
            style={{
              background: `${brandColor}08`,
              borderColor: `${brandColor}20`,
              color: brandColor,
            }}
          >
            <div
              className='w-2 h-2 rounded-full'
              style={{ background: brandColor }}
            />
            Our Mission
          </div>
        </div>

        {/* Main Mission Statement */}
        <div
          className={`transition-all duration-1200 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className='text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-8'>
            <div className='text-stone-900 mb-6'>We exist to</div>

            {/* Animated Text */}
            <div className='relative min-h-[120px] md:min-h-[160px] lg:min-h-[200px] overflow-hidden'>
              {missionTexts.map((text, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
                    index === currentTextIndex
                      ? 'opacity-100 translate-y-0'
                      : index < currentTextIndex
                      ? 'opacity-0 -translate-y-full'
                      : 'opacity-0 translate-y-full'
                  }`}
                  style={{ color: brandColor }}
                >
                  <span className='text-center px-4'>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className='text-xl md:text-2xl text-stone-600 max-w-4xl mx-auto leading-relaxed'>
            Through AI-powered design intelligence, we make professional
            interior design accessible to everyone in the UAE, connecting vision
            with reality.
          </p>
        </div>

        {/* Progress Indicators */}
        <div
          className={`flex justify-center gap-3 mt-16 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          {missionTexts.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === currentTextIndex ? 'w-12' : 'w-3'
              }`}
              style={{
                background:
                  index === currentTextIndex ? brandColor : `${brandColor}30`,
              }}
            />
          ))}
        </div>

        {/* Supporting Values */}
        <div
          className={`grid md:grid-cols-3 gap-8 mt-20 transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            {
              title: 'Intelligent',
              description: 'AI that understands your style and space',
            },
            {
              title: 'Accessible',
              description: 'Professional design for every budget',
            },
            {
              title: 'Connected',
              description: "UAE's premier design ecosystem",
            },
          ].map((value, index) => (
            <div key={index} className='text-center'>
              <h3 className='text-2xl font-bold text-stone-900 mb-3'>
                {value.title}
              </h3>
              <p className='text-stone-600 leading-relaxed'>
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MissionSection
