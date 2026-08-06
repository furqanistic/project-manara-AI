import { Instagram, Linkedin, Mail } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { name: 'Property Workspace', hash: '#product' },
      { name: 'Floor Plans', hash: '#product' },
      { name: 'Listing Media', hash: '#product' },
      { name: '3D Experiences', hash: '#product' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { name: 'For Agencies', hash: '#agencies' },
      { name: 'For Developers', hash: '#solutions' },
      { name: 'For Brokers', hash: '#solutions' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'Pricing', to: '/pricing' },
      { name: 'Sign In', to: '/auth?type=login' },
    ],
  },
]

const LandingFooter = () => {
  const handleHash = (e, hash) => {
    e.preventDefault()
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className='relative bg-charcoal text-ivory'>
      <div className='max-w-[1500px] mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-10'>
        <div className='grid lg:grid-cols-12 gap-14 pb-16 border-b border-ivory/10'>
          {/* Brand */}
          <div className='lg:col-span-5'>
            <div className='flex items-center gap-3'>
              <img
                src='/logoicon.png'
                alt='Manāra'
                className='h-6 w-auto object-contain brightness-0 invert'
              />
              <span className='font-serif text-[22px] tracking-[0.02em]'>
                Manāra
              </span>
            </div>
            <p className='mt-6 max-w-sm text-[13.5px] leading-[1.85] text-[#B5ACA0]'>
              The AI-powered property marketing workspace — turning property
              files into complete buyer-ready sales experiences.
            </p>
            <div className='flex items-center gap-6 mt-8'>
              {[Instagram, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href='#'
                  className='text-ivory/50 hover:text-[#c3a886] transition-colors duration-300'
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className='lg:col-span-5 grid grid-cols-3 gap-8'>
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className='text-[10px] font-semibold tracking-[0.3em] uppercase text-[#c3a886] mb-6'>
                  {col.title}
                </p>
                <div className='flex flex-col gap-3.5'>
                  {col.links.map((link) =>
                    link.to ? (
                      <Link
                        key={link.name}
                        to={link.to}
                        className='text-[13px] text-ivory/70 hover:text-ivory transition-colors duration-300'
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        key={link.name}
                        href={link.hash}
                        onClick={(e) => handleHash(e, link.hash)}
                        className='text-[13px] text-ivory/70 hover:text-ivory transition-colors duration-300'
                      >
                        {link.name}
                      </a>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Location */}
          <div className='lg:col-span-2 lg:text-right'>
            <p className='text-[10px] font-semibold tracking-[0.3em] uppercase text-[#c3a886] mb-6'>
              Studio
            </p>
            <p className='text-[13px] leading-[1.8] text-ivory/70'>
              Dubai Design District
              <br />
              Dubai, UAE
            </p>
            <p className='mt-6 font-serif text-lg text-ivory/80' dir='rtl'>
              منارة
            </p>
          </div>
        </div>

        <div className='pt-8 flex flex-col md:flex-row items-center justify-between gap-4'>
          <p className='text-[10px] tracking-[0.25em] uppercase text-ivory/35'>
            © 2026 MANĀRA — PROPERTY INTELLIGENCE
          </p>
          <div className='flex items-center gap-8 text-[10px] tracking-[0.25em] uppercase text-ivory/35'>
            <a href='#' className='hover:text-ivory/70 transition-colors'>
              Privacy
            </a>
            <a href='#' className='hover:text-ivory/70 transition-colors'>
              Terms
            </a>
            <a href='#' className='hover:text-ivory/70 transition-colors'>
              Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter
