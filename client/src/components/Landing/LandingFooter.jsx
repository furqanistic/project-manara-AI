import { Instagram, Linkedin, Mail } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const COLUMNS = [
  {
    title: 'Studio',
    links: [
      { name: '3D Renders', to: '/visualizer' },
      { name: 'Floor Plans', to: '/floorplans' },
      { name: 'AI Designs', to: '/moodboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'Pricing', to: '/pricing' },
      { name: 'About', to: '/about' },
      { name: 'Sign In', to: '/auth?type=login' },
    ],
  },
]

const LandingFooter = () => {
  return (
    <footer className='relative bg-charcoal text-ivory'>
      <div className='max-w-[1500px] mx-auto px-6 md:px-12 pt-14 md:pt-20 pb-8'>
        <div className='grid lg:grid-cols-12 gap-10 pb-10 border-b border-ivory/10'>
          {/* Brand */}
          <div className='lg:col-span-5'>
            <Link to='/' className='inline-block'>
              <img
                src='/logoicon.png'
                alt='Manara Logo'
                className='h-8 lg:h-9 w-auto object-contain transition-all hover:opacity-80'
              />
            </Link>
            <p className='mt-5 max-w-sm text-[13px] leading-[1.8] text-[#B5ACA0]'>
              The AI-powered property marketing workspace — turning property
              files into complete buyer-ready sales experiences.
            </p>
            <div className='flex items-center gap-6 mt-6'>
              {[Instagram, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href='#'
                  aria-label='Social link'
                  className='text-ivory/50 hover:text-[#c3a886] transition-colors duration-300'
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className='lg:col-span-4 grid grid-cols-2 gap-8'>
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className='text-[10px] font-semibold tracking-[0.3em] uppercase text-[#c3a886] mb-5'>
                  {col.title}
                </p>
                <div className='flex flex-col gap-2.5'>
                  {col.links.map((link) => (
                    <Link
                      key={link.name}
                      to={link.to}
                      className='text-[13px] text-ivory/70 hover:text-ivory transition-colors duration-300'
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Location */}
          <div className='lg:col-span-3 lg:text-right'>
            <p className='text-[10px] font-semibold tracking-[0.3em] uppercase text-[#c3a886] mb-5'>
              Studio
            </p>
            <p className='text-[13px] leading-[1.8] text-ivory/70'>
              Dubai Design District
              <br />
              Dubai, UAE
            </p>
          </div>
        </div>

        <div className='pt-6 flex flex-col md:flex-row items-center justify-between gap-3'>
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