import CompactFooter from '@/components/Layout/CompactFooter'
import TopBar from '@/components/Layout/Topbar'
import { Button } from '@/components/ui/button'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  Github,
  Linkedin,
  Quote,
  Sparkles,
  Twitter
} from 'lucide-react'
import React, { useRef } from 'react'

const AboutPage = () => {
  const containerRef = useRef(null)
  const { scrollY } = useScroll()

  // Parallax transforms for immersive feel
  const yHero = useTransform(scrollY, [0, 500], [0, 150])
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0])
  const yImage = useTransform(scrollY, [0, 500], [0, -50])

  const brandColor = '#937c60'

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
      title: "Design Intelligence",
      description: "We don't just generate images; we compute aesthetic harmony, structural integrity, and emotional resonance."
    },
    {
      title: "Cultural DNA",
      description: "Rooted in the UAE, our AI is trained to respect and elevate local architectural heritage and climate needs."
    },
    {
      title: "Radical Access",
      description: "Democratizing luxury. We believe premium interior design should be a human right, not just a high-net-worth privilege."
    }
  ]

  return (
    <div ref={containerRef} className='relative bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"] selection:bg-[#937c60]/10 overflow-x-hidden transition-colors duration-500'>
      <TopBar />

      {/* Cinematic Background Ambience */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#937c60]/5 dark:bg-[#937c60]/10 blur-[140px]' />
        <div className='absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#937c60]/3 dark:bg-[#937c60]/5 blur-[120px]' />
      </div>

      {/* Hero Section */}
      <section className='relative min-h-[90vh] flex items-center pt-32'>
        <main className='max-w-[1500px] mx-auto px-10 md:px-20 w-full'>
          <div className='grid lg:grid-cols-2 gap-20 items-center'>
            <motion.div 
               style={{ y: yHero, opacity: opacityHero }}
               className='space-y-12'
            >
              <div className='flex items-center gap-4'>
                <div className='w-16 h-[1px] bg-[#937c60] opacity-40'></div>
                <span className='text-[11px] font-bold tracking-[0.6em] text-[#937c60] uppercase'>Legacy of Manāra</span>
              </div>
              
              <h1 className='text-[12vw] lg:text-[7vw] font-bold text-gray-900 dark:text-white tracking-tighter leading-[0.85]'>
                Curating <br />
                <span className='text-[#937c60]'>Spacetime.</span>
              </h1>

              <div className='flex flex-col gap-10 items-start'>
                <p className='text-gray-400 dark:text-gray-500 font-medium text-xl md:text-2xl max-w-xl leading-relaxed'>
                  Manāra is a state-of-the-art design intelligence engine born in the UAE, engineered to bridge the gap between imagination and physical reality.
                </p>
                
                <div className='pt-4'>
                  <motion.button
                    onClick={() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' })}
                    whileHover={{ scale: 1.05 }}
                    className='w-20 h-20 rounded-full border border-[#937c60]/20 flex items-center justify-center text-[#937c60] hover:bg-[#937c60] hover:text-white dark:hover:text-black transition-all duration-500'
                  >
                    <ArrowRight size={24} className='rotate-90' />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Right Side Composition */}
            <motion.div 
              style={{ y: yImage }}
              className='relative hidden lg:block h-[800px]'
            >
               {/* Main Architectural Image */}
               <div className='absolute top-0 right-10 w-[400px] h-[600px] rounded-[100px] overflow-hidden shadow-2xl border border-white/20 dark:border-white/5'>
                 <img 
                   src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1000&auto=format&fit=crop" 
                   alt="Architectural Detail" 
                   className='w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000'
                 />
                 <div className='absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent' />
               </div>

               {/* Floating Detail Card */}
               <motion.div 
                 animate={{ y: [0, -20, 0] }}
                 transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                 className='absolute bottom-40 left-10 w-[300px] h-[400px] bg-white dark:bg-[#111] rounded-[60px] p-2 shadow-2xl border border-gray-100 dark:border-white/10'
               >
                  <div className='w-full h-full rounded-[52px] overflow-hidden relative'>
                    <img 
                      src="https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=1000&auto=format&fit=crop" 
                      alt="Interior Detail" 
                      className='w-full h-full object-cover opacity-80'
                    />
                  
                  </div>
               </motion.div>
            </motion.div>
          </div>
        </main>
      </section>

      {/* Vision Statement (Immersive Card) */}
      <section className='relative py-32 px-10 md:px-20'>
        <div className='max-w-[1500px] mx-auto'>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className='bg-white dark:bg-[#111] rounded-[60px] p-12 md:p-24 shadow-[0_40px_100px_rgba(0,0,0,0.02)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-[#937c60]/5 dark:border-white/5 relative overflow-hidden group'
          >
            <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-[#937c60]/5 dark:bg-[#937c60]/10 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full' />
            
            <div className='relative z-10 grid lg:grid-cols-2 gap-20 items-center'>
              <div className='space-y-8'>
                <Quote size={64} className='text-[#937c60] opacity-20' />
                <h2 className='text-5xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1]'>
                  Design is no longer a <span className='text-[#937c60]'>luxury</span>. It's an algorithm for better living.
                </h2>
              </div>
              
              <div className='space-y-10'>
                <p className='text-gray-500 text-xl leading-relaxed font-medium'>
                  The traditional design industry is broken—high costs, slow timelines, and limited access. We've rebuilt it from the ground up using proprietary AI that understands the intersection of culture, luxury, and technology.
                </p>
                
                <div className='grid grid-cols-2 gap-12 pt-8'>
                   {stats.map((stat, i) => (
                     <div key={i} className='space-y-2'>
                        <h4 className='text-4xl font-bold text-gray-900 dark:text-white tracking-tighter'>{stat.number}</h4>
                        <p className='text-[10px] font-bold text-[#937c60] tracking-widest uppercase'>{stat.label}</p>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Selection */}
      <section className='py-32 bg-[#1a1a1a] dark:bg-black rounded-[60px] md:rounded-[100px] my-12 text-white overflow-hidden relative'>
        <div className='absolute inset-0 bg-gradient-to-br from-[#937c60]/10 to-transparent opacity-50' />
        <main className='max-w-[1500px] mx-auto px-10 md:px-20 relative z-10'>
          <div className='flex flex-col lg:flex-row justify-between gap-20'>
            <div className='lg:max-w-md space-y-8'>
              <h3 className='text-[10px] font-bold text-[#937c60] uppercase tracking-[0.4em]'>Core Values</h3>
              <h2 className='text-5xl md:text-6xl font-bold tracking-tight'>The Manāra Standard</h2>
              <p className='text-gray-400 text-lg leading-relaxed'>We operate at the frontier of technology and aesthetics, guided by a singular vision of space transformation.</p>
            </div>
            
            <div className='grid gap-12 flex-1'>
               {values.map((v, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 20 }}
                    transition={{ duration: 0.4 }}
                    className='group cursor-pointer border-b border-white/5 pb-12'
                  >
                     <div className='flex items-start gap-8'>
                        <span className='text-gray-800 dark:text-gray-800 text-6xl font-bold font-mono tracking-tighter'>0{i+1}</span>
                        <div className='space-y-4'>
                           <h4 className='text-3xl font-bold group-hover:text-[#937c60] transition-colors'>{v.title}</h4>
                           <p className='text-gray-500 text-xl max-w-xl group-hover:text-gray-300 transition-colors'>{v.description}</p>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
          </div>
        </main>
      </section>

      {/* Team Section */}
      <section className='py-40 max-w-[1500px] mx-auto px-10 md:px-20'>
        <div className='flex flex-col lg:flex-row justify-between items-end gap-12 mb-32'>
           <div className='space-y-6'>
              <h3 className='text-[10px] font-bold text-[#937c60] uppercase tracking-[0.4em]'>Founding Team</h3>
              <h2 className='text-7xl md:text-8xl font-bold text-gray-900 dark:text-white tracking-tighter'>The Visionaries.</h2>
           </div>
           <p className='text-gray-400 dark:text-gray-500 font-medium text-xl max-w-sm'>Engineers and designers united by a common obsession for spatial intelligence.</p>
        </div>

        <div className='grid md:grid-cols-2 gap-16'>
           {team.map((member, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.2, duration: 0.8 }}
               className='group'
             >
                <div className='relative overflow-hidden rounded-[60px] aspect-[4/5] bg-gray-100 dark:bg-[#111] mb-10'>
                   <motion.img 
                     src={member.image} 
                     alt={member.name}
                     whileHover={{ scale: 1.05 }}
                     transition={{ duration: 1.2 }}
                     className='w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700'
                   />
                </div>
                <div className='flex justify-between items-start'>
                   <div className='space-y-2'>
                      <h4 className='text-4xl font-bold text-gray-900 dark:text-white tracking-tighter'>{member.name}</h4>
                      <p className='text-[#937c60] font-bold uppercase text-[11px] tracking-widest'>{member.role}</p>
                      <p className='text-gray-500 dark:text-gray-400 max-w-md mt-6 text-lg'>{member.bio}</p>
                   </div>
                   <div className='flex flex-col gap-4'>
                      {member.linkedin && <a href={member.linkedin} className='w-12 h-12 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-[#937c60] dark:hover:bg-[#937c60] hover:text-white dark:hover:text-white transition-all'><Linkedin size={18} /></a>}
                      {member.github && <a href={member.github} className='w-12 h-12 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all'><Github size={18} /></a>}
                      {member.twitter && <a href={member.twitter} className='w-12 h-12 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-[#1da1f2] hover:text-white transition-all'><Twitter size={18} /></a>}
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className='relative py-40 px-10 md:px-20'>
         <div className='max-w-[1500px] mx-auto text-center space-y-16'>
             <div className='relative inline-block'>
                <Sparkles className='text-[#937c60] w-12 h-12 mb-8 mx-auto opacity-40' />
                <h2 className='text-7xl md:text-9xl font-bold text-gray-900 dark:text-white tracking-tighter leading-none'>
                   Start your <br />
                   <span className='text-[#937c60]'>Genesis.</span>
                </h2>
             </div>
             
             <div className='flex flex-col sm:flex-row gap-8 justify-center items-center'>
                <Button 
                   onClick={() => window.location.href = '/moodboard'}
                   className='bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black px-12 py-8 rounded-[32px] font-bold text-lg flex items-center gap-3 shadow-2xl active:scale-95 transition-all'
                >
                   Begin Designing
                   <ArrowRight size={20} />
                </Button>
                
                <a href="/subscription" className='group flex items-center gap-4 text-gray-500 dark:text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-colors'>
                   View Membership Plans
                   <ChevronRight size={20} className='group-hover:translate-x-2 transition-transform' />
                </a>
             </div>
         </div>
      </section>

      <CompactFooter />
    </div>
  )
}

export default AboutPage
