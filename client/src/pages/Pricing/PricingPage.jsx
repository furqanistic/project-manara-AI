import AvatarOnboardingPopup from '@/components/AddOns/AvatarOnboardingPopup'
import TopBar from '@/components/Layout/Topbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import { ArrowRight, CreditCard, Crown, Sparkles, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { addCredits } from '@/lib/credits'
import { stripeService } from '@/services/stripeService'

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Star,
    tagline: 'Great for quick tests',
    price: '199',
    unit: 'AED',
    color: '#b8a58c',
    description: 'Perfect to get started with room design.',
    credits: 20,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_STARTER,
    features: [
      'Best for single room experiments',
      'Mix and match outputs',
      'Includes starter credit pack',
    ],
    cta: 'Buy Plan',
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
    description: 'Balanced plan for multi-room projects.',
    credits: 50,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_HOME,
    features: [
      'Enough for full room packages',
      'Great for multiple iterations',
      'Includes home credit pack',
    ],
    cta: 'Buy Plan',
  },
  {
    id: 'plus',
    name: 'Plus',
    icon: Crown,
    tagline: 'For larger projects',
    price: '799',
    unit: 'AED',
    color: '#7a654f',
    description: 'Best fit for large or frequent projects.',
    credits: 100,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_PLUS,
    features: [
      'Best value per credit',
      'Ideal for teams',
      'Includes plus credit pack',
    ],
    cta: 'Buy Plan',
  },
]
const CREDIT_DEFINITIONS = [
  { label: '3D Render Set (1 room)', credits: 3 },
  { label: 'Extra style / variation', credits: 1 },
  { label: '2D Floor Plan / Cut', credits: 4 },
  { label: 'Shopping List + Supplier Suggestions', credits: 2 },
  { label: 'Small revision', credits: 1 },
  { label: 'Full Room Package (all of the above)', credits: 8 },
]
const PLAN_CREDITS = {
  starter: 20,
  home: 50,
  plus: 100,
}
const PLAN_ORDER = {
  starter: 1,
  home: 2,
  plus: 3,
}
const CREDIT_GRANT_PREFIX = 'manara_credit_grant'
const PLAN_SKELETON_ITEMS = [1, 2, 3]

const Decorations = () => (
  <div className='absolute inset-0 overflow-hidden pointer-events-none'>
    <div className='absolute -top-24 -left-24 w-96 h-96 bg-[#937c60]/8 dark:bg-[#937c60]/10 rounded-full blur-[100px]' />
    <div className='absolute top-1/2 -right-24 w-80 h-80 bg-[#b8a58c]/8 dark:bg-[#b8a58c]/10 rounded-full blur-[80px]' />
    <div className='absolute -bottom-24 left-1/3 w-64 h-64 bg-[#7a654f]/8 dark:bg-[#7a654f]/10 rounded-full blur-[120px]' />
  </div>
)

