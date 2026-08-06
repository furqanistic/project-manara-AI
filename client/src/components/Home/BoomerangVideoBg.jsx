import React from 'react'

// Optional background motion — a real looping interior video can be placed at
// /public/boomerang.mp4 and referenced below. Until then, a slow cinematic
// "boomerang" motion is rendered from a still so the hero feels alive.
const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_090628_7052d8a6-a094-4341-a4a2-ad58493a67a9.mp4'

const BoomerangVideoBg = () => {
  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none select-none'>
      {/* Base imagery with gentle forward/back motion */}
      <div
        className='absolute inset-0'
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=2200&q=85&auto=format')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          animation: 'boomer-boomer 26s ease-in-out infinite',
          willChange: 'transform',
        }}
      />

      {VIDEO_SRC && (
        <video
          className='absolute inset-0 w-full h-full object-cover'
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload='metadata'
        />
      )}

      {/* Soft travelling light — sells the living, video-like quality */}
      <div
        className='absolute inset-0'
        style={{
          background:
            'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 66%, rgba(255,255,255,0.08) 100%)',
          animation: 'boomerang-sweep 22s ease-in-out infinite',
          willChange: 'transform',
        }}
      />

      {/* Warm ivory veils so the charcoal type stays crisp */}
      <div className='absolute inset-0 bg-ivory/20' />
      <div className='absolute inset-0 bg-gradient-to-b from-ivory/30 via-transparent to-ivory/40' />
      <div className='absolute inset-0 bg-gradient-to-r from-ivory/25 via-transparent to-ivory/25' />

      {/* Vignette + grain */}
      <div
        className='absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage:
            'url("https://www.transparenttextures.com/patterns/dark-mosaic.png")',
        }}
      />
      <div className='absolute inset-0' style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(244,240,232,0.35) 100%)' }} />

      <style>{`
        @keyframes boomer-boomer {
          0%, 100% { transform: scale(1.02) translateY(0); }
          50% { transform: scale(1.09) translateY(-14px); }
        }
        @keyframes boomerang-sweep {
          0%, 100% { transform: translateX(-18%) scaleX(1.2); }
          50% { transform: translateX(18%) scaleX(1.2); }
        }
      `}</style>
    </div>
  )
}

export default BoomerangVideoBg