import { motion } from 'framer-motion'
import React from 'react'
import { EASE } from './ease'

export const Label = ({ children, dark = false, className = '' }) => (
  <p className={`label-arch ${dark ? 'label-arch-light' : ''} ${className}`}>
    {children}
  </p>
)

export const Reveal = ({
  children,
  delay = 0,
  y = 32,
  className = '',
  duration = 1,
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration, ease: EASE, delay }}
  >
    {children}
  </motion.div>
)

export const Hairline = ({ dark = false, className = '' }) => (
  <div className={`${dark ? 'hairline-dark' : 'hairline'} ${className}`} />
)

export const SectionHeader = ({
  label,
  dark = false,
  title,
  copy,
  align = 'left',
  className = '',
}) => (
  <div
    className={`max-w-4xl ${align === 'center' ? 'mx-auto text-center' : ''} ${className}`}
  >
    <Reveal>
      <Label dark={dark}>{label}</Label>
    </Reveal>
    <Reveal delay={0.08}>
      <h2
        className={`mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.06] tracking-[-0.01em] ${
          dark ? 'text-ivory' : 'text-charcoal'
        }`}
      >
        {title}
      </h2>
    </Reveal>
    {copy && (
      <Reveal delay={0.16}>
        <p
          className={`mt-7 max-w-xl text-[15px] leading-[1.85] ${
            dark ? 'text-[#B5ACA0]' : 'text-stone'
          } ${align === 'center' ? 'mx-auto' : ''}`}
        >
          {copy}
        </p>
      </Reveal>
    )}
  </div>
)

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2.5 bg-manara text-white text-[13px] font-semibold tracking-wide px-7 py-3.5 rounded-lg hover:bg-[#7a664f] transition-colors duration-300 ${className}`}
  >
    {children}
  </button>
)

export const GhostButton = ({ children, dark = false, className = '', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2.5 text-[13px] font-semibold tracking-wide px-7 py-3.5 rounded-lg border transition-colors duration-300 ${
      dark
        ? 'border-ivory/30 text-ivory hover:border-ivory/70 hover:bg-ivory/5'
        : 'border-charcoal/25 text-charcoal hover:border-charcoal/60'
    } ${className}`}
  >
    {children}
  </button>
)
