import AvatarOnboardingPopup from '@/components/AddOns/AvatarOnboardingPopup'
import TopBar from '@/components/Layout/Topbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Crown, Sparkles, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { addCredits } from '@/lib/credits'
import { stripeService } from '@/services/stripeService'

const CREDIT_DEFINITIONS = [
  { label: '3D Render Set (1 room)', credits: 3 },
  { label: 'Extra style / variation', credits: 1 },
  { label: '2D Floor Plan / Cut', credits: 4 },
  { label: 'Shopping List + Supplier Suggestions', credits: 2 },
  { label: 'Small revision', credits: 1 },
  { label: 'Full Room Package (all of the above)', credits: 8 },
]

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Star,
    tagline: 'Great for quick tests',
    price: '199',
    unit: 'AED',
    color: '#b8a58c',
    description: 'Starter credits to explore the builders.',
    credits: 20,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_STARTER,
    features: [
      'Best for single room experiments',
      'Mix and match outputs',
      'Credits never expire (for now)',
    ],
    cta: 'Add 20 Credits',
  },
  {
    id: 'home',
    name: 'Home',
    icon: Sparkles,
    tagline: 'Most popular for homeowners',
    price: '449',
    unit: 'AED',
    color: '#937c60',
    popular: true,
    description: 'Balanced package for multi-room projects.',
    credits: 50,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_HOME,
    features: [
      'Enough for full room packages',
      'Great for multiple iterations',
      'Credits never expire (for now)',
    ],
    cta: 'Add 50 Credits',
  },
  {
    id: 'plus',
    name: 'Plus',
    icon: Crown,
    tagline: 'For larger projects',
    price: '799',
    unit: 'AED',
    color: '#7a654f',
    description: 'Best value for big renovations.',
    credits: 100,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_PLUS,
    features: [
      'Best value per credit',
      'Ideal for teams',
      'Credits never expire (for now)',
    ],
    cta: 'Add 100 Credits',
  },
]
const PLAN_CREDITS = {
  starter: 20,
  home: 50,
  plus: 100,
}
const CREDIT_GRANT_PREFIX = 'manara_credit_grant'

const Decorations = () => (
  <div className='absolute inset-0 overflow-hidden pointer-events-none'>
    <div className='absolute -top-24 -left-24 w-96 h-96 bg-[#937c60]/8 dark:bg-[#937c60]/10 rounded-full blur-[100px]' />
    <div className='absolute top-1/2 -right-24 w-80 h-80 bg-[#b8a58c]/8 dark:bg-[#b8a58c]/10 rounded-full blur-[80px]' />
    <div className='absolute -bottom-24 left-1/3 w-64 h-64 bg-[#7a654f]/8 dark:bg-[#7a654f]/10 rounded-full blur-[120px]' />
  </div>
)

