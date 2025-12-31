import {
    ArrowRight,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Sparkles,
    Twitter,
} from 'lucide-react'
import React from 'react'

const CompactFooter = () => {
  return (
    <footer className='relative bg-[#faf8f6] border-t border-gray-100 py-10 overflow-hidden'>
      {/* Subtle Background Pattern */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-[#937c60]/5 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full' />
      </div>

      <div className='relative z-10 max-w-[1500px] mx-auto px-6 md:px-12'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-8 mb-10'>
          {/* Brand Identity */}
          <div className='space-y-4 max-w-sm text-center md:text-left'>
             <div className='flex items-center justify-center md:justify-start gap-3'>
                <img 
                  src="/logoicon.png" 
                  alt="Manara Logo" 
                  className="h-8 w-auto object-contain"
                />
             </div>
             <p className='text-gray-400 font-medium text-[13px] leading-relaxed'>
               The professional design engine for modern spaces. Synthesizing imagination into architecture.
             </p>
          </div>

          {/* Navigation Links - Condensed Row - Matching Topbar */}
          <div className='flex items-center gap-8 md:gap-12'>
             <div className='flex items-center gap-6'>
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Studio', href: '/visualizer' },
                  { name: 'Pricing', href: '/pricing' },
                  { name: 'About', href: '/about' }
                ].map(link => (
                  <a key={link.name} href={link.href} className='text-gray-500 font-light text-[12px] hover:text-gray-900 transition-colors whitespace-nowrap'>{link.name}</a>
                ))}
             </div>
             <div className='h-4 w-px bg-gray-200 hidden md:block' />
             <div className='flex gap-3'>
                {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className='text-gray-400 hover:text-[#937c60] transition-colors'>
                     <Icon size={16} />
                  </a>
                ))}
             </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className='pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4'>
           <p className='text-gray-400 text-[9px] font-medium uppercase tracking-widest'>© 2025 Manāra Design Engine</p>
           <div className='flex gap-6 uppercase tracking-widest text-[9px] font-medium'>
              {['Privacy', 'Terms', 'Security'].map(item => (
                <a key={item} href="#" className='text-gray-400 hover:text-gray-900 transition-colors'>
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