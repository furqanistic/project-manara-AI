import AvatarOnboardingPopup from '@/components/AddOns/AvatarOnboardingPopup'
import TopBar from '@/components/Layout/Topbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { stripeService } from '@/services/stripeService'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Crown, Info, Shield, Sparkles, Star, Zap } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// Enhanced Pricing data
const PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    icon: Star,
    tagline: 'Ideal for single room focus',
    price: '8,999',
    unit: 'AED',
    originalPrice: '12,999',
    color: '#b8a58c',
    description: 'Perfect for transforming a single living space with expert AI guidance.',
    features: [
      '1 Room Complete Design',
      'AI Mood Boards & 3D Renders',
      'Material Lists with UAE Suppliers',
      'Installation Professional Contacts',
      'Budget Optimization (Up to 15K)',
      'Standard Email Support',
    ],
    cta: 'Start Transformation',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    icon: Crown,
    tagline: 'The ultimate design experience',
    price: '24,999',
    unit: 'AED',
    originalPrice: '34,999',
    color: '#937c60',
    popular: true,
    description: 'Our most comprehensive package for full home transformations and VIP service.',
    features: [
      'Whole Home Design (4+ Rooms)',
      'Premium AI Features & HD 3D Renders',
      'Curated Material Lists with UAE Suppliers',
      'Dedicated Installation Professional Network',
      'High-End Budgeting (up to 40K)',
      '24/7 VIP Support',
      'Dedicated Project Manager',
    ],
    cta: 'Get The VIP Treatment',
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Sparkles,
    tagline: 'Elevated multi-room design',
    price: '15,999',
    unit: 'AED',
    originalPrice: '22,999',
    color: '#7a654f',
    description: 'Balanced features for those looking to redesign multiple primary living areas.',
    features: [
      '2-3 Rooms Complete Design',
      'Advanced AI Mood Boards & 3D Renders',
      'Material Lists with UAE Suppliers',
      'Installation Professional Contacts',
      'Medium Budgeting (Up to 25K)',
      '24/7 Priority Support',
    ],
    cta: 'Upgrade Your Home',
    priceId: 'price_1Qpsm7F9uY9uY9uY9uY9uY9u', // Placeholder - actual price IDs needed
  },
]

const Decorations = () => (
  <div className='absolute inset-0 overflow-hidden pointer-events-none'>
    <div className='absolute -top-24 -left-24 w-96 h-96 bg-[#937c60]/8 rounded-full blur-[100px]' />
    <div className='absolute top-1/2 -right-24 w-80 h-80 bg-[#b8a58c]/8 rounded-full blur-[80px]' />
    <div className='absolute -bottom-24 left-1/3 w-64 h-64 bg-[#7a654f]/8 rounded-full blur-[120px]' />
  </div>
)

