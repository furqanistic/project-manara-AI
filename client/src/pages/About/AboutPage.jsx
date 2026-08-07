import { Label, Reveal } from '@/components/Landing/primitives'
import CompactFooter from '@/components/Layout/CompactFooter'
import TopBar from '@/components/Layout/Topbar'
import { Button } from '@/components/ui/button'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronRight, Github, Linkedin, Quote, Twitter } from 'lucide-react'
import React, { useRef } from 'react'

const AboutPage = () => {
  const containerRef = useRef(null)
  const { scrollY } = useScroll()

  // Parallax transforms for immersive feel
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0])
  const scaleImage = useTransform(scrollY, [0, 600], [1, 1.12])

  const team = [
    {
      name: 'Bawar Ahmad',
      role: 'Co-Founder',
      image:
        'https://dawcapital.co/wp-content/uploads/2024/08/Bawar-Photo-Lachend-1080x1080-1.png',
      bio: 'Technology pioneer focused on making professional design accessible through artificial intelligence.',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
    },
    {
      name: 'Dimitra Manikaki',
      role: 'Co-Founder',
      image:
        'https://dawcapital.co/wp-content/uploads/2024/08/Dimitra-Headshot-square-1024x1024.png',
      bio: 'Visionary leader combining design expertise with AI innovation to transform interior spaces.',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
  ]

  const stats = [
    { number: '1.2M', label: 'DESIGN ASSETS' },
    { number: '500+', label: 'UAE PARTNERS' },
    { number: '2.4s', label: 'GEN TIME' },
    { number: '99%', label: 'SATISFACTION' },
  ]

  const values = [
    {
      title: 'Design Intelligence',
      description: "We don't just generate images; we compute aesthetic harmony, structural integrity, and emotional resonance.",
    },
    {
      title: 'Cultural DNA',
      description: 'Rooted in the UAE, our AI is trained to respect and elevate local architectural heritage and climate needs.',
    },
    {
      title: 'Radical Access',
      description: 'Democratizing luxury. We believe premium interior design should be a human right, not just a high-net-worth privilege.',
    },
  ]

  return (
    <div
      ref={containerRef}
      className='relative bg-ivory text-charcoal font-sans selection:bg-manara/10 overflow-x-hidden transition-colors duration-500'
    >
      <TopBar />

      {/* Cinematic Background Ambience */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#8d775e]/6 blur-[140px]' />
        <div className='absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#c3a886]/6 blur-[120px]' />
      </div>

      {/* Hero Section */}
      <section className='relative min-h-[100svh] flex flex-col overflow-hidden pt-[76px]'>
        <motion.div style={{ scale: scaleImage }} className='absolute inset-0'>
          <motion.img
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
            src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80&auto=format'
            alt='Luxury interior at dusk'
            className='h-full w-full object-cover'
          />
        </motion.div>
        <div className='absolute inset-0 bg-charcoal/70' />
        <div className='absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-charcoal/60' />

        {/* Filmic letterbox hairlines */}
        <div className='absolute top-[76px] left-0 right-0 h-px bg-ivory/10 z-20' />

        {/* Hero Copy */}
        <div className='relative z-10 flex flex-col items-center text-center px-6 pt-24 sm:pt-32 md:pt-40 pb-10 flex-1'>
          <Reveal>
            <p className='label-arch-light'>The Story of Manāra</p>
          </Reveal>

          <Reveal delay={0.12} y={44}>
            <h1 className='mt-8 font-serif text-ivory text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] leading-[0.98] tracking-[-0.02em] [text-shadow:0_1px_2px_rgba(23,22,20,0.6),0_16px_60px_rgba(23,22,20,0.6)]'>
              Curating
              <br />
              <span className='italic text-[#c3a886]'>Spacetime.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2} y={32}>
            <p className='mt-9 max-w-xl text-[15px] md:text-base leading-[1.85] text-[#CFC7BB]'>
              Manāra is a design intelligence engine born in the UAE, bridging
              imagination and physical reality — one room at a time.
            </p>
          </Reveal>

          <Reveal delay={0.28}>
            <div className='mt-12 flex flex-wrap items-center justify-center gap-4'>
              <Button
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className='group h-[54px] px-10 rounded-xl bg-manara hover:bg-[#a08163] text-white text-[13px] font-semibold tracking-wide transition-colors duration-300'
              >
                Our Story
                <ArrowRight size={16} className='ml-1 transition-transform group-hover:translate-x-1' />
              </Button>
              <a
                href='/pricing'
                className='inline-flex items-center h-[54px] px-10 rounded-xl border border-ivory/30 text-ivory text-[13px] font-semibold tracking-wide hover:border-ivory/70 hover:bg-ivory/5 transition-colors duration-300'
              >
                View Plans
              </a>
            </div>
          </Reveal>
        </div>

        {/* Bottom meta panel */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          style={{ opacity: opacityHero }}
          className='relative z-10 w-full border-t border-ivory/15 backdrop-blur-md bg-charcoal/30'
        >
          <div className='max-w-[1500px] mx-auto px-6 md:px-12 py-6 grid grid-cols-3 md:grid-cols-4 gap-4 text-left'>
            {[
              ['01', 'The Vision'],
              ['02', 'The Build'],
              ['03', 'The Team'],
              ['04', 'The Mission'],
            ].map(([no, label]) => (
              <div key={no} className='flex items-baseline gap-3 border-r border-ivory/10 last:border-0 pr-4'>
                <span className='font-serif italic text-[#c3a886] text-lg'>{no}</span>
                <span className='text-[9px] font-semibold uppercase tracking-[0.3em] text-ivory/70'>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Vision Statement (Immersive Card) */}
      <section className='relative py-28 md:py-36 px-8 md:px-20'>
        <div className='max-w-[1500px] mx-auto'>
          <Reveal>
            <div className='border border-beige bg-white/70 backdrop-blur-sm rounded-2xl p-10 md:p-20 relative overflow-hidden group'>
              <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-[#c3a886]/8 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full' />

              <div className='relative z-10 grid lg:grid-cols-2 gap-16 items-center'>
                <div className='space-y-8'>
                  <Quote size={52} className='text-manara opacity-20' />
                  <h2 className='font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.06] tracking-[-0.01em] text-charcoal'>
                    Design is no longer a{' '}
                    <span className='italic text-manara'>luxury</span>. It's an
                    algorithm for better living.
                  </h2>
                </div>

                <div className='space-y-10'>
                  <p className='text-[15px] md:text-base leading-[1.85] text-stone'>
                    The traditional design industry is broken—high costs, slow timelines, and
                    limited access. We've rebuilt it from the ground up using proprietary AI that
                    understands the intersection of culture, luxury, and technology.
                  </p>

                  <div className='grid grid-cols-2 gap-12 pt-8'>
                    {stats.map((stat, i) => (
                      <div key={i} className='space-y-2'>
                        <h4 className='font-serif text-4xl md:text-5xl text-charcoal tracking-[-0.01em]'>
                          {stat.number}
                        </h4>
                        <p className='label-meta text-manara'>{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values Section */}
      <section className='py-28 md:py-36'>
        <main className='max-w-[1500px] mx-auto px-8 md:px-20 relative z-10'>
          <div className='flex flex-col lg:flex-row justify-between gap-24 mb-24'>
            <div className='lg:max-w-md space-y-8'>
              <Reveal>
                <Label>Core Values</Label>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className='font-serif text-5xl md:text-6xl tracking-[-0.01em] leading-[1.05] text-charcoal'>
                  The Manāra <span className='italic text-manara'>Standard.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.18}>
                <p className='text-[15px] leading-[1.85] text-stone max-w-md'>
                  We operate at the frontier of technology and aesthetics, guided by a singular
                  vision of space transformation.
                </p>
              </Reveal>
            </div>

            <div className='grid gap-14 flex-1'>
              {values.map((v, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className='group cursor-pointer border-b border-beige pb-12'>
                    <div className='flex items-start gap-8'>
                      <span className='font-serif italic text-[#c3a886] text-4xl tracking-tighter leading-none'>
                        0{i + 1}
                      </span>
                      <div className='space-y-4'>
                        <h4 className='text-2xl md:text-3xl font-semibold tracking-tight text-charcoal transition-colors duration-500 group-hover:text-manara'>
                          {v.title}
                        </h4>
                        <p className='text-stone text-[15px] leading-[1.85] max-w-xl'>
                          {v.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </main>
      </section>

      {/* Team Section */}
      <section className='py-24 px-8 md:px-20 border-t border-beige bg-white/40'>
        <div className='max-w-[1500px] mx-auto'>
          <div className='flex flex-col lg:flex-row justify-between items-end gap-12 mb-20'>
            <div className='space-y-6'>
              <Reveal>
                <Label>Founding Team</Label>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className='font-serif text-5xl md:text-7xl tracking-[-0.02em] leading-none text-charcoal'>
                  The <span className='italic text-manara'>Visionaries.</span>
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.16}>
              <p className='text-stone text-[15px] leading-[1.85] max-w-sm'>
                Engineers and designers united by a common obsession for spatial intelligence.
              </p>
            </Reveal>
          </div>

          <div className='grid md:grid-cols-2 gap-16'>
            {team.map((member, i) => (
              <Reveal key={i} delay={i * 0.15} y={40}>
                <div className='group'>
                  <div className='relative overflow-hidden rounded-2xl aspect-[4/5] bg-[#e8e3da] border border-beige mb-8'>
                    <motion.img
                      src={member.image}
                      alt={member.name}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 1.2 }}
                      className='w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700'
                    />
                  </div>
                  <div className='flex justify-between items-start gap-6'>
                    <div className='space-y-2'>
                      <h4 className='font-serif text-3xl md:text-4xl tracking-[-0.01em] text-charcoal'>
                        {member.name}
                      </h4>
                      <p className='label-meta text-manara'>{member.role}</p>
                      <p className='text-stone max-w-md mt-6 text-[15px] leading-[1.85]'>
                        {member.bio}
                      </p>
                    </div>
                    <div className='flex flex-col gap-3 shrink-0'>
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          className='w-11 h-11 rounded-full bg-white border border-beige flex items-center justify-center text-stone hover:bg-manara hover:border-manara hover:text-white transition-all'
                        >
                          <Linkedin size={17} />
                        </a>
                      )}
                      {member.github && (
                        <a
                          href={member.github}
                          className='w-11 h-11 rounded-full bg-white border border-beige flex items-center justify-center text-stone hover:bg-charcoal hover:border-charcoal hover:text-ivory transition-all'
                        >
                          <Github size={17} />
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          className='w-11 h-11 rounded-full bg-white border border-beige flex items-center justify-center text-stone hover:bg-[#1da1f2] hover:border-[#1da1f2] hover:text-white transition-all'
                        >
                          <Twitter size={17} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='relative py-28 md:py-36 px-8 md:px-20 overflow-hidden'>
        <div className='absolute inset-0 bg-charcoal rounded-t-2xl' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-manara/20 rounded-full blur-[140px] pointer-events-none' />
        <div className='relative z-10 max-w-[1500px] mx-auto text-center'>
          <Reveal>
            <div className='relative inline-block'>
              <h2 className='font-serif text-6xl md:text-8xl leading-[0.95] tracking-[-0.02em] text-ivory'>
                Start your
                <br />
                <span className='italic text-[#c3a886]'>Genesis.</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className='mt-16 flex flex-col sm:flex-row gap-6 justify-center items-center'>
              <Button
                onClick={() => (window.location.href = '/moodboard')}
                className='group h-[54px] px-10 rounded-xl bg-manara hover:bg-manara/[0.9] text-white text-[13px] font-semibold tracking-wide flex items-center gap-2.5 transition-all active:scale-[0.98]'
              >
                Begin Designing
                <ArrowRight size={16} className='transition-transform group-hover:translate-x-1' />
              </Button>

              <a
                href='/subscription'
                className='group flex items-center gap-3 text-ivory/60 hover:text-ivory text-[13px] font-semibold tracking-wide transition-colors'
              >
                View Membership Plans
                <ChevronRight
                  size={18}
                  className='group-hover:translate-x-2 transition-transform'
                />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <CompactFooter />
    </div>
  )
}

export default AboutPage