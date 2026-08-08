import { Instagram, Linkedin, Twitter } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const CompactFooter = () => {
  return (
    <footer className='relative bg-[#faf8f6] dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/10 py-10 overflow-hidden transition-colors duration-500'>
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-[#937c60]/5 dark:bg-[#937c60]/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full' />
      </div>

      <div className='relative z-10 max-w-[1500px] mx-auto px-6 md:px-12'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-6 mb-8'>
          {/* Brand */}
          <div className='space-y-3 max-w-sm text-center md:text-left'>
            <Link to='/' className='inline-flex items-center justify-center md:justify-start'>
              <img
                src='/logoicon.png'
                alt='Manara Logo'
                className='h-8 lg:h-9 w-auto object-contain'
              />
            </Link>
            <p className='text-gray-400 dark:text-gray-500 font-medium text-[13px] leading-relaxed'>
              The professional design engine for modern spaces. Synthesizing imagination into architecture.
            </p>
          </div>

          {/* Nav + socials */}
          <div className='flex items-center gap-6 md:gap-8'>
            <div className='flex items-center gap-5'>
              {[
                { name: 'Home', to: '/' },
                { name: 'Studio', to: '/visualizer' },
                { name: 'Pricing', to: '/pricing' },
                { name: 'About', to: '/about' },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  className='text-gray-500 dark:text-gray-400 font-light text-[12px] hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap'
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className='h-4 w-px bg-gray-200 dark:bg-white/10 hidden md:block' />
            <div className='flex gap-3'>
              {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href='#'
                  aria-label='Social link'
                  className='text-gray-400 dark:text-gray-500 hover:text-[#937c60] dark:hover:text-[#937c60] transition-colors'
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className='pt-5 border-t border-gray-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-3'>
          <p className='text-gray-400 dark:text-gray-600 text-[9px] font-medium uppercase tracking-widest'>
            © 2025 Manāra Design Engine
          </p>
          <div className='flex gap-6 uppercase tracking-widest text-[9px] font-medium'>
            {['Privacy', 'Terms', 'Security'].map((item) => (
              <a
                key={item}
                href='#'
                className='text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-400 transition-colors'
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default CompactFooter