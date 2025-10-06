import AvatarOnboardingPopup from '@/components/AddOns/AvatarOnboardingPopup'
import TopBar from '@/components/Layout/Topbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Check, Crown, Sparkles, Star } from 'lucide-react'
import { useState } from 'react'

// Pricing data with only primary color shades
const PLANS = [
  {
    id: 'luxury',
    name: 'Luxury',
    icon: Crown,
    tagline: 'Comprehensive whole home transformation',
    price: 'AED 24,999',
    originalPrice: 'AED 34,999',
    color: '#937c60', // primary
    gradient: 'from-[#937c60] to-[#7a654f]', // primary to darker primary
    lightColor: '#f5f0ec', // very light primary
    buttonColor: 'bg-[#937c60] hover:bg-[#7a654f]',
    popular: true,
    description: 'Complete home design with dedicated project management.',
    features: [
      'Whole Home Design (4+ Rooms)',
      'Premium AI Features & 3D Renders',
      'Curated Material Lists with UAE Suppliers',
      'Dedicated Installation Professional Network',
      'Budget: up to 40K AED',
      '24/7 VIP Support',
      'Project Manager Assigned',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Sparkles,
    tagline: 'Great value for multiple rooms',
    price: 'AED 15,999',
    originalPrice: 'AED 22,999',
    color: '#7a654f', // darker primary
    gradient: 'from-[#7a654f] to-[#61503f]', // darker primary to even darker
    lightColor: '#f0e8e0', // light primary
    buttonColor: 'bg-[#7a654f] hover:bg-[#61503f]',
    description: 'Advanced design features for multiple rooms.',
    features: [
      '2-3 Rooms Complete Design',
      'Advanced AI Mood Boards & 3D Renders',
      'Material Lists with UAE Suppliers',
      'Installation Professional Contacts',
      'Budget: Up to 25K AED',
      '24/7 Priority Support',
    ],
  },
  {
    id: 'essential',
    name: 'Essential',
    icon: Star,
    tagline: 'Perfect for single room transformations',
    price: 'AED 8,999',
    originalPrice: 'AED 12,999',
    color: '#b8a58c', // lighter primary
    gradient: 'from-[#b8a58c] to-[#937c60]', // lighter primary to primary
    lightColor: '#f8f4f0', // very light primary
    buttonColor: 'bg-[#b8a58c] hover:bg-[#937c60]',
    description: 'Complete design solution for a single room.',
    features: [
      '1 Room Complete Design',
      'AI Mood Boards & 3D Renders',
      'Material Lists with UAE Suppliers',
      'Installation Professional Contacts',
      'Budget: Up to 15K AED',
      'Email Support',
    ],
  },
]

// Decorative elements using only primary color shades
const Decorations = () => (
  <div className='absolute inset-0 overflow-hidden pointer-events-none'>
    {/* Top blob */}
    <div className='absolute top-0 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-[#937c60]/15 to-[#7a654f]/15 blur-3xl -translate-y-1/2'></div>

    {/* Bottom blob */}
    <div className='absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-[#b8a58c]/15 to-[#937c60]/15 blur-3xl translate-y-1/2'></div>

    {/* Floating elements */}
    <motion.div
      className='absolute top-24 left-10 opacity-50'
      animate={{ y: [-5, 5, -5], rotate: [0, 5, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
    >
      <Star size={24} className='text-[#937c60]' />
    </motion.div>

    <motion.div
      className='absolute bottom-32 right-10 opacity-50'
      animate={{ y: [5, -5, 5], rotate: [0, -5, 0] }}
      transition={{
        repeat: Infinity,
        duration: 4,
        ease: 'easeInOut',
        delay: 1,
      }}
    >
      <Crown size={24} className='text-[#7a654f]' />
    </motion.div>

    <motion.div
      className='absolute top-1/2 right-16 opacity-50'
      animate={{ y: [-8, 8, -8], rotate: [0, 10, 0] }}
      transition={{
        repeat: Infinity,
        duration: 5,
        ease: 'easeInOut',
        delay: 0.5,
      }}
    >
      <Sparkles size={20} className='text-[#b8a58c]' />
    </motion.div>
  </div>
)

// Feature check item component using only primary color shades
const FeatureItem = ({ children, color }) => (
  <div className='flex items-start gap-3 py-1.5 group'>
    <div className='shrink-0 mt-0.5'>
      <div
        className='rounded-full p-1 transition-colors'
        style={{ backgroundColor: `${color}20` }}
      >
        <Check size={16} style={{ color }} />
      </div>
    </div>
    <span className='text-gray-700 group-hover:text-gray-900 transition-colors'>
      {children}
    </span>
  </div>
)

const PlanCard = ({ plan, onGetStarted }) => {
  const {
    name,
    icon: Icon,
    tagline,
    price,
    originalPrice,
    color,
    gradient,
    lightColor,
    buttonColor,
    description,
    features,
    popular,
  } = plan

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className='h-full'
    >
      <Card
        className={`h-full overflow-hidden flex flex-col ${
          popular ? 'border-2 shadow-xl relative' : 'border shadow'
        }`}
        style={{ borderColor: popular ? color : '' }}
      >
        {popular && (
          <div className='absolute top-3 right-3 z-10'>
            <Badge className='py-1 px-2.5 bg-gradient-to-r from-[#937c60] to-[#7a654f] text-white border-none'>
              <Star className='w-3 h-3 mr-1' fill='white' /> Most Popular
            </Badge>
          </div>
        )}
        {/* Header with colored background */}
        <div
          className='p-6 text-white'
          style={{
            background: `linear-gradient(to right, ${color}, ${color}dd)`,
          }}
        >
          <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 bg-white/20 rounded-lg'>
              <Icon size={20} />
            </div>
            <h3 className='text-xl font-bold'>{name}</h3>
          </div>
          <p className='text-white/80 text-sm'>{tagline}</p>
        </div>

        <div className='flex flex-col flex-1 px-6 py-5 bg-white'>
          {/* Content section */}
          <div className='flex-1'>
            <div className='mb-4'>
              {originalPrice && (
                <div className='text-gray-500 line-through text-sm mb-1'>
                  {originalPrice}
                </div>
              )}
              <div className='flex items-baseline'>
                <span className='text-3xl font-bold' style={{ color }}>
                  {price}
                </span>
              </div>
              <p className='text-gray-600 text-sm mt-2 leading-snug'>
                {description}
              </p>
            </div>
            <div className='space-y-0.5'>
              {features.map((feature, index) => (
                <FeatureItem key={index} color={color}>
                  {feature}
                </FeatureItem>
              ))}
            </div>
          </div>

          {/* Button section - always at bottom */}
          <div className='pt-6'>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className={`w-full ${
                  popular ? 'py-6' : 'py-5'
                } ${buttonColor} text-white border-none`}
                onClick={onGetStarted} // 👈 Use the passed prop
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Shared features section using only primary color shades

// Main pricing section component
const PricingSection = () => {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)

  return (
    <>
      <TopBar />
      <div className='relative pt-26 pb-24 px-4 lg:px-8 overflow-hidden bg-gradient-to-b from-gray-50 to-white'>
        <Decorations />

        {/* Section header */}
        <div className='relative max-w-3xl mx-auto text-center mb-16 z-10'>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='text-4xl sm:text-5xl font-bold mb-5 bg-gradient-to-r from-[#937c60] via-[#7a654f] to-[#b8a58c] bg-clip-text text-transparent'
          >
            Three Plans, One Design Vision
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='text-lg text-gray-600 max-w-2xl mx-auto'
          >
            We&apos;ve created Manāra plans to scale based on your unique design
            needs, with beautiful solutions to help your space shine.
          </motion.p>
        </div>

        {/* Pricing cards */}
        {/* Pricing cards */}
        <div className='relative max-w-6xl mx-auto z-10'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onGetStarted={() => setIsAvatarOpen(true)} // 👈 Pass the handler
              />
            ))}
          </div>
        </div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className='relative max-w-2xl mx-auto mt-20 text-center z-10'
        >
          <div className='bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100'>
            <h3 className='text-2xl font-bold text-gray-800 mb-3'>
              Not sure which plan is right for you?
            </h3>
            <p className='text-gray-600 mb-6'>
              Our design experts are ready to help you find the perfect fit for
              your space transformation needs.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className='bg-gradient-to-r from-[#937c60] to-[#7a654f] text-white py-6 px-8 shadow-lg shadow-[#937c60]/20'
                onClick={() => setIsAvatarOpen(true)}
              >
                Start Your Design Journey
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <AvatarOnboardingPopup
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
        onSubmit={(data) => {
          console.log('Avatar data:', data)
        }}
      />
    </>
  )
}

export default PricingSection
