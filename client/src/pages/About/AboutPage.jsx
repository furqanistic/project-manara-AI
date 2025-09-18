import CompactFooter from '@/components/Layout/CompactFooter'
import TopBar from '@/components/Layout/Topbar'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  Award,
  Clock,
  Github,
  Globe,
  Heart,
  Lightbulb,
  Linkedin,
  MapPin,
  Sparkles,
  Target,
  Twitter,
  Users,
  Zap,
} from 'lucide-react'
import React, { useRef, useState } from 'react'

const AboutPage = () => {
  const [activeValue, setActiveValue] = useState(0)
  const containerRef = useRef(null)
  const { scrollY } = useScroll()

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 1000], [0, -100])
  const y2 = useTransform(scrollY, [0, 1000], [0, 50])
  const y3 = useTransform(scrollY, [0, 1000], [0, -75])

  const brandColor = '#937c60'
  const brandColorLight = '#a68970'

  // Company values that rotate
  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description:
        "We push the boundaries of what's possible in interior design through AI",
    },
    {
      icon: Heart,
      title: 'Human-Centered',
      description: 'Technology serves people, not the other way around',
    },
    {
      icon: Globe,
      title: 'UAE-Rooted',
      description: 'Built for the region, by people who understand it',
    },
    {
      icon: Sparkles,
      title: 'Quality Obsessed',
      description: 'Every design, every interaction, every detail matters',
    },
  ]

  // Team members
  const team = [
    {
      name: 'Bawar Ahmad',
      role: 'Co-Founder',
      image:
        'https://dawcapital.co/wp-content/uploads/2024/08/Bawar-Photo-Lachend-1080x1080-1.png',
      bio: 'Technology pioneer focused on making professional design accessible through artificial intelligence.',
      linkedin: '#',
      github: '#',
    },
    {
      name: 'Dimitra Manikaki',
      role: 'Co-Founder',
      image:
        'https://dawcapital.co/wp-content/uploads/2024/08/Dimitra-Headshot-square-1024x1024.png',
      bio: 'Visionary leader combining design expertise with AI innovation to transform interior spaces.',
      linkedin: '#',
      twitter: '#',
    },
  ]

  // Stats
  const stats = [
    { number: '1M+', label: 'Design References Analyzed', delay: 0.1 },
    { number: '500+', label: 'UAE Partner Installers', delay: 0.2 },
    { number: '2.4s', label: 'Average Generation Time', delay: 0.3 },
    { number: '99.2%', label: 'Client Satisfaction Rate', delay: 0.4 },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const cardVariants = {
    hidden: { y: 40, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <div ref={containerRef} className='relative bg-white overflow-hidden'>
      {/* TopBar */}
      <TopBar />

      {/* Hero Section */}
      <section
        className='relative min-h-screen flex items-center justify-center py-20 pt-32'
        style={{
          background: 'linear-gradient(135deg, #fafaf9 0%, #f8fafc 100%)',
        }}
      >
        {/* Animated Background */}
        <div className='absolute inset-0 overflow-hidden'>
          <motion.div className='absolute inset-0 opacity-20' style={{ y: y2 }}>
            <div
              className='absolute inset-0'
              style={{
                backgroundImage: `
                  linear-gradient(rgba(147, 124, 96, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(147, 124, 96, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px',
              }}
            />
          </motion.div>

          {/* Floating Elements */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className='absolute w-32 h-32 rounded-full opacity-5 blur-xl'
              style={{
                left: `${20 + i * 25}%`,
                top: `${15 + (i % 2) * 60}%`,
                background:
                  i === 0
                    ? brandColor
                    : i === 1
                    ? 'linear-gradient(45deg, #3b82f6, #06b6d4)'
                    : i === 2
                    ? 'linear-gradient(45deg, #10b981, #14b8a6)'
                    : 'linear-gradient(45deg, #f59e0b, #ef4444)',
                y: i % 2 === 0 ? y1 : y3,
              }}
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <motion.div
          className='relative z-10 max-w-4xl mx-auto px-4 text-center'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.div variants={itemVariants}>
            <motion.h1
              className='text-6xl md:text-8xl font-black leading-none tracking-tight mb-8'
              style={{ y: y1 }}
            >
              <span className='block text-stone-900'>We're Building the</span>
              <span className='block' style={{ color: brandColor }}>
                Future of Design
              </span>
            </motion.h1>

            <motion.p
              className='text-xl md:text-2xl text-stone-600 max-w-3xl mx-auto leading-relaxed mb-12'
              variants={itemVariants}
            >
              Manāra combines the creativity of human designers with the power
              of artificial intelligence to make professional interior design
              accessible to everyone in the UAE.
            </motion.p>

            <motion.div
              className='flex flex-col sm:flex-row gap-4 justify-center'
              variants={itemVariants}
            >
              <motion.button
                className='px-8 py-4 text-white font-bold rounded-2xl'
                style={{
                  background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 20px 40px -10px ${brandColor}40`,
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <span className='flex items-center gap-2'>
                  Our Story
                  <ArrowRight className='w-5 h-5' />
                </span>
              </motion.button>

              <motion.button
                className='px-8 py-4 bg-white/80 backdrop-blur-xl hover:bg-white border border-stone-200 text-stone-700 rounded-2xl transition-all duration-300'
                whileHover={{
                  scale: 1.02,
                  borderColor: brandColor,
                  boxShadow: `0 4px 20px ${brandColor}20`,
                }}
                whileTap={{ scale: 0.98 }}
              >
                Meet the Team
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className='relative py-24 bg-gradient-to-b from-stone-50 to-white'>
        <motion.div
          className='max-w-7xl mx-auto px-4'
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className='grid lg:grid-cols-2 gap-16 items-center'>
            <motion.div variants={itemVariants}>
              <h2 className='text-5xl md:text-6xl font-black text-stone-900 mb-8 leading-tight'>
                <span className='block'>Our</span>
                <span className='block' style={{ color: brandColor }}>
                  Mission
                </span>
              </h2>

              <div className='space-y-6 text-lg text-stone-600 leading-relaxed'>
                <p>
                  The interior design industry in the UAE has remained largely
                  unchanged for decades. Great design is still locked behind
                  high costs, long timelines, and geographic barriers.
                </p>
                <p>
                  We believe everyone deserves to live and work in spaces that
                  inspire them. That's why we're building AI that thinks like a
                  designer, paired with a network that works like a local team.
                </p>
                <p className='text-stone-900 font-medium'>
                  From a simple photo to a complete installation - we're making
                  professional design accessible to every space in the UAE.
                </p>
              </div>
            </motion.div>

            <motion.div className='relative' variants={itemVariants}>
              <motion.div
                className='bg-white/80 backdrop-blur-xl border border-stone-200 rounded-3xl p-8 shadow-lg'
                whileHover={{
                  y: -10,
                  boxShadow: `0 25px 50px -10px ${brandColor}20`,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className='space-y-8'>
                  <div className='flex items-center gap-4'>
                    <motion.div
                      className='w-16 h-16 rounded-2xl flex items-center justify-center'
                      style={{ background: `${brandColor}20` }}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Target
                        className='w-8 h-8'
                        style={{ color: brandColor }}
                      />
                    </motion.div>
                    <div>
                      <h3 className='text-2xl font-bold text-stone-900'>
                        Vision 2030
                      </h3>
                      <p className='text-stone-600'>
                        Aligned with UAE's future
                      </p>
                    </div>
                  </div>

                  <div className='space-y-4 text-stone-600'>
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ background: brandColor }}
                      ></div>
                      <span>10,000+ spaces transformed by 2027</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ background: brandColor }}
                      ></div>
                      <span>Every emirate connected to design excellence</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ background: brandColor }}
                      ></div>
                      <span>AI that understands local culture & climate</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className='relative py-24 bg-white'>
        <motion.div
          className='max-w-7xl mx-auto px-4'
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div className='text-center mb-16' variants={itemVariants}>
            <h2 className='text-5xl md:text-6xl font-black text-stone-900 mb-6'>
              What Drives Us
            </h2>
            <p className='text-xl text-stone-600 max-w-3xl mx-auto'>
              Our values shape every decision, from the algorithms we train to
              the partnerships we build.
            </p>
          </motion.div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <motion.div
                  key={index}
                  className='relative group cursor-pointer'
                  variants={cardVariants}
                  onHoverStart={() => setActiveValue(index)}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className='p-8 bg-stone-50/80 backdrop-blur-xl border border-stone-200 rounded-3xl h-full shadow-sm'
                    animate={{
                      borderColor:
                        activeValue === index ? `${brandColor}50` : '#e5e7eb',
                      backgroundColor:
                        activeValue === index
                          ? `${brandColor}10`
                          : 'rgba(248,250,252,0.8)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className='w-16 h-16 rounded-2xl flex items-center justify-center mb-6'
                      style={{ background: `${brandColor}20` }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconComponent
                        className='w-8 h-8'
                        style={{ color: brandColor }}
                      />
                    </motion.div>

                    <h3 className='text-xl font-bold text-stone-900 mb-4'>
                      {value.title}
                    </h3>
                    <p className='text-stone-600 leading-relaxed'>
                      {value.description}
                    </p>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className='relative py-24 bg-gradient-to-b from-stone-50 to-white'>
        <motion.div
          className='max-w-7xl mx-auto px-4'
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div className='text-center mb-16' variants={itemVariants}>
            <h2 className='text-5xl md:text-6xl font-black text-stone-900 mb-6'>
              <span style={{ color: brandColor }}>By the Numbers</span>
            </h2>
          </motion.div>

          <div className='grid md:grid-cols-4 gap-8'>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className='text-center'
                variants={itemVariants}
                custom={stat.delay}
              >
                <motion.div
                  className='text-4xl md:text-6xl font-black mb-4'
                  style={{ color: brandColor }}
                  animate={{
                    textShadow: [
                      `0 0 20px ${brandColor}40`,
                      `0 0 40px ${brandColor}60`,
                      `0 0 20px ${brandColor}40`,
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: stat.delay,
                  }}
                >
                  {stat.number}
                </motion.div>
                <div className='text-stone-600 text-lg font-medium'>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className='relative py-24 bg-white'>
        <motion.div
          className='max-w-7xl mx-auto px-4'
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div className='text-center mb-16' variants={itemVariants}>
            <h2 className='text-5xl md:text-6xl font-black text-stone-900 mb-6'>
              Meet Our Team
            </h2>
            <p className='text-xl text-stone-600 max-w-3xl mx-auto'>
              Designers, engineers, and dreamers united by the belief that great
              design should be accessible to all.
            </p>
          </motion.div>

          <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
            {team.map((member, index) => (
              <motion.div
                key={index}
                className='group h-full'
                variants={cardVariants}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className='bg-stone-50/80 backdrop-blur-xl border border-stone-200 rounded-3xl overflow-hidden h-full flex flex-col shadow-sm'
                  whileHover={{
                    borderColor: `${brandColor}30`,
                    boxShadow: `0 20px 40px -10px ${brandColor}20`,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className='aspect-square overflow-hidden'>
                    <motion.img
                      src={member.image}
                      alt={member.name}
                      className='w-full h-full object-cover'
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>

                  <div className='p-6 flex-1 flex flex-col'>
                    <div className='flex-1'>
                      <h3 className='text-xl font-bold text-stone-900 mb-1'>
                        {member.name}
                      </h3>
                      <p
                        className='mb-3 font-medium'
                        style={{ color: brandColor }}
                      >
                        {member.role}
                      </p>
                      <p className='text-stone-600 text-sm leading-relaxed'>
                        {member.bio}
                      </p>
                    </div>

                    <div className='flex gap-3 mt-6 pt-4 border-t border-stone-200'>
                      {member.linkedin && (
                        <motion.a
                          href={member.linkedin}
                          className='w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 hover:text-white transition-colors'
                          whileHover={{
                            scale: 1.2,
                            backgroundColor: `${brandColor}`,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Linkedin className='w-4 h-4' />
                        </motion.a>
                      )}
                      {member.twitter && (
                        <motion.a
                          href={member.twitter}
                          className='w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 hover:text-white transition-colors'
                          whileHover={{
                            scale: 1.2,
                            backgroundColor: `${brandColor}`,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Twitter className='w-4 h-4' />
                        </motion.a>
                      )}
                      {member.github && (
                        <motion.a
                          href={member.github}
                          className='w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 hover:text-white transition-colors'
                          whileHover={{
                            scale: 1.2,
                            backgroundColor: `${brandColor}`,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Github className='w-4 h-4' />
                        </motion.a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className='relative py-24 bg-gradient-to-b from-stone-50 to-white'>
        <motion.div
          className='max-w-4xl mx-auto px-4 text-center'
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div variants={itemVariants}>
            <h2 className='text-5xl md:text-6xl font-black text-stone-900 mb-8 leading-tight'>
              Ready to Transform
              <br />
              <span style={{ color: brandColor }}>Your Space?</span>
            </h2>

            <motion.p
              className='text-xl text-stone-600 mb-12 max-w-2xl mx-auto'
              variants={itemVariants}
            >
              Join thousands of UAE residents and businesses who have discovered
              the future of interior design.
            </motion.p>

            <motion.div
              className='flex flex-col sm:flex-row gap-4 justify-center'
              variants={itemVariants}
            >
              <motion.button
                className='px-8 py-4 text-white font-bold rounded-2xl shadow-2xl'
                style={{
                  background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 25px 50px -10px ${brandColor}40`,
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <span className='flex items-center gap-2'>
                  Start Designing Now
                  <ArrowRight className='w-5 h-5' />
                </span>
              </motion.button>

              <motion.button
                className='px-8 py-4 bg-white/80 backdrop-blur-xl hover:bg-white border border-stone-200 text-stone-700 rounded-2xl transition-all duration-300'
                whileHover={{
                  scale: 1.02,
                  borderColor: brandColor,
                  boxShadow: `0 4px 20px ${brandColor}20`,
                }}
                whileTap={{ scale: 0.98 }}
              >
                Contact Our Team
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
      <CompactFooter />
    </div>
  )
}

export default AboutPage
