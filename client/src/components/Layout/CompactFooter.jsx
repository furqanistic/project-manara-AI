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
  const brandColor = '#937c60'

  return (
    <footer className='relative bg-white border-t border-gray-100 py-20 overflow-hidden'>
      {/* Subtle Background Pattern */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-[#937c60]/5 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full' />
      </div>

      <div className='relative z-10 max-w-[1500px] mx-auto px-10 md:px-20'>
        <div className='grid lg:grid-cols-12 gap-16 mb-20'>
          {/* Brand Identity */}
          <div className='lg:col-span-5 space-y-8'>
             <div className='flex items-center gap-4'>
                <div className='w-12 h-12 rounded-2xl bg-[#937c60] flex items-center justify-center text-white shadow-[0_10px_20px_rgba(147,124,96,0.3)]'>
                   <Sparkles size={24} />
                </div>
                <h2 className='text-3xl font-bold text-gray-900 tracking-tighter'>Manāra</h2>
             </div>
             <p className='text-gray-400 font-medium text-lg leading-relaxed max-w-md'>
               The professional design engine for modern spaces. Synthesizing imagination intoexecutable architecture.
             </p>
             <div className='flex gap-4'>
                {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className='w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#937c60] hover:border-[#937c60]/20 transition-all'>
                     <Icon size={20} />
                  </a>
                ))}
             </div>
          </div>

          {/* Navigation Links */}
          <div className='lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12'>
             <div className='space-y-6'>
                <h4 className='text-[10px] font-bold text-[#937c60] uppercase tracking-widest'>Engine</h4>
                <ul className='space-y-4'>
                   {['3D Visualization', 'Moodboarding', 'Neural Mapping'].map(link => (
                     <li key={link}><a href="#" className='text-gray-400 font-semibold hover:text-gray-900 transition-colors'>{link}</a></li>
                   ))}
                </ul>
             </div>
             <div className='space-y-6'>
                <h4 className='text-[10px] font-bold text-[#937c60] uppercase tracking-widest'>Architecture</h4>
                <ul className='space-y-4'>
                   {['UAE Marketplace', 'Installer Mesh', 'Material Logs'].map(link => (
                     <li key={link}><a href="#" className='text-gray-400 font-semibold hover:text-gray-900 transition-colors'>{link}</a></li>
                   ))}
                </ul>
             </div>
             <div className='space-y-6'>
                <h4 className='text-[10px] font-bold text-[#937c60] uppercase tracking-widest'>Network</h4>
                <ul className='space-y-4 text-gray-400 font-semibold'>
                   <li className='flex items-center gap-3'><MapPin size={16} className='text-[#937c60]' /> Dubai HQ</li>
                   <li className='flex items-center gap-3'><Mail size={16} className='text-[#937c60]' /> hello@manara.ai</li>
                </ul>
             </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className='pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8'>
           <p className='text-gray-400 text-xs font-bold uppercase tracking-widest'>© 2025 Manāra Design Engine</p>
           <div className='flex gap-10'>
              <a href="#" className='text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-900'>Privacy</a>
              <a href="#" className='text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-900'>Terms</a>
              <a href="#" className='text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-900'>Security</a>
           </div>
        </div>
      </div>
    </footer>
  )
}

export default CompactFooter