const PricingCard = ({ plan, onSelect }) => {
  const isPopular = plan.popular
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className={`relative flex flex-col h-full rounded-3xl transition-all duration-300 ${
        isPopular 
          ? 'bg-white shadow-[0_20px_50px_rgba(147,124,96,0.12)] ring-1 ring-[#937c60]/30' 
          : 'bg-white shadow-xl border border-gray-100'
      }`}
    >
      {isPopular && (
        <div className='absolute -top-3 left-1/2 -translate-x-1/2 z-20'>
          <Badge className='bg-[#937c60] text-white px-5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md'>
            Most Popular
          </Badge>
        </div>
      )}

      <div className='p-8 flex flex-col h-full'>
        {/* Header */}
        <div className='mb-8'>
          <h3 className='text-2xl font-bold text-gray-900 mb-1'>{plan.name}</h3>
          <p className='text-sm text-gray-500 font-medium'>{plan.tagline}</p>
        </div>

        {/* Pricing */}
        <div className='mb-8'>
          <div className='flex items-baseline gap-1'>
            <span className='text-sm font-bold text-gray-400'>{plan.unit}</span>
            <span className='text-5xl font-extrabold text-[#1a1a1a] tracking-tight'>
              {plan.price}
            </span>
          </div>
          {plan.originalPrice && (
            <div className='flex items-center gap-2 mt-2'>
              <span className='text-sm text-gray-400 line-through'>{plan.unit} {plan.originalPrice}</span>
              <span className='text-[10px] font-bold text-[#937c60] bg-[#937c60]/5 px-2 py-0.5 rounded'>
                SAVE AED {parseInt(plan.originalPrice.replace(',','')) - parseInt(plan.price.replace(',',''))}
              </span>
            </div>
          )}
        </div>

        <p className='text-sm text-gray-600 leading-relaxed mb-8'>
          {plan.description}
        </p>

        {/* Features list */}
        <div className='flex-grow space-y-4 mb-10'>
          {plan.features.map((feature, idx) => (
            <div key={idx} className='flex items-start gap-3 group'>
              <div 
                className='mt-2 shrink-0 w-1.5 h-1.5 rounded-full'
                style={{ backgroundColor: plan.color }}
              />
              <span className='text-sm text-gray-700 leading-snug group-hover:text-gray-900 transition-colors'>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={onSelect}
          style={{ 
            backgroundColor: isPopular ? '#937c60' : 'transparent',
            borderColor: isPopular ? '#937c60' : '#e5e7eb',
            color: isPopular ? 'white' : '#937c60'
          }}
          className={`w-full py-7 rounded-2xl font-bold text-base transition-all duration-300 border-2 shadow-none ${
            !isPopular && 'hover:bg-[#937c60] hover:text-white hover:border-[#937c60]'
          }`}
        >
          {plan.cta}
        </Button>
      </div>
    </motion.div>
  )
}

const PricingPage = () => {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()

  const handleSelectPlan = async (plan) => {
    if (!currentUser) {
      navigate('/auth?type=login')
      return
    }

    if (currentUser?.isOnboarded) {
      // If already onboarded, initiate Stripe Checkout
      try {
        const loadingToast = toast.loading('Opening secure checkout...')
        const response = await stripeService.createCheckoutSession(plan.priceId || 'default')
        if (response.url) {
          window.location.href = response.url
        }
      } catch (error) {
        console.error('Stripe error:', error)
        toast.error('Failed to initiate checkout. Please try again.')
      }
    } else {
      setIsAvatarOpen(true)
    }
  }

  return (
    <div className='min-h-screen bg-[#faf8f6] font-["Poppins"]'>
      <TopBar />
      
      <main className='relative pt-32 pb-24 px-4 overflow-hidden'>
        <Decorations />

        <div className='max-w-7xl mx-auto relative z-10'>
          {/* Header Section */}
          <div className='max-w-3xl mx-auto text-center mb-20'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className='inline-flex items-center px-4 py-1 rounded-full bg-[#937c60]/10 text-[#937c60] text-[11px] font-bold mb-6 tracking-wider'
            >
              LIMITED TIME LAUNCH OFFER
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-[1.05]'
            >
              Premium Design, <br />
              <span className='text-[#937c60]'>Transparent</span> Pricing.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto'
            >
              Experience the future of interior design. Flexible plans tailored to the scale of your vision, from single rooms to luxury villas.
            </motion.p>
          </div>

          {/* Pricing Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 items-center'>
            {PLANS.map((plan, index) => (
              <div 
                key={plan.id} 
                className={plan.popular ? 'lg:scale-105 z-10' : 'lg:scale-95'}
              >
                <PricingCard 
                  plan={plan} 
                  onSelect={() => handleSelectPlan(plan)}
                />
              </div>
            ))}
          </div>

          {/* Trust Section Simplified */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className='flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 font-bold text-xs uppercase tracking-[0.2em] text-gray-600'
          >
            <span>Secure Payments</span>
            <span>AI-Powered Accuracy</span>
            <span>UAE Licensed Experts</span>
          </motion.div>

          {/* Help/CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='mt-32'
          >
            <div className='bg-[#1a1a1a] rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl'>
              <div className='absolute top-0 right-0 w-1/2 h-full bg-[#937c60]/10 blur-[100px] pointer-events-none' />
              
              <div className='relative z-10 max-w-xl text-center lg:text-left'>
                <h2 className='text-3xl md:text-5xl font-bold text-white mb-6 leading-tight'>
                  Still not sure about the perfect fit?
                </h2>
                <p className='text-gray-400 text-lg md:text-xl'>
                  Our consultants offer a free 15-minute session to help you choose the right path for your renovation.
                </p>
              </div>

              <div className='relative z-10 shrink-0 w-full lg:w-auto'>
                <Button 
                  onClick={handleSelectPlan}
                  className='bg-[#937c60] hover:bg-[#a68d6f] text-white px-12 py-8 rounded-2xl text-lg font-bold w-full lg:w-auto transition-all hover:scale-105 active:scale-95'
                >
                  Book Free Consultation
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <AvatarOnboardingPopup
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
        onSubmit={(data) => {
          console.log('Avatar data:', data)
        }}
      />
    </div>
  )
}

export default PricingPage