const PricingCard = ({ plan, onSelect, isLoading }) => {
  const isPopular = plan.popular
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className={`relative flex flex-col h-full rounded-3xl transition-all duration-300 ${
        isPopular 
          ? 'bg-white dark:bg-[#111] shadow-[0_20px_50px_rgba(147,124,96,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-[#937c60]/30 dark:ring-[#937c60]/50' 
          : 'bg-white dark:bg-[#111] shadow-xl dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5'
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
          <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-1'>{plan.name}</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>{plan.tagline}</p>
        </div>

        {/* Pricing */}
        <div className='mb-8'>
          <div className='flex items-baseline gap-1'>
            <span className='text-sm font-bold text-gray-400 dark:text-gray-500'>{plan.unit}</span>
            <span className='text-5xl font-extrabold text-[#1a1a1a] dark:text-white tracking-tight'>
              {plan.price}
            </span>
          </div>
          <div className='flex items-center gap-2 mt-2'>
            <span className='text-[10px] font-bold text-[#937c60] bg-[#937c60]/5 dark:bg-[#937c60]/10 px-2 py-0.5 rounded'>
              {plan.credits} Credits
            </span>
          </div>
        </div>

        <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-8'>
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
              <span className='text-sm text-gray-700 dark:text-gray-300 leading-snug group-hover:text-gray-900 dark:group-hover:text-white transition-colors'>
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={onSelect}
          disabled={isLoading}
          className={`w-full py-7 rounded-2xl font-bold text-base transition-all duration-300 border-2 shadow-none ${
            isPopular 
              ? 'bg-[#937c60] border-[#937c60] text-white hover:bg-[#867055] hover:border-[#867055]' 
              : 'bg-transparent border-gray-200 dark:border-white/10 text-[#937c60] hover:bg-[#937c60] hover:text-white hover:border-[#937c60]'
          }`}
        >
          {isLoading ? 'Processing...' : plan.cta}
        </Button>
      </div>
    </motion.div>
  )
}

const PricingPage = () => {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const [isProcessingPlanId, setIsProcessingPlanId] = useState(null)
  const [cardsCount, setCardsCount] = useState(0)
  const [isCardsLoading, setIsCardsLoading] = useState(false)
  const { currentUser } = useSelector((state) => state.user)
  const location = useLocation()
  const navigate = useNavigate()
  const processedSearchRef = useRef('')

  const applyCreditsGrant = (grantKey, amount, description) => {
    const safeAmount = Math.max(0, Number(amount) || 0)
    if (!safeAmount || !grantKey || typeof window === 'undefined') return

    const storageKey = `${CREDIT_GRANT_PREFIX}:${grantKey}`
    if (localStorage.getItem(storageKey) === '1') return

    addCredits(safeAmount, {
      source: 'subscription_purchase',
      description,
    })
    localStorage.setItem(storageKey, '1')
  }

  useEffect(() => {
    if (!currentUser) return

    const loadPaymentMethods = async () => {
      setIsCardsLoading(true)
      try {
        const response = await stripeService.getPaymentMethods()
        setCardsCount(response?.data?.cards?.length || 0)
      } catch (error) {
        console.error('Unable to load cards:', error)
      } finally {
        setIsCardsLoading(false)
      }
    }

    loadPaymentMethods()
  }, [currentUser])

  useEffect(() => {
    if (!location.search || processedSearchRef.current === location.search) return
    processedSearchRef.current = location.search

    const params = new URLSearchParams(location.search)
    const checkoutSuccess = params.get('success')
    const sessionId = params.get('session_id')

    if (checkoutSuccess !== 'true' || !sessionId) return

    stripeService
      .syncCheckoutSession(sessionId)
      .then((syncResponse) => {
        const grantedCredits = Number(syncResponse?.data?.grantedCredits) || 0
        const grantedPlanId = syncResponse?.data?.grantedPlanId || null
        const creditGrantKey = syncResponse?.data?.creditGrantKey || `checkout:${sessionId}`
        const fallbackCredits = grantedPlanId ? PLAN_CREDITS[grantedPlanId] || 0 : 0
        const finalCredits = grantedCredits || fallbackCredits

        if (finalCredits > 0) {
          applyCreditsGrant(
            creditGrantKey,
            finalCredits,
            `Plan purchase (${grantedPlanId || 'subscription'})`
          )
          toast.success(`${finalCredits} credits added to your account.`, {
            id: `credits-granted-pricing-${sessionId}`,
          })
        } else {
          toast.success('Checkout completed successfully.', {
            id: `stripe-checkout-success-pricing-${sessionId}`,
          })
        }
      })
      .catch((error) => {
        console.error('Checkout sync failed:', error)
        toast.error('Checkout completed, but failed to sync credits. Please refresh.')
      })
      .finally(() => {
        navigate(location.pathname, { replace: true })
      })
  }, [location.pathname, location.search, navigate])

  const handleSelectPlan = async (plan) => {
    if (!currentUser) {
      navigate('/auth?type=login')
      return
    }

    if (currentUser?.isOnboarded) {
      if (isCardsLoading) {
        toast.error('Loading your payment methods. Please wait a moment.')
        return
      }

      if (cardsCount === 0) {
        toast.error('Please link your card first from the subscription page.')
        navigate('/subscription')
        return
      }

      setIsProcessingPlanId(plan.id)
      try {
        const response = await stripeService.createCheckoutSession({
          planId: plan.id,
          purchaseType: 'topup',
        })

        if (response?.url) {
          window.location.href = response.url
          return
        }

        throw new Error('Stripe checkout URL is missing')
      } catch (error) {
        console.error('Stripe checkout error:', error)
        toast.error(error?.response?.data?.message || 'Unable to start checkout.')
      } finally {
        setIsProcessingPlanId(null)
      }
    } else {
      setIsAvatarOpen(true)
    }
  }

  return (
    <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"] transition-colors duration-500'>
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
              className='inline-flex items-center px-4 py-1 rounded-full bg-[#937c60]/10 dark:bg-[#937c60]/20 text-[#937c60] text-[11px] font-bold mb-6 tracking-wider'
            >
              CREDIT PACKAGES (TEST MODE)
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-[1.05]'
            >
              Simple Credits, <br />
              <span className='text-[#937c60]'>Transparent</span> Pricing.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto'
            >
              Buy credit packages and spend them on outputs. Credits represent deliverables, not technical usage.
            </motion.p>

            <div className='mt-8 flex flex-wrap justify-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-400'>
              <span>{isCardsLoading ? 'Checking Card Status...' : `${cardsCount} Card(s) Linked`}</span>
              <span>Card Required Before Purchase</span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 items-center'>
            {CREDIT_PACKAGES.map((plan) => (
              <div 
                key={plan.id} 
                className={plan.popular ? 'lg:scale-105 z-10' : 'lg:scale-95'}
              >
                <PricingCard 
                  plan={plan} 
                  onSelect={() => handleSelectPlan(plan)}
                  isLoading={isProcessingPlanId === plan.id}
                />
                {isProcessingPlanId === plan.id && (
                  <p className='text-center text-xs font-semibold text-[#937c60] mt-3'>Redirecting to secure checkout...</p>
                )}
              </div>
            ))}
          </div>

          <div className='max-w-5xl mx-auto mb-24'>
            <div className='bg-white/80 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[32px] p-8 md:p-12 shadow-xl'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-[1px] bg-[#937c60] opacity-40'></div>
                <span className='text-[10px] font-bold tracking-[0.4em] text-[#937c60] uppercase'>Credit Definitions</span>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {CREDIT_DEFINITIONS.map((item) => (
                  <div key={item.label} className='flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-sm font-semibold text-gray-700 dark:text-gray-200'>
                    <span>{item.label}</span>
                    <span className='text-[#937c60]'>{item.credits} credits</span>
                  </div>
                ))}
              </div>
              <p className='mt-6 text-xs text-gray-400'>
                Credits are applied per output and shown before you confirm an action.
              </p>
            </div>
          </div>

          {/* Trust Section Simplified */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className='flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 font-bold text-xs uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400'
          >
            <span>Clear Credit Costs</span>
            <span>Track Generations</span>
            <span>Credits Never Expire</span>
          </motion.div>

          {/* Help/CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='mt-32'
          >
            <div className='bg-[#1a1a1a] dark:bg-[#111] rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl dark:border dark:border-white/5'>
              <div className='absolute top-0 right-0 w-1/2 h-full bg-[#937c60]/10 blur-[100px] pointer-events-none' />
              
              <div className='relative z-10 max-w-xl text-center lg:text-left'>
                <h2 className='text-3xl md:text-5xl font-bold text-white mb-6 leading-tight'>
                  Still not sure about the perfect fit?
                </h2>
                <p className='text-gray-400 text-lg md:text-xl'>
                  Not sure how many credits you need? We can help estimate your project.
                </p>
              </div>

              <div className='relative z-10 shrink-0 w-full lg:w-auto'>
                <Button 
                  onClick={() => setIsAvatarOpen(true)}
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