const PricingCard = ({ plan, onSelect, isLoading, isDisabled, isCurrentPlan }) => {
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
      {isCurrentPlan && (
        <div className='absolute top-4 right-4 z-20'>
          <Badge className='bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-md'>
            Current Plan
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
          disabled={isLoading || isDisabled}
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
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [activePlanId, setActivePlanId] = useState(null)
  const [scheduledPlanId, setScheduledPlanId] = useState(null)
  const [scheduledChangeAt, setScheduledChangeAt] = useState(null)
  const [isBillingLoading, setIsBillingLoading] = useState(false)
  const [hasBillingLoaded, setHasBillingLoaded] = useState(false)
  const [showCardLinkPopup, setShowCardLinkPopup] = useState(false)
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

  const loadPaymentMethods = async () => {
    setIsCardsLoading(true)
    try {
      const response = await stripeService.getPaymentMethods()
      const nextCardsCount = response?.data?.cards?.length || 0
      setCardsCount(nextCardsCount)
      return nextCardsCount
    } catch (error) {
      console.error('Unable to load cards:', error)
      return 0
    } finally {
      setIsCardsLoading(false)
    }
  }

  const loadBillingStatus = async () => {
    setIsBillingLoading(true)
    try {
      const response = await stripeService.getBillingStatus()
      const subscription = response?.data?.subscription || null
      const isActive =
        Boolean(subscription?.stripeSubscriptionId) &&
        ['trialing', 'active', 'past_due', 'unpaid'].includes(subscription?.subscriptionStatus)
      setHasActiveSubscription(isActive)
      setActivePlanId(subscription?.activePlanId || null)
      setScheduledPlanId(subscription?.scheduledPlanId || null)
      setScheduledChangeAt(subscription?.scheduledChangeAt || null)
      return isActive
    } catch (error) {
      console.error('Unable to load billing status:', error)
      setHasActiveSubscription(false)
      setActivePlanId(null)
      setScheduledPlanId(null)
      setScheduledChangeAt(null)
      return false
    } finally {
      setIsBillingLoading(false)
      setHasBillingLoaded(true)
    }
  }

  const activePlanRank = PLAN_ORDER[activePlanId] || 0
  const hasScheduledPlanChange = Boolean(scheduledPlanId && scheduledChangeAt)
  const isDowngradeOption = (planId) => {
    const targetRank = PLAN_ORDER[planId] || 0
    return activePlanRank > 0 && targetRank > 0 && targetRank < activePlanRank
  }
  const getProcessingMessage = (planId) => {
    if (!hasActiveSubscription) return 'Redirecting to secure checkout...'
    if (activePlanId === planId) return 'Renewing your plan...'
    if (isDowngradeOption(planId)) return 'Scheduling downgrade...'
    return 'Updating plan...'
  }

  useEffect(() => {
    if (!currentUser) return
    setHasBillingLoaded(false)
    Promise.all([loadPaymentMethods(), loadBillingStatus()])
  }, [currentUser])

  const showPlanSkeleton = Boolean(currentUser?.isOnboarded) && !hasBillingLoaded

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
      if (isBillingLoading) {
        await loadBillingStatus()
      }

      if (isCardsLoading) {
        const refreshedCards = await loadPaymentMethods()
        if (refreshedCards === 0) {
          setShowCardLinkPopup(true)
          return
        }
      }

      if (cardsCount === 0) {
        setShowCardLinkPopup(true)
        return
      }

      if (hasActiveSubscription && hasScheduledPlanChange && isDowngradeOption(plan.id)) {
        toast.error('A downgrade is already scheduled. Cancel it first to choose another plan.')
        return
      }

      setIsProcessingPlanId(plan.id)
      try {
        let response
        if (!hasActiveSubscription) {
          response = await stripeService.createCheckoutSession({
            planId: plan.id,
            priceId: plan.priceId,
          })
        } else {
          response = await stripeService.changeSubscriptionPlan({
            planId: plan.id,
            priceId: plan.priceId,
            renewNow: activePlanId === plan.id,
          })
          const grantedCredits = Number(response?.grantedCredits) || 0
          const creditGrantKey = response?.creditGrantKey || null
          if (grantedCredits > 0) {
            applyCreditsGrant(creditGrantKey, grantedCredits, `Plan change (${plan.name})`)
            toast.success(`${grantedCredits} credits added to your account.`, {
              id: `credits-granted-pricing-change-${plan.id}`,
            })
          }
          toast.success(response?.message || 'Plan updated successfully.')
          await loadBillingStatus()
        }

        if (!hasActiveSubscription && response?.url) {
          window.location.href = response.url
          return
        }

        if (!hasActiveSubscription) {
          throw new Error('Stripe checkout URL is missing')
        }
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
              SUBSCRIPTION PLANS
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-[1.05]'
            >
              Choose Your <br />
              <span className='text-[#937c60]'>Manara Plan</span>.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto'
            >
              Buy a plan, renew your current plan, or switch tiers directly from this page.
            </motion.p>

            <div className='mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest'>
              {showPlanSkeleton ? (
                <>
                  <span className='inline-flex h-9 w-44 animate-pulse rounded-full border border-gray-200 bg-gray-100/80 dark:border-white/10 dark:bg-white/10' />
                  <span className='inline-flex h-9 w-36 animate-pulse rounded-full border border-gray-200 bg-gray-100/80 dark:border-white/10 dark:bg-white/10' />
                </>
              ) : (
                <>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
                      hasActiveSubscription
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-blue-200 bg-blue-50 text-blue-700'
                    }`}
                  >
                    <Crown size={13} />
                    {hasActiveSubscription ? 'Active Plan Enabled' : 'No Active Plan'}
                  </span>
                  {!isCardsLoading && cardsCount > 0 && (
                    <span className='inline-flex items-center gap-2 rounded-full border border-[#937c60]/30 bg-[#937c60]/5 px-4 py-2 text-[#937c60]'>
                      <CreditCard size={13} />
                      {cardsCount} Card(s) Linked
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Pricing Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 items-center'>
            {showPlanSkeleton
              ? PLAN_SKELETON_ITEMS.map((item) => (
                  <div
                    key={item}
                    className='animate-pulse rounded-3xl border border-gray-100 bg-white p-8 dark:border-white/10 dark:bg-[#111]'
                  >
                    <div className='mb-6 h-6 w-28 rounded bg-gray-200/80 dark:bg-white/10' />
                    <div className='mb-2 h-4 w-40 rounded bg-gray-200/80 dark:bg-white/10' />
                    <div className='mb-8 h-12 w-32 rounded bg-gray-200/80 dark:bg-white/10' />
                    <div className='space-y-3'>
                      <div className='h-4 w-full rounded bg-gray-200/80 dark:bg-white/10' />
                      <div className='h-4 w-[90%] rounded bg-gray-200/80 dark:bg-white/10' />
                      <div className='h-4 w-[85%] rounded bg-gray-200/80 dark:bg-white/10' />
                    </div>
                    <div className='mt-10 h-14 w-full rounded-2xl bg-gray-200/80 dark:bg-white/10' />
                  </div>
                ))
              : CREDIT_PACKAGES.map((plan) => (
                  <div
                    key={plan.id}
                    className={plan.popular ? 'lg:scale-105 z-10' : 'lg:scale-95'}
                  >
                    <PricingCard
                      plan={{
                        ...plan,
                        cta: !hasActiveSubscription
                          ? 'Buy Plan'
                          : activePlanId === plan.id
                            ? 'Renew Now'
                            : hasScheduledPlanChange && scheduledPlanId === plan.id
                              ? 'Downgrade Scheduled'
                              : hasScheduledPlanChange && isDowngradeOption(plan.id)
                                ? 'Downgrade Scheduled'
                                : 'Switch Plan',
                      }}
                      onSelect={() => handleSelectPlan(plan)}
                      isLoading={isProcessingPlanId === plan.id}
                      isDisabled={hasScheduledPlanChange && isDowngradeOption(plan.id)}
                      isCurrentPlan={hasActiveSubscription && activePlanId === plan.id}
                    />
                    {isProcessingPlanId === plan.id && (
                      <p className='text-center text-xs font-semibold text-[#937c60] mt-3'>
                        {getProcessingMessage(plan.id)}
                      </p>
                    )}
                  </div>
                ))}
          </div>

          <div className='max-w-5xl mx-auto mb-24'>
            <div className='bg-white/80 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[32px] p-8 md:p-12 shadow-xl'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-[1px] bg-[#937c60] opacity-40'></div>
                <span className='text-[10px] font-bold tracking-[0.4em] text-[#937c60] uppercase'>Plan Inclusions</span>
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
                Plan purchase and renew actions follow the same billing logic as the subscription page.
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

      <Dialog open={showCardLinkPopup} onOpenChange={setShowCardLinkPopup}>
        <DialogContent className='max-w-md border border-[#937c60]/20 bg-white p-0 dark:bg-[#111]'>
          <div className='relative overflow-hidden rounded-xl'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(147,124,96,0.18),transparent_60%)]' />
            <div className='relative p-7'>
              <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#937c60]/10 text-[#937c60]'>
                <CreditCard size={22} />
              </div>
              <DialogHeader>
                <DialogTitle className='text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white'>
                  Link your card first
                </DialogTitle>
                <DialogDescription className='pt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
                  Link at least one card in billing before buying or renewing a plan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className='mt-7'>
                <Button
                  onClick={() => {
                    setShowCardLinkPopup(false)
                    navigate('/subscription')
                  }}
                  className='group h-11 w-full rounded-xl bg-[#937c60] text-white hover:bg-[#866f54]'
                >
                  Open Billing
                  <ArrowRight size={14} className='ml-2 transition-transform group-hover:translate-x-0.5' />
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PricingPage
