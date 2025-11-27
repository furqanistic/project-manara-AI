// File: project-manara-AI/client/src/components/Layout/CompactFooter.jsx
import {
  ArrowRight,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Twitter,
} from 'lucide-react'
import React from 'react'

const CompactFooter = () => {
  const brandColor = '#937c60'
  const brandColorLight = '#a68970'

  return (
    <footer className='relative bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900'>
      {/* Subtle Pattern Overlay */}
      <div
        className='absolute inset-0 opacity-5'
        style={{
          backgroundImage: `
            linear-gradient(45deg, ${brandColor} 1px, transparent 1px),
            linear-gradient(-45deg, ${brandColor} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className='relative z-10 max-w-7xl mx-auto px-6 py-16'>
        {/* Main Footer Content */}
        <div className='grid md:grid-cols-4 gap-8 mb-12'>
          {/* Brand Column */}
          <div className='md:col-span-1'>
            <div className='flex items-center gap-3 mb-6'>
              <div
                className='w-10 h-10 rounded-xl flex items-center justify-center'
                style={{
                  background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                }}
              >
                <Sparkles className='w-5 h-5 text-white' />
              </div>
              <div className='text-2xl font-bold text-white'>Manāra</div>
            </div>
            <p className='text-stone-400 text-sm leading-relaxed mb-6'>
              AI-powered interior design copilot transforming spaces across the
              UAE with intelligent design solutions.
            </p>
            <div className='flex items-center gap-4'>
              {[
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className='w-9 h-9 rounded-lg bg-stone-800 hover:bg-stone-700 flex items-center justify-center transition-all duration-200 hover:scale-110 group'
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <social.icon className='w-4 h-4 text-stone-400 group-hover:text-white transition-colors' />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className='text-white font-semibold mb-4'>Services</h3>
            <div className='space-y-3'>
              {[
                'AI Design Copilot',
                '3D Visualization',
                'AutoCAD Plans',
                'UAE Marketplace',
                'Design Presentations',
              ].map((service, index) => (
                <a
                  key={index}
                  href='#'
                  className='block text-stone-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1'
                >
                  {service}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className='text-white font-semibold mb-4'>Company</h3>
            <div className='space-y-3'>
              {[
                'About Us',
                'How It Works',
                'UAE Partners',
                'Pricing',
                'Support',
              ].map((item, index) => (
                <a
                  key={index}
                  href='#'
                  className='block text-stone-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1'
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Contact & Location */}
          <div>
            <h3 className='text-white font-semibold mb-4'>Get Started</h3>
            <div className='space-y-4 mb-6'>
              <div className='flex items-start gap-3'>
                <MapPin className='w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0' />
                <div className='text-stone-400 text-sm'>
                  Serving UAE
                  <br />
                  Dubai • Abu Dhabi • Sharjah
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Mail className='w-4 h-4 text-stone-400' />
                <a
                  href='mailto:hello@manaradesign.ai'
                  className='text-stone-400 hover:text-white text-sm transition-colors'
                >
                  hello@manaradesign.ai
                </a>
              </div>
            </div>

            <button
              className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg group'
              style={{
                background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
              }}
            >
              <span>Start Designing</span>
              <ArrowRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform' />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='pt-8 border-t border-stone-700 flex flex-col md:flex-row justify-between items-center gap-4'>
          <div className='text-stone-500 text-sm'>
            © 2025 Manāra AI. All rights reserved.
          </div>

          <div className='flex items-center gap-6 text-sm'>
            <a
              href='#'
              className='text-stone-500 hover:text-stone-300 transition-colors'
            >
              Privacy Policy
            </a>
            <a
              href='#'
              className='text-stone-500 hover:text-stone-300 transition-colors'
            >
              Terms of Service
            </a>
            <div className='flex items-center gap-2 text-stone-500'>
              <div
                className='w-2 h-2 rounded-full animate-pulse'
                style={{ background: brandColor }}
              />
              <span className='text-xs'>AI-Powered Platform</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default CompactFooter
