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
import { ArrowRight, Crown, Sparkles, Star } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

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
    features: [
      'Best for single room experiments',
      'Mix and match outputs',
      'Includes starter credit pack',
    ],
    cta: 'Unlock This Plan',
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
    features: [
      'Enough for full room packages',
      'Great for multiple iterations',
      'Includes home credit pack',
    ],
    cta: 'Unlock This Plan',
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
    features: [
      'Best value per credit',
      'Ideal for teams',
      'Includes plus credit pack',
    ],
    cta: 'Unlock This Plan',
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

const Decorations = () => (
  <div className='absolute inset-0 overflow-hidden pointer-events-none'>
    <div className='absolute -top-24 -left-24 w-96 h-96 bg-[#937c60]/8 dark:bg-[#937c60]/10 rounded-full blur-[100px]' />
    <div className='absolute top-1/2 -right-24 w-80 h-80 bg-[#b8a58c]/8 dark:bg-[#b8a58c]/10 rounded-full blur-[80px]' />
    <div className='absolute -bottom-24 left-1/3 w-64 h-64 bg-[#7a654f]/8 dark:bg-[#7a654f]/10 rounded-full blur-[120px]' />
  </div>
)

const PricingCard = ({ plan, onSelect }) => {
  const isPopular = plan.popular

  return (
    <div
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
        <div className='mb-8'>
          <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-1'>{plan.name}</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>{plan.tagline}</p>
        </div>

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

        <Button
          onClick={onSelect}
          className={`w-full py-7 rounded-2xl font-bold text-base transition-all duration-300 border-2 shadow-none ${
            isPopular
              ? 'bg-[#937c60] border-[#937c60] text-white hover:bg-[#867055] hover:border-[#867055]'
              : 'bg-transparent border-gray-200 dark:border-white/10 text-[#937c60] hover:bg-[#937c60] hover:text-white hover:border-[#937c60]'
          }`}
        >
          {plan.cta}
        </Button>
      </div>
    </div>
  )
}

const PricingPage = () => {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [selectedPlanName, setSelectedPlanName] = useState('this')
  const { currentUser } = useSelector((state) => state.user)
  const navigate = useNavigate()

  const handleSelectPlan = (plan) => {
    if (currentUser) {
      navigate('/subscription', {
        state: {
          fromPricing: true,
          selectedPlanId: plan.id,
        },
      })
      return
    }

    setSelectedPlanName(plan.name)
    setShowAuthPrompt(true)
  }

  return (
    <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"] transition-colors duration-500'>
      <TopBar />

      <main className='relative pt-32 pb-24 px-4 overflow-hidden'>
        <Decorations />

        <div className='max-w-7xl mx-auto relative z-10'>
          <div className='max-w-3xl mx-auto text-center mb-20'>
            <div className='inline-flex items-center px-4 py-1 rounded-full bg-[#937c60]/10 dark:bg-[#937c60]/20 text-[#937c60] text-[11px] font-bold mb-6 tracking-wider'>
              SUBSCRIPTION PLANS
            </div>

            <h1 className='text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-[1.05]'>
              Choose Your <br />
              <span className='text-[#937c60]'>Manara Plan</span>.
            </h1>

            <p className='text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto'>
              Pick the plan that fits your design flow. Ready when you are, and upgradeable anytime.
            </p>

            <div className='mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest'>
              <span className='inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700'>
                <Crown size={13} />
                Marketing Preview
              </span>
              {currentUser ? (
                <span className='inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700'>
                  Signed In: Continue to Billing
                </span>
              ) : (
                <span className='inline-flex items-center gap-2 rounded-full border border-[#937c60]/30 bg-[#937c60]/5 px-4 py-2 text-[#937c60]'>
                  Sign in to activate a plan
                </span>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 items-center'>
            {CREDIT_PACKAGES.map((plan) => (
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
                Tap any plan to continue setup in your subscription page.
              </p>
            </div>
          </div>

          <div className='flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 font-bold text-xs uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400'>
            <span>Clear Credit Costs</span>
            <span>Track Generations</span>
            <span>Credits Never Expire</span>
          </div>

          <div className='mt-32'>
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
          </div>
        </div>
      </main>

      <AvatarOnboardingPopup
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
        onSubmit={(data) => {
          console.log('Avatar data:', data)
        }}
      />

      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className='max-w-md border border-[#937c60]/20 bg-white p-0 dark:bg-[#111]'>
          <div className='relative overflow-hidden rounded-xl'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(147,124,96,0.18),transparent_60%)]' />
            <div className='relative p-7'>
              <DialogHeader>
                <DialogTitle className='text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white'>
                  Create your account to continue
                </DialogTitle>
                <DialogDescription className='pt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
                  You selected the {selectedPlanName} plan. Create your account now, then subscribe from your billing page.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className='mt-7 flex-col sm:flex-row gap-2'>
                <Button
                  onClick={() => {
                    setShowAuthPrompt(false)
                    navigate('/auth?type=signup')
                  }}
                  className='group h-11 w-full rounded-xl bg-[#937c60] text-white hover:bg-[#866f54]'
                >
                  Create Account
                  <ArrowRight size={14} className='ml-2 transition-transform group-hover:translate-x-0.5' />
                </Button>
                <Button
                  variant='outline'
                  onClick={() => {
                    setShowAuthPrompt(false)
                    navigate('/auth?type=login')
                  }}
                  className='h-11 w-full rounded-xl'
                >
                  I Already Have an Account
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
